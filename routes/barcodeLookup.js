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
    next(error);
  }
});

export default router;
