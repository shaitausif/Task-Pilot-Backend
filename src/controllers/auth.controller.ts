import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { Request, Response } from "express";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../utils/index.js'
import { AuthPayload } from '../utils/index.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'


// This controller is responsible for registering the user
const registerUser = asyncHandler(async(req: Request, res: Response) => {
    
    const { fullName, username, email, password } = req.body;

    if(!fullName || !username || !email || !password ){
        throw new ApiError(400, "All fields are required.");
    }

    const isExistingUser = await User.findOne({
        $or : [
            {username}, {email}
        ]
    })

    

    if(isExistingUser){
        throw new ApiError(409, "User with Email or Username already exists")
    }

    // @ts-ignore
     const avatarLocalPath = req.file.path
     console.log("Avatar Local Path",avatarLocalPath)
    if(avatarLocalPath){
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if(!avatar) throw new ApiError(500, "Failed to upload Avatar on Cloudinary")

        const user = await User.create({
            fullName,
            username,
            avatar : avatar.secure_url,
            email,
            password
        })
        if(!user) throw new ApiError(500, "Unable to register the User.")
           
        return res.status(201).json(new ApiResponse(201, {}, "User registered successfully."))
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password
    })

    // Avoid mixing inclusion and exclusion in projection. Exclude both sensitive fields explicitly.


    if(!user) throw new ApiError(500, "Unable to register the User.")

    return res.status(201).json(new ApiResponse(201, {}, "User registered successfully."))

})


// creating a seperate function for generating both access and refresh tokens
const generateAccessAndRefreshTokens = async(userId: mongoose.Schema.Types.ObjectId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        // Here we've successfully generated both access and refresh tokens and now we'll give the access token to the user and also store the refresh token in the database
        user.refreshToken = refreshToken;
        // here we don't want any further mongoose validation like password is required so we'll save it like this
        await user.save({validateBeforeSave: false})

        // now return the access token and refresh token
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}


const loginUser = asyncHandler(async(req: Request, res: Response) => {
    // Algorithm to login the user
    // 1. Take input of email or username and password as request
    // 2. Verify the presence of the same email or username with the same password in the database and if it exists then give access and refresh token to user
    // 3. send the tokens in the cookies

    const {identifier, password} = req.body

    if(!identifier){
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or : [
            {username: identifier},
            {email: identifier}
        ]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    // Using the custom method we've defined in the user model
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password is Incorrect")
    }
    user.lastlogin = new Date()
    await user.save();
    // collect the refresh and access token from our function
    const{ accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // but before sending the user's information in the cookies remove the unwanted fields like password and refreshToken
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    

    return res
    .status(200)
    .cookie("accessToken",accessToken,accessTokenCookieOptions)
    .cookie("refreshToken",refreshToken,refreshTokenCookieOptions)
    .json(
        new ApiResponse(200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"   
        )
    )

})



const logoutUser = asyncHandler(async(req: Request, res: Response) => {
    // The first when user clicks on logged out then clear his cookie first
    // and also to clear the refresh token from the user's database
    // Just because of using this req.user = user in our verifyJWT middleware now we have access of current logged in user's document

    await User.findByIdAndUpdate(req.user._id,
        {   
            // This removes the field from the document
            $unset : {
                refreshToken : 1
            }
          
        },{
            new : true
        }
    )

    // Now refresh token has been viped out from the database now let's remove cookies from user's browser
    
    return res
    .status(200)
    .clearCookie("accessToken",accessTokenCookieOptions)
    .clearCookie("refreshToken",refreshTokenCookieOptions)
    .json(new ApiResponse(200,{},"User Logged out successfully"))


})




const refreshAccessToken = asyncHandler(async(req: Request, res: Response) => {

        // First take the refreshToken from cookies or from the user's body
    // check for validity of this refreshToken and if the user exists in the database with this refreshToken then generate a new accessToken and pass it to the user in it's cookie

    const IncomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken

    if(!IncomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as AuthPayload
    if(!decodedToken){
        throw new ApiError(401, "Token is invalid")
    }

    const user = await User.findById(decodedToken._id)
    if(!user){
     throw new ApiError(401, "Invalid refresh token")   
    }

    // Now compare both refresh tokens
    if(IncomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }


    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)


    return res
    .status(200)
    .cookie("accessToken",accessToken, accessTokenCookieOptions)
    .cookie("refreshToken",refreshToken, refreshTokenCookieOptions)
    .json(
        new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed")
    )
   

    
})



export {
    loginUser,
    registerUser,
    refreshAccessToken,
    logoutUser
}