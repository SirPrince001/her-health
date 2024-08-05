const Professional = require("../models/professionals");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const cloudinary = require("../cloudinary/cloudinary");
const User = require("../models/user");
const axios = require("axios");
const { ValidationError, NotFoundError } = require("../helper/error");
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

//sample
// controllers/professionalController.js

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
      city,
      bio,
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
      !city ||
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

    // Fetch coordinates using city name
    const coordinates = await getCoordinates(city);

    // Create new professional with geolocation
    const newProfessional = new Professional({
      fullName,
      email,
      password,
      phone,
      profession,
      specialty,
      clinicOrGym,
      city,
      location: {
        type: "Point",
        coordinates: [coordinates.longitude, coordinates.latitude], // GeoJSON coordinates: [longitude, latitude]
      },
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

// function to get user coordinates

async function getCoordinates(city) {
  try {
    const apiKey = process.env.MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      city
    )}&key=${apiKey}`;

    const response = await axios.get(url);
    const { results } = response.data;

    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error("Coordinates not found for the city");
    }
  } catch (error) {
    throw new Error(`Error fetching coordinates: ${error.message}`);
  }
}

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
