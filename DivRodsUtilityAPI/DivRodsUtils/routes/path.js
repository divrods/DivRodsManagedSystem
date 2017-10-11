var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs'), _ = require('underscore'), winston = require('winston'), request = require('request');
var museum = require('../museum.js');

//GET shortest path between two galleries
router.get('/', function(req, res, next) {
    _start = req.query.start;
    _end = req.query.end;
    if(req.query.deviceid && _start && _end){
        _path = museum.get_shortest_path(_start, _end, museum.map["3"]["active"]);
        if(_path){
            payload = JSON.stringify(_path);
            if(req.query.deviceid){
                req.app.get('_DeviceSessions')._update_path(req.query.deviceid, _path);
            }
            res.status(200).send(payload);
        }
        else{
            res.status(200).send("0");
        }
    }
    else{
        res.status(404).send("Please enclose a valid start and end point, and/or a valid device id.");
    }
});

router.get('/prune', function(req, res, next){
    _flr = "3";
    if(req.query.floor){
        _flr = req.query.floor;
    }
    museum._prune_map(_flr, function(error){
        if(!error){
            res.status(200).send(museum.map[_flr]["active"]);
        }
        else res.status(404).send(error);
    });
});

//Close a gallery- noticed a gallery is closed for construction?
//Close it here. It updates the filter and triggers a prune.
router.get('/close', function(req,res,next){
    if(req.query.galleries){
        var gals = req.query.galleries.split(',');
        _ArtFilter._update_galleries(gals, false);
        var floors_affected = [];
        for(var gallery in gals){
            if(parseInt(gals[gallery]) > 299){
                if(floors_affected.indexOf("3") == -1){
                    floors_affected.push("3");
                }
            }
            if(parseInt(gals[gallery]) > 199 && parseInt(gals[gallery]) < 299){
                if(floors_affected.indexOf("2") == -1){
                    floors_affected.push("2");
                }
            }
            var index = black_list.indexOf(gals[gallery]);
            if(index == -1){
                black_list.push(gals[gallery]);
            }
        }
        //TODO clean this up so we get a full reply, even though functionality looks good.
        museum._prune_map("3", function(error){
            if(!error){
                console.log(black_list);
                var reply = {};
                for(x = 0; x < floors_affected.length; x++){
                    reply[floors_affected[x]] = museum.map[floors_affected[x]]["active"];
                }
                res.status(200).send("Closed galleries. New map:" + JSON.stringify(reply));
            }
            else res.status(404).send(error);
        });
    }else{
        res.status(200).send("Please enclose a valid CSL of galleries.");
    }
});

//Close a gallery- noticed a gallery is closed for construction?
//Close it here. It updates the filter and triggers a prune.
router.get('/open', function(req,res,next){
    if(req.query.galleries){
        var gals = req.query.galleries.split(',');
        _ArtFilter._update_galleries(gals, true);
        for(var gallery in gals){
            var index = black_list.indexOf(gals[gallery]);
            if(index != -1){
                black_list.splice(index, 1);
            }
        }
        museum._prune_map("3", function(error){
            if(!error){
                console.log(black_list);
                res.status(200).send("Opened galleries. New map:" + JSON.stringify(museum.map["3"]["active"]));
            }
            else res.status(404).send(error);
        });
    }else{
        res.status(200).send("Please enclose a valid CSL of galleries.");
    }
});

    router.get('/open/all', function(req,res,next){
        black_list = [];
        _ArtFilter._update_galleries(black_list, true);
        museum._prune_map(req.query.floor, function(error){
            if(!error){
                res.status(200).send("Cleared closed galleries. New map: " + JSON.stringify(museum.map[req.query.floor]["active"]));
            }
            else res.status(404).send(error);
        });
    });
    
module.exports = router;
