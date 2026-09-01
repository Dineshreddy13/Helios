import pinoHttp from "pino-http";
import logger from "#utils/logger.js";

export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms [Completed]`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message} [Failed]`;
  },
  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
});
