var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//render a page with some vitals, list device sessions
router.get('/', function(req, res, next) {
    res.render('status', { title: 'Hey', message: 'Hello there!' })
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

module.exports = router;
