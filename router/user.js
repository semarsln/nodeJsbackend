const router=require("express").Router();
const { check } = require("express-validator");
const { forgotPassword, resetPassword, signup, login, verify, getWishList, updatedPassword, getAUser } = require("../controllers/user");
const { isResetToken } = require("../middlewares/user");
const { validateUser, validate } = require("../middlewares/validator");
const User=require("../model/user")

router.post('/signup',validateUser,validate, signup);
router.post('/login', login);
router.get('/verify/:id', verify);
router.post("/forgotpassword",forgotPassword)
router.post("/resetpassword",isResetToken,resetPassword)
router.get('/getFavorite/:id', getWishList);
router.post('/updatePassword/:id', updatedPassword);
router.get('/user/:id', getAUser);
router.get("/verify-token",isResetToken,(req,res)=>{
    res.json({success:true})
})
router.put("/update/:id", (req,res,next)=>{
    console.log(req.params.id)
    User.findByIdAndUpdate({_id:req.params.id},{
      $set:{
        fullName: req.body.fullName,
        email: req.body.email,
    
      }
    })
    .then(result=>{
      res.status(200).json({
        updated_user:result
      })
    })
    .catch(err=>{
      console.log(err);
      res.status(500).json({
        error:err
      })
    })
    
  });

router.get("/:id",(req,res)=>{
    console.log(req.params.id);
    User.findById(req.params.id).then(result=>{
        res.status(200).json({
            user:result
        })
    })
    .catch(err=>{
        res.status(500)
    })
})




module.exports = router;