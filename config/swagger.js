import dotenv from "dotenv";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";

dotenv.config();

const DOMAIN = process.env.DOMAIN || "http://localhost:3000";

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
      url: DOMAIN,
      description: "Running server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

// To get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    path.join(__dirname, "../docs/swagger/user.js"),
    path.join(__dirname, "../docs/swagger/v2/user.js"),
    path.join(__dirname, "../docs/swagger/order.js"),
    path.join(__dirname, "../docs/swagger/smartSolution.js"),
    path.join(__dirname, "../docs/swagger/license.js"),
    path.join(__dirname, "../docs/swagger/product.js"),
    path.join(__dirname, "../docs/swagger/cart.js"),
    path.join(__dirname, "../docs/swagger/v2/cart.js"),
    path.join(__dirname, "../docs/swagger/checkout.js"),
    path.join(__dirname, "../docs/swagger/order.js"),
    path.join(__dirname, "../docs/swagger/invoice.js"),
    path.join(__dirname, "../docs/swagger/location.js"),
    path.join(__dirname, "../docs/swagger/currency.js"),
    path.join(__dirname, "../docs/swagger/vat.js"),
    path.join(__dirname, "../docs/swagger/category.js"),
    path.join(__dirname, "../docs/swagger/frontend.js"),
    path.join(__dirname, "../docs/swagger/menu.js"),
    path.join(__dirname, "../docs/swagger/subMenu.js"),
    path.join(__dirname, "../docs/swagger/slider.js"),
    path.join(__dirname, "../docs/swagger/coreSolution.js"),
    path.join(__dirname, "../docs/swagger/proService.js"),
    path.join(__dirname, "../docs/swagger/whyBarcode.js"),
    path.join(__dirname, "../docs/swagger/page.js"),
    path.join(__dirname, "../docs/swagger/template1.js"),
    path.join(__dirname, "../docs/swagger/template2.js"),
    path.join(__dirname, "../docs/swagger/template3.js"),
    path.join(__dirname, "../docs/swagger/template4.js"),
    path.join(__dirname, "../docs/swagger/sunrize2027Template.js"),
    path.join(__dirname, "../docs/swagger/caseStudyTemplate1.js"),
    path.join(__dirname, "../docs/swagger/caseStudyTemplate2.js"),
    path.join(__dirname, "../docs/swagger/caseStudyMainTemplate.js"),
    path.join(__dirname, "../docs/swagger/halalTemplate.js"),
    path.join(__dirname, "../docs/swagger/company.js"),
    path.join(__dirname, "../docs/swagger/addon.js"),
    path.join(__dirname, "../docs/swagger/brand.js"),
    path.join(__dirname, "../docs/swagger/userDoc.js"),
    path.join(__dirname, "../docs/swagger/unitCode.js"),
    path.join(__dirname, "../docs/swagger/helpTicket.js"),
    path.join(__dirname, "../docs/swagger/barcodeType.js"),
    path.join(__dirname, "../docs/swagger/gtin.js"),
    path.join(__dirname, "../docs/swagger/userGuide.js"),
    path.join(__dirname, "../docs/swagger/localization.js"),
    path.join(__dirname, "../docs/swagger/aggregation.js"),
    path.join(__dirname, "../docs/swagger/udi.js"),
    // add more paths...
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
