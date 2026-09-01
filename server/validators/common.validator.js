import { z } from "zod";
import { VALIDATION_MSG } from "#config/constants.js";

const uuidParam = (errorMessage) => z.string().uuid(errorMessage);

export const projectIdParamSchema = z.object({
  projectId: uuidParam("Please provide a valid project UUID."),
});

export const taskIdParamSchema = z.object({
  taskId: uuidParam("Please provide a valid task UUID."),
});

export const listIdParamSchema = z.object({
  listId: uuidParam("Please provide a valid list UUID."),
});

export const invitationIdParamSchema = z.object({
  invitationId: uuidParam("Please provide a valid invitation UUID."),
});

export const messageIdParamSchema = z.object({
  messageId: uuidParam("Please provide a valid message UUID."),
});

export const fileIdParamSchema = z.object({
  fileId: uuidParam("Please provide a valid file UUID."),
});
