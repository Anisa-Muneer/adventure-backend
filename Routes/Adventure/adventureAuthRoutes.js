import express from 'express'
const router = express.Router()
import { Signup, Login, SignupWithGoogle } from '../../Controllers/adventureAuthController.js'


router.post('/signup',Signup)
router.post('/login',Login)
router.post('/googlesignup',SignupWithGoogle)



export default router