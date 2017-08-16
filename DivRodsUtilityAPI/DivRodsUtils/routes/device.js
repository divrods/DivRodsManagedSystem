//_cycle
var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
var prefclient = require('../prefclient.js');

router.get('/all', function(req,res,next){
    var payload = _ArtFilter._overview();
    res.status(200).send(JSON.stringify(payload));
});

router.get('/cycle', function(req,res,next){
    if(req.query.deviceid){
        _SessionMgr._touch(req.query.deviceid, _SessionMgr);
        res.status(200).send("success");
    }
    res.status(200).send("no device id");
});

module.exports = router;
