import express from 'express'

import { Signup } from '../../Controllers/userAuthController.js'
const router = express.Router()

router.post('/signup',Signup)

export default router;