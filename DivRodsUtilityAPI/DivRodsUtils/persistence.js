const uuidV4 = require('uuid/v4');
var _ = require('underscore'), request = require('request'), ClientOAuth2 = require('client-oauth2'), winston = require('winston');
var CronJob = require('cron').CronJob, moment = require('moment');

var testdata2f = {
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
};
/**
 * A session object to keep track of devices. Handles auth, interactions with pref engine, and report generation.
 */
class DeviceSession {
    constructor(DeviceMAC, timestamp){
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
        this.InitialPrefTarget = testdata2f["180"];
        this.CurrentPrefTarget = testdata2f["180"];
        this.LocHistory = [];
        this.Enabled = true;
        this.Status = "Normal";

        var randomtag = Object.keys(testdata2f)[Math.floor(Math.random() * Object.keys(testdata2f).length)];
        this.InitialPrefTarget = testdata2f[randomtag];
        this.CurrentPrefTarget = testdata2f[randomtag];
        //var prefauth = new Buffer(_PrefAuth).toString('base64');
        
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
    _get_ruleset(){

    }
    _get_consequent(){
        //find gallery for consequent
        //queue gallery for sending to device
    }
    //submit a user's expressed preference about an artwork
    _submit_pref(pref){
        //log the preference no matter what
        pref["timestamp"] = moment.now();
        this.PrefHistory.push(pref);
        if(pref["artid"] == this.CurrentPrefTarget["artid"]){
            //we scanned the target. time to crank out a new objective for the user.
            var otherart = Object.keys(testdata2f).filter(function(artid){
                return artid != pref["artid"] && testdata2f[artid]["room"] != testdata2f[pref["artid"]]["room"];
            });
            var randomtag = otherart[Math.floor(Math.random() * otherart.length)];
            this.CurrentPrefTarget = testdata2f[randomtag];
            return true;
        } else {
            return false;
        }
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
    constructor(_exp, _freq){
        this.Expiration = _exp;
        this.Sessions = [];
        this.cronfreq = _freq;
        console.log("Initialized session dictionary...");
        var self = this;
        //this.cron = new CronJob(this.cronfreq, function() {
        //    this._check_and_clear_expirations();
        //}, null, true, _Timezone, self);
        //this.cron.start(); sometimes this thing goes nuts. switch to another lib.
        //this._check_and_clear_expirations();
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
        winston.log('info', logstring);
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
            found.LocHistory.push({"loc":location, "time":_now});
        }
    }
    _update_path(deviceid, path){
        var found = _.find(this.Sessions, {DeviceID:deviceid});
        if(found){
            found.CurrentPath = path;
        }
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