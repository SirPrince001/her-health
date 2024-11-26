const router = require("express").Router();
const professionalAvailable = require("../controllers/availableController");
//const userController = require("../controllers/userController");

// Professional routes
router.post("/availability", professionalAvailable.createAvailability);

// User routes
router.get("/availability", professionalAvailable.getAvailability);


module.exports = router;
