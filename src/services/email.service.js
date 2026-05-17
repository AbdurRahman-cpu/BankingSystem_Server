const nodemailer = require("nodemailer");
const env = require('dotenv').config()
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.GMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

module.exports = transporter