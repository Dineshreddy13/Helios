process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught Exception - Shutting down");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.fatal({ err }, "Unhandled Rejection - Shutting down");
  process.exit(1);
});

import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, CLIENT_URL } from "./config/env.js";
import { APP_MSG } from "./config/constants.js";
import { connectDB, closeDB } from "./database/db.js";
import apiRoutes from "./routes/index.js";
import { initSocket } from "./sockets/index.js";
import "./jobs/workers/email.worker.js";
import "./jobs/workers/reminder.worker.js";
import logger from "./utils/logger.js";
import { httpLogger } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Render load balancer)
const httpServer = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(httpLogger);

import { sessionMiddleware } from "./config/session.js";
app.use(sessionMiddleware);
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/v1", apiRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: APP_MSG.HEALTH_CHECK_SUCCESS });
});

// Handle 404 routes
app.use((req, res, next) => {
  next(new ApiError(404, `API endpoint not found: ${req.originalUrl}`));
});

app.use(errorHandler);

const start = async () => {
  await connectDB();
  initSocket(httpServer);
  httpServer.listen(PORT || 5000, () => {
    logger.info(`Server running on port ${PORT || 5000}`);
  });
};

start();

const shutdown = async () => {
  logger.info("Graceful shutdown initiated...");
  httpServer.close(async () => {
    logger.info("HTTP server closed.");
    await closeDB();
    import('./config/redis.js').then(async ({ redis }) => {
      await redis.quit();
      logger.info("Redis connection closed.");
      process.exit(0);
    }).catch((err) => {
      logger.error("Error closing redis: ", err);
      process.exit(1);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
