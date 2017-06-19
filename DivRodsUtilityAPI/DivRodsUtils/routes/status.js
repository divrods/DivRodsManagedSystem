var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//render a page with some vitals, list device sessions
router.get('/overview', function(req, res, next) {
    var session_report = req.app.get('_DeviceSessions')._overview();
    res.render('status', { title: 'Session Overview', sessions: session_report, message: "Current Sessions (Active and Inactive):" })
});

module.exports = router;
