const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html, attachments }) => {
  console.log("Sending email to", to);

  let config = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let message = {
    from: `ATFS<${process.env.NODEMAILER_EMAIL}>`,
    to: to,
    subject: subject,
    html: html,
    attachments: attachments,
  };

  await transporter.sendMail(message);
};

module.exports = { sendEmail };
