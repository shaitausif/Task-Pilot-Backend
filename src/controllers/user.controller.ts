import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";





const updateProfile = asyncHandler(async(req: Request, res: Response) => {
    // Update fields such as fullName, username, bio, email and avatar
    const { fullName, username, email, bio } = req.body;

    if(!username && !fullName && !email && !bio){
        throw new ApiError(400, "All fields are required.")
    } 

    

    // @ts-ignore
    const avatarLocalPath = req.files?.avatar[0]?.path

    const user = await User.findById(req.user)
    if(!user) throw new ApiError(404, "User not found")
    
    //  If user has uploaded avatar as well than update it else just leave it as it it
    let avatar = null;
    if(avatarLocalPath){
        const oldAvatar = user.avatar
        if(oldAvatar) {
            const isDeleted = await deleteFromCloudinary(oldAvatar)
            if(isDeleted.result !== "ok") throw new ApiError(500,"Unable to delete the old Avatar from the Cloudinary.")
        }
        avatar = await uploadOnCloudinary(avatarLocalPath)
        if(!avatar) throw new ApiError(500, "Failed to upload avatar on Cloudinary.")
    }

    // Delete the unchanged files from the req.body
    for(const key in req.body){
        if(req.body[key] === user[key]){
            delete req.body[key]
        }
    }


    if(avatar){
        const updatedUser = await User.findByIdAndUpdate(req.user._id,
            {
                $set : { avatar: avatar.secure_url , ...req.body }
            },
            {
                new : true
            }
        ).select("-password -refreshToken")


     

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "User profile updated successfully.")
        )

    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : req.body
        },
    ).select("-password -refreshToken")
    

        return res.status(200).json(
            new ApiResponse(200, updatedUser, "User profile updated successfully.")
        )
    
})



const changeCurrentPassword = asyncHandler(async(req: Request, res: Response) => {
    const {oldPassword, newPassword} =  req.body

    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const isCorrectPassword = await user.isPasswordCorrect(oldPassword)
    if(!isCorrectPassword){
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

   
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))

})



const getAllUsers = asyncHandler(async(req: Request, res: Response) => {
    const user = await User.findById(req.user._id)

    if(!user) throw new ApiError(404, "User not found")

    // Get all the users except the current user
    const allUsers = await User.find({
        _id : {
            $ne : req.user._id
        }
    }).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, allUsers && allUsers.length != 0 ? allUsers : {}, allUsers && allUsers.length != 0 ? "Users fetched successfully." : "No users found"))

})



const getUserById = asyncHandler(async(req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId)

    if(!user) throw new ApiError(404, "No user found");

    return res.status(200).json(new ApiResponse(200, user, "User found successfully."))
})



// ADMIN ONLY
const updateUserRole = asyncHandler(async(req: Request, res: Response) => {
    const { role } = req.body;
    const { userId } = req.params

    const user = await User.findById(req.user._id)
    if(user.role != "Admin") throw new ApiError(401, "Unauthorized User")
    const isUserExist = await User.findByIdAndUpdate(
        userId,
        {
            role
        },
        {
            new : true
        }
    )

    if(!isUserExist) throw new ApiError(404, "User doesn't exist")

    

    return res.status(200).json(new ApiResponse(200, {_id : userId}, "User role updated successfully."))


})


// Delete User by their ID - ADMIN ONLY
const deleteUser = asyncHandler(async(req: Request, res: Response) => {
    const { userId } = req.params;
    
    if(userId == req.user._id) throw new ApiError(400, "You can't delete yourself via this route.")

    // Authorize the Current User
    const currentUser = await User.findById(req.user._id)

    
    if(currentUser && currentUser.role != "Admin") throw new ApiError(401, "You are not authorized to delete this user")

    const isUserDeleted = await User.findByIdAndDelete(userId)

    if(!isUserDeleted) throw new ApiError(404, "Unable not found")

    return res.status(200).json(new ApiResponse(200, isUserDeleted, "User Deleted successfully."))

})


const deleteCurrentUserAccount = asyncHandler(async(req: Request, res: Response) => {
    const isUserExist = await User.findByIdAndDelete(req.user._id)
    if(!isUserExist) throw new ApiError(500, "Unable to deleet the User from the Database.")
    
    return res.status(200).json(new ApiResponse(200, {}, "User Account Deleted succssfully."))
})



const getCurrentUser = asyncHandler(async(req: Request, res: Response) => {
    
    return res.status(200).json(new ApiResponse(200, req.user, "Current User fetched successfully."))
})



export {
    getAllUsers,
    getCurrentUser,
    getUserById,
    deleteUser,
    deleteCurrentUserAccount,
    changeCurrentPassword,
    updateUserRole,
    updateProfile
}