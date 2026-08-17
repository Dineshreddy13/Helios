import { z } from "zod";
import { VALIDATION_MSG } from "../config/constants.js";

const titleSchema = z
  .string()
  .trim()
  .min(1, VALIDATION_MSG.TASK_TITLE_MIN)
  .max(200, VALIDATION_MSG.TASK_TITLE_MAX);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: z
    .string()
    .trim()
    .max(2000, VALIDATION_MSG.TASK_DESC_MAX)
    .optional(),
  assigneeId: z
    .string()
    .uuid(VALIDATION_MSG.INVALID_ASSIGNEE_ID)
    .nullable()
    .optional(),
});

export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: z
      .string()
      .trim()
      .max(2000, VALIDATION_MSG.TASK_DESC_MAX)
      .optional(),
    assigneeId: z
      .string()
      .uuid(VALIDATION_MSG.INVALID_ASSIGNEE_ID)
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: VALIDATION_MSG.AT_LEAST_ONE_FIELD,
  });

export const moveTaskSchema = z.object({
  targetListId: z.string().uuid(VALIDATION_MSG.INVALID_TARGET_LIST_ID),
  targetPosition: z.number().min(0, VALIDATION_MSG.INVALID_TARGET_POSITION),
});
