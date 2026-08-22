import logger from "../utils/logger.js";
import { ZodError } from "zod";

/**
 * Global error handling middleware.
 * Formats errors and sends a consistent JSON response.
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = null;

    // Handle Zod validation errors (if any slip through the validation middleware)
    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation Error";
        errors = err.flatten().fieldErrors;
    }

    // Log the error
    if (statusCode >= 500) {
        logger.error({ err, req: { method: req.method, url: req.originalUrl } }, "Unhandled Exception");
    } else {
        logger.warn({ msg: message, statusCode, path: req.originalUrl }, "Operational Error");
    }

    const response = {
        success: false,
        message,
        ...(errors && { errors }),
        // Include stack trace only in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};
