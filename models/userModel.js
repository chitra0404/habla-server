const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require('dotenv').config()


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minLength:6,

    },
    bio: {
        type: String,
        default: 'Available',
      },
      profilePic: {
        type: String,
        default:
          'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
      },
      contacts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    {
      timestamps: true,
    }
)

// // fire a function after doc saved to db
// userSchema.post('save',function(doc,next){
//     console.log("new user created");
//     next();
// })

//fire a function before doc saved to db
userSchema.pre('save', async function(next){
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
      }
    next();
})

//generate token
userSchema.methods.generatetoken=async function(){
    try{
        let token=jwt.sign({id:this._id},
        process.env.SECRET_KEY,{
            expiresIn:
                '7d'
            
        });
        return token;
    }
    
    catch(err){
        console.log("error occured while generating token");

    }

}
const User=mongoose.model('user',userSchema);

module.exports=User;