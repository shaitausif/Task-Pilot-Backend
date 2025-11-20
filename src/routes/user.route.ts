import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { changeCurrentPassword, deleteCurrentUserAccount, deleteUser, getAllUsers, getCurrentUser, getUserById, updateProfile, updateUserRole } from "../controllers/user.controller.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validator.js";
import { validate } from "../validators/validate.js";
import { changePasswordValidator, profileValidator } from "../validators/user.validator.js";
const router = Router()


router.use(authenticateJWT)


router.route('/get-all-users').get(getAllUsers)

router.route('/get-current-user').get(getCurrentUser)

router.route('/get-user-by-id/:userId').get(mongoIdPathVariableValidator("userId"), validate, getUserById)

router.route('/update-user-role/:userId').patch(mongoIdPathVariableValidator("userId"), validate, updateUserRole)

router.route('/delete-user/:userId').delete(mongoIdPathVariableValidator("userId"), validate, deleteUser)

router.route('/delete-current-user-account').delete(deleteCurrentUserAccount)

router.route('/change-password').patch(changePasswordValidator, validate, changeCurrentPassword)

router.route('/update-profile').patch(profileValidator, validate, upload.single('avatar') ,  updateProfile)

export default router