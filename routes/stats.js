var express = require('express');
var router = express.Router();

const statsController = require('../controllers/stats')

router.get("/", async function (req, res, next) {
  try {
    const result = await statsController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

module.exports = router;