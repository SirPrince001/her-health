const Appointment = require("../models/appointment");
const { ValidationError } = require("../helper/error");


const ProfessionalAvailability = require("../models/available");

exports.bookAppointment = async (req, res, next) => {
  try {
    const { userId, professionalId, date, timeSlot } = req.body;

    // Validate inputs
    if (!userId || !professionalId || !date || !timeSlot) {
      throw new ValidationError(
        "User, professional, date, and time slot are required."
      );
    }

    // Extract month from the date (Format: 'YYYY-MM')
    const month = new Date(date).toISOString().slice(0, 7);

    // Check if the time slot is available
    const availability = await ProfessionalAvailability.findOne({
      professionalId,
      date,
      "timeSlots.startTime": timeSlot.startTime,
      "timeSlots.endTime": timeSlot.endTime,
      "timeSlots.isBooked": false, // Check if the slot is not already booked
    });

    // If the time slot is not available
    if (!availability) {
      throw new ValidationError("Selected time slot is not available.");
    }

    // Create the appointment with the month field
    const appointment = await Appointment.create({
      userId,
      professionalId,
      date,
      month, // Store the month based on the date
      timeSlot,
      status: "Confirmed", // Mark the appointment as confirmed
    });

    // Update the availability to mark the time slot as booked
    await ProfessionalAvailability.updateOne(
      {
        _id: availability._id,
        "timeSlots.startTime": timeSlot.startTime,
        "timeSlots.endTime": timeSlot.endTime,
      },
      { $set: { "timeSlots.$.isBooked": true } } // Mark the slot as booked
    );

    // Send the confirmation response
    return res.status(201).json({
      success: true,
      response_message: "Appointment booked successfully.",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};


// Update appointment status
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { userId } = req.user; // Extract userId from the decoded token
    const appointmentId = req.params.appointmentId;
    const { status } = req.body;

    // Validate input fields
    if (!appointmentId || !status) {
      throw new ValidationError("Appointment ID and status are required");
    }

    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ValidationError("Appointment not found");
    }

    // Ensure the user is either the creator of the appointment or the assigned professional
    if (
      userId !== appointment.userId.toString() &&
      userId !== appointment.professionalId.toString()
    ) {
      throw new ValidationError(
        "You are not authorized to update this appointment"
      );
    }

    // Update the status
    appointment.status = status;
    await appointment.save();

    // Send the success response
    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
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


exports.getBookedAppointments = async (req, res, next) => {
  try {
    const { professionalId, month, date } = req.query;

    // Build query object based on provided filters (if any)
    const query = {
      status: "Confirmed", // Only fetch confirmed appointments
    };

    // Add professionalId filter if provided
    if (professionalId) {
      query.professionalId = professionalId;
    }

    // Add month filter if provided
    if (month) {
      query.month = month;
    }

    // Add date filter if provided (assuming date format is 'YYYY-MM-DD')
    if (date) {
      query.date = new Date(date); // Ensure the date is correctly formatted
    }

    // Fetch the appointments based on the query
    const appointments = await Appointment.find(query)
      .populate("userId", "name email") // Optional: populate user details (name, email)
      .populate("professionalId", "name specialty"); // Optional: populate professional details

    if (!appointments.length) {
      throw new NotFoundError("No booked appointments found.");
    }

    // Return the list of appointments
    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};










