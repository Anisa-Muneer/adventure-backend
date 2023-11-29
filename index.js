//Import required modules
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

//Load environment variables
dotenv.config()

//Import route modules
import  userAuth  from "./Routes/User/userAuthRoutes.js";
import adventureAuth from "./Routes/Adventure/adventureAuthRoutes.js"
import adminAuth from "./Routes/Admin/adminAuthRoutes.js"


import AdminRoutes from "./Routes/Admin/adminRoutes.js";
import userRoutes from "./Routes/User/userRoutes.js";
import AdventureRoutes from './Routes/Adventure/adventureRoutes.js'

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())

mongoose.connect(process.env.MONGODBURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("MONGODB CONNECTED");
}).catch(err =>{
    console.log(err.message);
})

app.use(cors({
    origin:['http://localhost:5173'],
    methods:["GET","POST","PUT"],
    credentials:true
}))

app.use('/user/auth',userAuth)
app.use('/adventure/adventureAuth',adventureAuth)
app.use('/admin/adminAuth',adminAuth)

app.use('/admin',AdminRoutes)
app.use('/user',userRoutes)
app.use('/adventure',AdventureRoutes)


app.listen(process.env.PORTNUMBER,()=>{
    console.log('Server running');
})