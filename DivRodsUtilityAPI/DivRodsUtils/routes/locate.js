var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs'), request = require('request');

//Just passing a request through to the tracking API and responding with a small packet
router.post('/', function(req, res, next) {
    if(req.body && req.query.deviceid){
        console.log(req.body);
        request.post(
            FINDhost,
            req.body,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var jsonresp = JSON.parse(response.body);
                    //could do some massaging here
                    var devicelocation = jsonresp["location"];
                    if(devicelocation){
                        console.log(devicelocation);
                    }
                    else{
                        console.log("Empty location from FIND.");
                    }

                    if(req.query.deviceid){
                        req.app.get('_DeviceSessions')._place(req.query.deviceid, devicelocation);
                    }
                    res.status(200).send(str(devicelocation));
                }
                else{
                    res.status(422).send("Error returned from FIND. Status code:" + response.statusCode + "Error:" + error);
                }
            }
        );
    }
    else{
        res.status(404).send("Please enclose a valid device id and wifi fingerprint.");
    }
});

module.exports = router;
