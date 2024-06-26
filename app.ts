import express, { NextFunction, Request, Response } from "express"
export const app = express();
import cors from "cors"
import cookieParser from "cookie-parser";

require("dotenv").config();
import ErrorMiddleWare from "./middleware/error";
import {userRouter} from "./router/user.route";
import courseRouter from "./router/course.route";
import orderRouter from "./router/order.route";
import notificationsRouter from "./router/notification.route";
import analyticsRouter from "./router/analytics.route";
import layoutRouter from "./router/layout.route";

//body parser
app.use(express.json({limit:"100mb"}));

//cookie-parser
app.use(cookieParser());

//cors
app.use(cors({ origin:process.env.ORIGIN }));

//routes
app.use("/api/v1",userRouter,courseRouter,orderRouter,notificationsRouter,analyticsRouter,layoutRouter);

//test
app.get('/test',(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"API is working"
    })
});

app.all('*',(req:Request,res:Response,next:NextFunction)=>{
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleWare);