// import fs from "fs";
// import path, { dirname } from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const baseUrl = process.env.DOMAIN || "https://api.gstsa1.org";
// // const baseUrl = "http://localhost:3000";

// export const getImageUrl = (imagePath) => {
//   if (!imagePath) return null;
//   return `${baseUrl}/${imagePath.replace(/^\//, "")}`;
// };

// export const deleteImage = (imageUrl) => {
//   if (!imageUrl) return Promise.resolve();

//   const imagePath = imageUrl.replace(baseUrl, "").replace(/^\//, "");
//   const fullPath = path.join(__dirname, "..", imagePath);

//   return new Promise((resolve) => {
//     fs.unlink(fullPath, (err) => {
//       if (err) {
//         console.error("Failed to delete image:", err);
//       }
//       resolve();
//     });
//   });
// };

// export const addImage = (imageFile) => {
//   const relativePath = imageFile.path
//     .replace(/\\/g, "/")
//     .replace(/^public\//, "");
//   return getImageUrl(relativePath);
// };
