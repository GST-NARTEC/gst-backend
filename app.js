import "./instrument.js";

import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import path, { dirname } from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";

import * as Sentry from "@sentry/node";
import swaggerSpec from "./config/swagger.js";
import cors from "./middlewares/cors.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import routes from "./routes/routes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statically serverd routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// API Routes
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Routes
Sentry.setupExpressErrorHandler(app);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, "localhost", function () {
  console.log(`Server is running on port ${PORT}`);
});
