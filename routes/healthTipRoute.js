const router = require("express").Router();
const healthTip = require("../controllers/healthTipController");

router.post("/health-tip", healthTip.addHealthTip);
router.get("/reproductive-health-tips/:stage", healthTip.getHealthTips);

module.exports = router;
