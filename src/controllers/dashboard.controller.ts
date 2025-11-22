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
    // @ts-ignore
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const dashboardData = await User.aggregate([
      { $match: { _id: userId } }, // bring user's tasks, notes and projects into this pipeline (unchanged)

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
      }, // compute counts

      {
        $addFields: {
          totalTasks: { $size: { $ifNull: ["$tasks", []] } }, // 1. COMPLETED TASKS (Case-insensitive check for 'completed')

          completedTasks: {
            $size: {
              $filter: {
                input: { $ifNull: ["$tasks", []] },
                as: "t",
                cond: {
                  $eq: [
                    { $toLower: { $ifNull: ["$$t.status", ""] } },
                    "completed",
                  ],
                },
              },
            },
          },

          // 2. NEW: IN PROGRESS TASKS (Case-insensitive check for 'in progress')
          inProgressTasks: {
            $size: {
              $filter: {
                input: { $ifNull: ["$tasks", []] },
                as: "t",
                cond: {
                  $eq: [
                    { $toLower: { $ifNull: ["$$t.status", ""] } },
                    "in-progress",
                  ],
                },
              },
            },
          }, // 3. PENDING TASKS (Case-insensitive check for 'pending')

          pendingTasks: {
            $size: {
              $filter: {
                input: { $ifNull: ["$tasks", []] },
                as: "t",
                cond: {
                  $eq: [
                    { $toLower: { $ifNull: ["$$t.status", ""] } },
                    "pending",
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
                  sortBy: { createdAt: -1 },
                },
              },
              5,
            ],
          },

          totalNotes: { $size: { $ifNull: ["$notes", []] } },
          totalProjects: { $size: { $ifNull: ["$projects", []] } },
        },
      }, // update $project stage to include the new field

      {
        $project: {
          _id: 0,
          totalTasks: 1,
          completedTasks: 1,
          inProgressTasks: 1, // <--- New field added
          pendingTasks: 1,
          totalNotes: 1,
          totalProjects: 1,
          recentTasks: 1,
        },
      },
    ]);

    // update default stats object
    const stats = (dashboardData && dashboardData[0]) || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0, // <--- New field added
      pendingTasks: 0,
      totalNotes: 0,
      totalProjects: 0,
      recentTasks: [],
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
    const [totalUsers, totalTasks, totalNotes, totalProjects] =
      await Promise.all([
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
