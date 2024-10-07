const router = require("express").Router();
const professionalRoute = require("../controllers/professionalController");

router.post("/create-professional", professionalRoute.createProfessional);
router.get("/search-professionals", professionalRoute.searchProfessionals);
router.post('/login-professional' , professionalRoute.loginProfessional)
router.get('/get-professionals' , professionalRoute.getAllProfessionals)

module.exports = router;
