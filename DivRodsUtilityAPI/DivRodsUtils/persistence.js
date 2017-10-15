const uuidV4 = require('uuid/v4');
var _ = require('underscore'), request = require('request'), winston = require('winston');
var moment = require('moment'), prefclient = require('./prefclient.js');
var AWS = require('aws-sdk');
const s3 = new AWS.S3({region: 'us-east-1'});
/**
 * A session object to keep track of devices. Handles auth, interactions with pref engine, and report generation.
 */
class DeviceSession {
    constructor(DeviceMAC, timestamp, session_dict, floor = "3"){
        this.DeviceID = DeviceMAC;
        this.SessionID = uuidV4();
        this.Opened = timestamp;
        this.LastTouched = timestamp;
        this.Closed = {};
        this.BaseRuleSet = {};
        this.RuleSet = {};
        this.PrefHistory = [];
        this.Location = "0";
        this.SetupCode = 1;
        this.CurrentPath = {};
        this.CurrentFloor = floor;
        this.CurrentPrefTarget = {};
        this.LocHistory = [];
        this.Enabled = true;
        this.Status = "Normal";
        this.Manager = session_dict;

        var initial_target_id = (this.Manager.rules.length > 0) ? _.sample(this.Manager.rules)["ant"].slice(0,-2) : _.sample(this.Manager.art_filter.taggedworks)["artid"];
        this.CurrentPrefTarget = _.find(this.Manager.art_filter.taggedworks, {artid:initial_target_id}); 
    }
    _refresh_target(cb){ //emergency target grab
        var initial_target_id = _.last(this.Manager.rules)["ant"].slice(0,-2);
        this.CurrentPrefTarget = _.find(this.Manager.art_filter.taggedworks, {artid:initial_target_id}); 
        if(cb) cb();
    }
    //submit a user's expressed preference about an artwork
    _submit_pref(pref, floor){
        var self = this;
        if(!floor | floor == undefined){
            floor = this.CurrentFloor;
        }
        if(!this.CurrentPrefTarget){
            _refresh_target(null);
        }
        if(self.PrefHistory.length > 25){
            self.PrefHistory = [];
        }
        var _next = "";
        pref["timestamp"] = moment().utc().format();
        var correct = pref["artid"] == this.CurrentPrefTarget["artid"];
        pref["target"] = correct;
        if(correct){
            var pref_string = (pref["pref"] == "n") ? pref["artid"] + ":0" : pref["artid"] + ":1";
            var matchedprefs = _.filter(this.Manager.rules, function(o){
                return o["ant"] == pref_string;
            });
            if(matchedprefs.length > 0){ //get hydrated artwork objects for these consequent IDs
                var matched_valid_artworks = [];
                matchedprefs.forEach(function(matched){
                    var con_id = matched["con"].slice(0,-2); //get the consequent id
                    var mva = _.find(self.Manager.art_filter.taggedworks, {artid:con_id}); //find the full object for the consequent id
                    if(mva && !self._has_scanned(con_id)) matched_valid_artworks.push(mva); //got a winner
                });
                if(matched_valid_artworks.length > 0) {
                    _next = matched_valid_artworks[0]; //presumably the first item is highest confidence.
                    _next["preftype"] = "rule";
                }
            } 
            if(_next==""){ //still nothing? no rules featuring the artwork that was scanned.
                //look at random for a different artid that is in a different gallery.
                var artobj = _.find(this.Manager.art_filter.taggedworks, {artid:pref["artid"]});
                var otherart = this.Manager.art_filter.taggedworks.filter(function(tagged){
                    return tagged["artid"] != pref["artid"] && tagged["room"] != artobj["room"] && !self._has_scanned(pref["artid"]);
                });
                _next = otherart[Math.floor(Math.random() * otherart.length)];
                _next["preftype"] = "random";
            }
            this.CurrentPrefTarget = _next;  
        }
        var apipref = (pref["pref"] == "n") ? "0" : "1";
        prefclient.record_preference(this.SessionID, pref["artid"], apipref, function(data){
            if(data){
                console.log("Successfully wrote preference.");
            }
        });
        self.PrefHistory.push(pref);
        return correct;
    }
    _has_scanned(tag){
        var alreadyscanned = _.find(this.PrefHistory, {artid:tag}); //see if we've already scanned it
        if(alreadyscanned) return true;
        return false;
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
    constructor(_exp, _art_filter){
        this.Expiration = _exp;
        this.Sessions = [];
        var self = this;
        this.ruleset = {};
        this.rules = [];
        this.session_archive = [];
        this.art_filter = _art_filter;
        this._update_ruleset();
    }

    _check_and_clear_expirations(){
        var _now = moment().format();
        for(var index in this.Sessions){
            var session = this.Sessions[index];
            var _stale = Math.abs(_now - session.LastTouched);
            if(_stale > this.Expiration){
                session._close("Expired", _now);
            }
        }
        var clear = 0;
        var i = this.Sessions.length
        while (i--) {
            if(!this.Sessions[i].Enabled){
                this.session_archive.push(this.Sessions[i]);
                this.Sessions.splice(i,1);
                clear++;
            }
        }
        var logstring = 'Session cron cleared ' + clear + ' dormant sessions.';
        console.log(logstring);
    }
    _upload_history(docname){
        var params = {
            Bucket: _S3Bucket,
            Key: docname,
            ContentType: 'application/json',
            ACL: 'public-read',
            Body: JSON.stringify(this._history(true))
        };
        s3.putObject(params, function(err){
            if(!err) {
                console.log("Successful upload of session archive.");
            }
            else{
                console.log('Error occurred: ' + err);
            }
        });
    }
    _cycle(reqID){
        var self = this;
        var found = _.find(self.Sessions, {DeviceID:reqID});
        if(found){
            found.Enabled = false;
            self.session_archive.push(found);
            self.Sessions = _.without(self.Sessions, _.findWhere(self.Sessions, {SessionID:found.SessionID}));
        }
        _touch(reqID, self);
    }
    _touch(reqID, dict, status = null){
        var found = _.find(this.Sessions, {DeviceID:reqID});
        if(found){
            if(status){
                found.Status = status;
            }
            found.LastTouched = Date.now();
        }
        else{
            var _time = moment().utc().format();
            var _new = new DeviceSession(reqID, _time, dict);
            _new.LastTouched = Date.now();
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
                "CurrentTarget": JSON.stringify(session.CurrentPrefTarget),
                "ScannedTags": session.PrefHistory
            }
            out.push(sample);
        });
        return out;
    }
    _history(clear){
        var out = [];
        this.session_archive.forEach(function(session){
            var sample = {
                "ID": session.SessionID,
                "Location": session.Location,
                "LocationHistory": session.LocHistory,
                "Started": new Date(session.Opened).toISOString(),
                "CurrentPath": session.CurrentPath,
                "CurrentTarget": session.CurrentPrefTarget,
                "ScannedTags": session.PrefHistory,
                "Closed": session.Closed
            }
            out.push(sample);
        });
        if(out.length < 1){
            out[0] = "No sessions in current history.";
        }
        if(clear) this.session_archive = [];
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
    _validate(_artid){
        if(_.find(this.art_filter.taggedworks, {artid:_artid})) return true;
        else return false;
    }
    _update_path(deviceid, path){
        var found = _.find(this.Sessions, {DeviceID:deviceid});
        if(found){
            found.CurrentPath = path;
        }
    }
    _update_ruleset(){
        var self = this;
        self.rules = [];
        prefclient.refresh_ruleset_all(function(data){
            if(data){
                self.rules = [];
                for(var rule in data){
                    var _rule = data[rule];
                    var entry = {
                        "ant":_rule["ant"][0], //see below
                        "con":_rule["con"][0], //just using the first one for now, TODO fork this here
                        "confidence":_rule["confidence"]
                    };
                    //make sure the rule actually involves tagged works
                    if(self._validate(_rule["ant"][0].slice(0,-2)) && self._validate(_rule["con"][0].slice(0,-2))){
                        self.rules.push(entry);
                    }
                }
                self.rules = _.sortBy(self.rules, "confidence");
                if(self.rules.length < 1){
                    for(var x = 0; x<500; x++){
                        //make up a random rule
                    }
                }
                console.log(self.rules);
            }
        });
    }
};

module.exports.SessionDictionary = SessionDictionary;
module.exports.DeviceSession = DeviceSession;