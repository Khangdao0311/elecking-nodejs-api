var express = require('express');
var router = express.Router();

const userController = require('../controllers/user')
const userService = require('../services/user')

router.get('/', async function (req, res, next) {
  try {
    const result = await userController.getQuery(req.query);
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userController.getById(id)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/status/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userService.updateStatus(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/status/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userService.updateStatus(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.put('/profile/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userService.updateProfile(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

router.patch('/profile/:id', async function (req, res, next) {
  try {
    const { id } = req.params
    const result = await userService.updateProfile(id, req.body)
    return res.status(result.status).json(result);
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

module.exports = router;