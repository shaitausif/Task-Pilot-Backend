import { CookieOptions } from "express"
import { JwtPayload } from "jsonwebtoken";


export const accessTokenCookieOptions: CookieOptions = {    
        httpOnly : true,
        secure : process.env.NODE_ENV ? process.env.NODE_ENV == "development" ? false : true : true,
        maxAge: 3600000 * 24, // 1 day
        sameSite: 'lax'
        
}

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly : true,
    secure : true,
    maxAge: 3600000 * 24 * 7, // 7 days
    sameSite: 'lax'
}


export interface AuthPayload extends JwtPayload {
  _id: string;
}