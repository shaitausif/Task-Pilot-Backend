import { CookieOptions } from "express"
import { JwtPayload } from "jsonwebtoken";


export const accessTokenCookieOptions: CookieOptions = {
    httpOnly : true,
    secure : true, // Must be true for SameSite='None' in production
    maxAge: 3600000 * 24, // 1 day
    sameSite: 'lax' ,// Must be 'None' for cross-site cookies

};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly : true,
    secure : true, // Must be true
    maxAge: 3600000 * 24 * 7, // 7 days
    sameSite: 'lax' ,// Must be 'None'

};


export interface AuthPayload extends JwtPayload {
  _id: string;
}