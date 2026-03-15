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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000
    });

    return res.status(200).json({
      message: "Google authentication successful",
      token,
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
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