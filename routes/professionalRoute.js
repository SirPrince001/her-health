const router = require("express").Router();
const professionalRoute = require("../controllers/professionalController");

router.post("/create-professional", professionalRoute.createProfessional);
router.get("/search-professionals", professionalRoute.searchProfessionals);

module.exports = router;
