import express from "express";
import cors from "cors";
import { PORT, CLIENT_URL} from "./config/env.js";
import { connectDB } from "./database/db.js";
import logger from "./utils/logger.js";
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);


app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend connected successfully." });
});


const start = async () => {
  await connectDB();
  app.listen(PORT || 5000, () => {
    console.log(`Server running on port ${PORT || 5000}`);
  });
};

start();