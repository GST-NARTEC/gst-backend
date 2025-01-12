import cors from "cors";

import MyError from "../utils/error.js";

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

  // PayFort URLs
  "https://sbcheckout.payfort.com",
  "https://checkout.payfort.com",
  "https://sbpaymentservices.payfort.com",
  "https://paymentservices.payfort.com",
].filter(Boolean);

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new MyError("Not allowed by CORS", 403));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// allow all origins
const corsOptions = {
  origin: "*",
};

export default cors(corsOptions);
