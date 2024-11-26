const router = require("express").Router();
router.use(require("./userRoute"));
router.use(require("./professionalRoute"));
router.use(require("./appointmentRoute"));
router.use(require("./period"));
router.use(require("./fitness_diet_Route"));
router.use(require("./healthTipRoute"));
router.use(require('./availableRoute'))
module.exports = router;
