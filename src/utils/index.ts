import { CookieOptions } from "express"
import { JwtPayload } from "jsonwebtoken";


export const accessTokenCookieOptions: CookieOptions = {
    httpOnly : true,
    secure : true, // Must be true for SameSite='None' in production
    maxAge: 3600000 * 24, // 1 day
    sameSite: 'none' ,// Must be 'None' for cross-site cookies
    domain : 'https://task-pilot-frontend-seven.vercel.app/'
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly : true,
    secure : true, // Must be true
    maxAge: 3600000 * 24 * 7, // 7 days
    sameSite: 'none' ,// Must be 'None'
    domain : 'https://task-pilot-frontend-seven.vercel.app/'
};


export interface AuthPayload extends JwtPayload {
  _id: string;
}