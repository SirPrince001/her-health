require("dotenv").config();
const nodemailer = require("nodemailer");

async function mailer(to, subject, text) {
  try {
    //create transporter
    let transporter = nodemailer.createTransport({
      host: process.env.HOST_SMTP,
      port: process.env.PORT_SMTP,
      secure: false,
      auth: {
        user: process.env.USERNAME_SMTP,
        pass: process.env.PASSWORD_SMTP,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    let info = await transporter.sendMail({
      from: `${process.env.APP_NAME} <${process.env.USERNAME}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent: " + info.response);
  } catch (error) {
    console.log(error);
  }
}

module.exports = mailer;
