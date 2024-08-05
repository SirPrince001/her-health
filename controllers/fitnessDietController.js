const FitnessPlan = require("../models/fitnessPlan");
//const DietPlan = require("../models/deitPlan");

// Endpoint to add new plans
exports.addFitnessAndDietPlan = async (req, res, next) => {
  try {
    const { goal, fitnessPlans, dietPlans } = req.body;

    if (!goal || !fitnessPlans || !dietPlans) {
      return res
        .status(400)
        .json({ error: "Goal, fitness plan, and diet plan are required" });
    }

    // Create and save fitness plan
    const newFitnessPlan = new FitnessPlan({ goal, fitnessPlans, dietPlans });
    const savedPlan = await newFitnessPlan.save();

    res
      .status(201)
      .json({ message: "Plans added successfully", data: savedPlan });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while saving plans" });
  }
};

// Endpoint for personalized fitness and diet plans
exports.searchPlanByGoal = async (req, res) => {
  const { goal } = req.query;
  // Create a case-insensitive
  const isGoal = new RegExp(`^${goal}$`, "i");

  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  try {
    const fitness_diet_plan = await FitnessPlan.findOne({ goal: isGoal });
    // Check if neither fitnessPlan nor dietPlan exists
    if (!fitness_diet_plan) {
      return res.status(404).json({
        error: `No matching query ${goal} found for the given goal`,
      });
    }

    return res.status(200).json({
      success: true,
      response_message: "Fitness and Diet Plan Retrieved Successfully",
      data: fitness_diet_plan,
    });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
};
