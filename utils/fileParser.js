// utils/fileParser.js
export const parseTxtFile = (content) => {
  // Split by newline and filter out empty lines
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};
