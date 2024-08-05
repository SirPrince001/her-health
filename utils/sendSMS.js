const twilio = require("twilio");
require("dotenv").config();

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Function to send SMS using Twilio
async function sendSMS(phone, message) {
  twilioClient.messages
    .create({
      body: message,
      from: twilioPhoneNumber,
      to: phone,
    })
    .then((message) =>
      console.log(`SMS sent to ${message.to}: ${message.body}`)
    )
    .catch((err) => console.error("Error sending SMS:", err));
}

module.exports = sendSMS;
