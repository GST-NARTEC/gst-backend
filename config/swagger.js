import dotenv from "dotenv";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";

dotenv.config();

const LOCALHOST = process.env.LOCALHOST || "http://localhost:3000";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "APP NAME",
    version: "1.0.0",
    description: "APIs Documentation",
    contact: {
      name: "Your Name",
      email: "your_email@example.com",
    },
  },
  servers: [
    {
      url: LOCALHOST,
      description: "Development server",
    },
    // add more hosts...
  ],
};

// To get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    path.join(__dirname, "../docs/swagger/testDocs.js"),
    // add more paths...
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
