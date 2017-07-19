var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
var prefclient = require('../prefclient.js');

var testdata2f = {
    "18424":{"color":"purple", "title":"Sandy", "room":"275"},
    "40428":{"color":"yellow", "title":"Table Lamp", "room":"275"},
    "180":{"color":"red", "title":"Rendezvous", "room":"259"},
    "2175":{"color":"cyan", "title":"Collage IX: Landscape", "room":"259"},
    "113158":{"color":"green", "title":"Sunflowers II", "room":"255"},
    "5890":{"color":"purple", "title":"Moccasins", "room":"255"},
    "1224":{"color":"yellow", "title":"Seated Girl", "room":"263"},
    "43576":{"color":"red", "title":"Sailor's Holiday", "room":"263"},
    "40975":{"color":"cyan", "title":"Tesla Coil", "room":"264"},
    "3939":{"color":"green", "title":"Bricklayer, 1928", "room":"264"}
};

//TODO: get actual non-overlapping values for these.
var onboardingtags = {
    "99999999":{"setupcode":1},
    "99999998":{"setupcode":2}
}

//POST scanned artwork
// router.get('/', function(req, res, next) {
//     if(req.query.deviceid & req.query.artid & req.query.pref){
//         //TODO lookup session_ID from device id
//         //TODO send 0 or 1 from device and pass thru
//         // var report = prefclient.record_preference(req.query.deviceid, req.query.artid, 1, function(data){
//         //     if(data){
//         //         console.log(data);
//         //         res.send(data);
//         //     }
//         // });
//         res.status(200).send("Got a scanned artwork...");
//     }
// });

//adding a new work, more or less
router.post('/register', function(req,res,next){

});

router.get('/default', function(req,res,next){
    var payload = testdata2f["180"];
    res.status(200).send(JSON.stringify(payload));
});

//GET a random new RFID tag to go find. just for testing.
//This needs a refactor.
router.get('/', function(req,res,next){
    if(req.query.deviceid && req.query.artid && req.query.pref){
        if(testdata2f[req.query.artid]){ //got an art tag
            var is_target = req.device_session._submit_pref({
                "artid":req.query.artid,
                "pref":req.query.pref
            });

            if(is_target){ //scanned the target tag. great!
                res.status(200).send(JSON.stringify(req.device_session["CurrentPrefTarget"]));
            }
            else { //scanned something else. fine, but dont send a new goal.
                var payload = {"status":"success"};
                res.status(200).send(JSON.stringify(payload));
            }
        }
        else if(onboardingtags[req.query.artid] | req.query.artid == 0){
            //TODO: interaction with base ruleset here to get first step. right now just sending id 180.
            //var code = onboardingtags[req.query.artid]["setupcode"];
            req.device_session._setup(1);
            var payload = req.device_session["CurrentPrefTarget"];
            //payload["setupcode"] = code;
            res.status(200).send(JSON.stringify(payload));
        }
        else { //not one of our tags. could happen.
            var payload = {"status":"success"};
            res.status(200).send(JSON.stringify(payload));
        }
    }
    else{
        var payload = testdata2f["180"];
        res.status(200).send(JSON.stringify(payload));
    }
});

module.exports = router;
