const User = require("../models/User.js");
const OTP  = require("../models/OTP.js");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//sendOTP
exports.sendOTP = async(req,res)=>{
    try{
   //fetch email from req ki body
   const {email} = req.body;

   //check if user already exists
   const checkUserPresent = await User.findOne({email});

   //if user already exists then return a response
   if(checkUserPresent){
       res.status(401).json({
           success:false,
           message:"The User already exists"
       })
   }

   //generate OTP
     var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
     });

     console.log("OTP generated",otp);

     //check unique otp or not
     const result = await OTP.findOne({otp:otp});

     while(result){
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
         });
         result = await OTP.findOne({otp:otp});
     }

     const otpPayload = {email,otp};

     //create an entry in database for OTP
     const otpBody = await OTP.create(otpPayload);
     console.log(otpBody);

     //return response
     res.status(200).json({
        success:true,
        message:"OTP sent succesfully",
        otp,
     })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in otp generation"
        })
    }
    

}

//signUp

exports.signUp = async(req,res)=>{

    try{
      //data fetch karo from reqquest ki body
    const{
        firstName,lastName,email,password,confirmPassword,contactNumber,
        accountType,otp
    } = req.body();

    //validate kar lo

    if(!firstName || !lastName || !password || !confirmPassword || !otp || !contactNumber || !email){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
    }

    //2 password match kar lo
    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and confirm Password value does not match. Please try again!"
        })
    }

    //check user already exists or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User is already registered"
        })
    }

    //find most recent OTP stored
    const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOTP);

    //validate OTP
    if(recentOTP.length == 0){
        //OTP not found
        return res.status(400).json({
            success:false,
            message:"OTP not found"
        })
    } 
    else if(otp !== recentOTP.otp){
        //INvalid OTP
        return res.status(400).json({
            success:false,
            message:"Invalid OTP"
        })
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    //Profile ki ek baar entry bana lo kyunki apan ko additional details bhi daalni hai na uSER mein
    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,

    })

    //entry create in DB
    
    const user = await User.create({
        firstName,lastName,email,
        password:hashedPassword
        ,confirmPassword,contactNumber,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        otp
    })

    //return res
     return res.status(200).json({
        success:true,
        message:"User is registered succesfully",
        user,
     })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. PLease try again!"
        })
    }
}

//Login
exports.login = async(req,res)=>{
    try{
      
        //get data from request body
        const {email,password} = req.body();
        // validation data
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }
        // user check exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registred, please sign up first"
            })
        }

        //generate jwt, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;

        //create cookie and send response

        const options = {
            expires:new Dtae(Date.now() + 3*24*60*60*1000),
            httpOnly:true
        }
         res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"Loggen in succesfully"
         })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }

    } 
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure. Please try again"
        })
    }
}

//changePassword
exports.changePassword = async(req,res)=>{
    //get data from req body
    const { password,email,confirmPassword } = req.body();
    //get oldPassword,newPassword,confirmnewPassword
    const existingUser = await User.findOne({email});
    var oldPassword = existingUser.password;
    //validation
    if(!password || !confirmPassword || !email || !oldPassword){
        res.status(401).json({
            success:false,
            message:"Please fill all the required fields"
        })
    }
    //update the password in database
    let hashedPassword = password.hash(10,password);
    existingUser.password = hashedPassword;

    //send a mail
    mailSender(email,"Password Changed Succesfully","Your Password is Changed succesfully");
    
    
    
}
