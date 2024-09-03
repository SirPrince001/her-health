const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ValidationError, NotFoundError } = require("../helper/error");
const mailer = require("../utils/nodemailer");
const crypto = require("crypto");
const getCoordinatesFromCity = require("../utils/location"); // Path to geocoding service

exports.createUser = async (request, response, next) => {
  try {
    let {
      fullName,
      email,
      password,
      age,
      gender,
      state,
      city,
      phone,
      latitude,
      longitude,
    } = request.body;

    // Validate input
    if (
      !fullName ||
      !email ||
      !password ||
      !age ||
      !gender ||
      !state ||
      !city ||
      !phone ||
      !latitude ||
      !longitude
    ) {
      throw new ValidationError(
        "All fields are required, including latitude and longitude"
      );
    }

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ValidationError(
        `User with this email ${userExists.email} already exists`
      );
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      throw new ValidationError(
        `User with this phone number ${phoneExists.phone} already exists`
      );
    }

    // Hash password
    password = bcryptjs.hashSync(password, 10);

    // Create user with location
    const user = new User({
      fullName,
      email,
      password,
      age,
      gender,
      state,
      city,
      phone,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // Longitude first, then latitude
      },
    });

    let savedUser = await user.save();

    // Result and exclude password
    savedUser = savedUser.toJSON();
    delete savedUser.password;

    response.status(201).json({
      success: true,
      response_message: `User ${user.fullName} created successfully`,
      data: savedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (request, response, next) => {
  try {
    let { email, password } = request.body;
    //validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }
    //check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError(`User with email ${user.email} not found`);
    }
    //compare password
    const isMatch = bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      throw new ValidationError("Invalid email or password");
    }
    // create payload
    const payload = { userId: user._id };
    //generate and send jwt token
    const token = jwt.sign({ payload }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    response.json({
      success: true,
      response_message: `User ${user.fullName} logged in successfully`,
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

//forget password
exports.forgetPassword = async (request, response, next) => {
  try {
    const { email } = request.body;
    console.log("Received Email:", email);
    // Check if user exists
    const user = await User.findOne({ email });
    console.log("User email found:", user.email);
    console.log(user)

    if (!user) {
      console.log("No user found with the given ID number.");
      return response
        .status(400)
        .json({
          response_message: `No user found with the given ID number ${email}.`,
        });
    }

    // Generate a unique reset token
    const token = crypto.randomBytes(20).toString("hex");
    console.log("Generated reset token:", token);
    // Set reset token and expiration in the user document
      await User.findByIdAndUpdate(user._id, {
        resetPasswordToken: token,
        resetTokenExpires: Date.now() + 3600000, // 1 hour from now
      }, {new:true});
  

    // Send an email with the reset link
    const resetUrl = `${process.env.WEB_URL}/reset-password?token=${token}`;
    
    mailer(
      user.email,
       "Reset Password ",
       `Click this link to reset your password: ${resetUrl}`,
    );
    
    return response.status(200).json({
      success: true,
      response_message: `Password reset email sent to your email ${user.email}`,
    });
  } catch (error) {
    console.error("Error in forgetPassword endpoint:", error.message);
    next(error);
  }
};

// Endpoint to reset the password
exports.resetPassword = async (request, response, next) => {
  const { token, newPassword, confirmPassword } = request.body;
  console.log("Reset token:", token);

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return response.status(400).send("Passwords do not match");
  }

  try {
    // Find the user with the reset token and check if it is valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetTokenExpires: { $gt: Date.now() }, // Token has not expired
    }).exec();

    console.log("User found for password reset:", user);

    if (!user) {
      console.log("Invalid or expired reset token.");
      return response.status(400).send("Invalid or expired token");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Set new password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return response
      .status(200)
      .json({
        success: true,
        response_message: `${user.firstName} your password has been reset successfully`,
      });
  } catch (error) {
    console.error("Error in resetPassword endpoint:", error);
    next(error);
  }
};
