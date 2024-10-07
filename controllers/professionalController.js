const Professional = require("../models/professionals");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const cloudinary = require("../cloudinary/cloudinary");
const User = require("../models/user");
const jwt = require('jsonwebtoken')
const { ValidationError, NotFoundError } = require("../helper/error");
const nodemailer = require('../utils/nodemailer')
require("dotenv").config();

//search for professional by speacialty,City, geolocation

exports.searchProfessionals = async (req, res, next) => {
  try {
    // Extract query parameters
    const { specialty, city, maxDistance } = req.query;

    // Validate required parameters
    if (!specialty || !city) {
      return res.status(400).json({
        error: "Specialty and city are required query parameters",
      });
    }

    // Fetch user by city to get the location coordinates
    const user = await User.findOne({ city }).exec();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found in the specified city",
      });
    }

    // Prepare filter object
    let filter = {
      specialty: { $regex: new RegExp(specialty, "i") },
      city: { $regex: new RegExp(city, "i") },
    };

    // Add geolocation filtering if maxDistance is provided
    if (user.location && maxDistance) {
      filter.location = {
        $nearSphere: {
          $geometry: user.location,
          $maxDistance: parseFloat(maxDistance), // Convert maxDistance to number
        },
      };
    }

    // Query professionals based on filter
    const professionals = await Professional.find(filter).select("-password");

    // Check if professionals array is empty
    if (professionals.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No professionals found matching the criteria",
      });
    }

    // Return response with matching professionals
    return res.status(200).json({
      success: true,
      count: professionals.length,
      data: professionals,
    });
  } catch (error) {
    next(error);
  }
};



exports.createProfessional = async (req, res, next) => {
  try {
    let {
      fullName,
      email,
      password,
      phone,
      profession,
      specialty,
      clinicOrGym,
      state,
      city,
      address,
      bio,
      longitude,
      latitude,
      experienceYears,
    } = req.body;

    // Validate input
    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !profession ||
      !specialty ||
      !clinicOrGym ||
      !state ||
      !city ||
      !address ||
      !bio ||
      !experienceYears
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Hash password
    password = bcrypt.hashSync(password, 10);

    // Create new professional with geolocation
    const newProfessional = new Professional({
      fullName,
      email,
      password,
      phone,
      profession,
      specialty,
      clinicOrGym,
      state,
      city,
      address,
      longitude:longitude,
      latitude:latitude,
      // location: {
      //   type: "Point",
      //   coordinates: [coordinates.longitude, coordinates.latitude], // GeoJSON coordinates: [longitude, latitude]
      // },
      bio,
      experienceYears,
    });

    // Save the professional to the database
    const savedProfessional = await newProfessional.save();

    // Prepare response (omit sensitive information)
    const responseProfessional = savedProfessional.toObject();
    delete responseProfessional.password;

    // Respond with success message and professional data
    res.status(201).json({
      success: true,
      response_message: `Professional ${responseProfessional.fullName} created successfully`,
      data: responseProfessional,
    });
  } catch (error) {
    next(error);
  }
};



exports.loginProfessional = async (request, response, next) => {
  try {
    let { email, password } = request.body;
    //validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }
    //check if email exists
    const user = await Professional.findOne({ email });
    if (!user) {
      throw new NotFoundError(`User with email ${user.email} not found`);
    }
    //compare password
    const isMatch = bcrypt.compareSync(password, user.password);
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

//update professional profile image using formidable
exports.uploadImage = async (req, res, next) => {
  let user_id = req.user.id;
  if (!user_id || !Mongoose.isValidObjectId(user_id)) {
    throw new ValidationError(" User ID is required");
  }
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(err);
    }

    try {
      // Handle file upload to cloudinary
      const imageResult = await cloudinary.uploader.upload(
        files.profileImage[0].filepath,
        {
          folder: "profile-images"
        }
      );

      const updatedUser = await User.findByIdAndUpdate(
        user_id,
        { profileImage: imageResult.secure_url },
        { new: true }
      );

      if (!updatedUser) {
        throw new NotFoundError(`User not found with ID ${user_id}`);
      }

      // Convert Mongoose document to plain object, excluding sensitive fields
      const { password, ...result } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        response_message: `User ${updatedUser.firstName} profile image updated successfully`,
        result,
      });
    } catch (error) {
      return next(error);
    }
  });
};

//forget password
exports.forgetPassword = async (request, response, next) => {
  try {
    const { email } = request.body;
    console.log("Received Email:", email);
    // Check if user exists
    const user = await Professional.findOne({ email });

    console.log("User found:", user);

    if (!user) {
      console.log("No user found with the given ID number.");
      return response
        .status(400)
        .send(`No user found with the given ID number ${email}.`);
    }

    // Remove any existing reset token for this user
     await ResetPasswordToken.deleteMany({ user: user._id });

    // Generate a unique reset token
    const token = crypto.randomBytes(20).toString("hex");
    console.log("Generated reset token:", token);
    // Set reset token and expiration in the user document
    user.resetPasswordToken = token;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();

    // Send an email with the reset link
    const resetUrl = `${process.env.WEB_URL}/reset-password?token=${token}`;
    // Ensure nodemailer is properly configured
    nodemailer({
      to: user.email,
      subject: "Reset Password ",
      text: `Click this link to reset your password: ${resetUrl}`,
    });

    return response
      .status(200)
      .json({
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
  console.log('Reset token:', token);

  // Check if new password and confirm password match
  if (newPassword !== confirmPassword) {
    return response.status(400).send('Passwords do not match');
  }

  try {
    // Find the user with the reset token and check if it is valid
    const user = await Professional.findOne({
      resetPasswordToken: token,
      resetTokenExpires: { $gt: Date.now() }, // Token has not expired
    }).exec();

    console.log('User found for password reset:', user);

    if (!user) {
      console.log('Invalid or expired reset token.');
      return response.status(400).send('Invalid or expired token');
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
      .json({ success: true, response_message: `${user.firstName} your password has been reset successfully`});
  } catch (error) {
    console.error('Error in resetPassword endpoint:', error);
    next(error);
  }
};

// Get all professionals sorted by most recent
exports.getAllProfessionals = async (request, response, next) => {
  try {
    const professionals = await Professional.find({}).sort({ createdAt: -1 }); 
    response.status(200).json({ 
      success: true, 
      response_message: 'Fetched All Professionals Successfully', 
      data: professionals 
    });
  } catch (error) {
    next(error);
  }
};

// Profile professional using login token
exports.getProfessionalProfile = async (request, response, next) => {
  try {
    // Assuming you're using a middleware to verify the token and attach the professional's ID to the request
    const { professionalId } = request.user;  // Extract professionalId from the token (attached by auth middleware)

    if (!professionalId) {
      throw new ValidationError("Professional ID is missing from the token");
    }

    const professional = await Professional.findById(professionalId);

    if (!professional) {
      throw new NotFoundError(`Professional not found with ID ${professionalId}`);
    }

    // Convert Mongoose document to plain object, excluding sensitive fields
    const { password, ...result } = professional.toObject();

    response.status(200).json({
      success: true,
      response_message: `Fetched Professional profile successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


