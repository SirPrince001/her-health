const router = require("express").Router();
const fitness_diet = require("../controllers/fitnessDietController");

router.post("/add-plan", fitness_diet.addFitnessAndDietPlan);
router.get("/search", fitness_diet.searchPlanByGoal);

module.exports = router;
