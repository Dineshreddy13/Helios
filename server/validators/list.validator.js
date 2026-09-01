import { z } from "zod";
import { VALIDATION_MSG } from "#config/constants.js";

const nameSchema = z
  .string()
  .trim()
  .min(1, VALIDATION_MSG.LIST_NAME_MIN)
  .max(100, VALIDATION_MSG.LIST_NAME_MAX);

export const createListSchema = z.object({
  name: nameSchema,
});

export const updateListSchema = z
  .object({
    name: nameSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: VALIDATION_MSG.AT_LEAST_ONE_FIELD,
  });

export const reorderListsSchema = z.object({
  orderedListIds: z
    .array(z.string().uuid())
    .min(1, VALIDATION_MSG.INVALID_LIST_IDS),
});
