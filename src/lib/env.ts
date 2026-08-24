const DEFAULT_FIREBASE_API_KEY = "";
const DEFAULT_CORE_BASE_URL = "https://app.mconnect.africa/core";

export const env = {
  firebaseApiKey: process.env.MOUV_FIREBASE_API_KEY ?? DEFAULT_FIREBASE_API_KEY,
  coreBaseUrl: process.env.MOUV_CORE_BASE_URL ?? DEFAULT_CORE_BASE_URL
};
