import express from 'express'
const router = express.Router()
 import { Login } from '../../Controllers/adminAuthController.js'

 router.post('/login',Login)

 export default router