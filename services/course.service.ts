import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { NextFunction, Response } from "express";

export const createCourse = CatchAsyncError(async (data:any,res:Response,next:NextFunction)=>{
    const course = await CourseModel.create(data);

    res.status(201).json({
        success:true,
        course
    })

});

export const getAllCoursesService= CatchAsyncError(async (res:Response)=>{

    const courses = await CourseModel.find().sort({createAt:-1});
    res.status(201).json({
        success:true,
        courses
    })
})