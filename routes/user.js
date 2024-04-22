const router=require('express').Router();
const auth=require('../middleware/authMiddleware');

const {Signup,Login,getUserById,updateInfo, validUser}=require('../controllers/userControllers')

 router.post("/register",Signup)
 router.post('/login',Login)
router.get('/valid',auth,validUser)
 router.get("/users/:id",auth,getUserById)
 router.patch('/update/:id', auth, updateInfo)


// router.put("/forgotpassword")
// router.patch("/passwordreset/id")

module.exports=router;