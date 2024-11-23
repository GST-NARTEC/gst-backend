import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import config from "../config/config.js";
import MyError from "./error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addDomain = (imagePath) => {
  if (!imagePath) return null;
  return `${config.DOMAIN}/${imagePath}`;
};

export const deleteFile = (imageUrl) => {
  if (!imageUrl) return Promise.resolve();

  const imagePath = imageUrl.replace(config.DOMAIN, "");
  const fullPath = path.join(__dirname, "..", imagePath);

  return new Promise((resolve) => {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error("Failed to delete image:", err);
        throw MyError("Failed to delete file");
      }
      resolve();
    });
  });
};
