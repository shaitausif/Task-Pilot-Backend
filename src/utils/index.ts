import { CookieOptions } from "express"
import { JwtPayload } from "jsonwebtoken";
const COOKIE_DOMAIN = 'task-pilot-frontend-aoax.onrender.com';

export const accessTokenCookieOptions: CookieOptions = {
    httpOnly : false,
    secure : true, // Must be true for SameSite='None' in production
    maxAge: 3600000 * 24, // 1 day
    sameSite: 'none' ,// Must be 'None' for cross-site cookies
    domain : COOKIE_DOMAIN
};

export const refreshTokenCookieOptions: CookieOptions = {
    httpOnly : false,
    secure : true, // Must be true
    maxAge: 3600000 * 24 * 7, // 7 days
    sameSite: 'none' ,// Must be 'None'
    domain : COOKIE_DOMAIN

};


export interface AuthPayload extends JwtPayload {
  _id: string;
}