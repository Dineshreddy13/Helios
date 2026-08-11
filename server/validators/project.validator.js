import { z } from "zod";
import { VALIDATION_MSG } from "../config/constants.js";

const nameSchema = z
  .string()
  .trim()
  .min(3, VALIDATION_MSG.PROJECT_NAME_MIN)
  .max(100, VALIDATION_MSG.PROJECT_NAME_MAX);

const descriptionSchema = z
  .string()
  .trim()
  .max(500, VALIDATION_MSG.PROJECT_DESC_MAX)
  .optional();

export const createProjectSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateProjectSchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: VALIDATION_MSG.AT_LEAST_ONE_FIELD,
  });
