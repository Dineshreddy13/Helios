import dotenv from "dotenv";
dotenv.config();

export const {
    PORT,
    DATABASE_URL,
    CLIENT_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    REDIS_URL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
    OTP_TTL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
} = process.env;