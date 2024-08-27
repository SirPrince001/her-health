const router = require("express").Router();
const userRoute = require("../controllers/userController");

router.post("/create", userRoute.createUser);
router.post("/login", userRoute.loginUser);
router.post('/forgot-password' , userRoute.forgetPassword)
module.exports = router;
