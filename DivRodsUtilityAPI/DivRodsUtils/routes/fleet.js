var express = require('express');
var router = express.Router();
//Do we need this endpoint?

/* GET all devices */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;