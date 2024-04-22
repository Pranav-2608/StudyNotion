const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    timeDuration:{
        type:String,
    },
    desciption:{
        type:String,
    },
    videoUrl:{
        type:String,
    }
});


module.exports = mongoose.model("SubSection",subSectionSchema);