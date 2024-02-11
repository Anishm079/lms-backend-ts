require('dotenv').config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "../config/redis";

interface ITokenOption{
    expires:Date;
    maxAge:number;
    httpOnly:boolean;
    sameSite:"lax" | "strict" | "none" | undefined;
    secure ?: boolean;
}

export const sendToken = (user:IUser, statusCode:number, res:Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    //upload session to redis
    redis.set(user._id,JSON.stringify(user) as any);

    //parse env variable to integrates with fallback values
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300",10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200",10);

    //options for cookies
    const accessTokenOptions : ITokenOption = {
        expires:new Date(Date.now() + accessTokenExpire * 60*60* 1000),
        maxAge:accessTokenExpire* 60*60* 1000,
        httpOnly:true,
        sameSite:"lax"
    }

    const refreshTokenOptions : ITokenOption = {
        expires:new Date(Date.now() + accessTokenExpire * 60*60* 1000),
        maxAge:accessTokenExpire* 60*60* 1000,
        httpOnly:true,
        sameSite:"lax"
    }

    //set secure to true in prod
    if(process.env.NODE_ENV === "production"){
        accessTokenOptions.secure = true;
    }

    res.cookie("access_token",accessToken,accessTokenOptions);
    res.cookie("refresh_token",refreshToken,refreshTokenOptions);

    res.status(statusCode).json({
        success:true,
        user,
        accessToken
    })
}