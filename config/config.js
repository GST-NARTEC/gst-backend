const config = {
  PORT: process.env.PORT || 3030,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: "1d",
  JWT_REFRESH_EXPIRY: "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DOMAIN: process.env.DOMAIN || "https://api.gstsa1.org",
};

export default config;
