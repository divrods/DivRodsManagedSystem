var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var async = require('async'), fs = require('fs'), request = require('request');

//Just passing a request through to the tracking API and responding with a small packet
router.post('/', function(req, res, next) {
    if(req.body && req.query.deviceid){
        //console.log(req.body.toString());
        var idiot = ",\"wifi-fingerprint\":[";
        //turning the wifi fingerprint into a string literal
        req.body["wifi-fingerprint"].forEach(function(_ap){
            idiot += "{";
            idiot += "\"mac\":\"";
            idiot += _ap["mac"].toUpperCase();
            idiot += "\",";
            idiot += "\"rssi\": ";
            idiot += Math.floor(_ap["rssi"]);
            idiot += "},";
        });
        idiot = idiot.slice(0, -1);
        idiot += "]}";
        delete req.body["time"];
        delete req.body["wifi-fingerprint"];
        //req.body["wifi-fingerprint"] = idiot;
        var jstr = JSON.stringify(req.body);
        jstr = jstr.slice(0, -1);
        jstr = jstr + idiot;
        //TODO cut the stringified object off at wifi-fingerprint and put our string literal on there
        console.log(jstr);
        var options = {
            url: "http://ec2-54-209-226-130.compute-1.amazonaws.com:18003/track",
            headers: {
                "content-type":"application/json",
                "accept":"application/json",
            }
        };
        request.post(
            options,
            jstr,
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
