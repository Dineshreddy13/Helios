import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { DATABASE_URL, NODE_ENV } from "../config/env.js";
import * as schema from "../models/index.js";
import { DB_MSG } from "../config/constants.js";
import logger from "../utils/logger.js";

const { Pool } = pg;
export const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info({category: "DB"}, DB_MSG.CONNECTED)
  }catch(error) {
    logger.error({ category: "DB", err: error }, DB_MSG.CONNECTION_FAILED);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await pool.end();
    logger.info({category: "DB"}, "Database connection closed");
  } catch (error) {
    logger.error({category: "DB", err: error}, "Error closing database connection");
  }
};