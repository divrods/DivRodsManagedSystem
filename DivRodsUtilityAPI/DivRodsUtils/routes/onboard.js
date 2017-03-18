var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
current_device = {"Name":"","ID":""};

//GET push an assembled onboarding config to the queued device
//The kiosk app hits this URL when onboarding is done. Querystring is a list of configured props.
router.get('/', function(req, res, next) {
    if(current_device.ID != ""){
        var settings = "Distance:";
        settings += req.query.distance;
        settings += ",";
        settings += req.query.artpref;
        var fnPr = particle.callFunction({ deviceId: current_device.ID, name: 'do_onboard', argument: settings, auth: p_token });
        fnPr.then(
            function (data) {
                console.log('Function called succesfully: ', data.body.return_value);
                wipe();
                res.status(200).send("You're all set! Enjoy your DivRod.");
            }, function (err) {
                console.log('An error occurred:', err);
                wipe();
                res.status(422).send("There's a problem with this DivRod! Pick another one. :)");
            });
    }
});

//PUT a device ID at the top of a queue.
//The divrod scans the onboarding RFID and hits this URL with its ID.
router.put('/', function(req,res,next){
    current_device.Name = req.query.devicename;
    current_device.ID = req.query.deviceid;
    //TODO: call a function on the device with a simple command arg for user feedback.
    resp = req.query.devicename + " queued for onboarding!"
    console.log(current_device);
    res.status(200).send(resp);

});

//DELETE manually dequeue a device if there's an issue
//The kiosk app can call this.
router.delete('/', function(req,res,next){
    wipe();
    res.status(200).send("No devices currently queued.");
});

function wipe(){
    current_device = {"Name":"","ID":""};
}

module.exports = router;
