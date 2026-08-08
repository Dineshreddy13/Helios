import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, CLIENT_URL} from "./config/env.js";
import { APP_MSG } from "./config/constants.js";
import { connectDB } from "./database/db.js";
import authRoute from "./modules/auth/auth.route.js";
import logger from "./utils/logger.js";
const app = express();

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

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: APP_MSG.HEALTH_CHECK_SUCCESS });
});


const start = async () => {
  await connectDB();
  app.listen(PORT || 5000, () => {
    console.log(`Server running on port ${PORT || 5000}`);
  });
};

start();