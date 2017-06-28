var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
var prefclient = require('../prefclient.js');

//POST scanned artwork
router.get('/', function(req, res, next) {
    if(req.query.deviceid & req.query.artid & req.query.pref){
        //TODO lookup session_ID from device id
        //TODO send 0 or 1 from device and pass thru
        var report = prefclient.record_preference(req.query.deviceid, req.query.artid, 1, function(data){
            if(data){
                console.log(data);
                res.send(data);
            }
        });
    }
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

module.exports = router;
