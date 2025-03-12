var express = require('express');
var router = express.Router();

const voucherController = require('../controllers/voucher')
const voucherService = require('../services/voucher')

router.get("/", async function (req, res, next) {
  try {
    const result = await voucherController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});


router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await voucherController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const result = await voucherService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await voucherService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.patch('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await voucherService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

module.exports = router;