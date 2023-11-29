
import Adventure from '../Models/adventureModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const Signup = async(req,res,next)=>{
    try {
        const{name,email,mobile,password} = req.body
        
        const exist = await Adventure.findOne({email:email})
        if(exist){
            return res.status(200).json({created:false, message:'Email already exist'})
        }else{
            const hashPass = await bcrypt.hash(password, 10)
            const newAdventure = new Adventure({
                name:name,
                email:email,
                mobile:mobile,
                password:hashPass
            })
            let adventure = await newAdventure.save().then(console.log('Adventure team is registerd'))
            let token = jwt.sign({adventureId : adventure._id},process.env.JWTADVENTURESECRET,{expiresIn:'24hr'})
            return res.status(200).json({created:true, token:token, adventure, message:'registartion completed'})
    
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
   
}

export const Login = async(req,res,next)=>{
    try {
        const{email,password} = req.body
        const adventure = await Adventure.findOne({email:email})
        
        if(!adventure){
            return res.status(201).json({access:false,message:'User not found'})
        }else if(adventure.is_blocked===true){
            return res.status(201).json({access:false,message:'User is blocked'})
        }
        const isCorrect = await bcrypt.compare(password,adventure.password)
        if(!isCorrect){
            return res.status(201).json({access:false,message:'incorrect password'})
        }
        const token = jwt.sign({adventureId : adventure._id},process.env.JWTADVENTURESECRET,{expiresIn:'24hr'})
        return res.status(200).json({access:true, token, adventure, message:'Login completed'})
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}

export const SignupWithGoogle = async(req,res,next)=>{
    try {
        const{name, email, id} = req.body
        const exist = await Adventure.findOne({email:email})
        if(exist){
            return res.status(200).json({created:false, message:'Email already exist'})
        }else{
            const hashPass = await bcrypt.hash(id,10)
            const newAdventure = new Adventure({
                name : name,
                email : email,
                password : hashPass
            })
            const adventure = await newAdventure.save().then(console.log('saved'))
            const token = jwt.sign({adventureId : adventure._id},process.env.JWTADVENTURESECRET,{expiresIn:'24hr'})
            return res.status(201).json({created:true, token:token, adventure, message:'Signup completed'})

        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
        }
}