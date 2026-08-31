import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("3000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    CLIENT_URL: z.url("CLIENT_URL must be a valid URL").transform((url) => url.replace(/\/$/, "")).default("http://localhost:5173"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("1d"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    BREVO_API_KEY: z.string().min(1, "BREVO_API_KEY is required"),
    BREVO_SENDER_EMAIL: z.string().min(1, "BREVO_SENDER_EMAIL is required"),
    BREVO_SENDER_NAME: z.string().default("Helios"),
    OTP_TTL: z.string().default("600"),
    PASSWORD_RESET_TTL: z.string().default("900"),
    NODE_ENV: z.enum(["development", "production"]),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}

export const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    CLIENT_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    REDIS_URL,
    BREVO_API_KEY,
    BREVO_SENDER_EMAIL,
    BREVO_SENDER_NAME,
    OTP_TTL,
    PASSWORD_RESET_TTL,
    LOG_LEVEL
} = parsedEnv.data;