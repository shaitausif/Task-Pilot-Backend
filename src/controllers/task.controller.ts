import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Task } from "../models/task.model.js";



const createTask = asyncHandler(async (req: Request, res: Response) => {
	const { title, description, status, priority, dueDate } = req.body;

	if (!title || !description) {
		throw new ApiError(400, "Title and description are required");
	}

	const task = await Task.create({
		title,
		description,
		status,
		priority,
		dueDate,
		user: req.user._id,
	});

	return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
});


const getTasks = asyncHandler(async (req: Request, res: Response) => {
	// returns tasks for current user only
	// @ts-ignore
	const userId = req.user._id;

	const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });

	return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});


const getTaskById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;



	const task = await Task.findById(id);

	if (!task) throw new ApiError(404, "Task not found");

	// allow access if owner or admin
	// @ts-ignore
	const currentUser = req.user;
	if (task.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully"));
});


const updateTask = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;



	const task = await Task.findById(id);
	if (!task) throw new ApiError(404, "Task not found");

	// authorization: owner or admin
	// @ts-ignore
	const currentUser = req.user;
	if (task.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	const updates = req.body;
	
	if(!updates) throw new ApiError(400, "Fields are required")

	Object.assign(task, updates);
	await task.save();

	return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
});


const deleteTask = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const task = await Task.findById(id);
	if (!task) throw new ApiError(404, "Task not found");

	// authorization: owner or admin
	// @ts-ignore
	const currentUser = req.user;
	if (task.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	
	await Task.findByIdAndDelete(id)
	return res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
});


const searchTasks = asyncHandler(async (req: Request, res: Response) => {
	// supports query: q (text), status, priority, dueFrom, dueTo
	const { q, status, priority, dueFrom, dueTo } = req.query as any;

	const filter: any = {};

	// if the user is not admin, restrict to their tasks
	// @ts-ignore
	const currentUser = req.user;
	if (!currentUser || currentUser.role !== "Admin") {
		// @ts-ignore
		filter.user = currentUser._id;
	}

	if (q) {
		filter.$or = [		
			{ title: { $regex: q, $options: "i" } },
			{ description: { $regex: q, $options: "i" } },
		];
	}

	if (status) filter.status = status;
	if (priority) filter.priority = priority;

	if (dueFrom || dueTo) {
		filter.dueDate = {};
		if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
		if (dueTo) filter.dueDate.$lte = new Date(dueTo);
	}

	const tasks = await Task.find(filter).sort({ createdAt: -1 });

	return res.status(200).json(new ApiResponse(200, tasks, "Search results"));
});


const getAllTasksForAdmin = asyncHandler(async (req: Request, res: Response) => {
	// admin only
	const currentUser = req.user;
	if (!currentUser || currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	const { status, priority, q } = req.query as any;
	const filter: any = {};

	if (q) {
		filter.$or = [
			{ title: { $regex: q, $options: "i" } },
			{ description: { $regex: q, $options: "i" } },
		];
	}

	if (status) filter.status = status;
	if (priority) filter.priority = priority;

	const tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(10);

	return res.status(200).json(new ApiResponse(200, tasks, "All tasks fetched"));
});


export {
	createTask,
	getTasks,
	getTaskById,
	updateTask,
	deleteTask,
	searchTasks,
	getAllTasksForAdmin,
};

