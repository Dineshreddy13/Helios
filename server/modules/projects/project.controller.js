import { createProject, deleteProject, getProjectById, getProjectsForUser, updateProjectReadme } from "./project.service.js";

export const createProjectHandler = async (req, res, next) => {
  try {
    const payload = await createProject(req.user.id, req.validated.body);

    if (payload.status !== 201) {
      return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
      success: true,
      message: payload.message,
      project: payload.project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectsHandler = async (req, res, next) => {
  try {
    const payload = await getProjectsForUser(req.user.id);

    return res.status(payload.status).json({
      success: true,
      projects: payload.projects,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectByIdHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const payload = await getProjectById(projectId, req.user.id);

    if (payload.status !== 200) {
      return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
      success: true,
      project: payload.project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProjectHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const payload = await deleteProject(projectId, req.user.id);

    if (payload.status !== 200) {
      return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
      success: true,
      message: payload.message,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectReadmeHandler = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
