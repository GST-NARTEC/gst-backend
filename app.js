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
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.LOCALHOST || "http://localhost:3000",
  process.env.LIVE || "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// If you want to change the default uploads directory, you can do so here
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Add your routes...
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
