require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "../config/redis";

interface ITokenOption {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

//parse env variable to integrates with fallback values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "5", 10);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "5",
  10
);

//options for cookies
export const accessTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const refreshTokenOptions: ITokenOption = {
  expires: new Date(Date.now() + refreshTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //upload session to redis
  redis.set(user._id, JSON.stringify(user) as string,"EX",604800);
  
  //set secure to true in prod
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user:user,
    accessToken,
  });
};
