import winston from "winston";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
// const logger = winston.createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   format: logFormat,
//   transports: [
//     // Error log file
//     new winston.transports.File({
//       filename: path.join('logs', 'error.log'),
//       level: 'error',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
//     // Combined log file
//     new winston.transports.File({
//       filename: path.join('logs', 'combined.log'),
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
//     // Audit log file for important actions
//     new winston.transports.File({
//       filename: path.join('logs', 'audit.log'),
//       level: 'info',
//       maxsize: 5242880, // 5MB
//       maxFiles: 5,
//     }),
//   ],
//   // Handle exceptions and rejections
//   exceptionHandlers: [
//     new winston.transports.File({
//       filename: path.join('logs', 'exceptions.log'),
//     }),
//   ],
//   rejectionHandlers: [
//     new winston.transports.File({
//       filename: path.join('logs', 'rejections.log'),
//     }),
//   ],
// });
// Simplified logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

export default logger;
