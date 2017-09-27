var request = require('request'), _ = require('underscore'), museum = require('./museum.js');

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
    ///Asks the mia's collection what's on the third floor.
    ///Parses it against what we have tagged, and creates a
    ///list of artworks that are tagged + on display.
    _refresh(cb){
        var validworks = [];
        var works = 0;
        var _self = this;
        request.get(
            this.host,
            function (error, response, body) {
                if (!error && response.statusCode == 200 && JSON.parse(response.body).hits.hits) {
                    //loop through hits from collection, filter for artids and isondisplay or whatever
                    var _resp = JSON.parse(response.body);
                    _resp.hits.hits.forEach(function(element) {
                        if(element["_id"]){
                            validworks.push({"title": element["_source"]["title"], "room": element["_source"]["room"], "artid": element["_source"]["_id"]});
                            var matched_tag = _.find(museum.idtags, function(o){
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
                else{
                    console.log("No reply from collection API.");
                    //TODO: logging and notification.
                }
                cb(_self.taggedworks);
            }
        );
    }
    //TODO this will get overridden on a refresh call. have to persist it.
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