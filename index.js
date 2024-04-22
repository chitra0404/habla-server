const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const route = require('./routes/user');
const msgroute = require('./routes/message');
const chatroute = require('./routes/chat');

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", route);
app.use("/api/msg", msgroute);
app.use("/api/chat", chatroute);

const port = process.env.PORT || 8080;

mongoose.connect(process.env.URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("New client connected");
  
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log("User setup:", userData);
    });

    socket.on('joinroom', (room) => {
        socket.join(room);
        console.log("Joined room:", room);
    });

    socket.on('typing', (room) => {
        io.to(room).emit('typing');
        console.log("Typing in room:", room);
    });

    socket.on('stoptyping', (room) => {
        io.to(room).emit('stoptyping');
        console.log("Stopped typing in room:", room);
    });

    socket.on('newmessage', (newmsgReceive) => {
        const chat = newmsgReceive.chatId;
        if (!chat.users) {
            console.log('chat.users is not defined');
            return;
        }
        chat.users.forEach((user) => {
            if (user._id != newmsgReceive.sender._id) {
                io.to(user._id).emit('message received', newmsgReceive);
                console.log("Message sent to user:", user._id);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});
