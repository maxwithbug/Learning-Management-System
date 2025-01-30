import { config } from 'dotenv';
config()
import app from './app.js';
import connectionToDb from './config/dbConnection.js';






const PORT = process.env.PORT || 5020;

app.listen(PORT, async () => {
    await connectionToDb()
    console.log(`server running on PORT ${PORT}`);
});
