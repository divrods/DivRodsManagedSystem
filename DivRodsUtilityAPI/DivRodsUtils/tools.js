const uuidV4 = require('uuid/v4');
var _ = require('underscore');
/**
 * A session object to keep track of devices. Handles auth, interactions with pref engine, and report generation.
 * Not 100% sure where I'm going with this yet. Needs a middleware.
 */
class DeviceSession {
    constructor(DeviceMAC, timestamp){
        this.DeviceID = DeviceMAC;
        this.SessionID = uuidV4();
        this.Opened = timestamp;
        this.LastTouched = timestamp;
        this.Closed = null;
        this.BaseRuleSet = {};
        this.RuleSet = {};
        this.PrefHistory = {};
        this.Location = "0";
        this.Enabled = true;
        console.log("Initialized device Session...");
    }
    //submit a record of a session of usage
    _drop_report(){

    }
    _get_ruleset(){

    };

    //submit a user's expressed preference about an artwork
    _submit_pref(pref, timestamp){

    }
};

class SessionDictionary {
    constructor(expiration){
        this.Expiration = expiration;
        this.Sessions = [];
        console.log("Initialized session dictionary...");
    }
    _check_and_clear_expirations(){
        _now = Date.now().getTime();
        for(session in this.Sessions){
            _stale = Math.abs(_now - session.LastTouched.getTime());
            if(_stale > this.Expiration){
                session.Enabled = false;
            }
        }
        var i = this.Sessions.length
        while (i--) {
            if(!this.Sessions[i].Enabled){
                this.Sessions.splice(i,1);
            }
        }
    }
    _touch(reqID){
        var found = _.find(this.Sessions, {DeviceID:reqID});
        if(found){
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
                "Started": new Date(session.Opened).toISOString()
            }
            out.push(sample);
        });
        return out;
    }
};

module.exports.SessionDictionary = SessionDictionary;
module.exports.DeviceSession = DeviceSession;