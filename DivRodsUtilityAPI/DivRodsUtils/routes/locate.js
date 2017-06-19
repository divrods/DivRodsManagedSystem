var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
//router.use(bodyParser.raw());
var async = require('async'), fs = require('fs'), request = require('request');

//Just passing a request through to the tracking API and responding with a small packet
router.post('/', function(req, res, next) {
    if(req.body && req.query.deviceid){
        console.log(req.body);
        console.log(JSON.parse(req.body));
        request.post(
            "ec2-54-209-226-130.compute-1.amazonaws.com:18003/track",
            JSON.parse(req.body),
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var jsonresp = JSON.parse(response.body);
                    //could do some massaging here
                    var devicelocation = jsonresp["location"];
                    if(devicelocation){
                        console.log("Device location from FIND: ");
                        console.log(devicelocation);
                    }
                    else{
                        console.log("Empty location from FIND.");
                    }

                    if(req.query.deviceid){
                        req.app.get('_DeviceSessions')._place(req.query.deviceid, devicelocation);
                    }
                    res.status(200).send(String(devicelocation));
                }
                else{
                    console.log("FIND post error.");
                    console.log(error);
                    console.log(body);
                    res.status(200).send("");
                }
            }
        );
    }
    else{
        console.log("Empty post...");
        res.status(200).send("Please enclose a valid device id and wifi fingerprint.");
    }
});

module.exports = router;
