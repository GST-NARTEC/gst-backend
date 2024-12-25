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
  // Add wildcard subdomains
  /^https?:\/\/([a-zA-Z0-9-]+\.)?gstsa1\.org$/,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Incoming request from origin:", origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("Allowing request with no origin");
      return callback(null, true);
    }

    // Check if origin matches any whitelist entry (including regex patterns)
    const isAllowed = whitelist.some((entry) => {
      if (entry instanceof RegExp) {
        return entry.test(origin);
      }
      return entry === origin;
    });

    if (isAllowed) {
      console.log(`Origin ${origin} is allowed by CORS`);
      callback(null, true);
    } else {
      console.log(`Origin ${origin} is blocked by CORS`);
      console.log("Whitelist:", whitelist);
      callback(new MyError(`Origin not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Credentials",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Wrap the CORS middleware to handle preflight requests explicitly
export default function (req, res, next) {
  console.log("Request method:", req.method);
  console.log("Request headers:", req.headers);

  // Handle preflight requests explicitly
  if (req.method === "OPTIONS") {
    // Add CORS headers manually for preflight
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", corsOptions.methods.join(", "));
    res.header(
      "Access-Control-Allow-Headers",
      corsOptions.allowedHeaders.join(", ")
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", corsOptions.maxAge);

    // Send 204 response for preflight
    return res.status(204).send();
  }

  // For non-preflight requests, use the cors middleware
  return corsMiddleware(req, res, next);
}
