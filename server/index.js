import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, CLIENT_URL } from "./config/env.js";
import { APP_MSG } from "./config/constants.js";
import { connectDB } from "./database/db.js";
import authRoute from "./modules/auth/auth.route.js";
import projectRoute from "./modules/projects/project.route.js";
import myInvitationsRoute from "./modules/projects/myInvitations.route.js";
import activityRoute from "./modules/activity/activity.route.js";
import userRoute from "./modules/users/user.route.js";
import taskRoute from "./modules/tasks/task.route.js";
import { initSocket } from "./sockets/index.js";
import "./jobs/workers/email.worker.js";
import logger from "./utils/logger.js";

const app = express();
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

app.use("/api/auth", authRoute);
app.use("/api/projects", projectRoute);
app.use("/api/invitations", myInvitationsRoute);
app.use("/api/activity", activityRoute);
app.use("/api/users", userRoute);
app.use("/api/projects", taskRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: APP_MSG.HEALTH_CHECK_SUCCESS });
});


const start = async () => {
  await connectDB();
  initSocket(httpServer);
  httpServer.listen(PORT || 5000, () => {
    logger.info(`Server running on port ${PORT || 5000}`);
  });
};

start();