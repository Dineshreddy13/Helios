import { AUTH_MSG } from "../config/constants.js";

export const validateRequest = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: AUTH_MSG.VALIDATION_FAILED,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validated = req.validated || {};
  req.validated[source] = result.data;

  next();
};