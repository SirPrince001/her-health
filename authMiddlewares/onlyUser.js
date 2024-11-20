const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ValidationError("Authentication token is missing.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.payload.userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    req.user = user; // Attach user to the request
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error("Error in userAuth middleware:", error);
    next(error);
  }
};

module.exports = userAuth;
