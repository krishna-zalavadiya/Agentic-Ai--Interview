import User from "../models/user.model.js";
import genToken from "../config/token.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,          // required for HTTPS (Render uses HTTPS)
      sameSite: "none",      // required for cross-origin cookies
      maxAge: 1000 * 60 * 60 // 1 hour
    });

    return res.status(200).json({
      message: "Google authentication successful",
      user
    });

  } catch (error) {
    console.error("Google authentication error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


export const logout = (req, res) => {
  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    return res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};