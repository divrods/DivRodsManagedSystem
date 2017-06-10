var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs'), request = require('request');

//Just passing a request through to the tracking API and responding with a small packet
router.post('/', function(req, res, next) {
    if(req.query.deviceid){
        req.app.get('_DeviceSessions')._add_preference(
            req.query.deviceid, 
            req.query.artid,
            req.query.pref
            );
        //TODO: use the global filter to locate which gallery the scanned piece is in, and send it back to the device.
        //Could be really helpful if a device is having trouble locating itself and the user
        //scans a piece.
        //res.status(200).send(devicelocation);
    }
    //TODO hit the preference engine
});

module.exports = router;
