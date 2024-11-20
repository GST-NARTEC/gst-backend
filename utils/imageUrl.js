import config from "../config/config.js";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${config.LIVE_URL}/${imagePath}`;
};

export const getRelativePath = (fullPath) => {
  if (!fullPath) return null;
  return fullPath.replace(/\\/g, "/");
};
