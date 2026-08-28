import { Platform } from 'react-native';

// Production URLs
const PROD_MAIN_URL = 'https://inkedfact.online';
const PROD_SCRAPER_URL = 'https://inkedfact.online';
const PROD_OPTIMIZER_URL = 'https://inkedfact.online';

// Local Development URLs (Works with adb reverse for USB physical devices & emulators)
const DEV_MAIN_URL = 'http://localhost:5000';
const DEV_SCRAPER_URL = 'http://localhost:8000';
const DEV_OPTIMIZER_URL = 'http://localhost:8001';

export const MAIN_BACKEND_URL = __DEV__ ? DEV_MAIN_URL : PROD_MAIN_URL;
export const SCRAPER_URL = __DEV__ ? DEV_SCRAPER_URL : PROD_SCRAPER_URL;
export const OPTIMIZER_URL = __DEV__ ? DEV_OPTIMIZER_URL : PROD_OPTIMIZER_URL;
export const WEBSITE_URL = __DEV__ ? 'http://localhost:5173' : 'https://inkedfact.online';

/**
 * Robust fetch wrapper that tries the primary URL and falls back to production
 * if the local server or ADB reverse connection is unreachable.
 */
export const safeFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${MAIN_BACKEND_URL}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    if (url.includes('localhost') || url.includes('10.0.')) {
      const fallbackUrl = url.replace(/http:\/\/[^/]+/, PROD_MAIN_URL);
      try {
        return await fetch(fallbackUrl, options);
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
};
