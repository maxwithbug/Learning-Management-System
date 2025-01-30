import mongoose from "mongoose";
mongoose.set('strictQuery', false);

const connectionToDb = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI || `mongodb://localhost:27017/LMS`
        );
        console.log(`Connection Successful to MongoDB: ${connection.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectionToDb;

//brew services start mongodb-community