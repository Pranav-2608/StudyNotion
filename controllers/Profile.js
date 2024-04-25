const Profile = require("../models/Profile");
const User = require("../models/User");



exports.updateProfile = async(req,res)=>{
    try{
        //get data
        const { dateOfBirth="",about="",contactNumber, gender} = req.body();
        //get userId
        const id = req.user.id;
        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //findProfile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //updateProfile

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
 
        //return response
        return res.status(200).json({
            success:true,
            message:"Profile updated succesfully",
            profileDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.message
        })
    }
}

//delete account
exports.deleteAccount = async(req,res)=>{
    try{
       //get id
       const id = req.user.id;
       //validation
       const userDetails = await User.findById(id);
       if(!userDetails){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
       }
       //delete profile
       await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
       //delete user
       await User.findByIdAndDelete({_id:id});
       //return response
       return res.status(200).json({
        success:true,
        message:"User deleted succesfully"
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted",
            error:error.message
        })
    }
}


exports.getAllUserDetails = async(req,res)=>{
    try{
        //get id
       const id = req.user.id;
       //validation and get user details
       const userDetails = await User.findById(id).populate("additionDetails").exec();
       //return res
       return res.status(200).json({
        success:true,
        message:"User data fetched succesfully"
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"User data cannoot be fetched",
            error:error.message
        })
    }
}