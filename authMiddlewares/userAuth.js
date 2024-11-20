require("dotenv").config();
const User = require("../models/user");
const Professional = require("../models/professionals");
const jwt = require("jsonwebtoken");
const { ValidationError, NotFoundError } = require("../helper/error");

const userAuth = async (request, response, next) => {
  try {
    let userToken = request.headers.authorization;
    if (!userToken) {
      throw new ValidationError("User token is required.");
    }

    userToken = userToken.split(" ")[1];
    if (!userToken) {
      throw new ValidationError("Token format is invalid.");
    }

    const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken);

    const userId = decodedToken.payload?.userId || decodedToken?.id;
    if (!userId) {
      throw new ValidationError("Invalid token payload.");
    }

    if (decodedToken.exp * 1000 < Date.now()) {
      throw new ValidationError("User token has expired.");
    }

    console.log("Extracted userId:", userId);

    const user = await User.findById(userId);
    if (user) {
      request.authUser = user;
      console.log("User data:", user);
    } else {
      const professional = await Professional.findById(userId);
      if (!professional) {
        console.log("Professional data not found for ID:", userId);
        throw new NotFoundError("User or Professional not found.");
      }
      request.professional = professional; // Attach to request
      console.log("Professional data:", professional);
    }

    next();
  } catch (error) {
    console.error("Error in userAuth middleware:", error.message);
    next(error);
  }
};

module.exports = userAuth;



// const userAuth = async (request, response, next) => {
//   try {
//     let userToken = request.headers.authorization;

//     if (!userToken) {
//       throw new ValidationError("User token is required.");
//     }

//     // Extract token part from "Bearer <token>"
//     userToken = userToken.split(" ")[1];
//     if (!userToken) {
//       throw new ValidationError("Token format is invalid.");
//     }

//     // Verify the token
//     const decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
//     console.log("Decoded Token:", decodedToken);

//     // Extract userId from token
//     const userId = decodedToken.id; // Match `createUser` token payload
//     if (!userId) {
//       throw new ValidationError("Invalid token payload: Missing userId or id.");
//     }

//     // Check token expiration
//     if (decodedToken.exp * 1000 < Date.now()) {
//       throw new ValidationError("User token has expired.");
//     }

//     console.log("Extracted userId:", userId);

//     // Find user or professional by ID
//     const user = await User.findById(userId);
//     if (user) {
//       request.authUser = user;
//       console.log("User data:", user);
//     } else {
//       const professional = await Professional.findById(userId);
//       if (!professional) {
//         throw new NotFoundError("User or Professional not found.");
//       }
//       request.professional = professional;
//       console.log("Professional data:", professional);
//     }

//     next();
//   } catch (error) {
//     console.error("Error in userAuth middleware:", error.message);
//     next(error);
//   }
// };

// module.exports = userAuth;
