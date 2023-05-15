const mongoose = require('mongoose');
const bcrypt=require("bcrypt");
const jwt = require('jsonwebtoken');
const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    verified: {
        type: Boolean,
        required: true,
        default: false
    },

    
});
UserSchema.pre('save',async function(next){
    if(this.isModified("password")){
        const hash=await bcrypt.hash(this.password,8)
        this.password=hash
    }
     next()
})

UserSchema.methods.comparePassword=async function(password){
    const result= await bcrypt.compareSync(password,this.password);
    return result;
}

UserSchema.methods.generateVerificationToken = function () {
    const user = this;
    const verificationToken = jwt.sign(
        { ID: user._id },
        process.env.USER_VERIFICATION_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return verificationToken;
};
module.exports = mongoose.model("User", UserSchema);
