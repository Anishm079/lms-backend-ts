import { app } from "./app";
import { connectDB } from "./config/db";
require("dotenv").config();

app.listen(process.env.PORT,()=>{
    connectDB();
    console.log(`server is running at port ${process.env.PORT}`);
});