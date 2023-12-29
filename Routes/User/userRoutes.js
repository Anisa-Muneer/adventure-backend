import express from 'express'
import { addReview, advProfile, adventureFilter, adventurePost, fetchChats, getReview, getUser, searchUsers, updateImage, walletAmount, walletpaymentSuccess } from '../../Controllers/userController.js'
import { userAuth } from '../../MiddleWares/Auth.js';
import upload from '../../MiddleWares/Multer.js';
import { bookingDetails, cancelBooking, getSlotDateUser, getSlotsUser, payment, paymentSuccess, walletHistory, walletPayment } from '../../Controllers/slotController.js';
import { accessChat, allMessages, sendMessage } from '../../Controllers/chatController.js';
const router = express.Router()

router.get('/profile', userAuth, getUser)
router.post('/imgupdate', upload.single('image'), userAuth, updateImage);
router.get('/adventureFilter', userAuth, adventureFilter)

router.get('/slotdate', userAuth, getSlotDateUser)
router.get('/slotsuser', userAuth, getSlotsUser)
router.get('/payment/:id/:category', userAuth, payment)
router.post('/paymentSuccess', userAuth, paymentSuccess)
router.get('/bookingDetails', userAuth, bookingDetails)
router.put('/cancelBooking', userAuth, cancelBooking)
router.post('/walletPayment', userAuth, walletPayment)
router.get('/walletHistory', userAuth, walletHistory)

router.get("/walletamount/:id/:amount", userAuth, walletAmount);
router.put("/walletpaymentSuccess", userAuth, walletpaymentSuccess);


router.get('/advProfile/:id', userAuth, advProfile)
router.get('/adventurePost/:id', userAuth, adventurePost)

router.post('/accesschat', userAuth, accessChat)
router.get('/fetchchat/:userId', userAuth, fetchChats)
router.get('/usersearch', userAuth, searchUsers)
router.post('/message', userAuth, sendMessage)
router.get('/message/:chatId', userAuth, allMessages)

router.post('/review', userAuth, addReview)
router.get('/review/:id', userAuth, getReview)


export default router;