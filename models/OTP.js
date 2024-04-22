const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:String,
        default:Date.now(),
        expires: 5*60,
    }
});

//a function to send mail 
async function sendVerificationEmail(email,otp){
    try{
       const mailResponse = await mailSender(email,"Verification email from Study Motion",otp);
       console.log("Email sent succesfully",mailResponse);
    }
    catch(error){
        console.log("error occurred while sending mails",error);
        throw error;
    }
}

otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",otpSchema);