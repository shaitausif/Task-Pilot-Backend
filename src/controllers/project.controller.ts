import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Project } from "../models/projects.model.js";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";

/* Project controllers
	 - Minimal, follows existing project conventions.
	 - Authorization: project owner or Admin can view/modify/delete.
*/

const createProject = asyncHandler(async (req: Request, res: Response) => {
	const { name, description, status } = req.body;
	if (!name || !description) throw new ApiError(400, "Name and description are required");

	// @ts-ignore
	const project = await Project.create({ name, description, status, user: req.user._id });

	return res.status(201).json(new ApiResponse(201, project, "Project created"));
});

const getProjects = asyncHandler(async (req: Request, res: Response) => {
	// return projects for current user
	// @ts-ignore
	const userId = req.user._id;
	const projects = await Project.find({ user: userId }).sort({ createdAt: -1 });
	return res.status(200).json(new ApiResponse(200, projects, "Projects fetched"));
});

const getProjectById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;


	const project = await Project.findById(id).populate("tasks");
	if (!project) throw new ApiError(404, "Project not found");

	// @ts-ignore
	const currentUser = req.user;
	if (project.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	return res.status(200).json(new ApiResponse(200, project, "Project fetched"));
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) throw new ApiError(404, "Project not found");

    // @ts-ignore
    const currentUser = req.user;
    if (project.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
        throw new ApiError(403, "Forbidden");
    }

    // Only allow safe fields to be updated here — tasks should be managed via add/removeTask endpoints
    const allowedFields = ["name", "description", "status"];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            updates[key] = req.body[key];
        }
    }

    // If there's nothing to change, return the existing project
    if (Object.keys(updates).length === 0) {
        return res.status(200).json(new ApiResponse(200, project, "No updatable fields provided"));
    }

    // Use findByIdAndUpdate to get the updated document and run validators
    const updatedProject = await Project.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json(new ApiResponse(200, updatedProject, "Project updated"));
});

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const project = await Project.findById(id);
	if (!project) throw new ApiError(404, "Project not found");

	// @ts-ignore
	const currentUser = req.user;
	if (project.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	await Project.findByIdAndDelete(id)

	return res.status(200).json(new ApiResponse(200, {}, "Project deleted"));
});

// Add a task to project's tasks array (idempotent)
const addTaskToProject = asyncHandler(async (req: Request, res: Response) => {
	const { projectId, taskId } = req.params;

	const project = await Project.findById(projectId);
	const task = await Task.findById(taskId);
	if (!project || !task) throw new ApiError(404, "Project or Task not found");

	// @ts-ignore
	const currentUser = req.user;
	if (project.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	// avoid duplicates
	const exists = project.tasks?.some((t: any) => t.toString() === taskId);
	if (!exists) {
		project.tasks.push(task._id);
		await project.save();
	}

	return res.status(200).json(new ApiResponse(200, project, "Task added to project"));
});

// Remove a task from a project
const removeTaskFromProject = asyncHandler(async (req: Request, res: Response) => {
	const { projectId, taskId } = req.params;


	const project = await Project.findById(projectId);
	if (!project) throw new ApiError(404, "Project not found");

	// @ts-ignore
	const currentUser = req.user;
	if (project.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	project.tasks = project.tasks?.filter((t: any) => t.toString() !== taskId) || [];
	await project.save();

	return res.status(200).json(new ApiResponse(200, project, "Task removed from project"));
});

// Return tasks belonging to a project (populated)
const getProjectTasks = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const project = await Project.findById(id).populate("tasks");
	if (!project) throw new ApiError(404, "Project not found");

	// @ts-ignore
	const currentUser = req.user;
	if (project.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	return res.status(200).json(new ApiResponse(200, project.tasks || [], "Project tasks"));
});

export {
	createProject,
	getProjects,
	getProjectById,
	updateProject,
	deleteProject,
	addTaskToProject,
	removeTaskFromProject,
	getProjectTasks,
};

