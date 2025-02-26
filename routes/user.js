var express = require('express');
var router = express.Router();

const userController = require('../controllers/user')

router.get('/', async function (req, res, next) {
  try {
    const result = await userController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.post('/cart', async function (req, res, next) {
  try {
    const result = await userController.cart(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

router.post('/wish', async function (req, res, next) {
  try {
    const result = await userController.cart(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;