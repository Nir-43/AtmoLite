import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, GenerateContentResponse } from "@google/genai";
import { WeatherData } from "../types";
import { getCacheKey, checkLocalCache, checkRemoteCache, saveToLocalCache, uploadToRepository } from "./cacheService";

// ==========================================
// 🔧 CONFIGURATION: GOOGLE GEMINI API KEY
// ==========================================
const HARDCODED_API_KEY = "AIzaSyA1wm7PFGqpg5FaWgq_Hsa5RCfByxGwl-M"; 
// ==========================================

// Helper to safely get env var without crashing in browsers that lack 'process'
const getEnvApiKey = () => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : "";
  } catch (e) {
    return "";
  }
};

const GEMINI_API_KEY = HARDCODED_API_KEY || getEnvApiKey();

// --- RATE LIMIT CONFIGURATION ---
const MAX_DAILY_LIMIT = 1500; // Google Gemini Free Tier daily limit
const MAX_RPM = 15; // Google Gemini Free Tier RPM limit
const SAFETY_FACTOR = 0.95; // Stop at 95% of the limit
const USAGE_KEY = 'Atmolite_usage_stats';

interface UsageStats {
  date: string;       // YYYY-MM-DD
  dailyCount: number; // Total requests today
  timestamps: number[]; // Array of timestamps for RPM window
}

/**
 * Loads usage stats from localStorage or initializes defaults.
 */
const getUsageStats = (): UsageStats => {
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to parse usage stats", e);
  }
  return {
    date: new Date().toDateString(),
    dailyCount: 0,
    timestamps: []
  };
};

/**
 * Saves usage stats to localStorage.
 */
const saveUsageStats = (stats: UsageStats) => {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("Failed to save usage stats", e);
  }
};

/**
 * A wrapper function that enforces Rate Limits and Daily Quotas.
 */
const safeCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const todayStr = new Date().toDateString();
  let stats = getUsageStats();

  // 1. Daily Reset Logic
  if (stats.date !== todayStr) {
    stats = {
      date: todayStr,
      dailyCount: 0,
      timestamps: []
    };
  }

  // 2. Check Daily Safety Margin (95% of MAX)
  const dailyCutoff = Math.floor(MAX_DAILY_LIMIT * SAFETY_FACTOR);
  if (stats.dailyCount >= dailyCutoff) {
    console.warn(`Daily limit reached. Count: ${stats.dailyCount}, Cutoff: ${dailyCutoff}`);
    throw new Error("Daily free limit reached. Try again tomorrow.");
  }

  // 3. Check RPM (Sliding Window)
  // Remove timestamps older than 60 seconds
  stats.timestamps = stats.timestamps.filter(t => now - t < 60000);
  
  if (stats.timestamps.length >= MAX_RPM) {
    console.warn(`RPM limit reached. Active requests in last 60s: ${stats.timestamps.length}`);
    throw new Error("Too many requests. Wait a few seconds.");
  }

  // 4. Record Usage (Increment before call to be safe)
  stats.dailyCount++;
  stats.timestamps.push(now);
  saveUsageStats(stats);

  console.log(`[API Usage] Request allowed. Today: ${stats.dailyCount}/${dailyCutoff}. RPM: ${stats.timestamps.length}/${MAX_RPM}`);

  // 5. Execute API Call
  return await apiCall();
};


/**
 * Step 1: Get Real-time Weather Data
 * Always fetches FRESH data.
 */
export const getCityWeather = async (city: string): Promise<WeatherData> => {
  // Ensure we have a key
  if (!GEMINI_API_KEY) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  try {
    // 1. Search Request
    const searchModel = "gemini-2.5-flash";
    const searchPrompt = `
      Find the current weather for ${city}.
      I need the following current details:
      - Temperature range
      - Weather condition (e.g. Partly Cloudy)
      - Today's date
      - The city's native name
      - Crucial: Is it currently Day or Night at that location?
    `;

    const searchResponse = await safeCall<GenerateContentResponse>(() => 
      ai.models.generateContent({
        model: searchModel,
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      })
    );

    const searchResultText = searchResponse.text;
    
    // Extract sources
    const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string) => typeof uri === 'string');

    // 2. Formatting Request
    const formatPrompt = `
      Extract the weather data from the text below and format it as JSON.
      Text: "${searchResultText}"
      Required JSON Structure:
      - temperature: string (e.g., "24°C - 26°C")
      - condition: string (e.g., "Partly Cloudy")
      - date: string (e.g., "Oct 24")
      - cityNativeName: string (e.g., "東京" for Tokyo)
      - iconDescription: string (Choose exactly one: "Sunny", "Cloudy", "Rainy", "Snowy", "Stormy", "Foggy")
      - isDay: boolean (true if it is currently daytime, false if it is nighttime)
    `;

    const formatResponse = await safeCall<GenerateContentResponse>(() => 
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formatPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temperature: { type: Type.STRING },
              condition: { type: Type.STRING },
              date: { type: Type.STRING },
              cityNativeName: { type: Type.STRING },
              iconDescription: { type: Type.STRING },
              isDay: { type: Type.BOOLEAN },
            },
            required: ["temperature", "condition", "date", "cityNativeName", "iconDescription", "isDay"],
          },
        },
      })
    );

    const jsonText = formatResponse.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      cityName: city,
      sources,
      ...data,
    };

  } catch (error: any) {
    console.error("Error fetching weather:", error);
    if (error.message === "MISSING_API_KEY") throw error;
    if (error.message === "Daily free limit reached. Try again tomorrow." || error.message === "Too many requests. Wait a few seconds.") {
      throw error;
    }
    throw new Error("Failed to fetch weather data.");
  }
};

/**
 * Step 2: Generate or Retrieve Isometric Image
 */
export const generateIsometricCity = async (weather: WeatherData): Promise<string> => {
  const cacheKey = getCacheKey(weather.cityName, weather.iconDescription, weather.isDay);
  
  // --- LAYER 1: Local Storage Check ---
  const localVisual = checkLocalCache(cacheKey);
  if (localVisual) {
    return localVisual;
  }

  // --- LAYER 2: Remote Repository Check ---
  const remoteVisual = await checkRemoteCache(cacheKey);
  if (remoteVisual) {
    saveToLocalCache(cacheKey, remoteVisual);
    return remoteVisual;
  }

  // --- LAYER 3: Generate New via API ---
  if (!GEMINI_API_KEY) {
    throw new Error("MISSING_API_KEY");
  }
  
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    const lightingContext = weather.isDay 
      ? "Daylight scene, bright natural lighting, clear visibility." 
      : "Night time scene, cinematic evening lighting, windows glowing warm yellow, street lamps illuminated, dark blue ambient sky.";

    const visualPrompt = `
      Start immediately with image generation. Do not output any conversational text.
      Request: A vertical (9:16) isometric 3D miniature of ${weather.cityName} (${weather.cityNativeName}).
      Visual Specs:
      - View: 45° top-down.
      - Style: 3D cartoon, soft PBR textures, realistic lighting.
      - Weather: ${weather.condition}.
      - Atmosphere: ${lightingContext}
      - Composition: Iconic landmarks centered, solid-colored background, minimalistic.
      Output: Single image file.
    `;

    const response = await safeCall<GenerateContentResponse>(() => 
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: visualPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
          },
          safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          ]
        },
      })
    );

    let base64Image = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
      if (textPart && textPart.text) {
          throw new Error(`Generation blocked: ${textPart.text.slice(0, 100)}...`);
      }
      throw new Error("No image generated.");
    }

    const finalImageUri = `data:image/png;base64,${base64Image}`;

    // --- SAVE TO CACHES ---
    saveToLocalCache(cacheKey, finalImageUri);
    uploadToRepository(cacheKey, finalImageUri);

    return finalImageUri;

  } catch (error: any) {
    console.error("Error generating image:", error);
    if (error.message === "MISSING_API_KEY") throw error;
    if (error.message === "Daily free limit reached. Try again tomorrow." || error.message === "Too many requests. Wait a few seconds.") {
        throw error;
    }
    throw new Error(error.message || "Failed to generate city visual.");
  }
};