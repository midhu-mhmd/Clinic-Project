export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "https://sovereigns.site";

export const API_URL = `${API_BASE_URL}/api`;
