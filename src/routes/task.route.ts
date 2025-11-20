import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks,
  getAllTasksForAdmin,
} from "../controllers/task.controller.js";
import { createTaskValidator, updateTaskValidator, searchTasksValidator } from "../validators/task.validator.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validator.js";
import { validate } from "../validators/validate.js";

const router = Router();

router.use(authenticateJWT)

router.route("/create").post(createTaskValidator, validate, createTask);

router.route("/get-tasks").get(getTasks);

router.route("/get-task-by-id/:id").get(mongoIdPathVariableValidator("id"), validate, getTaskById);

router.route("/update-task/:id").patch(mongoIdPathVariableValidator("id"), updateTaskValidator(), validate, updateTask);

router.route("/delete-task/:id").delete(mongoIdPathVariableValidator("id"), validate, deleteTask);

router.route("/search").get(searchTasksValidator, validate, searchTasks);

router.route("/get-all-tasks").get(getAllTasksForAdmin);

export default router;
