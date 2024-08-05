const express = require('express');
const moment = require('moment');
const Period = require('../models/period')
const twilio = require('twilio');
const {ValidationError , NotFoundError} = require('../helper/error')


// Calculate menstruation and ovulation dates
const calculateDates = (lastPeriodDate) => {
  const periodLength = 28; // Average cycle length
  const ovulationOffset = 14; // Average ovulation offset in cycle

  const lastPeriod = moment(lastPeriodDate, "YYYY-MM-DD");
  const nextPeriod = lastPeriod.clone().add(periodLength, "days");
  const ovulationDate = lastPeriod.clone().add(ovulationOffset, "days");

  return {
    nextPeriod: nextPeriod.format("YYYY-MM-DD"),
    ovulationDate: ovulationDate.format("YYYY-MM-DD"),
  };
};


// Endpoint to receive last period date and send SMS
exports.calculatePeriod = async (request, response, next) => {
  try {
    const { lastPeriodDate, phoneNumber } = request.body;

    if (!lastPeriodDate || !phoneNumber) {
      return response.status(400).json({ error: "Please provide lastPeriodDate and phoneNumber" });
    }

    // Save or update user data
    let user = await Period.findOne({ phoneNumber });
    if (!user) {
      user = new Period({ phoneNumber, lastPeriodDate });
    } else {
      user.lastPeriodDate = lastPeriodDate;
    }

    const { nextPeriod, ovulationDate } = calculateDates(lastPeriodDate);
    user.nextPeriodDate = nextPeriod;
    user.ovulationDate = ovulationDate;

    const savedUser = await user.save();
    return response.status(200).json({
      success: true,
      message: 'Period data saved successfully',
      data: savedUser
    });

  } catch (error) {
    next(error); // Pass the error to the next error handling middleware
  }




  
  // Send SMS reminder
  // const message = `Your next period is expected to start on ${nextPeriod}. Your ovulation date is ${ovulationDate}.`;

  // client.messages.create({
  //   body: message,
  //   from: twilioPhoneNumber,
  //   to: phoneNumber
  // }).then(() => {
  //   res.status(200).json({
  //     success: true,
  //     message: 'Reminder sent successfully!',
  //     nextPeriod: nextPeriod,
  //     ovulationDate: ovulationDate
  //   });
  // }).catch((error) => {
  //   res.status(500).json({
  //     success: false,
  //     error: 'Failed to send SMS',
  //     details: error.message
  //   });
  // });
};


