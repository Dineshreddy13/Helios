import dotenv from "dotenv";
dotenv.config();

export const {
    PORT,
    DATABASE_URL,
    CLIENT_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
} = process.env;