
const { sendMessage, getMessage } = require('../controllers/messageControllers');
const auth=require('../middleware/authMiddleware');
const router=require('express').Router();

 router.route("/message").post(auth,sendMessage);
 router.route('/:chatId').get(auth,getMessage);
 

module.exports=router;