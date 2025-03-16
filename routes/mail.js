var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
var emailValidator = require("email-validator");
var emailExistence = require("email-existence");

router.post("/", async function (req, res, next) {
    try {
        const { to, subject, content } = req.body

        if (!emailValidator.validate(to)) {
            return res.status(400).json({ status: 400, message: "Email không đúng định dạng !" });
        }

        emailExistence.check(to, function (error, exists) {
            if (error) return res.status(500).json({ status: 500, message: "Lỗi kiểm tra email !" });
            if (!exists) return res.status(400).json({ status: 400, message: "Email không tồn tại !" });
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "elecking.store@gmail.com",
                pass: "zauy tcqh mvjh frtj"
            }
        });

        const mailOptions = {
            from: '"Elecking"<elecking.store@gmail.com>',
            to: to,
            subject: subject,
            // text: "text",
            html: content
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ status: 200, message: "Success" });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });

    }
});

module.exports = router;
