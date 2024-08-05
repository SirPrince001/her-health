const mongoose = require("mongoose");

const fitnessPlanSchema = new mongoose.Schema(
  {
    goal: {
      type: String,
      required: true,
      unique: true,
    },
    fitnessPlans: {
      type: [String],
      required: true,
    },
    dietPlans: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FitnessPlan", fitnessPlanSchema);
