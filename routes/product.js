var express = require('express');
var router = express.Router();

const productController = require('../controllers/product')

router.get('/', async function (req, res, next) {
  try {
    const result = await productController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.get('/total_page', async function (req, res, next) {
  try {
    const result = await productController.getTotalPageByQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.get('/same', async function (req, res, next) {
  try {
    const result = await productController.getSame(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await productController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;