//Status Code Canon:
//410 ~ Not yet implemented or feature removed.
//422 ~ Something wrong with a remote resource (device/file/blob) used by this endpoint
//301 ~ Resource is returning a backup version of something
//200 ~ B.A.U. and intact response from a GET
//201 ~ B.A.U. and intact responde from a PUT
//204 ~ Successful DELETE or PATCH
var persist = require('./persistence.js'), maintain = require('./maintenance.js');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('express-basic-auth');
var Particle = require('particle-api-js');
var winston = require('winston');
var nconf = require('nconf');
var museum = require('./museum.js');
var async= require('async');
particle = new Particle();

var index = require('./routes/index'),
users = require('./routes/users'),
generate = require('./routes/generate'),
setup = require('./routes/setup'),
dkpath = require('./routes/path'),
status = require('./routes/status'),
goal = require('./routes/goal'),
artwork = require('./routes/artwork'),
device = require('./routes/device'),
locate = require('./routes/locate');

//Guess who forgets this? Me.
//Start command on win: set DEBUG=myapp:* & npm start
var app = express();

_DefaultFloor = "3";
_ParticleToken = 0;
_Timezone = 'America/Chicago';
if(process.env.pref_host){
  //must be on EB
  _ParticleEmail = process.env.photonemail;
  _ParticlePW = process.env.photonpw;
  _PrefHost = process.env.pref_host;
  _PrefAuth = process.env.pref_auth;
  _FINDhost = process.env.tracking_host;
  _COLLhost2f = process.env.collection2f_host;
  _COLLhost3f = process.env.collection3f_host;
}
else{
  nconf.file('./config.json');
  _ParticleEmail = nconf.get('email');
  _ParticlePW = nconf.get('pass');
  _PrefHost = nconf.get('prefhost');
  _PrefAuth = nconf.get('prefauth');
  _FINDhost = nconf.get('trackinghost');
  _COLLhost2f = nconf.get('collection2f');
  _COLLhost3f = nconf.get('collection3f');
}

museum._start(function(){
  _ArtFilter = new maintain.ArtworkFilter(function(){
    _SessionMgr = new persist.SessionDictionary(95000, _ArtFilter);
    app.set('_DeviceSessions', _SessionMgr);
    app.set('_ArtFilter', _ArtFilter);
  });
})




var cron = require('node-cron');
cron.schedule('*/5 * * * *', function(){
  _SessionMgr._check_and_clear_expirations();
});

cron.schedule('30 11 * * 1,3,5', function(){
  _ArtFilter._refresh();
});


var DeviceSessionManager = function (req, res, next) {
  if(req.query.deviceid){
    if(req.query.status){
      _SessionMgr._touch(req.query.deviceid, _SessionMgr, req.query.status);
    }else{
      _SessionMgr._touch(req.query.deviceid, _SessionMgr);
    }
    req.device_session = _SessionMgr._get(req.query.deviceid);
  }
  next()
}

var CORS = function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}

particle.login({username: _ParticleEmail, password: _ParticlePW}).then(
  function(data){
    _ParticleToken = data.body.access_token;
  },
  function(err) {
    winston.log('error', 'Particle Login failed: ' + err);
  }
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(DeviceSessionManager);
app.use(CORS);

app.use('/', index),
app.use('/users', users),
app.use('/generate', generate),
app.use('/setup', setup),
app.use('/path', dkpath),
app.use('/status', status),
app.use('/goal', goal),
app.use('/artwork', artwork),
app.use('/device', device),
app.use('/locate', locate);
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
