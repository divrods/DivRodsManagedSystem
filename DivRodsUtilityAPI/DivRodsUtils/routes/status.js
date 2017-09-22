var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//render a page with some vitals, list device sessions
router.get('/overview', function(req, res, next) {
    var session_report = req.app.get('_DeviceSessions')._overview(true);
    res.render('status', { title: 'Session Overview', sessions: session_report, message: "Current Sessions (Active and Inactive):" })
    //TODO: serve list of closed galleries and open ones
});

router.get('/json', function(req,res,next){
    var session_report = req.app.get('_DeviceSessions')._overview(false);
    res.status(200).send(JSON.stringify(session_report));
});

router.get('/history', function(req,res,next){
    var session_history = req.app.get('_DeviceSessions')._history();
    res.status(200).send(JSON.stringify(session_history));
});

module.exports = router;
