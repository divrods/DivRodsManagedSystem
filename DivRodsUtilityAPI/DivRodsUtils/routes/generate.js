var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//GET trigger update from tracking API
router.get('/', function(req, res, next) {
    res.send("Not yet implemented.");
});

//POST new config information and trigger regen?
router.post('/', function(req,res,next){
    res.send("Not yet implemented.");
});

router.put('/', function(req,res,next){
    res.send("Not yet implemented.");
});

module.exports = router;
