const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req,res) =>{
    try{
        //data fetch
        const { sectionName , courseId } = req.body();
        //data validation
        if(! sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing properties"
            })
        }
        //create Section
        const newSection = await Section.create({sectionName});
        //update course with section object id
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },{new:true}
        )
        //HW : how to use populate here so that you can have both section and sucsection printed
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created succesfully",
            updatedCourse,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section please try again"
        })
    }
}

exports.updateSection = async(req,res) =>{
    try{
        //data input
        const { sectionName, sectionId} = req.body();
        //data validation
        if(! sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing properties"
            })
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:"Section updated succesfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section please try again"
        })
    }
} 

exports.deleteSection = async(req,res)=>{
    try{
         //getId
         const { sectionId} = req.params;
         ///use FindBYIdAndDelete
         await Section.findByIdAndDelete(sectionId);
         //return response
         return res.status(200).json({
            success:true,
            message:"Section deleted succesfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete this section please try again"
        })
    }
}