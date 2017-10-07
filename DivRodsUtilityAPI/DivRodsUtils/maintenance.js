var request = require('request'), _ = require('underscore'), museum = require('./museum.js');

//TODO: parse valid parts of the map with this tagged works call so we don't guide a user to a valid gallery that's in a gallery we haven't mapped.
class ArtworkFilter {
    constructor(cb){
        this.host = _COLLhost3f; //why discriminate between floors here?
        this.taggedworks = [];
        this.closed_galleries = [];
        var self = this;
        this._refresh(function(data){
            console.log(data);
            cb();
        });
    }
    ///Asks the mia's collection what's on the third floor.
    ///Parses it against what we have tagged, and creates a
    ///list of artworks that are tagged + on display.
    _refresh(cb){
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
                            //handle merged galleries here.
                            var matched_tag = _.find(museum.idtags, function(o){
                                return o["artid"] == element["_id"];
                            });
                            if(matched_tag){
                                var gallery = element["_source"]["room"].replace(/[^0-9]/, '');
                                if(museum.map["3"]["active"][gallery]){
                                    _self.taggedworks.push(
                                        _self._clean_and_merge(
                                            element["_source"]["title"], 
                                            gallery,
                                            element["_source"]["id"],
                                            matched_tag["color"],
                                            "3")
                                    );
                                }
                            }
                        }
                        works++;
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
    //cheesy function to handle the gallery mergers we had to do to handle some very physicall small galleries.
    //for example g334, which the nav system can't distinguish from the much larger g333.
    _clean_and_merge(title, room, artid, color, floor){
        var clean = {
            "title": title, 
            "room": room, 
            "artid": artid,
            "color": color,
            "available": true
        };
        //var towrap = _.find(museum.map[floor]["wrap"][room]);
        if(museum.map[floor]["wrap"][room]){
            clean["room"] = museum.map[floor]["wrap"][room];
        }
        return clean;
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