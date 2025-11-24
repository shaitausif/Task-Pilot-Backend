import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Request, Response } from "express";


export const healthCheck = asyncHandler(async(req: Request, res: Response) => {
    return res.status(200).json(new ApiResponse(200, {}, "Service is running properly."))
})