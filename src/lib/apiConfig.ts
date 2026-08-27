// Set VITE_API_URL in a .env file (or your hosting platform's env vars) to point
// at a deployed backend. Falls back to the local dev server when unset.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
