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

module.exports.Signup=async (req,res)=>{
  try{
  const {name,email,password}=req.body;
const existingUser=await User.findOne({email});
if(existingUser){
 return res.status(409).json({message:'user already existed'});
}
const newUser=new User({
  name,
  email,
  password
});
const token=await newUser.generatetoken();
await newUser.save();
return res.status(200).json({message:'success',token:token});

  }
  catch(err){
      console.error('Error signing up user', err);
      return res.status(409).json({ Message: "Internal server error" })
  }
}

module.exports.Login=async(req,res)=>{
  const {email,password}=req.body;
  console.log(password);
  try{
      const user=await User.findOne({email});
      console.log(user.password);
      if(!user){
          res.status(400).json({message:"user doesnt exist"});
          
      }
      const matchpassword=await bcrypt.compare(password,user.password);
      console.log(matchpassword);
      if(!matchpassword){
          res.status(400).json({message:'invalid credential'});
      }else{
          const token=await user.generatetoken();
          await user.save();
          res.cookie('userToken', token, {
              httpOnly: true,
              maxAge: 60*60,
            });
            res.status(200).json({ token: token, message:"success"});
      }
  }
  catch (error) {
      res.status(500).json({ error: error });
    }
}

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

module.exports. searchUser = async (req, res) => {
  // const { search } = req.query;  
  const search = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(search).find({ _id: { $ne: req.rootUserId } });
  res.status(200).send(users);
};