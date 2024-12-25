/**
 * @fileoverview Multer configuration utility for handling file uploads with extended functionality
 * @module multer-config-util
 */

import { promises as fs } from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * @constant {Object} ALLOWED_MIME_TYPES
 * @description Predefined MIME types organized by category
 */
const ALLOWED_MIME_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  videos: [
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
  ],
  pdfs: ["application/pdf"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ],
  all: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ],
};

/**
 * Configure storage for Multer
 */
const configureStorage = (destination) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const uploadPath = destination || "uploads";
        // Create directory if it doesn't exist
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const sanitizedFilename = file.originalname.replace(/\\/g, "/");
      const extension = path.extname(sanitizedFilename);
      const fieldName = file.fieldname || "file";
      const uniqueName = uuidv4();
      const fileName = `${uniqueName}-${fieldName}${extension}`.replace(
        /\\/g,
        "/"
      );
      cb(null, fileName);
    },
  });
};

/**
 * Configure file filter for Multer
 */
const configureFileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`
        ),
        false
      );
    }
  };
};

/**
 * Configure Multer with provided options
 */
const configureMulter = ({
  destination,
  filename,
  fileTypes = [],
  customMimeTypes = [],
  fileSizeLimit = 50 * 1024 * 1024, // Default 50MB
  preservePath = false,
}) => {
  const storage = configureStorage(destination);
  let allowedMimeTypes = [];

  if (customMimeTypes.length > 0) {
    allowedMimeTypes = customMimeTypes;
  } else if (fileTypes.length > 0) {
    fileTypes.forEach((type) => {
      if (ALLOWED_MIME_TYPES[type]) {
        allowedMimeTypes = allowedMimeTypes.concat(ALLOWED_MIME_TYPES[type]);
      }
    });
  } else {
    allowedMimeTypes = ALLOWED_MIME_TYPES.all;
  }

  const fileFilter = configureFileFilter(allowedMimeTypes);

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: fileSizeLimit,
    },
    preservePath,
  });
};

/**
 * Handle single file upload
 */
export const uploadSingle = (options = {}) => {
  const multerInstance = configureMulter(options);
  return multerInstance.single(options.filename || "file");
};

/**
 * Handle multiple file uploads
 */
export const uploadMultiple = (options = {}) => {
  // Extract fields configuration
  const fields = options.fields || [];

  // Get the maximum file size from field configurations or global limit
  const maxFileSize =
    Math.max(
      ...[
        options.fileSizeLimit || 0,
        ...fields.map((field) => field.fileSizeLimit || 0),
      ]
    ) || 50 * 1024 * 1024; // Default to 50MB if no limits specified

  // Collect all file types from fields
  const allFileTypes = new Set();
  fields.forEach((field) => {
    if (field.fileTypes) {
      field.fileTypes.forEach((type) => allFileTypes.add(type));
    }
  });

  // Configure multer with combined options
  const multerInstance = configureMulter({
    ...options,
    fileTypes: [...allFileTypes],
    fileSizeLimit: maxFileSize,
  });

  // Map fields to multer field config format
  const fieldConfigs = fields.map((field) => ({
    name: field.name,
    maxCount: field.maxCount || 1,
  }));

  return multerInstance.fields(fieldConfigs);
};

/**
 * Delete a file from the filesystem
 */
export const deleteFile = async (filePath) => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file: ${error.message}`);
    return false;
  }
};

/**
 * Export allowed file types
 */
export const ALLOWED_FILE_TYPES = Object.keys(ALLOWED_MIME_TYPES);
