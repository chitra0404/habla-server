const mongoose=require('mongoose');
const messageSchema=mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    message:{
        type:String,
        trim:true,
    },
    chatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chat",
},
},{
    timestamp:true,
})
const Message=mongoose.model("message",messageSchema);
module.exports =Message;