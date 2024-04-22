const mongoose=require("mongoose");
const chatSchema=mongoose.Schema({
    profilePic:{

    type:String,
    default:'https://cdn-icons-png.flaticon.com/512/9790/9790561.png'
    } ,

    chatName:{
        type:String,

    },
    isGroup:{
        type:Boolean,
        default:false,

    },
    users:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',

    },
],
    latestMessage:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'Message' ,
    },
    groupMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }

},
{
timestamps:true,
}
);
const Chat=mongoose.model('chat',chatSchema);
module.exports=Chat;