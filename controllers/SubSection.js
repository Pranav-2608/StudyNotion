const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

//create Subsection
exports.createSubSection = async(req,res)=>{
    try{
         //fetch data from the req body
         const {sectionId,title,timeDuration,description } = req.body();
         //extract file/video
         const video = req.files.videoFil;
         //validation
         if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
         }
         //upload video to cloudinary
         const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
         //create a subsection
         const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            decription:description,
            videoUrl:uploadDetails.secure_url
         })
         //update secttin with this subsection
         const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection : subSectionDetails._id
            }
         },{new:true});

         //HW:Log updated Section here 
         //return response
         return res.status(400).json({
            success:true,
            message:"Subsection created succesfully",
            updatedSection
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Subsection was not created",
        })
    }
}