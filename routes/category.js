var express = require('express');
var router = express.Router();

const categoryController = require('../controllers/category')

router.get("/", async function (req, res, next) {
  try {
    const result = await categoryController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await categoryController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Lỗi hệ thống" });
  }
});

module.exports = router;