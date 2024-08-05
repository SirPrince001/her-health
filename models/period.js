const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    match: /^\+\d{10,15}$/, // Ensure the phone number is in international format
  },
  lastPeriodDate: {
    type: Date,
    required: true,
  },
  nextPeriodDate: {
    type: Date,
  },
  ovulationDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Period", periodSchema);
