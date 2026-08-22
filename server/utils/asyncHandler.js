/**
 * Wraps an async route handler to catch any errors and pass them to the express error handler middleware.
 * @param {Function} requestHandler - The async route handler function.
 * @returns {Function} Express middleware function.
 */
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
