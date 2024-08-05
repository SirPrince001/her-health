const router = require("express").Router();
const appointmentRoute = require("../controllers/appointmentController");

router.post("/create-appointment", appointmentRoute.createAppointment);
router.put("/update-appointment-status/:appointmentId", appointmentRoute.updateAppointmentStatus);
router.get("/daily-appointments")

module.exports = router;
