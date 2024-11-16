import fs from "fs/promises";
import path from "path";

/**
 * Deletes a file based on the provided file path.
 * @param {string} filePath - The path to the file to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 * @throws {Error} - Throws an error if the file cannot be deleted.
 */
export const deleteFile = async (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    await fs.unlink(absolutePath);
    console.log(`File successfully deleted at ${absolutePath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(
        `File not found at ${filePath}. It may have already been deleted.`
      );
    } else {
      console.error(`Error deleting file at ${filePath}:`, error);
      throw new Error(`Unable to delete file at ${filePath}: ${error.message}`);
    }
  }
};

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The path to the directory.
 * @returns {Promise<void>} - A promise that resolves when the directory exists.
 */
export const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};

/**
 * Moves a file from one location to another.
 * @param {string} sourcePath - The current path of the file.
 * @param {string} destPath - The destination path for the file.
 * @returns {Promise<void>} - A promise that resolves when the file is moved.
 */
export const moveFile = async (sourcePath, destPath) => {
  try {
    await ensureDirectoryExists(path.dirname(destPath));
    await fs.rename(sourcePath, destPath);
    console.log(`File successfully moved from ${sourcePath} to ${destPath}`);
  } catch (error) {
    console.error(
      `Error moving file from ${sourcePath} to ${destPath}:`,
      error
    );
    throw new Error(`Unable to move file: ${error.message}`);
  }
};

/**
 * Checks if a file exists at the given path.
 * @param {string} filePath - The path to check for file existence.
 * @returns {Promise<boolean>} - A promise that resolves to true if the file exists, false otherwise.
 */
export const fileExists = async (filePath) => {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};
