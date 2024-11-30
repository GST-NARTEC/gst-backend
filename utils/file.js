import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import config from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addDomain = (filePath) => {
  if (!filePath) return null;
  return `${config.DOMAIN}/${filePath}`;
};

export const deleteFile = (fileUrl) => {
  if (!fileUrl) return Promise.resolve();

  const imagePath = fileUrl.replace(config.DOMAIN, "");
  const fullPath = path.join(__dirname, "..", imagePath);

  return new Promise((resolve) => {
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist
        console.warn(`File not found: ${fullPath}`);
        resolve();
        return;
      }

      // File exists, try to delete it
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error("Failed to delete file:", err);
        }
        resolve();
      });
    });
  });
};
