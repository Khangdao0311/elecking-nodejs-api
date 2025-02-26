var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth')

router.post("/login", async function (req, res, next) {
    try {
        const result = await authController.login(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
    }
});

module.exports = router;