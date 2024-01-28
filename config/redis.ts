require('dotenv').config();
import { Redis } from "ioredis";

const redisClient = () :any => {
    if(process.env.REDIS_URL){
        console.log(`Redis connected`);
        return new Redis(process.env.REDIS_URL);
    }
    throw new Error(`redis connection failed`);
};

export const redis = new Redis(redisClient())