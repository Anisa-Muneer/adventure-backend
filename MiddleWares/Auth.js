import  jwt  from "jsonwebtoken";
import User from '../Models/userModel';
import dotenv from 'dotenv';
dotenv.config()

export const userAuth = async(req,res,next)=>{
    try {
       if(req.header.authorization){
        let token = req.header.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWTUSERSECRET)
        const user = await User.findOne({_id:decoded.userId})
        if(user){
            if(user.is_blocked === false){
                next()
            }else{
                return res.status(403).json({data: {message:'You are blocked by admin'}})
            }
        }else{
            return res.status(400).json({message:'user not authorised or invalid user'})
        }
       }else{
        return res.status(400).json({message:'user not authorised'})
       } 
    } catch (error) {
        console.log(error.message);
    }
}