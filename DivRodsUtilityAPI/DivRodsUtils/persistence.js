const uuidV4 = require('uuid/v4');
var _ = require('underscore'), request = require('request'), ClientOAuth2 = require('client-oauth2');

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
        this.PrefHistory = {};
        this.Location = "0";
        this.CurrentPath = {};
        this.LocHistory = [];
        this.Enabled = true;
        this.Status = "Normal";
        console.log("Initialized device Session...");
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
    _submit_pref(pref, timestamp){

    }
    _close(reason, timestamp){
        this.Enabled = false;
        this.Closed = {"reason":reason, "time": timestamp};
    }
};

class SessionDictionary {
    constructor(expiration, cron){
        this.Expiration = expiration;
        this.Sessions = [];
        this.cronfreq = cron;
        console.log("Initialized session dictionary...");
        this._start();
    }
    _start(){
        this.cron = new CronJob(this.cronfreq, function() {
            this._check_and_clear_expirations();
        }, null, true, this.timezone);
    }
    _check_and_clear_expirations(){
        _now = Date.now().getTime();
        for(session in this.Sessions){
            _stale = Math.abs(_now - session.LastTouched.getTime());
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
    _overview(){
        var out = [];
        this.Sessions.forEach(function(session){
            var sample = {
                "ID": session.SessionID,
                "Location": session.Location,
                "Awake": session.Enabled,
                "Started": new Date(session.Opened).toISOString(),
                "Current_Path": session.CurrentPath,
                "Status": session.Status
            }
            out.push(sample);
        });
        return out;
    }
    _place(deviceid, location){
        var found = _.find(this.Sessions, {DeviceID:deviceid});
        if(found){
            _now = Date.now().getTime();
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