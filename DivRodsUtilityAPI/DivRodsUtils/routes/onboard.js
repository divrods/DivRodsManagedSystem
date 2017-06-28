var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');
current_device = {"Name":"","ID":""};

//GET push an assembled onboarding config to the queued device
//The kiosk app hits this URL when onboarding is done. Querystring is a list of configured props.
router.get('/', function(req, res, next) {
    if(current_device.ID != ""){
        var settings = "Config Received! Distance:";
        settings += req.query.distance;
        settings += ", ArtPref";
        settings += req.query.artpref;
        var pcall = {
            "func":"do_onboard",
            "arg":settings,
            "pass":[200,"Device received config string."],
            "fail":[422,"There's a problem with this DivRod! Pick another one."]
        }
        callParticle(pcall, res);
    }
});

//PUT a device ID in position for onboarding.
//The divrod scans the onboarding RFID and hits this URL with its ID.
//We use the particle cloud to configure the device for the time period it
//sits in the cradle getting configured.
router.put('/', function(req,res,next){
    current_device.Name = req.query.devicename;
    current_device.ID = req.query.deviceid;
    //call signal_onboard in the firmware to give the user visual feedback.
    //TODO: we don't really care if this particle call comes back, though. The feedback isn't critical.
    //Why wait on it to send a response?
    var pcall = {
            "func":"show_onboard",
            "arg":"Show",
            "pass":[201,"This device queued for onboarding."],
            "fail":[422,"There's a problem with this DivRod! Pick another one."]
        }
    callParticle(pcall, res);
    //could just call with a null res and move on
});

//DELETE manually dequeue a device if there's an issue
//The kiosk app can call this.
router.delete('/', function(req,res,next){
    wipe();
    res.status(204).send("No devices currently queued.");
});

function wipe(){
    console.log("Wiping device slot...")
    current_device = {"Name":"","ID":""};
}

function callParticle(_pcallobj, _res){
    var fnPr = particle.callFunction({ deviceId: current_device.ID, name: _pcallobj.func, argument: _pcallobj.arg, auth: _ParticleToken });
        fnPr.then(
            function (data) {
                console.log('Function called succesfully: ', data.body.return_value);
                if(_res) _res.status(_pcallobj.pass[0]).send(_pcallobj.pass[1]);
            }, function (err) {
                console.log('An error occurred:', err);
                if(_res) _res.status(_pcallobj.fail[0]).send(_pcallobj.fail[1]);
            });
}

module.exports = router;
