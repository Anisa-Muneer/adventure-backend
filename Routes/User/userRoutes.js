import express from 'express'
import { advProfile, adventureFilter, getUser, updateImage } from '../../Controllers/userController.js'
import { userAuth } from '../../MiddleWares/Auth.js';
import upload from '../../MiddleWares/Multer.js';
import { bookingDetails, getSlotDateUser, getSlotsUser, payment, paymentSuccess } from '../../Controllers/slotController.js';
const router = express.Router()

router.get('/profile',userAuth,getUser)
router.post('/imgupdate', upload.single('image'),userAuth,updateImage );
router.get('/adventureFilter',adventureFilter)

router.get('/slotdate',userAuth,getSlotDateUser)
router.get('/slotsuser',userAuth,getSlotsUser)
router.get('/payment/:id/:category',payment)
router.post('/paymentSuccess',userAuth,paymentSuccess)
router.get('/bookingDetails',bookingDetails)

router.get('/advProfile/:id',advProfile)

export default router;