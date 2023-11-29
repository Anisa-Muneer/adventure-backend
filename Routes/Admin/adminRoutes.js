import express, { Router } from 'express'
const router = express.Router()
import {  allAdventures,  allUsers, getAdventure, manageAdventure,  manageUsers, notVerified, verifyAdventure } from '../../Controllers/adminController.js'
import { adminAuth } from '../../MiddleWares/Auth.js'

router.get('/adventures',adminAuth,allAdventures)
router.get('/users',allUsers)
router.put('/manageUsers/:id',manageUsers)
router.put('/manageAdventure/:id',manageAdventure)
router.get('/notVerified',notVerified)
router.get('/adventure/:id',getAdventure)
router.put('/verify/:id',verifyAdventure)




export default router