const mongoose = require("mongoose");

const ProfessionalAvailabilitySchema = new mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      required: true,
    },
    month: {
      type: String, // Format: 'YYYY-MM' (e.g., '2024-11')
      required: true,
    },
    dates: [
      {
        date: {
          type: Date,
          required: true,
        },
        timeSlots: [
          {
            startTime: { type: String, required: true }, // Format: 'HH:mm' (e.g., '10:00')
            endTime: { type: String, required: true }, // Format: 'HH:mm' (e.g., '10:30')
            isBooked: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProfessionalAvailability",
  ProfessionalAvailabilitySchema
);
