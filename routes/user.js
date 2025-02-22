var express = require('express');
var router = express.Router();

const userController = require('../controllers/user')

// lấy các danh mục theo dữ liệu query
router.get('/', async function (req, res, next) {
  try {
    const data = await userController.getQuery(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// lấy chi tiết thương hiệu dựa trên id
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const data = await userController.getById(id)
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;