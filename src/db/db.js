import mongoose, { mongo } from 'mongoose'

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongodb Connected Successfully")
    } catch (error) {
        console.error("Mongodb connection failed:-(")
        process.exit(1)
    }
}

export default connectDB;