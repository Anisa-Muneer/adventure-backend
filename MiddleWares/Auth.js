import  jwt  from "jsonwebtoken";
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
import Adventure from "../Models/adventureModel.js";
dotenv.config()

export const userAuth = async(req,res,next)=>{
    try {
       if(req.headers.authorization){
        console.log("in auth");
        let token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWTUSERSECRET)
        const user = await User.findOne({_id:decoded.userId})
        if(user){
            if(user.is_blocked === false){
                req.headers.userId = decoded.userId

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

export const adventureAuth = async(req,res,next)=>{
    try {
        if(req.headers.authorization){
            let token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWTADVENTURESECRET)
            const adventure = await Adventure.findOne({_id:decoded.adventureId})
            if(adventure){
                if(adventure.is_blocked===false){
                    req.headers.adventureId = decoded.adventureId
                    next()
                }else{
                    return res.status(403).json({data:{message:'You are blocked by admin'}})
                }
            }else{
                return res.status(400).json({message:'User nor authorized or inavlid user'})
            }
        }else{
            return res.status(400).json({message:'User not authorized'})
        } 
    } catch (error) {
        console.log(error.message);
    }
   
}

export const adminAuth = async(req,res,next)=>{
    try {
        if(req.headers.authorization){
            const token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWTADMINSECRET)
            const admin = await User.findOne({
                _id : decoded.adminId,
                is_admin : true
            })
            if(admin){
                next()
            }else{
                return res.status(400).json({message:'User not authorized or invalid user'})
            }
        }else{
            return res.status(400).json({message:'User not authorized'})
        }
    } catch (error) {
        console.log(error.message);
    }
}