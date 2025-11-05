import cors from "cors";

const whitelist = [
  process.env.DOMAIN,
  process.env.FRONTEND_URL,
  "https://gstsa1.org",
  "https://www.gstsa1.org",
  "https://buybarcodeupc.com",
  "http://gstsa1.org",
  "http://www.gstsa1.org",
  "http://buybarcodeupc.com",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3000/api",
  "http://localhost:5173",

  // PayFort URLs
  "https://sbcheckout.payfort.com",
  "https://checkout.payfort.com",
  "https://sbpaymentservices.payfort.com",
  "https://paymentservices.payfort.com",
].filter(Boolean);

// Proper CORS configuration with whitelist
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(null, true); // Allow all for now, but log blocked origins
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
