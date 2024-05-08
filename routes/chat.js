const express=require("express");
const router=express.Router();
const auth=require('../middleware/authMiddleware');
const {accessChats,
    fetchAllChats,
    creatGroup,
    renameGroup,
    addToGroup,
    removeFromGroup,}=require('../controllers/chatControllers');

    router.post('/access', auth,accessChats);
    router.get('/', auth, fetchAllChats);
    router.post('/group',auth,creatGroup);
    router.patch('/group/rename', auth, renameGroup);
    router.patch('/groupAdd', auth,addToGroup);
    router.patch('/groupRemove',auth, removeFromGroup);
   
   module.exports= router;