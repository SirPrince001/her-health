const router = require("express").Router();
const userRoute = require("../controllers/userController");
const userAuth = require("../authMiddlewares/userAuth");

router.post("/create", userRoute.createUser);
router.post("/login", userRoute.loginUser);
router.post("/forgot-password", userRoute.forgetPassword);
router.get("/profile", userAuth, userRoute.userProfile);
module.exports = router;
