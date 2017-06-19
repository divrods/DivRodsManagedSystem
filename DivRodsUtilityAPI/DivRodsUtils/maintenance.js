var CronJob = require('cron').CronJob, request = require('request');

class ArtworkFilter {
    constructor(_host, _freq){
        this.host = _host;
        this.cronfreq = _freq;
        this.currently_up = {};
        this.broken_rules = 0;
        this.validworks = {};
        this.cron = new CronJob(this.cronfreq, function() {
            this._refresh();
        }, null, true, _Timezone);
        this.cron.start();
        this._refresh();
    }
    _refresh(){
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
                            validworks[element["_id"]] = {"title": element["_source"]["title"], "room": element["_source"]["room"]};
                        }
                        works++;
                        if(works == _resp.hits.hits.length){
                            _self.validworks = validworks;
                        }
                    });
                }
            }
        );

    }
    _filter(_ruleset){
        //TODO filter a whole ruleset and remove any rules pertaining to artwork that isn't on display
    }
    _check(_artid){
        //TODO given a single artid, see if it's a valid one that is currently on display
    }
}

module.exports.ArtworkFilter = ArtworkFilter;