import { redis } from "../config/redis";

//get user by id
export const getUserById = async (id:string) => {
    const userJson: string = await redis.get(id) as string;
    return JSON.parse(userJson);
}