const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); //requrired to interact with mongodb
const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoute")


const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection successful");
}).catch((err)=>{
    console.log(err.message);
});

const server = app.listen(process.env.PORT, () =>{
    console.log(`Server started on port ${process.env.PORT}`);
});

const io =socket(server, {
    cors:{
        origin:"https://localhost:3000",
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) =>{
    global.chatSocket = socket;

    socket.on("add-user", (userId) =>{
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg",(data) =>{
        console.log("sendd",data)
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message);
        }
    });
});