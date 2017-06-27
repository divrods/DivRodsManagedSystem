var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//GET goal gallery
router.get('/', function(req, res, next) {
    if(req.query.deviceid){
        //update device session from pref engine?
    }
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

module.exports = router;
