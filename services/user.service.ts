import { Response } from "express";
import { redis } from "../config/redis";
import userModel from "../models/user.model";

//get user by id
export const getUserById = async (id:string) => {
    const userJson: string = await redis.get(id) as string;
    return JSON.parse(userJson);
}

//Get All users
export const getAllUsersService = async (res : Response) => {
    const users = await userModel.find().sort({createdAt:-1});

    res.status(201).json({
        success:true,
        users
    });
}

//update user role
export const updateUserRoleService = async (res:Response,id:string,role:string) =>{
    try{
        const user = await userModel.findByIdAndUpdate(id , { role }, { new:true });
        res.status(201).json({
            success:true,
            user
        })
    }catch(error:any){

    }
}