const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader.js");

//create Course handler function
exports.createCourse = async(req,res)=>{
    try{
        //fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag} = req.body();

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouwillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor not found"
            })
        }

        //check given tag is valid or not 
        const tagDetails = await Tag.findbyId(tag);

        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag Details not found"
            })
        }

        //Upload Image to cloduinary
        const thumbailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //Create an entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn : whatYouWillLearn,
            tag:tagDetails._id,
            thumbnail:thumbailImage.secure_url,
        })

        //Update Instructor as course in the user is increasing
        await User.findByIdAndUpdate({_id:instructorDetails._id},{
            $push:{
                courses:newCourse._id
            }
        },{new:true});

        //update the tag schema



        //return response
        return res.statuus(200).json({
            success:true,
            message:"Course created succesfully",
            data:newCourse
        })

    }
    catch(error){
       console.error(error);
       return res.status(500).json({
        success:false,
        message:"Failed to create course",
       })
    }
};




//get All Courses Handler function
exports.showAllCourses = async(req,res)=>{
    try{
       const allCourses = await Course.find({},{courseName:true,price:true,
    instructor:true,studentsEnrolled:true,ratingAndReviews:true,thumbnail:true}).populate("instructor").exec();

    return res.status(200).json({
        success:true,
        message:"Data for all course fetched succefully",
        data:allCourses,
    })

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
         success:false,
         message:"Cannot fetch the courses",
         error:error.message,
        })
     }
}