import userModel from "../models/user.model.js";
export const getUserData = async (req, res) => {
    try {
        const userId = req.JWT_id;
        if(!userId){
            return res.json({success: false});
        }
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false, messag: "User not found!"});
        }
        res.json({
            success: false,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}