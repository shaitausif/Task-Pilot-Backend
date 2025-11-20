// This middleware will only to Authenticate the user

import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { AuthPayload } from "../utils/index.js";



export const authenticateJWT  = asyncHandler(async (req: Request, res: Response ,next: NextFunction) => {
   try {
    // By using app.use(cookieParser()) now we have the access of req.cookies
    // we can either get the token from cookies or from header
    // For more : https://jwt.io/introduction
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    // we're getting this accessToken because we've injected it while logging in the user res.cookie("accessToken")
    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    // Now, if the token exists then decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as AuthPayload

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401, "Invalid Access Token")
    }

    // Now if the user with this access token exists and is in the database then save it in the request object like this
    req.user = user
    next()
   } 
   catch (error: any) {
        throw new ApiError(401, error?.message || "Invalid access token")
   }


})