var express = require('express');
var router = express.Router();

const payment_methodController = require('../controllers/payment_method')
const payment_methodService = require('../services/payment_method')

router.get("/", async function (req, res, next) {
  try {
    const result = await payment_methodController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await payment_methodController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const result = await payment_methodService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await payment_methodService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await payment_methodService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;