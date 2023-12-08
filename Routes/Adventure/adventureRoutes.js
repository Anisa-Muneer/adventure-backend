import express from 'express'
const router = express.Router()
import { adventureAuth, userAuth } from '../../MiddleWares/Auth.js'
import { ProfileImage, addCategory, advCategory, allCategory, editCategory, editProfile, fetchChats, getAdventure, manageCategory, manageCategoryList, searchUsers } from '../../Controllers/adventureController.js'
import upload from '../../MiddleWares/Multer.js'
import { addSlots, getSlotDate, getSlots, slotCategory, slotDelete, userBooking } from '../../Controllers/slotController.js'
import { adventureMessage } from '../../Controllers/chatController.js'


router.get('/profile/:id',adventureAuth,getAdventure)
router.put('/editProfile/:id',adventureAuth,editProfile)
router.get('/advCategory',adventureAuth,advCategory)
router.post('/imageEdit', upload.single('image'),adventureAuth,ProfileImage );

router.post('/addSlots',adventureAuth,addSlots)
router.get('/slotCategory',adventureAuth,slotCategory)
router.get('/slotDate',adventureAuth,getSlotDate)
router.get('/slots',adventureAuth,getSlots)
router.delete('/slotdelete/:id/:slotId',adventureAuth, slotDelete);


router.post('/addCategory',upload.single('image'),adventureAuth,addCategory)
router.get('/allCategory',adventureAuth,allCategory)
router.put('/manageCategory/:id',adventureAuth,manageCategory)
router.put('/manageCategoryList/:id',adventureAuth,manageCategoryList)
router.post('/editCategory',upload.single('image'),adventureAuth,editCategory)
router.get('/userBooking',adventureAuth,userBooking)

router.get('/fetchchat/:userId',adventureAuth,fetchChats)
router.get('/usersearch',adventureAuth,searchUsers)
router.post('/message',adventureAuth,adventureMessage)

export default router