
const User = require('../models/userModel');
const jwt=require('jsonwebtoken');
require('dotenv').config()

const auth = async (req, res, next) => {
  try {
    console.log(req.headers.authorization);
    let token = req.headers.authorization.split(' ')[1];//when using browser this line
   
    if (token.length < 500) {
      const verifiedUser = jwt.verify(token, process.env.SECRET_KEY);
      const rootUser = await user
        .findOne({ _id: verifiedUser.id })
        .select('-password');
      req.token = token;
      req.rootUser = rootUser;
      req.rootUserId = rootUser._id;
    } else {
      let data = jwt.decode(token);
      req.rootUserEmail = data.email;
      const googleUser = await user
        .findOne({ email: req.rootUserEmail })
        .select('-password');
      req.rootUser = googleUser;
      req.token = token;
      req.rootUserId = googleUser._id;
    }
    next();
  } catch (error) {
    // console.log(error);
    res.json({ error: 'Invalid Token' });
  }
};

module.exports = auth;