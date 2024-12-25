import "./instrument.js";

import dotenv from "dotenv";
import express from "express";
import path, { dirname } from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";

import * as Sentry from "@sentry/node";
import config from "./config/config.js";
import swaggerSpec from "./config/swagger.js";
import cors from "./middlewares/cors.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import routes from "./routes/routes.js";
dotenv.config();

const PORT = config.PORT;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors);
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// Statically serverd routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// API Routes

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Error Routes
Sentry.setupExpressErrorHandler(app);
app.use(notFoundHandler);
app.use(errorHandler);

// Set timeout
app.timeout = 30 * 60 * 1000; // 30 minutes

app.listen(PORT, "localhost", function () {
  console.log(`Server is running on port ${PORT}`);
});
