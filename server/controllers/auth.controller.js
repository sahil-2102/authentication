import userModel from "../models/user.model.js";
import bcrypt, { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
export const register = async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) return res.json({success: false,message: "All fields are required"});
    try {
        const existingUser = await userModel.findOne({email});
        if(existingUser) return res.json({success: false, message: "Email already exists!"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const User = new userModel({name, email, password: hashedPassword});
        await User.save();

        const token = jwt.sign({id: User._id}, process.env.JWT_SECRET,{
            expiresIn: '7d'
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7d in milliseconds
        });
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Authenticator",
            text: `You account has successfully been created on Authenticator with the email Id: ${email}`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success: true, message: "Account created successfully!"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}
export const login = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) return res.json({success: false, message: "Both fields are required!"});
    try {
        const user  = await userModel.findOne({email});
        if(!user) return res.json({success: false, message: "Invalid credentials!"});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.json({success: false, message: "Invalid credentials!"});
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });
        res.cookie('token',token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({success: true});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        return res.json({success: true, message: "Logged out!"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}
export const sendVerifyOtp = async (req, res) => {
    const userId = req.JWT_Id;
    try {
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success: false, message: "Acoount already verified!"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Email Verification",
            text: `Your email verification OTP is ${otp}. Please use this OTP to verify your email.`
        };
        await transporter.sendMail(mailOptions);
        return res.json({success: true, message: "Verification OTP has been sent!"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}
export const verifyEmail = async(req, res) => {
    const {otp} = req.body;
    const userId = req.JWT_Id;
    try {
        if(!userId || !otp) return res.json({success: false, message: "Missing details!"});
        const user = await userModel.findById(userId);
        if(!user) return res.json({success: false,message: "User not found!"});
        if(user.verifyOtp === '' || !(user.verifyOtp === otp)){
            return res.json({success: false, message: "Invalid OTP!"});
        }
        if(user.verifyOtpExpireAt < Date.now()) return res.json({success: false, message: "OTP expired!"});

        user.isAccountVerified = true;
        user.verifyOtp = ''
        user.verifyOtpExpireAt = 0
        await user.save();
        return res.json({success: true, message: "Account verified successfully!"})
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}
export const sendResetOtp = async (req, res) => {
   try {
        const {email} = req.body;
        if(!email){
            return res.json({success: false, message: "A valid email is required!"});
        }
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not found!"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password reset OTP",
            text: `Your password reset OTP is ${otp}. Please use this OTP to reset your password`
        };
        await transporter.sendMail(mailOptions);
        return res.json({success: false, message: "Password reset otp sent!"});
   } catch (error) {
        return res.json({success: false, message: error.message});
   }
}
export const resetPassword = async (req, res) => {
    try {
        const {email, otp, newPassword} = req.body;
        if(!email || !otp || !newPassword){
            return res.json({success: false, message: "All fields are required!"});
        }
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "user not found!"});
        }
        if(user.resetOtp === '' || !(user.resetOtp === otp)){
            return res.json({success: false, message: "Invalid OTP"});
        }
        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP Expired!"});
        }
        const samePassword = await bcrypt.compare(newPassword, user.password);
        if(samePassword){
            return res.json({success: false, message: "Password cannot be same!"});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.json({success: true, message: "You password has been changed successfully!"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}