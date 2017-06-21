var express = require('express');
var router = express.Router();
var async = require('async'), fs = require('fs'), _ = require('underscore'), winston = require('winston'), request = require('request'), nconf = require('nconf');

black_list = [];
base_map = {
    "205":{"loc": [1013,1803], "edges":{"220":1, "206":1}},
    "206":{"loc": [1140,1812], "edges":{"205":1, "217":1}},
    "214":{"loc": [1284,1395], "edges":{"235":1, "215":1}},
    "215":{"loc": [1288,1530], "edges":{"214":1, "216":1}},
    "216":{"loc": [1278,1636], "edges":{"215":1}},
    "217":{"loc": [1217,1710], "edges":{"206":1}},
    "219":{"loc": [1009,1509], "edges":{"223":1, "222":1, "220":1}},
    "220":{"loc": [1010,1677], "edges":{"219":1, "222":1, "221":1}},
    "221":{"loc": [918,1683], "edges":{"222":1, "220":1}},
    "222":{"loc": [920,1603], "edges":{"223":1, "219":1, "220":1, "221":1}},
    "223":{"loc": [925,1503], "edges":{"224":1, "219":1, "222":1}},
    "224":{"loc": [937,1413], "edges":{"229":1, "223":1}},
    "225":{"loc": [1047,1413], "edges":{"226":1, "224":1}},
    "226":{"loc": [1162,1413], "edges":{"227":1, "225":1}},
    "227":{"loc": [1172,1286], "edges":{"237":1, "226":1}},
    "229":{"loc": [881,1284], "edges":{"239":1, "224":1}},
    "235":{"loc": [1286,1283], "edges":{"214":1, "227":1, "236":1}},
    "236":{"loc": [1280,1170], "edges":{"250":1, "235":1}},
    "237":{"loc": [1121,1154], "edges":{"251":1, "250":1, "227":1}},
    "238":{"loc": [1034,1154], "edges":{"237":1, "239":1}},
    "239":{"loc": [931,1154], "edges":{"253":1, "229":9, "236":1}},
    "247":{"loc": [984,762], "edges":{"261":1, "255":1}},
    "250":{"loc": [1265,1009], "edges":{"254":1, "236":1}},
    "251":{"loc": [1108,1054], "edges":{"252":1, "237":1}},
    "252":{"loc": [1021,1054], "edges":{"251":1, "253":1, "255":1}},
    "253":{"loc": [918,1049], "edges":{"252":1, "239":1}},
    "254":{"loc": [1121,910], "edges":{"250":1, "255":1}},
    "255":{"loc": [1008,904], "edges":{"247":1, "252":1, "256":1, "254":1, "261":1}},
    "256":{"loc": [919,934], "edges":{"255":1}},
    "259":{"loc": [1301,643], "edges":{"260":1}},
    "260":{"loc": [1152,643], "edges":{"259":1, "261":1}},
    "261":{"loc": [1001,647], "edges":{"260":1, "262":1, "247":1}},
    "262":{"loc": [854,634], "edges":{"261":1, "263":1, "275":1}},
    "263":{"loc": [732,691], "edges":{"262":1, "264":1}},
    "264":{"loc": [624,691], "edges":{"265":1, "263":1}},
    "265":{"loc": [508,691], "edges":{"264":1}},
    "275":{"loc": [792,508], "edges":{"280":1, "278":1, "262":1, "276": 1, "275b":1}},
    "275b":{"loc": [799,419], "edges":{ "275":1, "276":1}},
    "276":{"loc": [766,339], "edges":{"275b":1, "275": 1, "280":1}},
    "277":{"loc": [518,373], "edges":{"280":1, "278":1}},
    "278":{"loc": [434,341], "edges":{"277":1}},
    "280":{"loc": [623,503], "edges":{"264":1, "275":1, "277":1}},
    "998":{"loc": [200,200], "edges":{"277":1, "999":1}}, //spoofed location at my apartment
    "999":{"loc": [200,200], "edges":{"250":1, "998":1}} //spoofed location at my studio
};

active_map = {};

_prune_map(function(error){
    if(!error){
        winston.log('info', JSON.stringify(active_map));
    }else{
        winston.log('error', error);
    }
});

//"6.g255:100,100."
function _compress_path(path_obj){
    var out = path_obj["steps"] + "~";
    for(var i=0; i< path_obj["journey"].length; i++){
        out = out + path_obj["journey"][i]["room"] + ":" + path_obj["journey"][i]["coords"][0] + "," + path_obj["journey"][i]["coords"][1] + "~";
    }
    return out;
}

//GET shortest path between two galleries
router.get('/', function(req, res, next) {
    _start = req.query.start;
    _end = req.query.end;
    if(req.query.deviceid && _start && _end){
        _path = get_shortest_path(_start, _end, base_map);
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

    //If a device experiences an outage during a user's visit, this is one recovery step.
    //Assuming the device went down without completing the session, it would need to retrieve the latest path
    //and get back on track.
    else if(!_start & !_end & req.query.deviceid){
        payload = _.findWhere(req.app.get('_DeviceSessions').Sessions, {DeviceID: req.query.deviceid})
        if(payload){
            res.status(200).send(JSON.stringify(payload.CurrentPath));
        }
        else{
            var logstring = 'Device with id ' + req.query.deviceid + ' made a default path retrieval attempt but no session was present.';
            winston.log('info', logstring);
            _path = get_shortest_path("254", "275", base_map);
            res.status(200).send(JSON.stringify(_path));
        }
    }
    else{
        res.status(404).send("Please enclose a valid start and end point, and/or a valid device id.");
    }
});

router.get('/prune', function(req, res, next){
    _prune_map(function(error){
        if(!error){
            res.status(200).send(active_map);
        }
        else res.status(404).send(error);
    });
});

//Close a gallery- noticed a gallery is closed for construction?
//Close it here. It updates the filter and triggers a prune.
router.get('/close', function(req,res,next){
    if(req.query.galleries){
        var gals = req.query.galleries.split(',');
        for(var gallery in gals){
            var index = black_list.indexOf(gals[gallery]);
            if(index == -1){
                black_list.push(gals[gallery]);
            }
        }
        _prune_map(function(error){
            if(!error){
                console.log(black_list);
                res.status(200).send("Closed galleries. New map:" + JSON.stringify(active_map));
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
        for(var gallery in gals){
            var index = black_list.indexOf(gals[gallery]);
            if(index != -1){
                black_list.splice(index, 1);
            }
        }
        _prune_map(function(error){
            if(!error){
                console.log(black_list);
                res.status(200).send("Opened galleries. New map:" + JSON.stringify(active_map));
            }
            else res.status(404).send(error);
        });
    }else{
        res.status(200).send("Please enclose a valid CSL of galleries.");
    }
});

    router.get('/open/all', function(req,res,next){
        black_list = [];
        _prune_map(function(error){
            if(!error){
                res.status(200).send("Cleared closed galleries. New map: " + JSON.stringify(active_map));
            }
            else res.status(404).send(error);
        });
    });

function get_shortest_path(start, end, weighted_graph){
    //Calculate the shortest path for a directed weighted graph.

    // :param start: starting node
    // :param end: ending node
    // :param weighted_graph: {"node1": {"node2": "weight", ...}, ...}
    // :return: ["START", ... nodes between ..., "END"] or None, if there is no path
    //We always need to visit the start
    nodes_to_visit = {};
    nodes_to_visit[start] = start;
    visited_nodes = {};
    //Distance from start to start is 0
    distance_from_start = {};
    distance_from_start[start] = 0
    tentative_parents = {};

    while(Object.keys(nodes_to_visit).length > 0){

        temp_dists = {};
        for(node in nodes_to_visit){
            if(distance_from_start[node] != undefined){
                temp_dists[node] = distance_from_start[node];
            }
        }
        min_dist = 0;
        current = {};
        for(temp_dist in temp_dists){
            if(min_dist == 0 | temp_dists[temp_dist] <= min_dist){
                current = temp_dist;
                min_dist = temp_dists[temp_dist];
            }
        }

        //The end was reached
        if(current == end)
          break;
        delete nodes_to_visit[current];
        visited_nodes[current] = current;
        edges = {};
        if(weighted_graph[current]){
            if(weighted_graph[current]["edges"]){
                edges = weighted_graph[current]["edges"];
            }
            else break;
        }
        else{
            break;
        }
        
        for(unvisited_edge in edges){
            if(!visited_nodes[unvisited_edge]){
                neighbor_distance = distance_from_start[current] + edges[unvisited_edge];
                _dist = 99;
                if(distance_from_start[unvisited_edge]){
                    _dist = distance_from_start[unvisited_edge];
                }
                if(neighbor_distance < _dist){
                    distance_from_start[unvisited_edge] = neighbor_distance;
                    tentative_parents[unvisited_edge] = current;
                    nodes_to_visit[unvisited_edge] = unvisited_edge;
                }
            }
        }
    }
    return _deconstruct_path(tentative_parents, end)
}

function _deconstruct_path(tentative_parents, end){
    if(!tentative_parents[end]){
        return null;
    }

    cursor = end;
    path = [];
    while(cursor){
        path.push(cursor);
        cursor = tentative_parents[cursor];
    }
    _map = {};
    _allsteps = [];
    
    for(i=0; i<path.length; i++){
        var _step = {
            "room": path[i],
            "coords": base_map[path[i]]["loc"]
        };
        _allsteps.unshift(_step);
    }
    _map["journey"] = _allsteps;
    _map["steps"] = path.length;
    return _map;
}

//pull list of mapped locations from FIND and match them to nodes/edges.
//cull any nodes in the base map that haven't been mapped using FIND.
//also pull any edges involving that culled node.
function _prune_map(cb){
    pruned = {};
    request.get(
            "http://ec2-54-209-226-130.compute-1.amazonaws.com:18003/locations?group=mia2f",
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //loop through mapped galleries, seeing if we have an entry for them
                    var _resp = JSON.parse(response.body);
                    _resp.locations.forEach(function(element) {
                        _name = element.slice( 1 );
                        if(black_list.indexOf(_name) != -1){
                            return;
                        }
                        corresponding = base_map[_name];
                        if(corresponding){
                            pruned[_name] = corresponding;
                        }
                    });
                    Object.keys(pruned).forEach(function(pruned_element){
                        //prune edges
                        var _this_element = pruned[pruned_element];
                        Object.keys(_this_element["edges"]).forEach(function(edge){   
                            if(!pruned[edge]){
                                delete _this_element["edges"][edge];
                            }
                        });
                        if(Object.keys(_this_element["edges"]).length == 0){
                            delete pruned[pruned_element];
                        }
                    });
                    active_map = pruned;
                    cb(null);
                }else{cb(error);}
            }
        );
}
    
module.exports = router;
