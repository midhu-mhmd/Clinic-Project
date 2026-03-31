const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:5000";
const DEFAULT_PROD_API_BASE_URL = "https://sovereigns.site";

const configuredApiBaseUrl = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL?.trim() ?? ""
);

const runtimeHostname =
  typeof window !== "undefined" ? window.location.hostname : "";

export const IS_LOCAL_ENV = LOCAL_HOSTS.has(runtimeHostname);

export const API_BASE_URL =
  configuredApiBaseUrl ||
  (import.meta.env.DEV ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL);

export const API_URL = `${API_BASE_URL}/api`;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

const googleEnabledInDev = import.meta.env.VITE_ENABLE_GOOGLE_AUTH_IN_DEV === "true";

export const GOOGLE_AUTH_ENABLED =
  Boolean(GOOGLE_CLIENT_ID) && (!import.meta.env.DEV || !IS_LOCAL_ENV || googleEnabledInDev);

export const GOOGLE_AUTH_DISABLED_REASON =
  !GOOGLE_CLIENT_ID
    ? "Google Sign-In is not configured for this environment."
    : "Google Sign-In is disabled in local development until this origin is added to the Google OAuth client.";

export default API_BASE_URL;
