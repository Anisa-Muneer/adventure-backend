import express, { Router } from 'express'
const router = express.Router()
import {  adminBooking, allAdventures,  allUsers, getAdventure, manageAdventure,  manageUsers, notVerified, rejectAdventure, verifyAdventure } from '../../Controllers/adminController.js'
import { adminAuth } from '../../MiddleWares/Auth.js'

router.get('/adventures',adminAuth,allAdventures)
router.get('/users',adminAuth,allUsers)
router.put('/manageUsers/:id',adminAuth,manageUsers)
router.put('/manageAdventure/:id',adminAuth,manageAdventure)
router.get('/notVerified',adminAuth,notVerified)
router.get('/adventure/:id',adminAuth,getAdventure)
router.put('/verify/:id',adminAuth,verifyAdventure)
router.get('/booking',adminAuth,adminBooking)
router.put('/rejectAdventure/:id',adminAuth,rejectAdventure)



export default router