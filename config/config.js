const config = {
  PORT: process.env.PORT || 3030,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DOMAIN: process.env.DOMAIN || "http://localhost:3030",
};

export default config;
