var express = require('express');
var router = express.Router();

const productController = require('../controllers/product')

// lấy tất cả sản phẩm
router.get('/', async function (req, res, next) {
  try {
    const data = await productController.getAll()
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// lấy các sản phẩm dự theo dữ liệu của query
router.get("/query", async function (req, res, next) {
  try {
    const data = await productController.getQuery(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// lấy chi tiết sản phẩm dựa trên id
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const data = await productController.getById(id)
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;