import { Router } from "express";
import userAuth from "../middlewares/userAuth.middleware.js";
import { getUserData } from "../controllers/user.controller.js";
const userRouter = Router();
userRouter.get('/data', userAuth, getUserData);
export default userRouter;