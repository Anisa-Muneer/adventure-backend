import User from '../Models/userModel.js'
import bcrypt from 'bcrypt'

import sendMail from '../utils/sendMail.js'
import crypto from 'crypto'

export const Signup = async(req,res,next)=>{
    try {
        const {name,email,mobile,password} = req.body
        const exist = await User.findOne({email:email})
        if(exist){
            return res.status(200).json({created:false,message:'Email already exist'})

        }else{
            const date = new Date()
            const hashpass = await bcrypt.hash(password,10)
            const newUser = new User({
                name:name,
                email:email,
                mobile:mobile,
                password:hashpass,
                joindate:date
            });
            let user = await newUser.save().then(console.log("User is registered"))
            const emailtoken = await new Tokenmodel({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
              }).save();
              const url = `${process.env.SERVERURL}/${user._id}/verify/${emailtoken.token}`;
              await sendMail(user.email, "Verify Email", url);
              console.log("email Succes");
              return res.status(200).json({
                created: true,
                emailtoken,
                message: "verification mail has been sent to your Gmail",
              });
        }
    } catch (error) {
        console.log(error.message);
    }
}