// Determine API base URL – prefers explicit env var, falls back to localhost
const getApiUrl = () => {
  // If an env variable is provided, use it (for LAN IP / production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, default to localhost (works from the same machine).
  // To access from another device on the LAN, create an .env.local file with:
  // VITE_API_URL=http://YOUR_IP:5000
  // (replace YOUR_IP with your local IP – find it via `ifconfig` on Mac/Linux or `ipconfig` on Windows)
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

