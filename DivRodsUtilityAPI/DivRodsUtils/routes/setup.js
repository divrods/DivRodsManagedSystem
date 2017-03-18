var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs');

//GET device config
router.get('/', function(req, res, next) {
    fs.readFile('../resources/drsetup.json', 'utf8', function (err,data) {
        if (err) {
            res.status(204).res.send("Config file is missing or corrupt. Consider PUTting a new one in place.");
            return console.log(err);
        }
        res.status(200).res.send(data);
    });
});

//Manual Override of config file
router.put('/', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

//Manual Override of specific config property
router.put('/prop', function(req,res,next){
    res.status(410).res.send("Not yet implemented.");
});

//Manual removal of node from config file, if there's a problematic gallery we need to skip forever?
router.delete('/', function(req,res,next){
    res.status(204).send("Config file removed. Reverting to backup.");
});

module.exports = router;
