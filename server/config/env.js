import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("3000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default("http://localhost:5173"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("1d"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
    SMTP_PORT: z.string().default("587"),
    SMTP_USER: z.string().min(1, "SMTP_USER is required"),
    SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
    MAIL_FROM: z.string().min(1, "MAIL_FROM is required"),
    OTP_TTL: z.string().default("600"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}

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
} = parsedEnv.data;