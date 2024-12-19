// create a route that will call third party api to lookup the barcode and return the product details

// here is the api route: https://api.barcodelookup.com/v3/products?barcode=5281009568356&formatted=y&key=5zj8nzcoovoht100j3eswvs4g4o7jv

import axios from "axios";
import express from "express";

const router = express.Router();

router.get("/:barcode", async (req, res, next) => {
  try {
    const { barcode } = req.params;

    const response = await axios.get(
      `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=5zj8nzcoovoht100j3eswvs4g4o7jv`
    );

    res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 403:
          return res.status(403).json({
            error: "Invalid API key",
          });
        case 404:
          return res.status(404).json({
            error: "Product not found",
          });
        case 429:
          return res.status(429).json({
            error: "API rate limit exceeded. Please try again later",
          });
        default:
          return res.status(500).json({
            error: "An unexpected error occurred",
          });
      }
    }

    // Handle network errors or other issues
    return res.status(500).json({
      error: "Unable to connect to barcode lookup service",
    });
  }
});

export default router;
