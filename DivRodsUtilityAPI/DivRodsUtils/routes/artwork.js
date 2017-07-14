var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
var prefclient = require('../prefclient.js');

var testdata2f = {
    "18424":{"color":"purple", "title":"Sandy", "room":"275"},
    "40428":{"color":"yellow", "title":"Table Lamp", "room":"275"},
    "180":{"color":"red", "title":"Rendezvous", "room":"259"},
    "2175":{"color":"blue", "title":"Collage IX: Landscape", "room":"259"},
    "113158":{"color":"green", "title":"Sunflowers II", "room":"255"},
    "5890":{"color":"purple", "title":"Moccasins", "room":"255"},
    "1224":{"color":"yellow", "title":"Seated Girl", "room":"263"},
    "43576":{"color":"red", "title":"Sailor's Holiday", "room":"263"},
    "40975":{"color":"blue", "title":"Tesla Coil", "room":"264"},
    "3939":{"color":"green", "title":"Bricklayer, 1928", "room":"264"}
};

//POST scanned artwork
router.get('/', function(req, res, next) {
    if(req.query.deviceid & req.query.artid & req.query.pref){
        //TODO lookup session_ID from device id
        //TODO send 0 or 1 from device and pass thru
        // var report = prefclient.record_preference(req.query.deviceid, req.query.artid, 1, function(data){
        //     if(data){
        //         console.log(data);
        //         res.send(data);
        //     }
        // });
        res.status(200).send("Got a scanned artwork...");
    }
});

//GET a random new RFID tag to go find. just for testing.
router.get('/test', function(req,res,next){
    if(req.query.deviceid && req.query.artid && req.query.pref && testdata2f[req.query.artid]){
        req.device_session._submit_pref({
            "artid":req.query.artid,
            "pref":req.query.pref
        });
        var otherart = Object.keys(testdata2f).filter(function(artid){
            return artid != req.query.artid && testdata2f[artid]["room"] != testdata2f[req.query.artid]["room"];
        });
        var randomtag = otherart[Math.floor(Math.random() * otherart.length)];
        res.status(200).send(JSON.stringify(testdata2f[randomtag]));
    }
    else{
        var payload = testdata2f["180"];
        res.status(200).send(JSON.stringify(payload));
    }
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

module.exports = router;
