export const amazonPayConfig = {
  // Base configuration
  merchantIdentifier: process.env.MERCHANT_IDENTIFIER,
  accessCode: process.env.ACCESS_CODE,
  shaRequestPhrase: process.env.SHA_REQUEST_PHRASE,
  shaResponsePhrase: process.env.SHA_RESPONSE_PHRASE,
  shaType: process.env.SHA_TYPE || "SHA-256",

  // Environment check
  sandbox: process.env.NODE_ENV !== "production",

  // Sandbox configuration (using the same values from .env for development)
  sandbox: {
    merchantIdentifier: process.env.MERCHANT_IDENTIFIER,
    accessCode: process.env.ACCESS_CODE,
    shaRequestPhrase: process.env.SHA_REQUEST_PHRASE,
    shaResponsePhrase: process.env.SHA_RESPONSE_PHRASE,
  },

  // Production configuration (using the same env variables)
  production: {
    merchantIdentifier: process.env.MERCHANT_IDENTIFIER,
    accessCode: process.env.ACCESS_CODE,
    shaRequestPhrase: process.env.SHA_REQUEST_PHRASE,
    shaResponsePhrase: process.env.SHA_RESPONSE_PHRASE,
  },
};

// Log configuration on startup (excluding sensitive data)
console.log("Amazon Pay Configuration:", {
  environment: process.env.NODE_ENV,
  isSandbox: process.env.NODE_ENV !== "production",
  merchantIdentifier: process.env.MERCHANT_IDENTIFIER,
  shaType: process.env.SHA_TYPE,
});
