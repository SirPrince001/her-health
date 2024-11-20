const router = require("express").Router();
const professionalRoute = require("../controllers/professionalController");
const userAuth = require("../authMiddlewares/userAuth");


router.post("/create-professional", professionalRoute.createProfessional);
router.get("/search-professionals", professionalRoute.searchProfessionals);
router.post('/login-professional' , professionalRoute.loginProfessional)
router.get('/get-professionals' , professionalRoute.getAllProfessionals)
router.get("/prof-profile", userAuth, professionalRoute.getProfessionalProfile);
router.put("/upload-profile-image", userAuth, professionalRoute.uploadImage);

module.exports = router;
