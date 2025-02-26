var express = require('express');
var router = express.Router();

const orderController = require('../controllers/order')

router.post("/create", async function (req, res, next) {
  try {
    const result = await orderController.create(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.post("/update_transaction_code", async function (req, res, next) {
  try {
    const result = await orderController.updateTransactionCode(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.post("/update_status", async function (req, res, next) {
  try {
    const result = await orderController.updateStatus(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});


module.exports = router;