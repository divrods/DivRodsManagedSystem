var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//POST scanned artwork
router.post('/', function(req, res, next) {
    if(req.query.deviceid){
        
    }
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

module.exports = router;
