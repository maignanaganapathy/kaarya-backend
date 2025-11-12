import app from "./app";
import Database from "./initializers/database";
import logger from "./initializers/logger";

Database.connect()
  .then(() => logger.info("Database connected successfully"))
  .catch((err) => {
    logger.error("Database connection failed:", err);
  });

export default app;
