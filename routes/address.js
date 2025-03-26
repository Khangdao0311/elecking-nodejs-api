var express = require('express');
var router = express.Router();

const addressController = require('../controllers/address')
const addressService = require('../services/address')

router.get("/", async function (req, res, next) {
  try {
    const result = await addressController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await addressController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/', async function (req, res, next) {
  try {
    const result = await addressService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/update/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await addressService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/update/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await addressService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/edit/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await addressService.edit(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/edit/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await addressService.edit(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;