import {
    createProject,
    getProjectsForUser,
    getProjectById,
    deleteProject,
    updateProjectReadme,
} from "./services/project.core.service.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { ApiResponse } from "#utils/ApiResponse.js";

export const createProjectHandler = asyncHandler(async (req, res, next) => {
  const payload = await createProject(req.user.id, req.validated.body);

  return res.status(201).json(
    new ApiResponse(201, { project: payload.project }, payload.message)
  );
});

export const getProjectsHandler = asyncHandler(async (req, res, next) => {
  const payload = await getProjectsForUser(req.user.id);

  return res.status(200).json(
    new ApiResponse(200, { projects: payload.projects }, "Projects retrieved successfully")
  );
});

export const getProjectByIdHandler = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const payload = await getProjectById(projectId, req.user.id);

  return res.status(200).json(
    new ApiResponse(200, { project: payload.project }, "Project retrieved successfully")
  );
});

export const deleteProjectHandler = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const payload = await deleteProject(projectId, req.user.id);

  return res.status(200).json(
    new ApiResponse(200, null, payload.message)
  );
});

export const updateProjectReadmeHandler = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const payload = await updateProjectReadme(projectId, req.user.id, req.validated.body);

  return res.status(200).json(
    new ApiResponse(200, { project: payload.project }, payload.message)
  );
});
