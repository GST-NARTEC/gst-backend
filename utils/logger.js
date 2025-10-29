import fs from "fs-extra";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import winston from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Define logs directory
const logsDir = path.join(__dirname, "../assets/logs");
fs.ensureDirSync(logsDir);

// Define log file path with today's date
const getLogFilePath = () => {
  return path.join(logsDir, `errors-${getTodayDate()}.log`);
};

// Custom format for logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${
      stack ? "\n" + stack : ""
    }`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: "error",
  format: customFormat,
  transports: [
    new winston.transports.File({
      filename: getLogFilePath(),
      maxsize: 5242880, // 5MB
      maxFiles: 1,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), customFormat),
    })
  );
}

export default logger;
