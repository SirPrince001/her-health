const mongoose = require("mongoose");

// Define the Professional schema
const ProfessionalSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    enum: ["doctor", "dietitian", "fitnessCoach"],
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  clinicOrGym: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: "2dsphere", // Index for geospatial queries
    },
  },
  bio: {
    type: String,
    required: true,
  },
  experienceYears: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetTokenExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Create and export the Professional model

module.exports = mongoose.model("Professional", ProfessionalSchema);

