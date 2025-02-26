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


module.exports = router;