// const ProfessionalAvailability = require("../models/available");
// const { ValidationError } = require("../helper/error");

// // Utility function to format the month
// const formatMonth = (monthString) => {
//   const [year, month] = monthString.split("-");
//   const date = new Date(year, month - 1); // JavaScript months are zero-based
//   const options = { month: "long", year: "numeric" }; // e.g., "November 2024"
//   return new Intl.DateTimeFormat("en-US", options).format(date);
// };

// exports.createAvailability = async (req, res, next) => {
//   try {
//     const { professionalId, month, dates } = req.body;

//     // Input validation
//     if (!professionalId || !month || !dates || !Array.isArray(dates)) {
//       throw new ValidationError(
//         "Professional ID, month, and valid dates with time slots are required."
//       );
//     }

//     // Format and validate input dates and time slots
//     const formattedDates = dates.map((dateObj) => {
//       if (!dateObj.date || !Array.isArray(dateObj.timeSlots)) {
//         throw new ValidationError(
//           "Each date must include a date and an array of timeSlots."
//         );
//       }

//       dateObj.timeSlots.forEach((slot) => {
//         if (!slot.startTime || !slot.endTime) {
//           throw new ValidationError(
//             "Each timeSlot must include startTime and endTime."
//           );
//         }
//       });

//       return {
//         date: new Date(dateObj.date),
//         timeSlots: dateObj.timeSlots.map((slot) => ({
//           startTime: slot.startTime,
//           endTime: slot.endTime,
//           isBooked: slot.isBooked || false, // Default to false if not provided
//         })),
//       };
//     });

//     // Check for existing availability for the professional and month
//     const existingAvailability = await ProfessionalAvailability.findOne({
//       professionalId,
//       month,
//     });

//     if (existingAvailability) {
//       // Merge new dates with existing availability
//       formattedDates.forEach((newDate) => {
//         const existingDate = existingAvailability.dates.find(
//           (d) => d.date.toISOString() === newDate.date.toISOString()
//         );

//         if (existingDate) {
//           // Merge new time slots into existing time slots
//           const existingSlotsSet = new Set(
//             existingDate.timeSlots.map(
//               (slot) => `${slot.startTime}-${slot.endTime}`
//             )
//           );

//           newDate.timeSlots.forEach((slot) => {
//             const slotKey = `${slot.startTime}-${slot.endTime}`;
//             if (!existingSlotsSet.has(slotKey)) {
//               existingDate.timeSlots.push(slot);
//             }
//           });
//         } else {
//           // Add new date with its time slots
//           existingAvailability.dates.push(newDate);
//         }
//       });

//       // Save the updated availability
//       await existingAvailability.save();
//     } else {
//       // Create a new availability record
//       const newAvailability = new ProfessionalAvailability({
//         professionalId,
//         month,
//         dates: formattedDates,
//       });

//       await newAvailability.save();
//     }

//     // Prepare response with formatted month and isBooked field
//     const responseData = formattedDates.map((dateObj) => ({
//       date: dateObj.date,
//       timeSlots: dateObj.timeSlots,
//     }));

//     return res.status(201).json({
//       success: true,
//       response_message: "Availability created/updated successfully.",
//       month: formatMonth(month), // Include formatted month
//       data: responseData,
//     });
//   } catch (error) {
//     console.error("Error in createAvailability:", error.message);
//     next(error);
//   }
// };

//new create
const ProfessionalAvailability = require("../models/available");
const { ValidationError } = require("../helper/error");

// Utility function to format the month into a user-friendly format
const formatMonth = (monthString) => {
  const [year, month] = monthString.split("-");
  const date = new Date(year, month - 1); // JavaScript months are zero-based
  const options = { month: "long", year: "numeric" }; // e.g., "December 2024"
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

exports.createAvailability = async (req, res, next) => {
  try {
    const { professionalId, month, dates } = req.body;

    // Input validation
    if (!professionalId || !month || !dates || !Array.isArray(dates)) {
      throw new ValidationError(
        "Professional ID, month, and valid dates with time slots are required."
      );
    }

    // Format and validate input dates and time slots
    const formattedDates = dates.map((dateObj) => {
      if (!dateObj.date || !Array.isArray(dateObj.timeSlots)) {
        throw new ValidationError(
          "Each date must include a date and an array of timeSlots."
        );
      }

      dateObj.timeSlots.forEach((slot) => {
        if (!slot.startTime || !slot.endTime) {
          throw new ValidationError(
            "Each timeSlot must include startTime and endTime."
          );
        }
      });

      return {
        date: new Date(dateObj.date),
        timeSlots: dateObj.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked || false, // Default to false if not provided
        })),
      };
    });

    // Format the month to a user-friendly format (e.g., "December")
    const formattedMonth = new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(new Date(month + "-01"));

    // Check for existing availability for the professional and month
    const existingAvailability = await ProfessionalAvailability.findOne({
      professionalId,
      month: formattedMonth, // Query by the user-friendly month
    });

    if (existingAvailability) {
      // Merge new dates with existing availability
      formattedDates.forEach((newDate) => {
        const existingDate = existingAvailability.dates.find(
          (d) => d.date.toISOString() === newDate.date.toISOString()
        );

        if (existingDate) {
          // Merge new time slots into existing time slots
          const existingSlotsSet = new Set(
            existingDate.timeSlots.map(
              (slot) => `${slot.startTime}-${slot.endTime}`
            )
          );

          newDate.timeSlots.forEach((slot) => {
            const slotKey = `${slot.startTime}-${slot.endTime}`;
            if (!existingSlotsSet.has(slotKey)) {
              existingDate.timeSlots.push(slot);
            }
          });
        } else {
          // Add new date with its time slots
          existingAvailability.dates.push(newDate);
        }
      });

      // Save the updated availability
      await existingAvailability.save();
    } else {
      // Create a new availability record with the formatted month
      const newAvailability = new ProfessionalAvailability({
        professionalId,
        month: formattedMonth, // Store the formatted month
        dates: formattedDates,
      });

      await newAvailability.save();
    }

    // Prepare response with formatted month and isBooked field
    const responseData = formattedDates.map((dateObj) => ({
      date: dateObj.date,
      timeSlots: dateObj.timeSlots,
    }));

    return res.status(201).json({
      success: true,
      response_message: "Availability created/updated successfully.",
      month: formattedMonth, // Include formatted month in response
      data: responseData,
    });
  } catch (error) {
    console.error("Error in createAvailability:", error.message);
    next(error);
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const { professionalId, date, month } = req.query;

    // Validate input
    if (!professionalId || !date || !month) {
      throw new ValidationError(
        "Professional ID and either date or month are required."
      );
    }

    let query = { professionalId };

    // Add filtering by month if provided
    if (month) {
      query.month = month;
    }

    // Add filtering by date if provided
    if (date) {
      query.date = date;
    }

    // Query the database with .populate to include professional data
    const availability = await ProfessionalAvailability.find(query).populate(
      "professionalId"
    ); // Populate the professionalId field

    if (!availability || availability.length === 0) {
      return res.status(404).json({
        success: false,
        response_message: "No availability found for the given criteria.",
      });
    }

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};
