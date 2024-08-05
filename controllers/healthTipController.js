const ReproductiveHealth = require("../models/reproductiveHealthTip");

// Endpoint to add new health tips
exports.addHealthTip = async (req, res, next) => {
  try {
    const { stage, tips } = req.body;

    // Validate input
    if (!stage || !Array.isArray(tips)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Create a new document
    const newHealthTip = new ReproductiveHealth({ stage, tips });
    await newHealthTip.save();

    return res.status(201).json({
      success: true,
      response_message: "Health Tips Retrieved Successfully",
      data: newHealthTip,
    });
  } catch (error) {
    next(error);
  }
};

// Endpoint to get all health tips
exports.getHealthTips = async (req, res, next) => {
  try {
    const stage = req.params.stage.toLowerCase();
    const healthTip = await ReproductiveHealth.findOne({ stage });

    if (healthTip) {
      return res.status(200).json({
        success: true,
        response_message: "Health Tips Retrieve Successfully",
        data: healthTip,
      });
    } else {
      return res.status(404).json({ error: `Stage ${stage} not found` });
    }
  } catch (error) {
    next(error);
  }
};
