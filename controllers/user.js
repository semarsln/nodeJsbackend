const { response } = require("express");
const User=require("../model/user");
const VerificationToken=require("../model/verificationToken");
const { sendError, createRandomBytes } = require("../utils/helper");
const jwt=require("jsonwebtoken");
const { generateOTP, mailTransport, generateEmailTemplate, plainEmailTemplate, generatePasswordResetTemplate } = require("../utils/mail");
const { isValidObjectId } = require("mongoose");
const ResetToken = require("../model/resetToken");
const crypto=require("crypto");
const nodemailer=require("nodemailer");


const mongoose = require('mongoose');


const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
       user: process.env.EMAIL_USERNAME,
       pass: process.env.EMAIL_PASSWORD,
    },
});
exports.signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    // Check we have an email
    if (!email) {
        return res.status(422).send({ message: "Missing email." });
    }
    const user = await User.findOne({ email })
    if (user) {
        return sendError(res, "this email is aldready in use");
    }
    const newUser = new User({
        _id: new mongoose.Types.ObjectId,
        fullName,
        email,
        password

    })
    const userId = newUser._id
    await newUser.save()
    const url = ` http://localhost:8000/verify/${userId}`
    transporter.sendMail({
        to: email,
        subject: 'Verify Account',
        html: `<p>Click <a style="color:#e63946" href="${url}">here</a> to confirm your email.</p><br><p></p>`
    })
    return res.status(201).send({
        message: `Sent a verification email to ${email} `
    });

 
}
exports.login=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email.trim() || !password.trim())
        return sendError(res,"email/password is missing")
        const user=await User.findOne({email})
        if(!user) return sendError(res,"user not found")
        if(user.verified===false)  return sendError(res,"Email is not verified")
        const isMatched=await user.comparePassword(password)
        if(!isMatched) return sendError(res,"password doest match ")
    
        const token= jwt.sign({userId:user._id},process.env.JWT_SECRET,{
            expiresIn:'365d'
        })
        res.json({success:true,user:{fullName:user.fullName,email:user.email,id:user._id,token}})
    
    } catch (error) {
         sendError(res,error.message,500)
    }
   
}

exports.verify = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
        return res.status(404).send({
            message: "User does not  exists"
        });
    }
    user.verified = true;
    await user.save();
    transporter.sendMail({
        to: user.email,
        subject: 'Verify Account Successfully',
        html: `<p>Your Account verified successfully</p><br>`
    })
    return res.status(200).send({
        message: `Account Verified`
    });
        
    
}

exports.forgotPassword=async(req,res)=>{
     const {email}=req.body;

     if(!email) return sendError(res,"email doesn't exists")

     const user= await User.findOne({email});
     if(!user) return sendError(res,"User not found")

     const token= await ResetToken.findOne({owner:user._id})
     if(token) return sendError(res,"Only after one hour you can request for another token")

     const randomBytes=await createRandomBytes()
    
     const resetToken=new ResetToken({owner:user._id,token:randomBytes})
     
     await resetToken.save()
     
     mailTransport().sendMail({
        from:"",
        to:user.email,
        subject:"Password Reset",
        html:generatePasswordResetTemplate(`http://localhost:3000/reset-password?token=${randomBytes}&id=${user._id}`)
    });
    res.json({success:true,message:"Password reset link is sent your email box.."})
    
}


exports.resetPassword=async(req,res)=>{
    const {password}=req.body;

    const user=await User.findById(req.user._id )
    if(!user) return sendError(res,"User not found")

    const isSamePassword=await user.comparePassword(password)
    if(isSamePassword) return sendError(res,"password must be the different")

    if(password.trim().length<8)
    return sendError(res,"password length must be longer than 8 characters")

    user.password=password.trim();
    await user.save()
    await ResetToken.findOneAndDelete({owner:user._id})
    
    mailTransport().sendMail({
        from:"",
        to:user.email,
        subject:"Password Reset Successfully",
        html:plainEmailTemplate("Password Reset Successfully","You can login with new password")
    });
    res.json({success:true,message:"Password Reset Successfully"})



}



  

  exports.updatedPassword=async(req,res)=>{
    const { id } = req.params;
    const { password } = req.body;
    const user = await User.findById(id);
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      res.json(updatedPassword);
    } else {
      res.json(user);
    }
  };
  
  exports.getAUser=async(req,res)=>{
    const { id } = req.params;
  
    try {
      const getaUser = await User.findById(id);
      res.json({
        getaUser,
      });
    } catch (error) {
      throw new Error(error);
    }
  };