// Unified API base URL for client (Vercel + local dev)
// In production/staging set VITE_API_URL in the environment
// Example: VITE_API_URL=https://your-render-backend.onrender.com/api
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

