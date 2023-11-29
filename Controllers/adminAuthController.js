import User from "../Models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Adventure from "../Models/adventureModel.js";

export const Login = async(req,res,next)=>{
    try {
        const{email,password} = req.body
        const admin = await User.findOne({email:email})
        if(!admin){
            return res.status(201).json({access:false, message:'Email not found'})
        }
         if(admin.is_admin === true){
        const isCorrect = await bcrypt.compare(password, admin.password)
        if(!isCorrect){
            return res.status(201).json({access:false, message:'Incorrect password'})
        }

        const token = jwt.sign({adminId : admin._id}, process.env.JWTADMINSECRET,{expiresIn:'24hr'})
        return res.status(200).json({access:true, token, admin, message:'Loggin completed'})
    }else{
        if(!isCorrect){
            return res.status(201).json({access:false, message:'You are not an admin'})
        }
    }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
    
}

