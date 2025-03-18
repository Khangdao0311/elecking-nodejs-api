var express = require('express');
var router = express.Router();

const reviewController = require('../controllers/review')
const reviewService = require('../services/review')

router.get("/", async function (req, res, next) {
  try {
    const result = await reviewController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const result = await reviewService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/like/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewService.like(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await reviewService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;