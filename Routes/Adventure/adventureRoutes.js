import express from 'express'
const router = express.Router()
import { adventureAuth } from '../../MiddleWares/Auth.js'
import { ProfileImage, addCategory, advCategory, allCategory, editProfile, getAdventure, manageCategory, manageCategoryList } from '../../Controllers/adventureController.js'
import upload from '../../MiddleWares/Multer.js'
import { addSlots, getSlotDate, getSlots, slotCategory, userBooking } from '../../Controllers/slotController.js'


router.get('/profile/:id',adventureAuth,getAdventure)
router.put('/editProfile/:id',editProfile)
router.get('/advCategory',adventureAuth,advCategory)
router.post('/imageEdit', upload.single('image'),adventureAuth,ProfileImage );

router.post('/addSlots',adventureAuth,addSlots)
router.get('/slotCategory',adventureAuth,slotCategory)
router.get('/slotDate',adventureAuth,getSlotDate)
router.get('/slots',adventureAuth,getSlots)

router.post('/addCategory',upload.single('image'),adventureAuth,addCategory)
router.get('/allCategory',adventureAuth,allCategory)
router.put('/manageCategory/:id',adventureAuth,manageCategory)
router.put('/manageCategoryList/:id',adventureAuth,manageCategoryList)
router.get('/userBooking',userBooking)

export default router