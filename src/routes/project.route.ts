import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
  getProjectTasks,
} from "../controllers/project.controller.js";
import { createProjectValidator, projectIdParamValidator, updateProjectValidator } from "../validators/project.validator.js";
import { validate } from "../validators/validate.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validator.js";

const router = Router();

router.use(authenticateJWT)

router.route("/create").post(createProjectValidator, validate, createProject);

router.route("/get-projects").get(getProjects);

router.route("/get-project-by-id/:id").get(projectIdParamValidator("id"), validate, getProjectById);

router.route("/update-project/:id").patch(projectIdParamValidator("id"), updateProjectValidator("id"), validate, updateProject);

router.route("/delete-project/:id").delete(projectIdParamValidator("id"), validate, deleteProject);

// add/remove tasks (use path params projectId and taskId)
router.route("/add-task-to-project/:taskId/:projectId").post(
  mongoIdPathVariableValidator("projectId"),
  mongoIdPathVariableValidator("taskId"),
  validate,
  addTaskToProject
);

router.route("/remove-task-from-project/:taskId/:projectId").patch(
  mongoIdPathVariableValidator("projectId"),
  mongoIdPathVariableValidator("taskId"),
  validate,
  removeTaskFromProject
);

router.route("/get-project-tasks/:id").get(projectIdParamValidator("id"), validate, getProjectTasks);

export default router;
