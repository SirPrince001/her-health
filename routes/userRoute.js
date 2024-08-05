const router = require("express").Router();
const userRoute = require("../controllers/userController");

router.post("/create", userRoute.createUser);
router.post("/login", userRoute.loginUser);
module.exports = router;
