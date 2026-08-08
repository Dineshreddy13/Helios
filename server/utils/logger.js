import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",

    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
            // singleLine: true,

            messageFormat: "[{category}] {msg}",
            hideObject: true,
        },
    },
});

export default logger;

// export default logger;


// import pino from "pino";

// const logger = pino({
//   level: process.env.LOG_LEVEL || "info",
// });

// export default logger;