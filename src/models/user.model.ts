import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


enum Role {
    Admin = "Admin",
    User = "User"
}

export interface UserInterface extends Document{
    fullName: string;
    username: string;
    email: string;
    password : string;
    avatar? : string;
    bio? : string;
    lastlogin : Date;
    role : Role;
    createdAt: Date;
    updatedAt: Date;
    refreshToken? : String
}



const userSchema = new Schema<UserInterface>({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type : String,
        required: true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    avatar : String,
    bio : String,
    lastlogin : {
        type : Date
    },
    role : {
        type : String,
        required : true,
        default : Role.User,
        enum : Object.values(Role)
    },
    refreshToken : {
        type : String
    }
    
}, {
    timestamps : true
})




// Here I'm going to use pre hook of mongoose to encrypt the password before saving it in the database Link : https://mongoosejs.com/docs/middleware.html#pre
// First we'll specify the event on which this middleware should run https://mongoosejs.com/docs/middleware.html
// Don't use arrow functions here — we need `function` to access the correct `this` (bound to the Mongoose document)


userSchema.pre("save",async function(next){
    // Only hash the password if it's created for first time or only the password field has been changed
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
//  Pass the control to the next middleware
    next()
    
})



// here, i will define custom methods using the methods object of mongoose's schemas
// It will also has access to this document before saving or after saving it into the database
// I would have no access to this model fields if i had created a normal functions
userSchema.methods.isPasswordCorrect = async function(password: string){
    return await bcrypt.compare(password, this.password)
    // It will return true or false
}



// I'm going to generate access token and refresh token both with different uses but are jwt
// Here both the tokens are doing the same work but the refresh token will contain less information compared to access token and will have longer expiry date to keep the users logged in
userSchema.methods.generateAccessToken = function(){
    // these methods have the access of all the fields in the database and we can access them using this keyword
    // @ts-ignore
    return jwt.sign(
        {
            // this object contains the payload
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET!,
        // the below object contains the expiry information of this token
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}   



userSchema.methods.generateRefreshToken = function(){
    // these methods have the access of all the fields in the database and we can access them using this keyword
    // @ts-ignore
    return jwt.sign(
        {
            // this object contains the payload
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET!,
        // the below object contains the expiry information of this token
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}








export const User = mongoose.models.User || mongoose.model<UserInterface>("User",userSchema)