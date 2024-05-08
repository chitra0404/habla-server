const router=require('express').Router();
const auth=require('../middleware/authMiddleware');

const {Signup,Login,getUserById,updateInfo, validUser,searchUsers, logout}=require('../controllers/userControllers')

 router.post("/register",Signup)
 router.post('/login',Login)
router.get('/valid',auth,validUser)
 router.get("/users/:id",auth,getUserById)
 router.get('/logout', auth, logout);

 router.patch('/update/:id', auth, updateInfo)
 router.get('/user?', auth, searchUsers);
 
 

// router.put("/forgotpassword")
// router.patch("/passwordreset/id")

module.exports=router;