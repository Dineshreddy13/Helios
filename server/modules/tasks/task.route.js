import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { createTaskSchema, updateTaskSchema, moveTaskSchema, addDependencySchema, createTodoSchema, updateTodoSchema, reorderTodosSchema } from "#validators/task.validator.js";
import { projectIdParamSchema, listIdParamSchema, taskIdParamSchema, fileIdParamSchema, blockingTaskIdParamSchema, todoIdParamSchema } from "#validators/common.validator.js";
import {
    createTaskHandler,
    getTasksHandler,
    updateTaskHandler,
    deleteTaskHandler,
    moveTaskHandler,
    uploadTaskFilesHandler,
    deleteTaskFileHandler,
    addDependencyHandler,
    removeDependencyHandler,
    getDependenciesHandler,
    createTodoHandler,
    getTodosHandler,
    updateTodoHandler,
    deleteTodoHandler,
    reorderTodosHandler,
} from "./task.controller.js";

const router = Router();

router.use(requireAuth);

// Task CRUD
router.post("/lists/:listId/tasks", validateRequest(listIdParamSchema, "params"), validateRequest(createTaskSchema), createTaskHandler);
router.get("/:projectId/tasks", validateRequest(projectIdParamSchema, "params"), getTasksHandler);
router.patch("/tasks/:taskId/move", validateRequest(taskIdParamSchema, "params"), validateRequest(moveTaskSchema), moveTaskHandler);
router.patch("/tasks/:taskId", validateRequest(taskIdParamSchema, "params"), validateRequest(updateTaskSchema), updateTaskHandler);
router.delete("/tasks/:taskId", validateRequest(taskIdParamSchema, "params"), deleteTaskHandler);

// Task file management
router.post("/tasks/:taskId/files", validateRequest(taskIdParamSchema, "params"), upload.array("files", 5), uploadTaskFilesHandler);
router.delete("/tasks/:taskId/files/:fileId", validateRequest(taskIdParamSchema, "params"), validateRequest(fileIdParamSchema, "params"), deleteTaskFileHandler);

// Task dependencies
router.post("/tasks/:taskId/dependencies", validateRequest(taskIdParamSchema, "params"), validateRequest(addDependencySchema), addDependencyHandler);
router.get("/tasks/:taskId/dependencies", validateRequest(taskIdParamSchema, "params"), getDependenciesHandler);
router.delete("/tasks/:taskId/dependencies/:blockingTaskId", validateRequest(blockingTaskIdParamSchema, "params"), removeDependencyHandler);

// Task todos (subtasks)
router.post("/tasks/:taskId/todos", validateRequest(taskIdParamSchema, "params"), validateRequest(createTodoSchema), createTodoHandler);
router.get("/tasks/:taskId/todos", validateRequest(taskIdParamSchema, "params"), getTodosHandler);
router.patch("/tasks/:taskId/todos/reorder", validateRequest(taskIdParamSchema, "params"), validateRequest(reorderTodosSchema), reorderTodosHandler);
router.patch("/tasks/:taskId/todos/:todoId", validateRequest(todoIdParamSchema, "params"), validateRequest(updateTodoSchema), updateTodoHandler);
router.delete("/tasks/:taskId/todos/:todoId", validateRequest(todoIdParamSchema, "params"), deleteTodoHandler);

export default router;
