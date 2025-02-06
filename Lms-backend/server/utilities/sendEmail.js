const e = require("express");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD,
    },
  });
  
  async function sendEmail({ email, subject, message }) {
    try {
      // Send email with defined transport object
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        html: `<b>${message}</b>`, // HTML body
      });
  
      console.log("Message sent: %s", info.messageId);
  
      // Return success message with email info
      return {
        success: true,
        message: `Email sent to ${email}`,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Email could not be sent");
    }
  }

  export default sendEmail