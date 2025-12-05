import { CachedVisual } from "../types";

const CACHE_VERSION = 'v1';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours
// Placeholder for your repository URL.
const REPO_CACHE_URL = 'https://raw.githubusercontent.com/username/repo/main/community_cache.json'; 
const PERMISSION_KEY = 'Atmolite_storage_permission';

// Pre-compile Regex for performance
const CLEAN_CITY_REGEX = /[^a-z0-9]/g;

/**
 * Generates a unique key based on visual parameters.
 */
export const getCacheKey = (cityName: string, iconDesc: string, isDay: boolean): string => {
  const timeOfDay = isDay ? 'day' : 'night';
  const cleanCity = cityName.toLowerCase().trim().replace(CLEAN_CITY_REGEX, '');
  const cleanDesc = iconDesc.toLowerCase().trim();
  return `Atmolite_${CACHE_VERSION}_${cleanCity}_${cleanDesc}_${timeOfDay}`;
};

/**
 * Tier 1: Check Local Storage (User's Device)
 * RESPECTS PERMISSION: Returns null if user denied storage access.
 */
export const checkLocalCache = (key: string): string | null => {
  try {
    // 1. Privacy Check
    const permission = localStorage.getItem(PERMISSION_KEY);
    if (permission === 'denied') {
      return null;
    }

    // 2. Read Cache
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cached: CachedVisual = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;

    // 3. Expiry Check (older than 24 hours)
    if (age > CACHE_EXPIRY_MS) {
      console.log(`[Cache] Local visual expired for ${key}`);
      localStorage.removeItem(key);
      return null;
    }

    console.log(`[Cache] Found valid local visual for ${key}`);
    return cached.imageUrl;
  } catch (e) {
    console.warn("Error reading local cache", e);
    return null;
  }
};

/**
 * Tier 2: Check Remote Repository (Community Shared Data)
 */
export const checkRemoteCache = async (key: string): Promise<string | null> => {
  try {
    // Placeholder for remote fetch logic
    return null; 
  } catch (e) {
    return null;
  }
};

/**
 * Save to Local Storage
 * RESPECTS PERMISSION: Does not save if user denied storage access.
 */
export const saveToLocalCache = (key: string, imageUrl: string) => {
  try {
    // 1. Privacy Check
    const permission = localStorage.getItem(PERMISSION_KEY);
    if (permission === 'denied') {
      return;
    }

    // 2. Write Cache
    const data: CachedVisual = {
      imageUrl,
      timestamp: Date.now(),
      source: 'local'
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("LocalStorage full or disabled", e);
  }
};

/**
 * Save to Remote Repository
 */
export const uploadToRepository = async (key: string, imageUrl: string) => {
  // Placeholder for background upload logic
  console.log(`[Repo Upload] Would upload ${key} to remote database.`);
};