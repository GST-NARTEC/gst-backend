const config = {
  PORT: process.env.PORT || 3030,
  JWT_SECRET: process.env.JWT_SECRET,
  LIVE_URL: process.env.LIVE || "http://gs1ksa.org:9021",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BASE_URL: process.env.BASE_URL || "http://localhost:3030",
};

export default config;
