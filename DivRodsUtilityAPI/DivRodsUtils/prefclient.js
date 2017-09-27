var request = require('request');
var moment = require('moment');
var async = require('async');


function record_preference(session_id, art_id, pref, cb){
    var time = moment().utc().format();
    var payload = [{
        "item_id":art_id,
        "pref":pref,
        "user_id":session_id,
        "timestamp":time
    }];
    
    var prefauth = new Buffer(_PrefAuth).toString('base64');
    var options = {
        url: _PrefHost + "preferences",
        headers: {
            "Content-Type":"application/json",
            "accept":"application/json",
            "Authorization":"Basic " + prefauth
        },
        json: payload
    };
    //In this GET: get default ruleset from pref engine
    console.log(JSON.stringify(payload));
    request.post(
        options,
        function (error, response, body) {
            console.log(response);
            if (!error && response.statusCode == 200) {
                var jsonresp = response.body;
                console.log("Success... " + jsonresp);
                cb(jsonresp);
            }else{
                console.log("Failure " + response.json);
                cb("Problem!");
            }
        }
    );
}

function refresh_ruleset(cb){
    var time = moment().utc().format();
    //GET /api/rest/v1.0/recommendation
    //likely hundreds of ant-con sets
    var prefauth = new Buffer(_PrefAuth).toString('base64');
    var options = {
        url: _PrefHost + "recommendations",
        headers: {
            "Content-Type":"application/json",
            "accept":"application/json",
            "Authorization":"Basic " + prefauth
        }
    };
    request.get(
        options,
        function(error, response, body){
            //console.log(response);
            if (!error && response.statusCode == 200) {
                var jsonresp = JSON.parse(response.body);
                cb(jsonresp["results"]);
            }else{
                console.log("Failure " + response.json);
                cb("Problem!");
            }
        }
    )
}

function refresh_ruleset_all(top_callback) {
    var all_data = [];
    var _more = true;
    var _cursor = null;
    var _prefauth = new Buffer(_PrefAuth).toString('base64');
    var _headers = {
        "Content-Type":"application/json",
        "accept":"application/json",
        "Authorization":"Basic " + _prefauth
    }
    async.whilst(
        function(){return _more},
        function(cb){
            var _url = _PrefHost + "recommendations";
            if(_cursor){
                _url = _PrefHost + "recommendations?cursor=" + _cursor;
            }
            request.get(
                {   
                    url: _url,
                    headers: _headers
                },
                function(error, response, body){
                    //console.log(response);
                    if (!error && response.statusCode == 200) {
                        var jsonresp = JSON.parse(response.body);
                        all_data = all_data.concat(jsonresp["results"]);
                        if(jsonresp["more"] && jsonresp["cursor"]){
                            _cursor = jsonresp["cursor"];
                            _more = true; //for sure there are more rules and a way to index them
                        }else{
                            _cursor = null;
                            _more = false;
                        }
                        cb();
                    }else{
                        console.log("Failure " + response.json);
                        cb();
                    }
                }
            )
        },
        function(err){
            top_callback(all_data);
        }
    )
    
}

module.exports.refresh_ruleset = refresh_ruleset;
module.exports.refresh_ruleset_all = refresh_ruleset_all;
module.exports.record_preference = record_preference;