import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../config/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs"
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";

export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (!data.thumbnail) {
        return next(new ErrorHandler("Invalid request", 500));
      }

      const myCloud = await cloudinary.v2.uploader.upload(data.thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editCourse = CatchAsyncError( async (req:Request,res:Response,next:NextFunction) => {
    try{
        const data = req.body;
      if (!data.thumbnail) {
        return next(new ErrorHandler("Invalid request", 500));
      }

      const myCloud = await cloudinary.v2.uploader.upload(data.thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      const id = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(id,{ $set:data},{new:true});

      res.status(201).json({
          success:true,
          course
      })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//get single course --without purchase
export const getSingleCourse = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{

        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        if(isCacheExist){
            return res.status(200).json({
                success:true,
                course:JSON.parse(isCacheExist)
            })
        }

        const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggesstion -courseData.questions -courseData.links");

        await redis.set(courseId,JSON.stringify(course));

        return res.status(200).json({
            success:true,
            course
        });

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

export const getAllCourses = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggesstion -courseData.questions -courseData.links");

        return res.status(200).json({
            success:true,
            courses
        });

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

//for valid users
export const getCourseByUser = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList?.find((course:any)=>course._id.toString() === courseId);

        if(!courseExist){
            return next(new ErrorHandler("You are not eligible to access this course",400))
        }

        const course = await CourseModel.findById(courseId);

        const content = course?.courseData;

        return res.status(200).json({
            success:true,
            content
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

//add question in course
interface IAddQuestionData{
    question:string;
    courseId:string;
    contentId:string;
}

export const addQuestion = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const { question, courseId, contentId } = req.body as IAddQuestionData;

        const course = await CourseModel.findById(courseId);

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content Id",400))
        }

        const courseContent = course?.courseData?.find((item:any )=>item._id.toString() === contentId);

        if(!courseContent){
            return next(new ErrorHandler("Invalid content Id",400))
        }

        const newQuestion:any={
            user:req.user,
            question,
            questionReplies:[],
        }

        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            user:req.user?._id,
            title:"New Question",
            message:`You have a question in ${courseContent.title}`
        });

        await course?.save();

        res.status(200).json({
            success:true,
            course
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
});

//add answer in course question
interface IAddAnswerData{
    answer:string;
    courseId:string;
    contentId:string;
    questionId:string;
}

export const addAnswer = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const { answer, courseId, contentId, questionId } = req.body as IAddAnswerData;

        const course = await CourseModel.findById(courseId);

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id",400))
        }

        const courseContent = course?.courseData?.find((item:any)=>item._id.equals(contentId));

        if(!courseContent){
            return next(new ErrorHandler("Invalid content id",400))
        }

        const question = courseContent?.questions?.find((item:any)=>item._id.equals(questionId));

        if(!question){
            return next(new ErrorHandler("Invalid question id",400))
        }

        const newAnswer:any = {
            user:req.user,
            answer
        }

        if(!question.questionReplies)
            question.questionReplies=[];

        question.questionReplies.push(newAnswer);

        await course?.save();

        if(req.user?._id === question.user._id){
            //create Notification
            await NotificationModel.create({
                user:req.user?._id,
                title:"A New Question Reply recieved",
                message:"You have a new question reply in "+courseContent.title
            });
        }else{
            const data = {
                name:question.user.name,
                title:courseContent.title
            };

            const html = await ejs.renderFile(path.join(__dirname,"../mails/question-replies.ejs"),data)

            try{
                await sendMail({
                    email:question.user.email,
                    subject:"Question Reply",
                    template:"question-reply.ejs",
                    data
                })
            }catch(error:any){
                return next(new ErrorHandler(error.message,500));
            }
        }

        res.status(200).json({
            success:true,
            course
        });

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
});

interface IAddReviewData{
    review:string;
    rating:number;
    userId:string;
}

export const addReview = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const userCourseList = req.user?.courses;

        const courseId = req.params.id;

        //check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some((course:any) => course._id.toString() === courseId.toString());

        if(!courseExists){
            return next(new ErrorHandler("You are not eligible to access this course",404));
        }

        const course = await CourseModel.findById(courseId);

        const { review, rating } = req.body as IAddReviewData;

        const reviewData:any = {
            user:req.user,
            rating,
            comment:review
        }
        course?.reviews.push(reviewData);

        let avg = 0;

        course?.reviews.forEach((rev:any)=>{
            avg+=rev.rating;
        });

        if(course){
            course.ratings = avg/course.reviews.length;
        }

        await course?.save();

        const notification = {
            title:"New Review Received",
            message:`${req.user?.name} has given a review in ${course?.name}`
        }

        //create notification
        await NotificationModel.create({
            user:req.user?._id,
            ...notification,
        });

        res.status(200).json({
            success:true,
            course
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,500))
    }
});

//add reply in review
interface IAddReviewData{
    comment:string;
    courseId:string;
    reviewId:string;
}

export const addReplyToReview = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const { comment, courseId, reviewId } = req.body as IAddReviewData;

        const course = await CourseModel.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course not found",404));
        }

        const review = course.reviews.find((rev:any)=>rev._id.toString() === reviewId);

        if(!review) return next(new ErrorHandler("Review not found",404));

        const replyData:any = {
            user:req.user,
            comment
        }
        if(review?.commentReplies) review.commentReplies=[];
        review.commentReplies.push(replyData);

        await course?.save();

        res.status(200).json({
            success:true,
            course
        });

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
});

// export const getAllCourses = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
//     try{
//         getAllCoursesService(res);
//     }catch(error:any){
//         return next(new ErrorHandler(error.message,500));
//     }
// })

//Delete course -- only for admin
export const deleteCourse = CatchAsyncError(async (req:Request,res:Response,next:NextFunction)=>{
    try{
      const { id } = req.params;
      const course = await CourseModel.findById(id);
  
      if(!course){
        return next(new ErrorHandler("course not found",404));
      }
  
      await course.deleteOne({id});
  
      await redis.del(id);
  
      res.status(200).json({
        success:true,
        message:"Course deleted successfully"
      })
  
    }catch(error:any){
      return next(new ErrorHandler(error.message,400));
    }
  })