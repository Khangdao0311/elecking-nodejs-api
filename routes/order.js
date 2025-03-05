var express = require('express');
var router = express.Router();

const orderController = require('../controllers/order')
const orderService = require('../services/order')

router.get("/", async function (req, res, next) {
  try {
    const result = await orderController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.get("/total_pages", async function (req, res, next) {
  try {
    const result = await orderController.getTotalPagesByQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.post("/create", async function (req, res, next) {
  try {
    const result = await orderService.create(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.put("/update_transaction_code/:id", async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateTransactionCode(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.patch("/update_transaction_code/:id", async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateTransactionCode(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.put("/update_status/:id", async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateStatus(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.patch("/update_status/:id", async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateStatus(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.put("/update_status_review/:id", async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateStatusReview(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.patch("/update_status_review/:id", async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await orderService.updateStatusReview(id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

module.exports = router;