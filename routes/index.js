var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  try {
    console.log(process.env.LIMIT);
  } catch (error) {

  }
});

module.exports = router;
