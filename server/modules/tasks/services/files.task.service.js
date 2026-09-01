import { eq } from "drizzle-orm";
import { TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { tasks } from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { requireProjectMember } from "../../projects/utils/permissions.js";
import { deleteFile, deleteFiles } from "#utils/storage.js";
import { v4 as uuidv4 } from "uuid";
import { assignee, buildTaskSelect } from "../utils/task.helpers.js";

export const uploadTaskFiles = async (taskId, userId, uploadedFiles) => {
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    await requireProjectMember(existing.projectId, userId);

    const currentFiles = Array.isArray(existing.files) ? existing.files : [];

    if (currentFiles.length + uploadedFiles.length > 5) {
        // Clean up the newly uploaded files since we're rejecting
        await deleteFiles(uploadedFiles.map(f => f.filename));
        throw new ApiError(400, TASK_MSG.FILE_LIMIT_EXCEEDED);
    }

    const newFileEntries = uploadedFiles.map((f) => ({
        id: uuidv4(),
        publicId: f.filename, // Cloudinary gives public_id in f.filename
        name: f.originalname,
        url: f.path, // Cloudinary gives URL in f.path
        size: f.size,
        mimeType: f.mimetype,
    }));

    const mergedFiles = [...currentFiles, ...newFileEntries];

    await db
        .update(tasks)
        .set({ files: mergedFiles, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));

    const [task] = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.id, taskId))
        .limit(1);

    await delCache(`tasks:project:${existing.projectId}`);

    return { task, message: TASK_MSG.FILE_UPLOADED };
};

export const deleteTaskFile = async (taskId, userId, fileId) => {
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    await requireProjectMember(existing.projectId, userId);

    const currentFiles = Array.isArray(existing.files) ? existing.files : [];
    const fileToDelete = currentFiles.find((f) => f.id === fileId);

    if (!fileToDelete) {
        throw new ApiError(404, TASK_MSG.FILE_NOT_FOUND);
    }

    // Delete from Cloudinary
    if (fileToDelete.publicId) {
        await deleteFile(fileToDelete.publicId);
    }

    const updatedFiles = currentFiles.filter((f) => f.id !== fileId);

    await db
        .update(tasks)
        .set({ files: updatedFiles.length > 0 ? updatedFiles : null, updatedAt: new Date() })
        .where(eq(tasks.id, taskId));

    const [task] = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.id, taskId))
        .limit(1);

    await delCache(`tasks:project:${existing.projectId}`);

    return { task, message: TASK_MSG.FILE_DELETED };
};
