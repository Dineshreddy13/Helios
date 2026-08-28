import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { DATABASE_URL } from "../config/env.js";
import * as schema from "../models/index.js";
import { DB_MSG } from "../config/constants.js";
import logger from "../utils/logger.js";

const { Pool } = pg;
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info({category: "DB"}, DB_MSG.CONNECTED)
  }catch(error) {
    logger.error({category: "DB"}, DB_MSG.CONNECTION_FAILED, error);
    process.exit(1);
  }
};