import dotenv from "dotenv";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";

dotenv.config();

const LOCALHOST = process.env.LOCALHOST || "http://localhost:3000";
const LIVE = process.env.BASE_URL || "https://gst.nartec.com";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "GST",
    version: "1.0.0",
    description: "APIs Documentation",
    contact: {
      name: "Wasim Zaman",
      email: "wasimxaman13@gmail.com",
    },
  },
  servers: [
    {
      url: LIVE,
      description: "Production server",
    },
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
    path.join(__dirname, "../docs/swagger/user.js"),
    path.join(__dirname, "../docs/swagger/license.js"),
    path.join(__dirname, "../docs/swagger/product.js"),
    path.join(__dirname, "../docs/swagger/cart.js"),
    path.join(__dirname, "../docs/swagger/checkout.js"),
    path.join(__dirname, "../docs/swagger/order.js"),
    path.join(__dirname, "../docs/swagger/invoice.js"),
    path.join(__dirname, "../docs/swagger/location.js"),
    path.join(__dirname, "../docs/swagger/currency.js"),
    path.join(__dirname, "../docs/swagger/vat.js"),
    path.join(__dirname, "../docs/swagger/category.js"),
    // add more paths...
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
