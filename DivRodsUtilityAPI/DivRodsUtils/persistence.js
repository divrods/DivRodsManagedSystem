const uuidV4 = require('uuid/v4');
var _ = require('underscore'), request = require('request'), ClientOAuth2 = require('client-oauth2'), winston = require('winston');
var CronJob = require('cron').CronJob, moment = require('moment'), prefclient = require('./prefclient.js');

var floortestdata = {
    "2": {
        "18424":{"color":"purple", "title":"Sandy", "room":"275", "artid":"18424"},
        "40428":{"color":"yellow", "title":"Table Lamp", "room":"275", "artid":"40428"},
        "180":{"color":"red", "title":"Rendezvous", "room":"259", "artid":"180"},
        "2175":{"color":"blue", "title":"Collage IX: Landscape", "room":"259", "artid":"2175"},
        "113158":{"color":"green", "title":"Sunflowers II", "room":"255", "artid":"113158"},
        "5890":{"color":"purple", "title":"Moccasins", "room":"255", "artid":"5890"},
        "1224":{"color":"yellow", "title":"Seated Girl", "room":"263", "artid":"1224"},
        "43576":{"color":"red", "title":"Sailor's Holiday", "room":"263", "artid":"43576"},
        "40975":{"color":"blue", "title":"Tesla Coil", "room":"264", "artid":"40975"},
        "3939":{"color":"green", "title":"Bricklayer, 1928", "room":"264", "artid":"3939"}
    },
    "3": {
        "116020":{"color":"purple", "title":"Portrait of Beethoven", "room":"351", "artid":"116020"},
        "1320":{"color":"yellow", "title":"Dancer Putting on Her Stocking", "room":"351", "artid":"1320"},
        "1509":{"color":"red", "title":"The Birthday Party", "room":"351", "artid":"1509"},
        "1240":{"color":"cyan", "title":"Dining Room in the Country", "room":"355", "artid":"1240"},
        "802":{"color":"green", "title":"Chestnut Trees at Jas de Bouffon", "room":"355", "artid":"802"},
        "118786":{"color":"purple", "title":"Winter Landscape", "room":"355", "artid":"118786"},
        "3267":{"color":"yellow", "title":"Still Life with Pheasants and Plovers", "room":"355", "artid":"3267"},
        "1272":{"color":"red", "title":"Port-en Bessin", "room":"355", "artid":"1272"},
        "1649":{"color":"cyan", "title":"Portrait of Clementine", "room":"357", "artid":"1649"},
        "2276":{"color":"green", "title":"The Algerian", "room":"357", "artid":"2276"},
        "10362":{"color":"purple", "title":"Seraglio, Constantinople", "room":"357", "artid":"10362"},
        "80860":{"color":"yellow", "title":"Battledore", "room":"357", "artid":"80860"},
        "2239":{"color":"red", "title":"On The Thames", "room":"357", "artid":"2239"},
        "420":{"color":"cyan", "title":"Mirror", "room":"368", "artid":"420"},
        "99318":{"color":"green", "title":"Side Chair", "room":"368", "artid":"99318"},
        "9668":{"color":"purple", "title":"Queen Anne Room", "room":"368", "artid":"9668"},
        "6228":{"color":"yellow", "title":"The Lost Pleiad", "room":"368", "artid":"6228"},
        "427":{"color":"red", "title":"Highboy", "room":"379", "artid":"427"}
    }
}
/**
 * A session object to keep track of devices. Handles auth, interactions with pref engine, and report generation.
 */
class DeviceSession {
    constructor(DeviceMAC, timestamp, floor = _DefaultFloor){
        this.DeviceID = DeviceMAC;
        this.SessionID = uuidV4();
        this.Opened = timestamp;
        this.LastTouched = timestamp;
        this.Closed = {}; //why?
        this.BaseRuleSet = {};
        this.RuleSet = {};
        this.PrefHistory = [];
        this.Location = "0";
        this.SetupCode = 1;
        this.CurrentPath = {};
        this.CurrentFloor = floor; //3
        this.CurrentPrefTarget = {};
        this.LocHistory = [];
        this.Enabled = true;
        this.Status = "Normal";

        var randomtag = Object.keys(floortestdata[floor])[Math.floor(Math.random() * Object.keys(floortestdata[floor]).length)];
        this.CurrentPrefTarget = floortestdata[floor][randomtag];
        //var prefauth = new Buffer(_PrefAuth).toString('base64');
        var thing = "";
        // var options = {
        //     url: _PrefHost + "recommendations",
        //     headers: {
        //         "Content-Type":"application/json",
        //         "accept":"application/json",
        //         "Authorization":"Basic " + prefauth
        //     },
        //     json: true
        // };
        //In this GET: get default ruleset from pref engine
        // request.get(
        //     options,
        //     function (error, response, body) {
        //         console.log("Send request to pref engine...");
        //         if (!error && response.statusCode == 200) {
        //             var jsonresp = response.body;
        //             var report = jsonresp.results[0]["ant"];
        //             console.log(report);
        //             console.log("Initialized device Session...");
        //         }else{
        //             console.log(body);
        //         }
        //     }
        // );
    }
    //submit a record of a session of usage
    _drop_report(){

    }
    _get_consequent(pref){
        //TODO based on a pref, look for a likely consequent in the latest association rules,
        //maybe triggering a refresh. Validate found consequents against tagged works list.
    }
    //submit a user's expressed preference about an artwork
    _submit_pref(pref, floor = "3"){
        pref["timestamp"] = moment.now();
        var correct = pref["artid"] == this.CurrentPrefTarget["artid"];
        pref["target"] = correct;
        if(correct){
            //we scanned the target. time to crank out a new objective for the user.
            var otherart = Object.keys(floortestdata[floor]).filter(function(artid){
                return artid != pref["artid"] && floortestdata[floor][artid]["room"] != floortestdata[floor][pref["artid"]]["room"];
            });
            var randomtag = otherart[Math.floor(Math.random() * otherart.length)];
            this.CurrentPrefTarget = floortestdata[floor][randomtag];   
        }
        //prefclient.record_preference(this.SessionID, pref["artid"], pref["pref"], function(data){
            //TODO: figure out another endpoint that gets us a consequent.
        //});
        this.PrefHistory.push(pref);
        return correct;
    }
    _validate(artid){
        //TODO get floor for artwork here
        if(floortestdata["3"][artid]) return true;
        else return false;
    }
    _setup(code){
        //TODO setup stuff. whatever we want. at first, we're controlling the walking radius.
        this.SetupCode = code;
    }
    _close(reason, timestamp){
        this.Enabled = false;
        this.Closed = {"reason":reason, "time": timestamp};
    }
};

class SessionDictionary {
    constructor(_exp){
        this.Expiration = _exp;
        this.Sessions = [];
        console.log("Initialized session dictionary...");
        var self = this;
        this.ruleset = {};
        this.rules = [];
        this._update_ruleset();
    }

    _check_and_clear_expirations(){
        var _now = Date.now();
        for(var session in this.Sessions){
            var _stale = Math.abs(_now - session.LastTouched.getTime());
            if(_stale > this.Expiration){
                session.Enabled = false;
            }
        }
        var clear = 0;
        var i = this.Sessions.length
        while (i--) {
            if(!this.Sessions[i].Enabled){
                this.Sessions.splice(i,1);
                clear++;
            }
        }
        var logstring = 'Session cron cleared ' + clear + ' dormant sessions.';
        console.log(logstring);
    }
    _touch(reqID, status = null){
        var found = _.find(this.Sessions, {DeviceID:reqID});
        if(found){
            if(status){
                found.Status = status;
            }
            found.LastTouched = Date.now();
        }
        else{
            var _time = Date.now();
            var _new = new DeviceSession(reqID, _time);
            this.Sessions.push(_new);
        }
        console.log("Touched: ");
        console.log(reqID);
    }
    _get(reqID){
        var found = _.find(this.Sessions, {DeviceID:reqID});
        if(found){
            return found;
        }
    }
    _overview(pretty){
        var out = [];
        this.Sessions.forEach(function(session){
            var sample = {
                "ID": session.SessionID,
                "Location": session.Location,
                "LocationHistory": session.LocHistory,
                "Awake": session.Enabled,
                "Started": new Date(session.Opened).toISOString(),
                "CurrentPath": pretty ? JSON.stringify(session.CurrentPath) : session.CurrentPath,
                "CurrentTarget": session.CurrentPrefTarget["artid"],
                "Status": session.Status,
                "ScannedTags": session.PrefHistory
            }
            out.push(sample);
        });
        return out;
    }
    _place(deviceid, location){
        var found = _.find(this.Sessions, {DeviceID:deviceid});
        if(found){
            var _now = Date.now();
            found.Location = location;
            if(found.LocHistory.length < 1){
                found.LocHistory.push({"loc":location, "time":_now});
            }
            else if(found.LocHistory[found.LocHistory.length-1]["loc"] != location){
                found.LocHistory.push({"loc":location, "time":_now});
            }
        }
    }
    _update_path(deviceid, path){
        var found = _.find(this.Sessions, {DeviceID:deviceid});
        if(found){
            found.CurrentPath = path;
        }
    }
    _update_ruleset(){
        var self = this; //uggghhh
        prefclient.refresh_ruleset(function(data){
            if(data){
                self.rules = [];
                for(var rule in data["results"]){
                    var _rule = data["results"][rule];
                    var entry = {
                        "ant":_rule["ant"][0], //see below
                        "con":_rule["con"][0], //just using the first one for now, TODO fork this here
                        "confidence":_rule["confidence"]
                    };
                    self.rules.push(entry);
                }
                console.log(self.rules);
            }
        });
    }
};

class PrefEngineWrapper{
    constructor(host){
        this.Host = host;
        console.log("Initializing preference engine wrapper...");
        this.pref_oauth = new ClientOAuth2({
            clientId: prefengid,
            clientSecret: prefengsecret,
            accessTokenUri: '',
            authorizationUri: '',
            redirectUri: '',
            scopes: []
        });
    }
    _turn_in_pref(cb){
        //send a single preference to get a set of consequents.
        request.get(
            this.Host,
            function (error, response, body) {
                cb();
            }
        );
    }
}

name_map={
    "AB":"",
    "Al":"",
    "AZ":"",
    "AR":"",
    "CA":"",
    "CO":"",
    "CN":"",
    "DE":"",
    "FL":"",
    "GA":"",
    "HI":"",
    "ID":"",
    "IL":"",
    "IN":"",
    "IA":"",
    "KS":"",
    "KY":"",
    "LA":"",
    "ME":"",
    "MD":"",
    "MA":"",
    "MI":"",
    "MN":"",
    "MS":"",
    "MO":"",
    "MT":"",
    "NE":"",
    "NV":"",
    "NH":"",
    "NJ":"",
    "NM":"",
    "NY":"",
    "NC":"",
    "ND":"",
    "OH":"",
    "OK":"",
    "OR":"",
    "PA":"",
    "RI":"",
    "SC":"",
    "SD":"",
    "TN":"",
    "TX":"",
    "UT":"",
    "VT":"",
    "VA":"",
    "WA":"",
    "WV":"",
    "WI":"",
    "WY":""
}

module.exports.NameMap = name_map;
module.exports.SessionDictionary = SessionDictionary;
module.exports.DeviceSession = DeviceSession;