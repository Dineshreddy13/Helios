import { asc, eq } from "drizzle-orm";
import { TODO_MSG, TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { tasks, taskTodos } from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { requireProjectMember } from "../../projects/utils/permissions.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fetchTask = async (taskId) => {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) throw new ApiError(404, TASK_MSG.NOT_FOUND);
    return task;
};

const fetchTodo = async (todoId, taskId) => {
    const [todo] = await db
        .select()
        .from(taskTodos)
        .where(eq(taskTodos.id, todoId))
        .limit(1);
    if (!todo || todo.taskId !== taskId) throw new ApiError(404, TODO_MSG.NOT_FOUND);
    return todo;
};

const getOrderedTodos = (taskId) =>
    db
        .select()
        .from(taskTodos)
        .where(eq(taskTodos.taskId, taskId))
        .orderBy(asc(taskTodos.position));

// ─── Services ─────────────────────────────────────────────────────────────────

export const createTodo = async (taskId, userId, { title }) => {
    const task = await fetchTask(taskId);
    await requireProjectMember(task.projectId, userId);

    // Next position = max + 1
    const existing = await getOrderedTodos(taskId);
    const position = existing.length > 0 ? existing[existing.length - 1].position + 1 : 0;

    const [inserted] = await db
        .insert(taskTodos)
        .values({ taskId, title, completed: false, position })
        .returning();

    await delCache(`tasks:project:${task.projectId}`);

    return { todo: inserted, projectId: task.projectId, message: TODO_MSG.CREATED };
};

export const getTodos = async (taskId, userId) => {
    const task = await fetchTask(taskId);
    await requireProjectMember(task.projectId, userId);

    const todos = await getOrderedTodos(taskId);
    return { todos, message: "Todos retrieved successfully." };
};

export const updateTodo = async (taskId, todoId, userId, { title, completed }) => {
    const task = await fetchTask(taskId);
    await requireProjectMember(task.projectId, userId);
    await fetchTodo(todoId, taskId);

    const patch = { updatedAt: new Date() };
    if (title !== undefined) patch.title = title;
    if (completed !== undefined) patch.completed = completed;

    const [updated] = await db
        .update(taskTodos)
        .set(patch)
        .where(eq(taskTodos.id, todoId))
        .returning();

    await delCache(`tasks:project:${task.projectId}`);

    return { todo: updated, projectId: task.projectId, message: TODO_MSG.UPDATED };
};

export const deleteTodo = async (taskId, todoId, userId) => {
    const task = await fetchTask(taskId);
    await requireProjectMember(task.projectId, userId);
    await fetchTodo(todoId, taskId);

    await db.delete(taskTodos).where(eq(taskTodos.id, todoId));

    // Re-index remaining todos so positions stay contiguous
    const remaining = await getOrderedTodos(taskId);
    await Promise.all(
        remaining.map((t, i) =>
            db
                .update(taskTodos)
                .set({ position: i, updatedAt: new Date() })
                .where(eq(taskTodos.id, t.id))
        )
    );

    await delCache(`tasks:project:${task.projectId}`);

    return { todoId, taskId, projectId: task.projectId, message: TODO_MSG.DELETED };
};

export const reorderTodos = async (taskId, userId, { orderedIds }) => {
    const task = await fetchTask(taskId);
    await requireProjectMember(task.projectId, userId);

    // Validate all IDs belong to this task
    const existing = await getOrderedTodos(taskId);
    const existingIds = new Set(existing.map((t) => t.id));
    const allValid = orderedIds.every((id) => existingIds.has(id));
    if (!allValid || orderedIds.length !== existing.length) {
        throw new ApiError(422, "orderedIds must contain exactly all todo IDs for this task.");
    }

    await Promise.all(
        orderedIds.map((id, i) =>
            db
                .update(taskTodos)
                .set({ position: i, updatedAt: new Date() })
                .where(eq(taskTodos.id, id))
        )
    );

    const todos = await getOrderedTodos(taskId);

    await delCache(`tasks:project:${task.projectId}`);

    return { todos, projectId: task.projectId, message: TODO_MSG.REORDERED };
};
