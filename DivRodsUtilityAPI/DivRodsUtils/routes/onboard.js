var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
current_device = {"Name":"","ID":""};
current_usersettings = "Distance:3,ArtPref:0";
//GET push an assembled onboarding config to the queued device
//The kiosk app hits this URL when onboarding is done
router.get('/', function(req, res, next) {
    if(current_device.ID != ""){
        var fnPr = particle.callFunction({ deviceId: current_device.ID, name: 'do_onboard', argument: current_usersettings, auth: p_token });
        fnPr.then(
            function (data) {
                console.log('Function called succesfully: ', data.body.return_value);
                wipe();
                res.send("You're all set! Enjoy your DivRod.");
            }, function (err) {
                console.log('An error occurred:', err);
                wipe();
                res.send("There's a problem with this DivRod! Pick another one. :)");
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
    res.send(resp);
    console.log(current_device);
});

//DELETE manually dequeue a device if there's an issue
//The kiosk app can call this.
router.delete('/', function(req,res,next){
    wipe();
    res.send("No devices currently queued.");
});

function wipe(){
    current_device = {"Name":"","ID":""};
    current_usersettings = "Distance:3,ArtPref:0";
}

module.exports = router;
