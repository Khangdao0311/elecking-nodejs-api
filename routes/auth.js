var express = require('express');
var router = express.Router();

const authService = require('../services/auth')

router.post("/login", async function (req, res, next) {
    try {
        const result = await authService.login(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
    }
});

router.post("/register", async function (req, res, next) {
    try {
        const result = await authService.register(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
    }
});

router.post('/cart/:id', async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await authService.updateCart(id, req.body)
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
    }
});

router.post('/wish/:id', async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await authService.updateWish(id, req.body)
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
    }
});

module.exports = router;