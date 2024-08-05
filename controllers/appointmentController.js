const Appointment = require("../models/appointment");
const { ValidationError } = require("../helper/error");


// Create appointment without email notification
exports.createAppointment = async (req, res, next) => {
  try {
    const { professional, user, date, duration, status, time, reason } =
      req.body;

    // Validate input fields
    if (
      !professional ||
      !professional.name ||
      !professional.profession ||
      !professional.specialty ||
      !professional.clinicOrGym ||
      !user ||
      !user.name ||
      !user.email ||
      !user.phone ||
      !user.age ||
      !date ||
      !duration ||
      !status ||
      !time ||
      !reason
    ) {
      throw new ValidationError("All fields are required");
    }

    // Validate and parse the time string to a Date object
    const parsedTime = new Date(time);
    if (isNaN(parsedTime.getTime())) {
      throw new ValidationError("Invalid date format for time");
    }

    // Create new appointment instance
    const newAppointment = new Appointment({
      professional: {
        name: professional.name,
        profession: professional.profession,
        specialty: professional.specialty,
        phone: professional.phone,
        clinicOrGym: professional.clinicOrGym,
      },
      user: {
        name: user.name,
        email: user.email,
        age: user.age,
      },
      date,
      duration,
      status,
      time: parsedTime,
      reason,
    });

    // Save the appointment to the database
    const savedAppointment = await newAppointment.save();

    // Send a response back indicating success
    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointmentId = req.params.appointmentId;
    const { status } = req.body;

    // Validate input fields
    if (!appointmentId || !status) {
      throw new ValidationError("Appointment ID and status are required");
    }

    // Find the appointment by ID and update the status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      throw new ValidationError("Appointment not found");
    }

    // Send a response back indicating success
   return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// Get all appointments for a specific user
exports.getAllAppointmentsForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Validate input fields
    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    // Find all appointments for the given user
    const appointments = await Appointment.find({ "user.email": userId });

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No appointments found for the given user",
      });
    }

    // Send a response back indicating success
   return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};









