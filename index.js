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
import userAuth from "./Routes/User/userAuthRoutes.js";
import adventureAuth from "./Routes/Adventure/adventureAuthRoutes.js"
import adminAuth from "./Routes/Admin/adminAuthRoutes.js"


import AdminRoutes from "./Routes/Admin/adminRoutes.js";
import userRoutes from "./Routes/User/userRoutes.js";
import AdventureRoutes from './Routes/Adventure/adventureRoutes.js'
import { Server, Socket } from "socket.io";

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

mongoose.connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MONGODB CONNECTED");
}).catch(err => {
    console.log(err.message);
})

app.use(cors({
    origin: [process.env.ORIGIN_PORT],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.use('/user/auth', userAuth)
app.use('/adventure/adventureAuth', adventureAuth)
app.use('/admin/adminAuth', adminAuth)

app.use('/admin', AdminRoutes)
app.use('/user', userRoutes)
app.use('/adventure', AdventureRoutes)


const server = app.listen(process.env.PORTNUMBER, () => {
    console.log('Server running');
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.ORIGIN_PORT,
    },
})
io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on('setup', (userData) => {
        socket.join(userData._id)
        socket.emit('connected')
    })

    socket.on('join chat', (room) => {
        socket.join(room)
        console.log('user joined room', room);
    })

    socket.on('typing', (room) => socket.in(room).emit("typing"))
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"))

    socket.on('new message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat



        const userKeys = Object.keys(chat.users);

        userKeys.forEach((userKey) => {
            const user = chat.users[userKey];
            const senderUserId = newMessageRecieved.sender?.user
                ? newMessageRecieved.sender.user._id
                : newMessageRecieved.sender.adventure._id;

            if (userKey !== senderUserId) {
                console.log(user, 'its a user');
                let access = user.user ? user.adventure : user.user;
                console.log(access);
                socket.to(access).emit("message received", newMessageRecieved);
            }
        });
    })
})