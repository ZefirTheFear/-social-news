const jwt = require("jsonwebtoken");
const privateKey = require("../config/keys").secretOrKey;

module.exports = (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, privateKey);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
