import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { Task } from "../models/task.model.js";
import { Notes } from "../models/notes.model.js";
import { Project } from "../models/projects.model.js";



const getUserDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    // Data to fetch for the current User:
    /*
        total tasks
        completed tasks
        pending tasks
        total notes
        total projects
    */

    // build aggregation against the User collection and lookup related collections
    // use collection names from model.collection.name to avoid hard-coding
    // @ts-ignore
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const dashboardData = await User.aggregate([
      { $match: { _id: userId } },

      // bring user's tasks, notes and projects into this pipeline
      {
        $lookup: {
          from: Task.collection.name,
          localField: "_id",
          foreignField: "user",
          as: "tasks",
        },
      },
      {
        $lookup: {
          from: Notes.collection.name,
          localField: "_id",
          foreignField: "user",
          as: "notes",
        },
      },
      {
        $lookup: {
          from: Project.collection.name,
          localField: "_id",
          foreignField: "user",
          as: "projects",
        },
      },

      // compute counts. Use $filter + $size for robust counting (case-insensitive match for completed)
      {
        $addFields: {
          totalTasks: { $size: { $ifNull: ["$tasks", []] } },

          completedTasks: {
            $size: {
              $filter: {
                input: { $ifNull: ["$tasks", []] },
                as: "t",
                cond: {
                  $eq: [
                    { $toLower: { $ifNull: ["$$t.status", ""] } },
                    "Completed",
                  ],
                },
              },
            },
          },

          pendingTasks: {
            $size: {
              $filter: {
                input: { $ifNull: ["$tasks", []] },
                as: "t",
                cond: {
                  $ne: [
                    { $toLower: { $ifNull: ["$$t.status", ""] } },
                    "Completed",
                  ],
                },
              },
            },
          },

          recentTasks: {
            $slice: [
              {
                $sortArray: {
                  input: { $ifNull: ["$tasks", []] },
                  sortBy: { createdAt: -1 }
                }
              },
              5
            ]
          }
,
          totalNotes: { $size: { $ifNull: ["$notes", []] } },
          totalProjects: { $size: { $ifNull: ["$projects", []] } },
        },
      },

      // only return the counts we need
      {
        $project: {
          _id: 0,
          totalTasks: 1,
          completedTasks: 1,
          pendingTasks: 1,
          totalNotes: 1,
          totalProjects: 1,
          recentTasks: 1,
        },
      },
    ]);

    const stats = (dashboardData && dashboardData[0]) || {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalNotes: 0,
      totalProjects: 0,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "User dashboard statistics"));
  }
);

const getAdminDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    // Ensure only admins can access platform-level statistics
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== "Admin") {
      throw new ApiError(403, "Forbidden");
    }

    // Run counts in parallel for performance
    const [totalUsers, totalTasks, totalNotes, totalProjects] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Notes.countDocuments(),
      Project.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      totalTasks,
      totalNotes,
      totalProjects,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "Admin dashboard statistics"));
  }
);

export { getUserDashboardStats, getAdminDashboardStats };
