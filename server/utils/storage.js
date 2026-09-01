import logger from "./logger.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Safely deletes a file from Cloudinary (given publicId)
 */
export const deleteFile = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        logger.error(`Failed to delete file: ${publicId}`, err);
    }
};

/**
 * Safely deletes multiple files from Cloudinary or disk.
 */
export const deleteFiles = async (fileUrlsOrPaths) => {
    if (!Array.isArray(fileUrlsOrPaths)) return;
    
    await Promise.all(fileUrlsOrPaths.map(fileUrl => deleteFile(fileUrl)));
};
