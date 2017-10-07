var request = require('request');
var black_list = [];
//The weights here represent the relative difficulty FIND has locating devices in a given gallery.
var map = {
    "2":{
        "active":{},
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
        "261":{"loc": [1001,647], "edges":{"260":1, "262":1, "255":1, "247":1}},
        "262":{"loc": [854,634], "edges":{"261":1, "263":1, "275":1}},
        "263":{"loc": [732,691], "edges":{"262":1, "264":1}},
        "264":{"loc": [624,691], "edges":{"265":1, "263":1}},
        "265":{"loc": [508,691], "edges":{"264":1}},
        "275":{"loc": [792,508], "edges":{"280":1, "278":1, "262":1, "276": 1, "275b":1}},
        "275b":{"loc": [799,419], "edges":{ "275":1, "276":1}},
        "276":{"loc": [766,339], "edges":{"275b":1, "275": 1, "280":1}},
        "277":{"loc": [518,373], "edges":{"280":1, "278":1}},
        "278":{"loc": [434,341], "edges":{"277":1}},
        "280":{"loc": [623,503], "edges":{"264":1, "275":1, "277":1}}
    },
    "3":{
        "active":{},
        "300":{"loc": [1306,1901], "edges":{"301":1, "308":1,"307":1}},
        "301":{"loc": [1383,2021], "edges":{"300":1, "304":1}},
        "304":{"loc": [1008,2020], "edges":{"301":1, "305":1}},
        "305":{"loc": [938,1864], "edges":{"306":1, "321":1}},
        "306":{"loc": [1068,1791], "edges":{"305":1, "307":1}},
        "307":{"loc": [1217,1790], "edges":{"300":1, "306":1, "316":4,"308":1}},
        "308":{"loc": [1371,1786], "edges":{"307":1, "310":1, "309":1, "300":1}},
        "309":{"loc": [1493,1790], "edges":{"311":1, "308":1}},
        "310":{"loc": [1392,1566], "edges":{"312":1, "314":1, "308":1, "330":1}},
        "311":{"loc": [1491,1678], "edges":{"309":1, "312":1}},
        "312":{"loc": [1489,1568], "edges":{"313":1, "311":1,"310":1}},
        "313":{"loc": [1494,1451], "edges":{"330":1, "312":1}},
        "314":{"loc": [1264,1508], "edges":{"310":1, "315":1, "332":4}},
        "315":{"loc": [1263,1607], "edges":{"314":1, "316":1, "321":4}},
        "316":{"loc": [1271,1696], "edges":{"315":1, "321":4}},
        "318":{"loc": [1077,1536], "edges":{"321":1, "314":1}},
        "321":{"loc": [949,1645], "edges":{"305":1, "322":1, "315":1}},
        "322":{"loc": [993,1517], "edges":{"323":1, "321":1}},
        "323":{"loc": [906,1511], "edges":{"322":1, "333":1, "321":1}},
        "325":{"loc": [1253,1377], "edges":{"332":1}},
        "326":{"loc": [1128,1370], "edges":{"332":3, "327":1}},
        "327":{"loc": [1024,1367], "edges":{"326":1}},
        "328":{"loc": [929,1368], "edges":{"333":1}},
        "330":{"loc": [1463,1269], "edges":{"313":1, "341":1,"340":1,"310":1,"313":1}},
        "331":{"loc": [1266,1162], "edges":{"340":1, "350":1}},
        "332":{"loc": [1150,1268], "edges":{"333":3, "351":3, "326":1}},
        "333":{"loc": [1024,1270], "edges":{"332":3,"336":1,"337":1,"328":1}},
        "336":{"loc": [1033,1170], "edges":{"333":1, "337":1}},
        "337":{"loc": [922,1170], "edges":{"336":1, "333":1}},
        "340":{"loc": [1412,984], "edges":{"330":1, "331":1, "350":1, "362":1, "341":1, "342":1, "343":1}}, //TODO resolve this gallery
        "341":{"loc": [1491,1086], "edges":{"330":1, "340":1, "342":1}},
        "342":{"loc": [1491,975], "edges":{"340":1, "341":1, "343":1}},
        "343":{"loc": [1491,869], "edges":{"342":1, "340":1}},
        "350":{"loc": [1270,975], "edges":{"351":4, "361":1, "331":1}},
        "351":{"loc": [1097,952], "edges":{"351":4, "355":1, "332":1}},
        "355":{"loc": [995,945], "edges":{"351":1, "357":1, "359":1}},
        "357":{"loc": [905,994], "edges":{"333":1, "355":1}},
        "359":{"loc": [1009,753], "edges":{"360":1, "367":1, "355":1}},
        "360":{"loc": [1138,748], "edges":{"359":1, "361":1, "351":2}},
        "361":{"loc": [1276,743], "edges":{"360":1, "362":1, "350":1}},
        "362":{"loc": [1416,750], "edges":{"340":1, "363":1, "361":1}},
        "363":{"loc": [1409,634], "edges":{"362":1, "364":1, "369":1}},
        "364":{"loc": [1272,634], "edges":{"363":1, "365":1}},
        "365":{"loc": [1128,634], "edges":{"367":1, "364":1}},
        "367":{"loc": [970,634], "edges":{"359":1, "365":1, "371":1, "368":1}},
        "368":{"loc": [852,627], "edges":{"379":1, "367":1}},
        "369":{"loc": [1402,522], "edges":{"370":1, "363":1, "373":1}},
        "370":{"loc": [1278,520], "edges":{"369":1, "374":1}},
        "371":{"loc": [1080,521], "edges":{"375":1, "377":1, "367":1}},
        "373":{"loc": [1414,374], "edges":{"374":1, "369":1}},
        "374":{"loc": [1303,374], "edges":{"370":1, "373":1, "375":1}},
        "375":{"loc": [1189,374], "edges":{"371":1, "376":1, "374":1}},
        "376":{"loc": [1078,374], "edges":{"375":1, "377":1}},
        "377":{"loc": [962,371], "edges":{"371":1, "376":1, "378":1}},
        "378":{"loc": [749,324], "edges":{"377":1, "379":1, "380":1}},
        "379":{"loc": [779,448], "edges":{"378":1, "380":1, "368":1}},
        "380":{"loc": [665,451], "edges":{"378":1, "379":1}},
        "wrap":{
            "334":"333",
            "352":"351",
            "353":"351",
            "323":"322"
        }
    }
};

var idtags = [
    {
        "color": "red",
        "artid": "4441"
    },
    {
        "color": "orange",
        "artid": "5995"
    },
    {
        "color": "green",
        "artid": "62770"
    },
    {
        "color": "blue",
        "artid": "19689"
    },
    {
        "color": "purple",
        "artid": "5694"
    },
    {
        "color": "red",
        "artid": "1862"
    },
    {
        "color": "orange",
        "artid": "4196"
    },
    {
        "color": "green",
        "artid": "108705"
    },
    {
        "color": "blue",
        "artid": "3321"
    },
    {
        "color": "purple",
        "artid": "5102"
    },
    {
        "color": "red",
        "artid": "263"
    },
    {
        "color": "orange",
        "artid": "83269"
    },
    {
        "color": "green",
        "artid": "106831"
    },
    {
        "color": "blue",
        "artid": "5683"
    },
    {
        "color": "purple",
        "artid": "47"
    },
    {
        "color": "red",
        "artid": "2900"
    },
    {
        "color": "orange",
        "artid": "303"
    },
    {
        "color": "green",
        "artid": "31427"
    },
    {
        "color": "blue",
        "artid": "1263"
    },
    {
        "color": "purple",
        "artid": "2490"
    },
    {
        "color": "red",
        "artid": "98954"
    },
    {
        "color": "orange",
        "artid": "118808"
    },
    {
        "color": "green",
        "artid": "2421"
    },
    {
        "color": "blue",
        "artid": "2505"
    },
    {
        "color": "red",
        "artid": "10593"
    },
    {
        "color": "orange",
        "artid": "1727"
    },
    {
        "color": "green",
        "artid": "4398"
    },
    {
        "color": "blue",
        "artid": "1227"
    },
    {
        "color": "purple",
        "artid": "2570"
    },
    {
        "color": "red",
        "artid": "1463"
    },
    {
        "color": "orange",
        "artid": "1629"
    },
    {
        "color": "green",
        "artid": "99368"
    },
    {
        "color": "blue",
        "artid": "10451"
    },
    {
        "color": "purple",
        "artid": "1402"
    },
    {
        "color": "red",
        "artid": "1665"
    },
    {
        "color": "orange",
        "artid": "8776"
    },
    {
        "color": "green",
        "artid": "2245"
    },
    {
        "color": "blue",
        "artid": "1487"
    },
    {
        "color": "purple",
        "artid": "1494"
    },
    {
        "color": "red",
        "artid": "3057"
    },
    {
        "color": "orange",
        "artid": "521"
    },
    {
        "color": "green",
        "artid": "1375"
    },
    {
        "color": "blue",
        "artid": "9688"
    },
    {
        "color": "purple",
        "artid": "518"
    },
    {
        "color": "red",
        "artid": "3217"
    },
    {
        "color": "orange",
        "artid": "2507"
    },
    {
        "color": "green",
        "artid": "22277"
    },
    {
        "color": "blue",
        "artid": "90349"
    },
    {
        "color": "purple",
        "artid": "2730"
    },
    {
        "color": "red",
        "artid": "51935"
    },
    {
        "color": "green",
        "artid": "49879"
    },
    {
        "color": "blue",
        "artid": "43605"
    },
    {
        "color": "purple",
        "artid": "52346"
    },
    {
        "color": "red",
        "artid": "109138"
    },
    {
        "color": "orange",
        "artid": "47086"
    },
    {
        "color": "green",
        "artid": "113261"
    },
    {
        "color": "blue",
        "artid": "59510"
    },
    {
        "color": "red",
        "artid": "53"
    },
    {
        "color": "orange",
        "artid": "1226"
    },
    {
        "color": "green",
        "artid": "1978"
    },
    {
        "color": "blue",
        "artid": "6239"
    },
    {
        "color": "purple",
        "artid": "109318"
    },
    {
        "color": "red",
        "artid": "98269"
    },
    {
        "color": "orange",
        "artid": "593"
    },
    {
        "color": "green",
        "artid": "689"
    },
    {
        "color": "blue",
        "artid": "98274"
    },
    {
        "color": "purple",
        "artid": "1565"
    },
    {
        "color": "red",
        "artid": "44"
    },
    {
        "color": "orange",
        "artid": "452"
    },
    {
        "color": "green",
        "artid": "45"
    },
    {
        "color": "blue",
        "artid": "4763"
    },
    {
        "color": "red",
        "artid": "6228"
    },
    {
        "color": "orange",
        "artid": "420"
    },
    {
        "color": "green",
        "artid": "96502"
    },
    {
        "color": "blue",
        "artid": "427"
    },
    {
        "color": "purple",
        "artid": "1217"
    },
    {
        "color": "red",
        "artid": "63571"
    },
    {
        "color": "orange",
        "artid": "4817"
    },
    {
        "color": "green",
        "artid": "2614"
    },
    {
        "color": "blue",
        "artid": "4248"
    },
    {
        "color": "purple",
        "artid": "82237"
    },
    {
        "color": "red",
        "artid": "123223"
    },
    {
        "color": "orange",
        "artid": "613"
    },
    {
        "color": "green",
        "artid": "113688"
    },
    {
        "color": "blue",
        "artid": "106354"
    },
    {
        "color": "purple",
        "artid": "136"
    },
    {
        "color": "red",
        "artid": "1520"
    },
    {
        "color": "orange",
        "artid": "98750"
    },
    {
        "color": "green",
        "artid": "109118"
    },
    {
        "color": "blue",
        "artid": "120729"
    },
    {
        "color": "purple",
        "artid": "111675"
    },
    {
        "color": "red",
        "artid": "1509"
    },
    {
        "color": "orange",
        "artid": "2806"
    },
    {
        "color": "green",
        "artid": "10444"
    },
    {
        "color": "blue",
        "artid": "1417"
    },
    {
        "color": "purple",
        "artid": "774"
    },
    {
        "color": "red",
        "artid": "802"
    },
    {
        "color": "orange",
        "artid": "1689"
    },
    {
        "color": "green",
        "artid": "11956"
    },
    {
        "color": "blue",
        "artid": "1655"
    },
    {
        "color": "purple",
        "artid": "10436"
    },
    {
        "color": "red",
        "artid": "1738"
    },
    {
        "color": "orange",
        "artid": "10361"
    },
    {
        "color": "green",
        "artid": "80860"
    },
    {
        "color": "blue",
        "artid": "2035"
    },
    {
        "color": "purple",
        "artid": "2276"
    },
    {
        "color": "red",
        "artid": "1633"
    },
    {
        "color": "orange",
        "artid": "1503"
    },
    {
        "color": "green",
        "artid": "103800"
    },
    {
        "color": "blue",
        "artid": "1277"
    },
    {
        "color": "purple",
        "artid": "106095"
    },
    {
        "color": "red",
        "artid": "13190"
    },
    {
        "color": "orange",
        "artid": "100463"
    },
    {
        "color": "blue",
        "artid": "31101"
    },
    {
        "color": "purple",
        "artid": "30758"
    },
    {
        "color": "red",
        "artid": "7565"
    },
    {
        "color": "orange",
        "artid": "125771"
    },
    {
        "color": "blue",
        "artid": "20962"
    },
    {
        "color": "purple",
        "artid": "27228"
    },
    {
        "color": "red",
        "artid": "1429"
    },
    {
        "color": "orange",
        "artid": "1411"
    },
    {
        "color": "green",
        "artid": "1639"
    },
    {
        "color": "blue",
        "artid": "1800"
    },
    {
        "color": "purple",
        "artid": "1356"
    },
    {
        "color": "red",
        "artid": "95926"
    },
    {
        "color": "orange",
        "artid": "1857"
    },
    {
        "color": "green",
        "artid": "27402"
    },
    {
        "color": "blue",
        "artid": "125888"
    },
    {
        "color": "purple",
        "artid": "89597"
    },
    {
        "color": "red",
        "artid": "1721"
    },
    {
        "color": "orange",
        "artid": "108666"
    },
    {
        "color": "green",
        "artid": "115752"
    },
    {
        "color": "blue",
        "artid": "12776"
    },
    {
        "color": "purple",
        "artid": "111576"
    },
    {
        "color": "red",
        "artid": "1244"
    },
    {
        "color": "orange",
        "artid": "1354"
    },
    {
        "color": "green",
        "artid": "1515"
    },
    {
        "color": "blue",
        "artid": "1330"
    },
    {
        "color": "purple",
        "artid": "98513"
    },
    {
        "color": "red",
        "artid": "1355"
    },
    {
        "color": "orange",
        "artid": "1555"
    },
    {
        "color": "green",
        "artid": "1670"
    },
    {
        "color": "blue",
        "artid": "5033"
    },
    {
        "color": "purple",
        "artid": "2241"
    },
    {
        "color": "red",
        "artid": "10219"
    },
    {
        "color": "orange",
        "artid": "1274"
    },
    {
        "color": "green",
        "artid": "1325"
    },
    {
        "color": "blue",
        "artid": "1887"
    },
    {
        "color": "purple",
        "artid": "1427"
    },
    {
        "color": "red",
        "artid": "116294"
    },
    {
        "color": "orange",
        "artid": "40979"
    },
    {
        "color": "green",
        "artid": "119495"
    },
    {
        "color": "blue",
        "artid": "33040"
    },
    {
        "color": "purple",
        "artid": "114549"
    }
]

var onboardingtags = {
    "99999999":{"setupcode":1},
    "99999998":{"setupcode":2},
    "99999997":{"setupcode":3}
}

function get_shortest_path(start, end, weighted_graph){
    //Calculate the shortest path for a directed weighted graph.
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
            "coords": map["3"]["active"][path[i]]["loc"]
        };
        _allsteps.unshift(_step);
    }
    _map["journey"] = _allsteps;
    _map["steps"] = path.length;
    return _map;
}

///"6.g255:100,100."
///Low-bandwidth option for devices with bad JSON implementations
function _compress_path(path_obj){
    var out = path_obj["steps"] + "~";
    for(var i=0; i< path_obj["journey"].length; i++){
        out = out + path_obj["journey"][i]["room"] + ":" + path_obj["journey"][i]["coords"][0] + "," + path_obj["journey"][i]["coords"][1] + "~";
    }
    return out;
}

//pull list of mapped locations from FIND and match them to nodes/edges.
//cull any nodes in the base map that haven't been mapped using FIND.
//also pull any edges involving that culled node.
function _prune_map(floor, cb){
    pruned = {};
    if(floor == undefined | !floor){
        floor = "3";
    }
    request.get(
        "http://ec2-52-205-211-230.compute-1.amazonaws.com:18003/locations?group=mia" + floor + "f",
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //loop through mapped galleries, seeing if we have an entry for them
                var _resp = JSON.parse(response.body);
                _resp.locations.forEach(function(element) {
                    _name = element.slice( 1 );
                    if(black_list.indexOf(_name) != -1){
                        return;
                    }
                    corresponding = map[floor][_name];
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
                map[floor]["active"] = pruned;
                cb(null);
            }else{cb(error);}
        }
    );
}

function _groom_maps(data, cb){
    for(var floor in Object.keys(data)){
        var _floor = Object.keys(data)[floor];
        for(var node in Object.keys(data[_floor])){
            if(node == "active") continue;
            node = Object.keys(data[_floor])[node]; //lel
            for(var edge in data[_floor][node]["edges"]){
                var connected = data[_floor][edge];
                if(connected["edges"] && !connected["edges"].hasOwnProperty(node)){
                    connected["edges"][node] = 1;
                    console.log("Repaired a broken link between node " + node + " and " + edge);
                }
            }
        }
    }
    cb();
}

function _start(top_cb){
    _groom_maps(map, function(cb){
        _prune_map("3", function(error){
            if(!error){
                console.log(JSON.stringify(map["3"]["active"]));
                top_cb(); //yuck
            }else{
                console.log('error');
            }
        });
    });
}

module.exports.onboardingtags = onboardingtags;
module.exports.idtags = idtags;
module.exports.map = map;
    module.exports.get_shortest_path = get_shortest_path;
    module.exports._prune_map = _prune_map;
    module.exports._groom_maps = _groom_maps;
    module.exports._start = _start;
module.exports.black_list = black_list;