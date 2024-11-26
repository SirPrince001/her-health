const User = require("../models/user");
const bcryptjs = require("bcryptjs");
const formidable = require("formidable");
const cloudinary = require("../cloudinary/cloudinary");
const jwt = require("jsonwebtoken");
const { ValidationError, NotFoundError } = require("../helper/error");
const mailer = require("../utils/nodemailer");
const crypto = require("crypto");
const getCoordinatesFromCity = require("../utils/location"); // Path to geocoding service
const Mongoose = require("mongoose");

exports.createUser = async (request, response, next) => {
  try {
    const {
      fullName,
      email,
      password,
      age,
      gender,
      state,
      city,
      interests,
      phone,
      latitude,
      longitude,
      date_of_birth,
    } = request.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !age ||
      !gender ||
      !state ||
      !city ||
      !interests ||
      !phone ||
      !date_of_birth
    ) {
      throw new ValidationError("All fields are required");
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
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create the user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      age,
      gender,
      state,
      city,
      interests,
      phone,
      longitude,
      latitude,
      date_of_birth,
    });

    let savedUser = await user.save();

    // Generate a JWT token for the user
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time
    );

    // Convert savedUser to JSON and exclude password
    savedUser = savedUser.toJSON();
    delete savedUser.password;

    response.status(201).json({
      success: true,
      response_message: `User ${savedUser.fullName} created successfully`,
      data: savedUser,
      token, // Include token in the response
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

//endpoint for user profile
exports.userProfile = async (request, response, next) => {
  try {
    const user = request.user;

    // if (!userId || !Mongoose.isValidObjectId(userId)) {
    //   throw new ValidationError("Invalid User ID");
    // }
    // const user_profile = await User.findById(userId);
    // console.log(user_profile)
    // if (!user_profile) {
    //   throw new NotFoundError(`User with this ID ${userId} not found`);
    // }

    return response.status(200).json({
      success: true,
      response_message: `User ${user.fullName} profile retrieved successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//forget password
exports.forgetPassword = async (request, response, next) => {
  try {
    const { email } = request.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).json({
        success: false,
        response_message: `No user found with the email ${email}.`,
      });
    }

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the token and set expiry
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const tokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Update user with reset token and expiration
    user.resetPasswordToken = hashedToken;
    user.resetTokenExpires = tokenExpiry;
    await user.save();

    // Construct reset URL
    const resetUrl = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;

    // Send email
    await mailer(
      user.email,
      "Password Reset Request",
      `You requested to reset your password. Click the link below to proceed:\n\n${resetUrl}\n\nIf you did not make this request, please ignore this email.`
    );

    return response.status(200).json({
      success: true,
      response_message: `Password reset email sent to ${user.email}.`,
    });
  } catch (error) {
    console.error("Error in forgetPassword endpoint:", error.message);
    next(error); // Pass the error to a global error handler
  }
};

// Endpoint to reset the password
exports.resetPassword = async (request, response, next) => {
  const { token, newPassword, confirmPassword } = request.body;

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    return response.status(400).json({
      success: false,
      response_message: "Passwords do not match.",
    });
  }

  try {
    // Hash the provided token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user with the hashed token and check token expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() }, // Token has not expired
    });

    if (!user) {
      return response.status(400).json({
        success: false,
        response_message: "Invalid or expired token.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return response.status(200).json({
      success: true,
      response_message: `${user.firstName}, your password has been reset successfully.`,
    });
  } catch (error) {
    console.error("Error in resetPassword endpoint:", error.message);
    next(error); // Pass the error to a global error handler
  }
};
exports.uploadImage = async (req, res, next) => {
  try {
    // Extract user or professional details from the request
    const { user } = req;

    if (!user || !Mongoose.isValidObjectId(user._id)) {
      throw new ValidationError(
        "User or Professional ID is required or invalid."
      );
    }

    // Initialize formidable to parse form-data
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return next(new ValidationError("Error parsing form data."));
      }

      console.log("Parsed fields:", fields);
      console.log("Parsed files:", files);

      // Extract profile image file
      const profileImage = Array.isArray(files.profileImage)
        ? files.profileImage[0]
        : files.profileImage;

      if (!profileImage?.filepath) {
        return next(new ValidationError("Profile image file is missing."));
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(profileImage.mimetype)) {
        return next(
          new ValidationError("Invalid file type. Please upload an image.")
        );
      }

      try {
        // Upload image to Cloudinary
        const imageResult = await cloudinary.uploader.upload(
          profileImage.filepath,
          {
            folder: "profile-images",
          }
        );

        console.log("Uploaded Image URL:", imageResult.secure_url);

        // Update user's profile image
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { profileImage: imageResult.secure_url },
          { new: true }
        );

        if (!updatedUser) {
          throw new NotFoundError(`User not found with ID ${user._id}`);
        }

        // Exclude sensitive data (e.g., password) from response
        const { password, ...result } = updatedUser.toObject();

        // Respond with success
        return res.status(200).json({
          success: true,
          response_message: `Profile image updated successfully`,
          result,
        });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return next(
          new ValidationError("Error uploading image to Cloudinary.")
        );
      }
    });
  } catch (error) {
    console.error("Error in uploadImage controller:", error);
    return next(error);
  }
};
