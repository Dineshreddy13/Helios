import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, CLIENT_URL } from "./config/env.js";
import { APP_MSG } from "./config/constants.js";
import { connectDB } from "./database/db.js";
import apiRoutes from "./routes/index.js";
import { initSocket } from "./sockets/index.js";
import "./jobs/workers/email.worker.js";
import "./jobs/workers/reminder.worker.js";
import logger from "./utils/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Render load balancer)
const httpServer = http.createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.use(errorHandler);

const start = async () => {
  await connectDB();
  initSocket(httpServer);
  httpServer.listen(PORT || 5000, () => {
    logger.info(`Server running on port ${PORT || 5000}`);
  });
};

start();