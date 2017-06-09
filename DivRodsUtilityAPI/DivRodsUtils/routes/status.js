var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//render a page with some vitals, list device sessions
router.get('/', function(req, res, next) {
    var session_report = req.app.get('_DeviceSessions')._overview();
    res.render('status', { title: 'Session Overview', sessions: session_report, message: "Current Sessions (Active and Inactive):" })
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

module.exports = router;
