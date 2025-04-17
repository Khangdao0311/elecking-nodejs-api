var express = require('express');
var router = express.Router();

const categoryController = require('../controllers/category')
const categoryService = require('../services/category')
const { authentication, authorization } = require('../middleware/auth')
const { upload } = require('../services/upload')

router.get("/", async function (req, res, next) {
  try {
    const result = await categoryController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await categoryController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.post('/', authorization, upload.single('image'), async function (req, res, next) {
  try {
    const body = req.body
    if (req.file) body.image = req.file.originalname
    const result = await categoryService.insert(body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/:id', authorization, upload.single('image'), async function (req, res, next) {
  try {
    const { id } = req.params
    const body = req.body
    if (req.file) body.image = req.file.originalname
    const result = await categoryService.update(id, body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/:id', authorization, upload.single('image'), async function (req, res, next) {
  try {
    const { id } = req.params
    const body = req.body
    if (req.file) body.image = req.file.originalname
    const result = await categoryService.update(id, body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;