var express = require('express');
var router = express.Router();

const brandController = require('../controllers/brand')

// lấy tất cả thương hiệu
router.get('/', async function (req, res, next) {
  try {
    const data = await brandController.getAll()
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// lấy các danh mục theo dữ liệu query
router.get("/query", async function (req, res, next) {
  try {
    const data = await brandController.getQuery(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// lấy chi tiết thương hiệu dựa trên id
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const data = await brandController.getById(id)
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;