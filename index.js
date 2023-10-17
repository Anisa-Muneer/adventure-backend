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


app.listen(process.env.PORTNUMBER,()=>{
    console.log('Server running');
})