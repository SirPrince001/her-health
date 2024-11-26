const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^\+\d{10,15}$/, // Ensure the phone number is in international format
    },

    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
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
    interests: {
      type: [String],
      required: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    profileImage: {
      type: String,
    },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],

    //   },
    //   coordinates: {
    //     type: [Number],

    //   },
    // },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
