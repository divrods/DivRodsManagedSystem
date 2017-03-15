var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//GET push an assembled onboarding config to the queued device
//The kiosk app hits this URL when onboarding is done
router.get('/', function(req, res, next) {
    var fnPr = particle.callFunction({ deviceId: d_id, name: 'int_fun', argument: 'wifi_rssi', auth: l_token });
    fnPr.then(
        function (data) {
            console.log('Function called succesfully: ', data.body.return_value);
            res.send("You're all set! Enjoy your DivRod.");
        }, function (err) {
            console.log('An error occurred:', err);
            res.send("There's a problem with this DivRod! Pick another one. :)");
        });
});

//PUT a device ID at the top of a queue.
//The divrod scans the onboarding RFID and hits this URL with its ID.
router.put('/', function(req,res,next){
    res.send("Not yet implemented.");
});

//DELETE manually dequeue a device if there's an issue
//The kiosk app can call this.
router.delete('/', function(req,res,next){
    res.send("Not yet implemented.");
});

module.exports = router;
