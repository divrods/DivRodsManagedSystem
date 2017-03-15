var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//GET trigger generation of new config file
router.get('/', function(req, res, next) {
    res.send("Not yet implemented.");
});

//POST new config information and trigger regen?
router.post('/', function(req,res,next){
    res.send("Not yet implemented.");
});

module.exports = router;
