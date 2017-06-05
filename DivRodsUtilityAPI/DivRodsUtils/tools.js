const uuidV4 = require('uuid/v4');
/**
 * A session object to keep track of devices. Handles auth, interactions with pref engine, and report generation.
 * Not 100% sure where I'm going with this yet. Needs a middleware.
 */
class DeviceSession {
    constructor(DeviceMAC, timestamp){
        this.DeviceID = DeviceMAC;
        this.SessionID = uuidV4();
        this.Opened = timestamp;
        this.Closed = null;
        this.BaseRuleSet = {};
        this.RuleSet = {};
        this.PrefHistory = {};
        this.Location = {};
    }
    //submit a record of a session of usage
    _drop_report = function(){

    }

    //submit a user's expressed preference about an artwork
    _submit_pref = function(pref, timestamp){

    }

    _get_ruleset = function(){

    }
}

module.exports.DeviceSession = DeviceSession;