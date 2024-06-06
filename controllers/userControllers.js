require('dotenv').config();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const selectedUser = await User.findOne({ _id: id }).select('-password');
    res.status(200).json(selectedUser);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

module.exports.Signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const newUser = new User({
      name,
      email,
      password
    });
    const token = await newUser.generateToken();
    await newUser.save();
    return res.status(200).json({ message: 'Success', token: token });
  } catch (err) {
    console.error('Error signing up user', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist" });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    } else {
      const token = await user.generateToken();
      await user.save();
      res.cookie('userToken', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, // 1 hour
      });
      return res.status(200).json({ token: token, message: "Success" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

module.exports.validUser = async (req, res) => {
  try {
    const validUser = await User.findOne({ _id: req.rootUserId }).select('-password');
    if (!validUser) return res.status(400).json({ message: 'User is not valid' });
    return res.status(200).json({
      user: validUser,
      token: req.token,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

module.exports.updateInfo = async (req, res) => {
  const { id } = req.params;
  const { bio, name } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { name, bio }, { new: true }).select('-password');
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

module.exports.logout = async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
    await req.rootUser.save();
    res.clearCookie('userToken');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

module.exports.searchUser = async (req, res) => {
  try {
    console.log('Request Query:', req.query);

    // Construct the search query based on the 'search' parameter
    const searchQuery = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
          ]
        }
      : {};

    console.log('Search Query:', searchQuery);

    // Perform the search operation in the database
    const users = await User.find(searchQuery).select('-password');

    console.log('Found Users:', users);

    // Return the search results to the client
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error during user search:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



