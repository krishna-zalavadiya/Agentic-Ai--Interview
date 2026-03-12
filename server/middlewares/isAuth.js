import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  try {

    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token"
    });

  }
};

export default isAuth;