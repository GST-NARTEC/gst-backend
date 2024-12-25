import cors from "cors";

import MyError from "../utils/error.js";

const whitelist = [
  process.env.DOMAIN,
  process.env.FRONTEND_URL,
  "https://gstsa1.org",
  "https://www.gstsa1.org",
  "https://api.gstsa1.org",
  "https://buybarcodeupc.com",
  "http://gstsa1.org",
  "http://www.gstsa1.org",
  "http://api.gstsa1.org",
  "http://buybarcodeupc.com",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      console.log("Origin allowed by CORS:", origin);
      callback(null, true);
    } else {
      console.log("Origin blocked by CORS:", origin);
      callback(new MyError(`Origin not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export default cors(corsOptions);
