const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  professional: {
    name: { type: String, required: true },
    profession: {
      type: String,
      required: true,
      enum: ["doctor", "dietitian", "fitnessCoach"],
    },
    specialty: { type: String, required: true },

    phone: { type: String, required: true },
    clinicOrGym: { type: String, required: true },
  },
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: String, required: true },
  },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["pending", "accepted", "rejected"],
  },

  time: { type: Date, required: true },
  reason: { type: String, required: true },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
