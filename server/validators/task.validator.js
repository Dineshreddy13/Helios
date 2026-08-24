import { z } from "zod";
import { VALIDATION_MSG } from "../config/constants.js";

const titleSchema = z
  .string()
  .trim()
  .min(1, VALIDATION_MSG.TASK_TITLE_MIN)
  .max(200, VALIDATION_MSG.TASK_TITLE_MAX);

const statusSchema = z
  .enum(["pending", "completed"], { error: VALIDATION_MSG.TASK_STATUS_INVALID })
  .optional();

const tagsSchema = z
  .array(
    z.string().trim().max(50, VALIDATION_MSG.TASK_TAG_MAX_LENGTH)
  )
  .max(10, VALIDATION_MSG.TASK_TAGS_MAX)
  .optional();

const dueDateSchema = z
  .string()
  .datetime({ offset: true, message: VALIDATION_MSG.TASK_DUE_DATE_INVALID })
  .nullable()
  .optional();

const reminderAtSchema = z
  .string()
  .datetime({ offset: true, message: "Invalid reminder date format" })
  .nullable()
  .optional();

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
  status: statusSchema,
  tags: tagsSchema,
  dueDate: dueDateSchema,
  reminderAt: reminderAtSchema,
}).refine((data) => {
  if (data.reminderAt && data.dueDate) {
    return new Date(data.reminderAt) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: "Reminder cannot be set after the task deadline",
  path: ["reminderAt"],
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
    status: statusSchema,
    tags: tagsSchema,
    dueDate: dueDateSchema,
    reminderAt: reminderAtSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: VALIDATION_MSG.AT_LEAST_ONE_FIELD,
  })
  .refine((data) => {
    if (data.reminderAt && data.dueDate) {
      return new Date(data.reminderAt) <= new Date(data.dueDate);
    }
    return true;
  }, {
    message: "Reminder cannot be set after the task deadline",
    path: ["reminderAt"],
  });

export const moveTaskSchema = z.object({
  targetListId: z.string().uuid(VALIDATION_MSG.INVALID_TARGET_LIST_ID),
  targetPosition: z.number().min(0, VALIDATION_MSG.INVALID_TARGET_POSITION),
});

