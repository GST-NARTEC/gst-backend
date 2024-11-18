import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import routes from "./routes/routes.js";

dotenv.config();

const whitelist = [
  process.env.FRONTEND_URL, // Frontend URL
  process.env.LOCALHOST, // Local Backend URL
  process.env.LIVE, // Live Backend URL
  process.env.BASE_URL, // Base URL
  "https://buybarcodeupc.com",
  "http://www.buybarcodeupc.com",
].filter(Boolean); // Remove any undefined/null values

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions)); // Enable CORS

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// If you want to change the default uploads directory, you can do so here
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/assets", express.static(path.join(path.resolve(), "assets")));

// Add your routes...
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
