
const mongoose = require("mongoose");

const ReproductiveHealthSchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
    unique: true,
  },
  tips: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("ReproductiveHealth", ReproductiveHealthSchema);
