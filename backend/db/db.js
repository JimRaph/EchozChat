import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

console.log('CONNECTION: ',process.env.MONGO_URL)
export const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            tls: true,
        });
        console.log('MongoDB Connected...')
    }catch(err){
        console.error(err.message)
        process.exit(1)
    }
}