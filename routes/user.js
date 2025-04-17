var express = require('express');
var router = express.Router();

const userController = require('../controllers/user')
const userService = require('../services/user')
const { authentication, authorization } = require('../middleware/auth')

router.get('/', authorization, async function (req, res, next) {
  try {
    const result = await userController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', authentication, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/status/:id', authorization, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userService.updateStatus(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/status/:id', authorization, async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userService.updateStatus(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;