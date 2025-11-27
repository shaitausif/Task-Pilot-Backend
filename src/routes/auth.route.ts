import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { validate } from "../validators/validate.js";
const router = Router()




router.route('/register').post(
    upload.single('avatar'),
    registerValidator,
    validate,
    registerUser
)

router.route('/login').post(
    loginValidator,
    validate,
    loginUser
)


router.route('/logout').post(authenticateJWT, logoutUser)


router.route('/refresh-tokens').get(refreshAccessToken)




export default router