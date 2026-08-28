import axios from 'axios';

// Main Backend API Client
export const mainApiClient = axios.create({
  baseURL: import.meta.env.VITE_MAIN_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scraper Backend API Client
export const scraperApiClient = axios.create({
  baseURL: import.meta.env.VITE_SCRAPER_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optimizer Engine API Client
export const optimizerApiClient = axios.create({
  baseURL: import.meta.env.VITE_OPTIMIZER_URL || 'http://localhost:5002',
  headers: {
    'Content-Type': 'application/json',
  },
});
