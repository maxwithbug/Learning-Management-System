import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/userRouter.js'
import errorMiddleware from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev')) //for information logger ,like dev is a mode that logs what user trying to aaccess in website with status code 

// Corrected Ping Route
app.use('/ping', (req, res) => {
    res.send('/pong');
});

// Routes (Placeholder for 3 modules)
// import userRoutes from './routes/userRoutes.js';
// import productRoutes from './routes/productRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';

app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);

// 404 Handler
app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 page not found');
});
app.use(errorMiddleware)



export default app;
