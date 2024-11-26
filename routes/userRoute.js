const router = require("express").Router();
const userRoute = require("../controllers/userController");
const userAuth = require("../authMiddlewares/onlyUser");

router.post("/create", userRoute.createUser);
router.post("/login", userRoute.loginUser);
router.post("/forgot-password", userRoute.forgetPassword);
router.post("/reset-password", userRoute.resetPassword);
router.get("/profile", userAuth, userRoute.userProfile);
router.put("/upload-user-profile-image", userAuth, userRoute.uploadImage);
module.exports = router;
