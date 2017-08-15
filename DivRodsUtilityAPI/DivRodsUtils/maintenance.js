var request = require('request'), _ = require('underscore');

var idtags = [
        {"artid":"111619", "color":"purple"},
        {"artid":"492", "color":"yellow"},
        {"artid":"3903", "color":"red"},
        {"artid":"31412", "color":"cyan"},
        {"artid":"31377", "color":"green"},
        {"artid":"66176", "color":"purple"},
        {"artid":"9671", "color":"yellow"},
        {"artid":"3908", "color":"red"},
        {"artid":"3220", "color":"cyan"},
        {"artid":"191", "color":"green"},
        {"artid":"118619", "color":"green"},
        {"artid":"4688", "color":"purple"},
        {"artid":"17169", "color":"yellow"},
        {"artid":"60752", "color":"red"},
        {"artid":"802", "color":"cyan"},
        {"artid":"1163", "color":"green"},
        {"artid":"1808", "color":"purple"},
        {"artid":"1773", "color":"yellow"},
        {"artid":"14011", "color":"red"},
        {"artid":"589", "color":"cyan"},
        {"artid":"1372", "color":"green"},
        {"artid":"1378", "color":"purple"}
];

class ArtworkFilter {
    constructor(){
        this.host = _COLLhost3f; //why discriminate between floors here?
        this.currently_up = {};
        this.broken_rules = 0;
        this.validworks = [];
        this.taggedworks = [];
        this.closed_galleries = [];
        var self = this;
        this._refresh(function(data){
            console.log(data);
        });
    }
    _refresh(cb){
        var validworks = [];
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
                            validworks.push({"title": element["_source"]["title"], "room": element["_source"]["room"], "artid": element["_source"]["_id"]});
                            var matched_tag = _.find(idtags, function(o){
                                return o["artid"] == element["_id"];
                            });
                            if(matched_tag){
                                var gallery = element["_source"]["room"].replace(/[^0-9]/, '');
                                _self.taggedworks.push({"artid": element["_id"], "color": matched_tag["color"], "room": gallery, "available": true})
                            }
                        }
                        works++;
                        if(works == _resp.hits.hits.length){
                            _self.validworks = validworks;
                        }
                    });
                }
                cb(_self.taggedworks);
            }
        );
    }
    _update_galleries(_galleries, _access){
        var self = this;
        if(_galleries.length < 1){
            self.taggedworks.forEach(function(artwork){
                artwork.available = true;
            });
            return;
        }
        var all_affected = [];
        _galleries.forEach(function(room){
            var affected = _.filter(self.taggedworks, function(o){
                return o["room"] == element["_id"];
            });
            all_affected = all_affected.concat(affected);
        });
        all_affected.forEach(function(artwork){
            artwork.available = _access;
        });
    }
    _check(_artid){
        var self = this;
        var found = _.find(self.taggedworks, function(o){o["artid"] == _artid});
        if(found) return found;
        else return false;
    }
    _overview(){
        if(this.taggedworks.length > 0){
            return this.taggedworks;
        }
        return "No valid works found.";
    }
}

module.exports.ArtworkFilter = ArtworkFilter;