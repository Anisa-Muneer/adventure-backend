import express from 'express'
import { Login, verification, Signup, SignupWithGoogle } from '../../Controllers/userAuthController.js'
import { getUser } from '../../Controllers/userController.js';
const router = express.Router()

router.post('/signup',Signup)
router.get("/:id/verify/:token", verification);
router.post('/login',Login)
router.post('/googleSignup',SignupWithGoogle)

export default router;