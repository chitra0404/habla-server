const Message=require("../models/messageModel");
const Chat=require('../models/chatModel');
const User=require('../models/userModel');


module.exports.sendMessage = async (req, res) => {
  const { chatId, message } = req.body;

  try {
    let msg = await Message.create({ sender: req.userId, message, chatId });

    // Populate the fields after message creation
    msg = await Message.findById(msg._id)
      .populate('sender', 'name profilePic email')
      .populate({
        path: 'chatId',
        select: 'chatName isGroup users',
        populate: {
          path: 'users',
          select: 'name email profilePic',
        },
      });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: msg });

    res.status(200).json(msg); // Sending the message object as response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.getMessage = async (req, res) => {
  const { chatId } = req.params;
  try {
    let messages = await Message.find({ chatId })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'name profilePic email',
      })
      .populate({
        path: 'chatId',
        model: 'chat',
      });

    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};