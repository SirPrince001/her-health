const cron = require("node-cron");
const moment = require("moment");
const sendSMS = require("./utils/sendSMS");
const Appointment = require("./models/appointment");

// Define the cron job to run every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  try {
    // Calculate the start and end of the next day
    const startOfNextDay = moment().add(1, "days").startOf("day").toDate();
    const endOfNextDay = moment().add(1, "days").endOf("day").toDate();

    // Fetch appointments for the next day
    const nextDayAppointments = await Appointment.find({
      date: {
        $gte: startOfNextDay,
        $lt: endOfNextDay,
      },
      status: "accepted",
    }).exec();

    // Send SMS reminders for each appointment
    nextDayAppointments.forEach((appointment) => {
      const message = `Reminder: Your appointment is scheduled for tomorrow at ${moment(
        appointment.date
      ).format("h:mm A")}. Please remember to attend.`;
      sendSMS(appointment.phone, message);
      console.log(`SMS reminder sent to ${appointment.phone}`);
    });
  } catch (error) {
    next(error)
  }
});





