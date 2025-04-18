var express = require('express');
var router = express.Router();

const productController = require('../controllers/product')
const productService = require('../services/product')
const { authentication, authorization } = require('../middleware/auth')
const { upload } = require('../services/upload')

router.get('/', async function (req, res, next) {
  try {
    const result = await productController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/same', async function (req, res, next) {
  try {
    const result = await productController.getSame(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/view_up/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.viewUp(id);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await productController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/', authorization, upload.array("galleries"), async function (req, res, next) {
  try {
    const result = await productService.insert(req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/:id', authorization, upload.array("galleries"), async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/:id', authorization, upload.array("galleries"), async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await productService.update(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;