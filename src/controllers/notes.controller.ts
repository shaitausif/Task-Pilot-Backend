import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Notes } from "../models/notes.model.js";
import mongoose from "mongoose";

/*
	Note controllers
	- createNote: create a new note for current user
	- getNotes: fetch notes for current user
	- getNoteById: fetch a single note (owner or admin)
	- updateNote: update a note (owner or admin)
	- deleteNote: delete a note (owner or admin)
	- searchNotes: search notes by title/content/tags (current user only)

	These handlers use `req.user` injected by `authenticateJWT` middleware.
*/

// Create a new note for the authenticated user
const createNote = asyncHandler(async (req: Request, res: Response) => {
	// validate required fields
	const { title, content, tag } = req.body;

	if (!title || !content) {
		// Bad request when essential fields are missing
		throw new ApiError(400, "Title and content are required");
	}

	// `req.user` is set by the auth middleware; using ts-ignore to avoid TS complaints
	// We intentionally store only the user's _id reference here to keep the note small.
	
	const note = await Notes.create({ title, content, tag, user: req.user._id });

	return res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
});


// Get all notes for the current authenticated user (most recent first)
const getNotes = asyncHandler(async (req: Request, res: Response) => {
	
	const userId = req.user._id;

	const notes = await Notes.find({ user: userId }).sort({ createdAt: -1 });

	return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"));
});


// Get a single note by id. Owners and Admins can access.
const getNoteById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;


	const note = await Notes.findById(id);
	if (!note) throw new ApiError(404, "Note not found");

	// Authorization: allow owner or Admin
	
	const currentUser = req.user;
	if (note.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	return res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
});


// Update a note. Partial updates allowed.
const updateNote = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const note = await Notes.findById(id);
	if (!note) throw new ApiError(404, "Note not found");

	// Authorization check: only owner or Admin can modify
	
	const currentUser = req.user;
	if (note.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	// Only apply fields that come from the client; leave timestamps intact
	const updates = req.body;
	Object.assign(note, updates);
	await note.save();

	return res.status(200).json(new ApiResponse(200, note, "Note updated successfully"));
});


// Delete a note. Owner or Admin only.
const deleteNote = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;
	const note = await Notes.findById(id);
	if (!note) throw new ApiError(404, "Note not found");

	// Authorization
	
	const currentUser = req.user;
	if (note.user?.toString() !== currentUser._id.toString() && currentUser.role !== "Admin") {
		throw new ApiError(403, "Forbidden");
	}

	await Notes.findByIdAndDelete(id)

	return res.status(200).json(new ApiResponse(200, {}, "Note deleted successfully"));
});


// Search notes for current user by title/content/tags. Simple text search using regex.
// This is intentionally lightweight and does not require text indexes; if performance
// becomes an issue we should add a text index and switch to `$text` search.
const searchNotes = asyncHandler(async (req: Request, res: Response) => {
	const { q, tag } = req.query as any;

	const filter: any = {};

	// restrict to current user (no admin-wide search here)
	
	const currentUser = req.user;
	filter.user = currentUser._id;

	if (q) {
		filter.$or = [
			{ title: { $regex: q, $options: "i" } },
			{ content: { $regex: q, $options: "i" } },
		];
	}

	if (tag) filter.tag = tag;

	const notes = await Notes.find(filter).sort({ createdAt: -1 });

	return res.status(200).json(new ApiResponse(200, notes, "Search results"));
});


export { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes };

