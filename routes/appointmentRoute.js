const router = require("express").Router();
const appointmentRoute = require("../controllers/appointmentController");

router.post("/create-appointment", appointmentRoute.bookAppointment);
router.put("/update-appointment-status/:appointmentId", appointmentRoute.updateAppointmentStatus);
router.post("/book-appointment", appointmentRoute.bookAppointment);
router.get("/daily-appointments")

module.exports = router;
