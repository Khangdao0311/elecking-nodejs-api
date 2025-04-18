var nodemailer = require("nodemailer");

module.exports = {
    sendMailer
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "elecking.store@gmail.com",
        pass: "zauy tcqh mvjh frtj"
    }
});

async function sendMailer(from, to, subject, html) {
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };
    await transporter.sendMail(mailOptions);
}