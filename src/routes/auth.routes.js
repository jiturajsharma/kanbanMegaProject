import { Router } from 'express'
import { registerUser, verifyEmail } from '../controllers/auth.controllers.js'
import { validate } from '../middlewares/validator.middleware.js'
import { userRegistrationValidator } from '../validators/user.validators.js'


const router = Router();

router.route("/register").post(userRegistrationValidator(), validate, registerUser)
router.route("/verify-email").post(verifyEmail)


export default router;