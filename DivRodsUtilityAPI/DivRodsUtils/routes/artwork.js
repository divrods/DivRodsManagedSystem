var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
var prefclient = require('../prefclient.js');
var museum = require('../museum.js');

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

router.get('/all', function(req,res,next){
    var payload = _ArtFilter._overview();
    res.status(200).send(JSON.stringify(payload));
});

//GET a random new RFID tag to go find. just for testing.
//This needs a refactor.
router.get('/', function(req,res,next){
    if(req.query.deviceid && req.query.artid && req.query.pref){
        if(_SessionMgr._validate(req.query.artid)){ //got an art tag
            var is_target = req.device_session._submit_pref({
                "artid":req.query.artid,
                "pref":req.query.pref
            });

            //override command from device which was probably in fallback mode.
            if(req.query.oride && req.query.oride != 0){
                req.device_session._refresh_target(function(){
                    res.status(200).send(JSON.stringify(req.device_session["CurrentPrefTarget"]));
                });
            }
            if(is_target){ //scanned the target tag. great!
                res.status(200).send(JSON.stringify(req.device_session["CurrentPrefTarget"]));
            }
            else { //scanned something else. fine, but dont send a new goal.
                var payload = {"status":"success"};
                res.status(200).send(JSON.stringify(payload));
            }
        }
        else if(museum.onboardingtags[req.query.artid] | req.query.artid == 0){
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
        res.status(404).send("Bad ID");
    }
});

module.exports = router;
