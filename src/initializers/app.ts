import config from "config";

export const APP_CONFIG = {
  port: Number(process.env.PORT) || config.get<number>("server.port"),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigins: ["http://localhost:5173", "https://kaarya.vercel.app"],
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};
