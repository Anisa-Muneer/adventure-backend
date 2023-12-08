import Adventure from "../Models/adventureModel.js";
import Booking from "../Models/bookingModel.js";
import User from "../Models/userModel.js";
import { sendRejectionMail } from "../utils/sendMail.js";



export const allAdventures = async(req,res,next)=>{
    try {
        const adventures = await Adventure.find()
        return res.status(200).json({data : adventures})
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}

export const allUsers = async(req,res,next)=>{
    try {
        const users = await User.find({is_admin:false})
        return res.status(200).json({data : users})
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}

export const manageUsers = async(req,res,next)=>{
    try {
        const id = req.params.id
        const user = await User.findById(id)
        if(user){
            await User.updateOne(
                {_id:id},
                {$set : {is_blocked : !user.is_blocked}}
            )
            return res.status(200).json({ message : user.is_blocked ? "User is blocked" : "User unblocked"})
        }else{
            return res.status(200).json({ message : 'User is not found'})
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}

export const manageAdventure = async(req,res,next)=>{
    try {
        const id = req.params.id
        const adventure = await Adventure.findById(id)
        if(adventure){
            await Adventure.updateOne(
                {_id:id},
                {$set : {is_blocked : !adventure.is_blocked}}
            )
            return res.status(200).json({ message : adventure.is_blocked ? "Host is blocked" : "Host unblocked"})
        }else{
            return res.status(200).json({ message : 'Host is not found'})
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const notVerified = async(req,res,next)=>{
    try {
        const notVerified = await Adventure.find({verified : false, requested: true})
        if(notVerified){
            return res.status(200).json({data : notVerified, message : 'Data recieved'})
        }else{
            return res.status(200).json({message : 'Data not found'})
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}

export const getAdventure = async(req,res,next)=>{
    try {
       
        const id = req.params.id

        const data = await Adventure.findById(id)
        if(data){
            return res.status(200).json({ data : data})
        }else{
            return res.status(200).json({message : 'Data not found'})
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}

export const verifyAdventure = async(req,res,next)=>{
    try {
        const id = req.params.id
        const verified = await Adventure.updateOne(
            {_id : id},
            {$set : {verified : true}}
        )
        if(verified){
            return res.status(200).json({verified  : true, message : 'Verification successfull'})
        }else{
            return res.status(200).json({message : 'Verification failed'})
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}


export const adminBooking = async(req,res,next)=>{
    try {
       const booking = await Booking.find().populate("adventureId").populate("userId")
       return res.status(200).json({data : booking, message : 'Booking data found'})
    } catch (error) {
        return res.status(500).json({ error: error.message });

    }
}

export const rejectAdventure = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;
    const reject = await Adventure.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          requested: false,
        },
      }
    );
    await sendRejectionMail(reject.email, "verification rejected", reason);

    return res.status(200).json({ reject: true, message: "adventure rejected" });
  } catch (error) {
    console.log(error.message);
  }
};