import userModel from "../models/user.model.js";
export const getUserData = async (req, res) => {
    try {
        const userId = req.JWT_Id;
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false, message: "User not found!"});
        }
        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}