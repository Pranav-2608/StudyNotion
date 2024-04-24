const Tag = require("../models/Tags");

//create tag ka hander function

exports.createTag = async(req,res)=>{
    try{
        //take entry from user
       const {name,description} = req.body();

    //validation
       if(!name || !description){
        return res.status(400).json({
            success:false,
            message:"All fields are required",
        })
       }

       //create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        return res.status(200).json({
           success:true,
           message:"Tags created succesfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//getAllTagsHandler fuunction
exports.showAllTags = async(req,res)=>{
    try{
       const allTags = await Tag.find({},{name:true,description:true});
       res.status(200).json({
         success:true,
         message:"All Tags are returned succesfully",
         allTags
       })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};