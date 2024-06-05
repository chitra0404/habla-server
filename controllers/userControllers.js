require('dotenv').config();
const User=require("../models/userModel");
const bcrypt=require("bcrypt")




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
      const validuser = await User
        .findOne({ _id: req.rootUserId })
        .select('-password');
      if (!validuser) res.json({ message: 'user is not valid' });
      res.status(201).json({
        user: validuser,
        token: req.token,
      });
    } catch (error) {
      res.status(500).json({ error: error });
      console.log(error);
    }
  };


  module.exports. updateInfo = async (req, res) => {
    const { id } = req.params;
    const { bio, name } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { name, bio });
    
    res.status(200).json(updatedUser);
  };

  module.exports. logout =async (req, res) => {
    req.rootUser.tokens = req.rootUser.tokens.filter((e) => e.token != req.token);
  };

  module.exports.searchUsers = async (req, res) => {
    const searchQuery = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
            _id: { $ne: req.rootUserId }
        }
        : { _id: { $ne: req.rootUserId } };

    console.log('Search Query:', searchQuery);

    try {
        const users = await User.find(searchQuery);
        if (!users.length) {
            console.log('No users found for query:', searchQuery);
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



  