const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const chatRoutes = require('./routes/chat');

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
  }));

app.use("/api", userRoutes);
app.use("/api/msg", messageRoutes);
app.use("/api/chat", chatRoutes);

const port = process.env.PORT || 8080;

mongoose.connect(process.env.URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

const server = http.createServer(app);
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log("User setup:", userData);
        socket.emit("connected");
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

    socket.on('newmessage', (newMessageReceived) => {
        const chat = newMessageReceived.chatId;
        if (!chat.users) {
            console.log('chat.users is not defined');
            return;
        }
        chat.users.forEach((user) => {
            if (user._id != newMessageReceived.sender._id) {
                io.to(user._id).emit('message received', newMessageReceived);
                console.log("Message sent to user:", user._id);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
