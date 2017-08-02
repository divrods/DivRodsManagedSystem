var CronJob = require('cron').CronJob, request = require('request'), _ = require('underscore');

var idtags = [ //TODO get this from somewhere
        {"artid":"18424", "color":"purple"}, //2f starts
        {"artid":"40428", "color":"yellow"},
        {"artid":"180", "color":"red"},
        {"artid":"2175", "color":"cyan"},
        {"artid":"113158", "color":"green"},
        {"artid":"5890", "color":"purple"},
        {"artid":"1224", "color":"yellow"},
        {"artid":"43576", "color":"red"},
        {"artid":"40975", "color":"cyan"},
        {"artid":"3939", "color":"green"},
        {"artid":"3939", "color":"green"},
        {"artid":"116020", "color":"purple"}, //3f starts
        {"artid":"1320", "color":"yellow"},
        {"artid":"1509", "color":"red"},
        {"artid":"1240", "color":"cyan"},
        {"artid":"802", "color":"green"},
        {"artid":"118786", "color":"purple"},
        {"artid":"3267", "color":"yellow"},
        {"artid":"1272", "color":"red"},
        {"artid":"1649", "color":"cyan"},
        {"artid":"2276", "color":"green"},
        {"artid":"10362", "color":"purple"},
        {"artid":"80860", "color":"yellow"},
        {"artid":"2239", "color":"red"},
        {"artid":"420", "color":"cyan"},
        {"artid":"99318", "color":"green"},
        {"artid":"9668", "color":"purple"},
        {"artid":"6228", "color":"yellow"},
        {"artid":"427", "color":"red"},
];

var taggedworks = [];

class ArtworkFilter {
    constructor(_freq){
        this.host = _COLLhost3f; //why discriminate between floors here?
        this.cronfreq = _freq;
        this.currently_up = {};
        this.broken_rules = 0;
        this.validworks = {};
        var self = this;
        this._refresh(function(data){
            console.log(data);
        });
    }
    _refresh(cb){
        var validworks = {};
        var works = 0;
        var _self = this;
        request.get(
            this.host,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //loop through hits from collection, filter for artids and isondisplay or whatever
                    var _resp = JSON.parse(response.body);
                    _resp.hits.hits.forEach(function(element) {
                        if(element["_id"]){
                            //Something
                            validworks[element["_id"]] = {"title": element["_source"]["title"], "room": element["_source"]["room"], "artid": element["_source"]["_id"]};
                            var matched_tag = _.find(idtags, function(o){
                                return o["artid"] == element["_id"];
                            });
                            if(matched_tag){
                                var gallery = element["_source"]["room"].replace(/[^0-9]/, '');
                                taggedworks.push({"artid": element["_id"], "color": matched_tag["color"], "room": gallery})
                            }
                        }
                        works++;
                        if(works == _resp.hits.hits.length){
                            _self.validworks = validworks;
                        }
                    });
                }
                cb(taggedworks);
            }
        );

    }
    _filter(_ruleset){
        //TODO filter a whole ruleset and remove any rules pertaining to artwork that isn't on display
    }
    _check(_artid){
        if(_.find(taggedworks, function(o){o["artid"] == _artid})) return true;
        else return false;
        //TODO given a single artid, see if it's a valid one that is currently on display
    }
}

module.exports.ArtworkFilter = ArtworkFilter;