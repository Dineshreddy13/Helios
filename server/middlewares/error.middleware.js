import logger from "#utils/logger.js";
import z, { ZodError } from "zod";
import { ApiError } from "#utils/ApiError.js";
import { AUTH_MSG } from "#config/constants.js";
import { NODE_ENV } from "#config/env.js";

export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = "Internal Server Error";
    let errors = null;

    if (err instanceof ZodError) {
        statusCode = 400;
        message = AUTH_MSG.VALIDATION_FAILED;
        errors = z.treeifyError(err);
    } else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors?.length ? err.errors : null;
    } else if (NODE_ENV === "development") {
        message = err.message || "Internal Server Error";
    }

    if (statusCode >= 500) {
        logger.error({ err, req: { method: req.method, url: req.originalUrl } }, "Unhandled Exception");
    }
    // No need for this (-_-)
    // else {
    //     logger.warn({ msg: message, statusCode, path: req.originalUrl }, "Operational Error");
    // }

    const response = {
        success: false,
        message,
        ...(errors && { errors }),
        ...(NODE_ENV === "development" && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};
