import { config } from 'dotenv';
config()
import app from './app.js';
import connectionToDb from './config/dbConnection.js';
import cloudinary from 'cloudinary';    



//cloudinary config
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,     
    api_secret: process.env.CLOUD_API_SECRET
});


const PORT = process.env.PORT || 5020;

app.listen(PORT, async () => {
    await connectionToDb()
    console.log(`server running on PORT ${PORT}`);
});
