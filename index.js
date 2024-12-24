import express, { json, urlencoded } from 'express'
import { config } from 'dotenv'
import databaseConnection from './config/database.js'
import cookieParser from 'cookie-parser'
import userRoute from './routes/userRoute.js'
import tweetRoute from './routes/tweetRoute.js'
import cors from 'cors'
// const PORT = 3001;
config({
    path: '.env'
})
const app = express();
databaseConnection();
//middlewares
app.use(json());
app.use(urlencoded({
    extended: true
}))
app.use(cors({
    origin:'http://tweetlys.vercel.app',
    methods: ['POST','GET','PUT','DELETE'],
    credentials: true
}))
app.use(cookieParser());
// api
app.use("/api/v1/user", userRoute)
app.use('/api/v1/tweet', tweetRoute)
console.log("reached here after cookieParser middleware")
// app.post("/api/v1/user/register",Register);
// app.get('/',(req,res)=>{
//     console.log(res.status(200).json({
//         message:"coming from backend..."
//     }));

// })


app.listen(process.env.PORT, () => {
    console.log(`Server listen at ${process.env.PORT}`);

})