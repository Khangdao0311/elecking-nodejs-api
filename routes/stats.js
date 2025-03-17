var express = require('express');
var router = express.Router();

const statsController = require('../controllers/stats')
const { authorization } = require('../middleware/auth')

// router.get("/", authorization, async function (req, res, next) {
router.get("/", async function (req, res, next) {
  try {
    const result = await statsController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

module.exports = router;