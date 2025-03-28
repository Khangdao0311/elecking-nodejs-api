var express = require('express');
var router = express.Router();

const authService = require('../services/auth')

router.post("/login", async function (req, res, next) {
    try {
        const result = await authService.login(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/login-admin", async function (req, res, next) {
    try {
        const result = await authService.loginAdmin(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/register", async function (req, res, next) {
    try {
        const result = await authService.register(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.put("/change-password/:id", async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await authService.changePassword(id, req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.patch("/change-password/:id", async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await authService.changePassword(id, req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post('/cart/:id', async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await authService.updateCart(id, req.body)
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post('/wish/:id', async function (req, res, next) {
    try {
        const { id } = req.params
        const result = await authService.updateWish(id, req.body)
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/get_token", async function (req, res, next) {
    try {
        const result = await authService.getToken(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/forgot-password", async function (req, res, next) {
    try {
        const result = await authService.forgotPassword(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

router.post("/reset-password", async function (req, res, next) {
    try {
        const result = await authService.resetPassword(req.body);
        return res.status(result.status).json(result);
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

module.exports = router;