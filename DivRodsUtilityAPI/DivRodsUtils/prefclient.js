var request = require('request');
var moment = require('moment');

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
                var jsonresp = response.body;
                cb(JSON.parse(jsonresp));
            }else{
                console.log("Failure " + response.json);
                cb("Problem!");
            }
        }
    )
}

module.exports.refresh_ruleset = refresh_ruleset;
module.exports.record_preference = record_preference;