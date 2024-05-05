import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

export const getUsersAnalytics = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

export const getCoursesAnalytics = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

export const getOrdersAnalytics = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{

    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})