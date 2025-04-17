var express = require('express');
var router = express.Router();

const orderController = require('../controllers/order')
const orderService = require('../services/order')
const { authentication, authorization } = require('../middleware/auth')

router.get("/", authentication, async function (req, res, next) {
  try {
    const result = await orderController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', authentication, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post("/create", authentication, async function (req, res, next) {
  try {
    const result = await orderService.create(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put("/update_transaction_code/:id", authentication, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateTransactionCode(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch("/update_transaction_code/:id", authentication, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateTransactionCode(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put("/update_status/:id", authorization, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateStatus(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch("/update_status/:id", authorization, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateStatus(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;