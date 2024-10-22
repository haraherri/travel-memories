const jwt = require("jsonwebtoken");
const { CustomError } = require("./error");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new CustomError("Authentication required", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new CustomError("Token has expired", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new CustomError("Invalid token", 401);
    }
    throw new CustomError("Token verification failed", 500);
  }
};

module.exports = verifyToken;
