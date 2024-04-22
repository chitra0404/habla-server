const Message=require("../models/messageModel");
const Chat=require('../models/chatModel');
const User=require('../models/userModel');


module.exports. sendMessage=async (req,res)=>{
    const {chatId,message}=req.body;
    try{
        let msg=await Message.create({sender:req.userId,message,chatId});
        msg = await (
            await msg.populate('sender', 'name profilePic email')
          ).populate({
            path: 'chatId',
            select: 'chatName isGroup users',
            model: 'Chat',
            populate: {
              path: 'users',
              select: 'name email profilePic',
              model: 'User',
            },
          });
          await Chat.findIdAndUpdate(chatId,{latestmessage:msg});
          res.status(200).send(message);

    }catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}


module.exports. getMessage=async(req,res)=>{
    const {chatId}=req.params;
    try{
        let messages = await Message.find({ chatId })
        .populate({
          path: 'sender',
          model: 'User',
          select: 'name profilePic email',
        })
        .populate({
          path: 'chatId',
          model: 'Chat',
        });
  
      res.status(200).json(messages);
    }catch (error) {
        res.sendStatus(500).json({ error: error });
        console.log(error);
      }
}