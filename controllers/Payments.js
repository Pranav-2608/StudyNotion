const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");



//capture the payment and inititae the razporpay order
exports.capturePayment = async(req,res)=>{
    //get courseId and user Id
    const {courseId} = req.body();
    const userId = req.user.id;
    //validation
    if(!courseId){
        return res.json({
            success:false,
            message:"Please provide valid course ID"
        })
    }
    //valid CourseId
    let course;
    try{
        course = await Course.findById(courseId);
        if(!course){
            return res.json({
                success:false,
                message:"Could not find the course",
            }) 
        }

        //user already paid for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
            })
        }
    }
    catch(error){
        connsole.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    //order create 
    const amount = course.price;
    const currency ="INR";

    const options = {
        amount : amount*100,
        currency,reciept:Math.random(Date.now()).toString(),
        notes:{
            courseId: courseId,
            userId
        }
    }

    try{
      //initiate the payment using razorpay 
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      //retunr response
      return res.status(200).json({
        success:true,
        courseName:course.courseName,
        courseDescription:course.courseDescription,
        thumbnail:course.thumbnail,
        orderId:paymentResponse.id,
        currency:paymentResponse.currency,
        amount:paymentResponse.amount,
      });
    }
    catch(error){
        console.log(error);
        return res.status().json({
            success:false,
            message:"Could not initiate the order",
        })
    }

}

//verify signature

exports.verifySignature= async(req,res)=>{

       const webhookSecret="12345678";
       const signature = req.headers("x-razorpay-signature");
       const shasum = crypto.createHmac("sha256",webhookSecret);
       shasum.update(JSON.stringify(req.body));
       const digest = shasum.digest("hex");

       if(signature === digest){
         console.log("Payment is authorized");

       const { courseId,userId } = req.body.payload.payment.entity.notes;
       try{
          //fulfill the action

          //find the course and enroll the studnet
          const enrolledCourse = await Course.findOneAndUpdate(
            {_id: courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true}
          )

          if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"Course not found"
            })
          }

          console.log(enrolledCourse);

          //find the student and add the course to the list of courses of students
          const enrolledStudent = await User.findOneAndUpdate(
            {_id:userId},
            {$push:{courses:courseId}},
            {new:true}
          );

          console.log(enrolledStudent);

          //mail send kardo confirmation wala
          const emailResponse = await mailSender(
            enrolledStudent.email,
            "Congratulations!!",
            "Congratulations you are onboarded to the course"
          )

          console.log(emailResponse);
          return res.status(200).json({
             success:true,
             message:"Signature verified and course added succesfully",
          })
       }
       catch(error){
          console.log(error);
          return res.status(500).json({
             success:false,
             message:error.message
          })
       }
    }
    else{
        return res.status(500).json({
            success:false,
            message:error.message
         })
    }
    

}