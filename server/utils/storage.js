import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safely deletes a file from disk given its URL (e.g. /uploads/...) or absolute path.
 */
export const deleteFile = (fileUrlOrPath) => {
    try {
        let targetPath = fileUrlOrPath;

        // If it's a relative URL from our DB (e.g., /uploads/tasks/filename.jpg)
        if (fileUrlOrPath.startsWith("/uploads")) {
            targetPath = path.join(__dirname, "..", fileUrlOrPath);
        }

        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }
    } catch (err) {
        logger.error(`Failed to delete file: ${fileUrlOrPath}`, err);
    }
};

/**
 * Safely deletes multiple files from disk.
 */
export const deleteFiles = (fileUrlsOrPaths) => {
    if (!Array.isArray(fileUrlsOrPaths)) return;
    
    for (const fileUrl of fileUrlsOrPaths) {
        deleteFile(fileUrl);
    }
};
