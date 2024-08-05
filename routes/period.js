const router = require("express").Router();
const periodRoute = require("../controllers/periodController");

router.post("/calculate-period", periodRoute.calculatePeriod);

module.exports = router;
