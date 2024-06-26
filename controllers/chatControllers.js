const Chat =require('../models/chatModel');
const user=require('../models/userModel');

module.exports. accessChats= async (req, res) => {
  const { userId } = req.body;
  if (!userId) res.send({ message: "Provide User's Id" });
  let chatExists = await Chat.find({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: userId } } },
      { users: { $elemMatch: { $eq: req.rootUserId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');
  chatExists = await user.populate(chatExists, {
    path: 'latestMessage.sender',
    select: 'name email profilePic',
  });
  if (chatExists.length > 0) {
    res.status(200).send(chatExists[0]);
  } else {
    let data = {
      chatName: 'sender',
      users: [userId, req.rootUserId],
      isGroup: false,
    };
    try {
      const newChat = await Chat.create(data);
      const chat = await Chat.find({ _id: newChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).send(error);
    }
  }
};
module.exports. fetchAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.rootUserId } },
    })
      .populate('users')
      .populate('latestMessage')
      .populate('groupAdmin')
      .sort({ updatedAt: -1 });
    const finalChats = await user.populate(chats, {
      path: 'latestMessage.sender',
      select: 'name email profilePic',
    });
    res.status(200).json(finalChats);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};
module.exports.creatGroup = async (req, res) => {
  const { chatName, users } = req.body;
  console.log(chatName, users);

  if (!chatName || !users) {
    return res.status(400).json({ message: 'Please fill the fields' });
  }

  const parUsers = users.split(',');  // Split the string by commas to create an array
  console.log("parUsers", parUsers);

  if (parUsers.length < 2) {
    return res.status(400).send('Group should contain more than 2 users');
  }

  parUsers.push(req.rootUser);

  try {
    const chat = await Chat.create({
      chatName: chatName,
      users: parUsers,
      isGroup: true,
      groupAdmin: req.rootUserId,
    });

    const createdChat = await Chat.findOne({ _id: chat._id })
      .populate({ path: 'users', select: '-password' })  // Populate users field
      .populate({ path: 'groupAdmin', select: '-password' });

    res.status(200).json(createdChat);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports. renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName)
    res.status(400).send('Provide Chat id and Chat name');
  try {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $set: { chatName },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};
module.exports. addToGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const existing = await Chat.findOne({ _id: chatId });
  if (!existing.users.includes(userId)) {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } else {
    res.status(409).send('user already exists');
  }
};
module.exports.removeFromGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).send('Chat not found');
    }

    const userIndex = chat.users.findIndex((id) => id.toString() === userId);
    
    if (userIndex !== -1) {
      chat.users.splice(userIndex, 1);
      
      const updatedChat = await chat.save();

      const populatedChat = await Chat.findById(chatId)
        .populate('groupAdmin', '-password')
        .populate('users', '-password');

      res.status(200).json(populatedChat);
    } else {
      res.status(409).send('User does not exist in the group');
    }
  } catch (error) {
    console.error('Error removing user from group:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports. removeContact = async (req, res) => {};