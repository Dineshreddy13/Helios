import { createProject, deleteProject, getProjectById, getProjectsForUser, updateProjectReadme } from "./project.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createProjectHandler = asyncHandler(async (req, res, next) => {
  const payload = await createProject(req.user.id, req.validated.body);

  if (payload.status !== 201) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return res.status(payload.status).json({
    success: true,
    message: payload.message,
    project: payload.project,
  });
});

export const getProjectsHandler = asyncHandler(async (req, res, next) => {
  const payload = await getProjectsForUser(req.user.id);

  return res.status(payload.status).json({
    success: true,
    projects: payload.projects,
  });
});

export const getProjectByIdHandler = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const payload = await getProjectById(projectId, req.user.id);

  if (payload.status !== 200) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return res.status(payload.status).json({
    success: true,
    project: payload.project,
  });
});

export const deleteProjectHandler = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const payload = await deleteProject(projectId, req.user.id);

  if (payload.status !== 200) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return res.status(payload.status).json({
    success: true,
    message: payload.message,
  });
});

export const updateProjectReadmeHandler = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const payload = await updateProjectReadme(projectId, req.user.id, req.validated.body);

  if (payload.status !== 200) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return res.status(payload.status).json({
    success: true,
    message: payload.message,
    project: payload.project,
  });
});
