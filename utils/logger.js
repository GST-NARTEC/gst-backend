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

// Clean up old log files (keep only today's file)
const cleanOldLogs = () => {
  try {
    const files = fs.readdirSync(logsDir);
    const today = getTodayDate();

    files.forEach((file) => {
      if (file.startsWith("errors-") && !file.includes(today)) {
        fs.removeSync(path.join(logsDir, file));
        console.log(`Removed old log file: ${file}`);
      }
    });
  } catch (error) {
    console.error("Error cleaning old logs:", error);
  }
};

// Clean old logs on startup
cleanOldLogs();

// Custom format for logs with better formatting
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;

    let log = `\n${"=".repeat(80)}\n`;
    log += `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\nMetadata:\n${JSON.stringify(meta, null, 2)}\n`;
    }

    // Add stack trace if present
    if (stack) {
      log += `\nStack Trace:\n${stack}\n`;
    }

    log += `${"=".repeat(80)}\n`;

    return log;
  })
);

// Create a dynamic transport that updates the filename daily
class DynamicFileTransport extends winston.transports.File {
  constructor(options) {
    super(options);
    this._currentDate = getTodayDate();
    this._checkDateChange();
  }

  _checkDateChange() {
    setInterval(() => {
      const newDate = getTodayDate();
      if (newDate !== this._currentDate) {
        this._currentDate = newDate;
        this.filename = getLogFilePath();

        // Clean old logs when date changes
        cleanOldLogs();
      }
    }, 60000); // Check every minute
  }
}

// Create logger
const logger = winston.createLogger({
  level: "error",
  format: customFormat,
  transports: [
    new DynamicFileTransport({
      filename: getLogFilePath(),
      maxsize: 10485760, // 10MB
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
