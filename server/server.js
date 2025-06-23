import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongoDB.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
const app = express();
const port = process.env.PORT || 4000;
connectDB();
const allowedOrigins = ['http://localhost:5173']
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins,credentials: true}));
app.use('/api/auth', authRouter );
app.use('/api/user', userRouter);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
