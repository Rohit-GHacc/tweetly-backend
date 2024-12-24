import express, { json, urlencoded } from 'express';
import { config } from 'dotenv';
import databaseConnection from './config/database.js';
import cookieParser from 'cookie-parser';
import userRoute from './routes/userRoute.js';
import tweetRoute from './routes/tweetRoute.js';
import cors from 'cors';
import isAuthenticated from './config/auth.js';

config({
    path: '.env'
});

const app = express();
databaseConnection();

// Middlewares
app.use(json());
app.use(
    urlencoded({
        extended: true,
    })
);

// Dynamic CORS Configuration
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'https://tweetlys.vercel.app', // Production
];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['POST', 'GET', 'PUT', 'DELETE'],
        credentials: true,
    })
);

app.use(cookieParser());

// API Routes
app.use('/api/v1/user',isAuthenticated, userRoute);
app.use('/api/v1/tweet',isAuthenticated, tweetRoute);

console.log('Server reached after cookieParser middleware');

// Start the Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening at port ${PORT}`);
});
