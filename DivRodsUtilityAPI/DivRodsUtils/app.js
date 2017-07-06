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
particle = new Particle();

var index = require('./routes/index'),
users = require('./routes/users'),
generate = require('./routes/generate'),
setup = require('./routes/setup'),
dkpath = require('./routes/path'),
status = require('./routes/status'),
onboard = require('./routes/onboard'),
goal = require('./routes/goal'),
artwork = require('./routes/artwork'),
locate = require('./routes/locate');

//Guess who forgets this? Me.
//Start command on win: set DEBUG=myapp:* & npm start
var app = express();

_ParticleToken = 0;
_Timezone = 'America/Chicago';
_PrefHost = process.env.pref_host;
_PrefAuth = process.env.pref_auth;
_FINDhost = "http://ec2-54-209-226-130.compute-1.amazonaws.com:18003";

_SessionMgr = new persist.SessionDictionary(45000, '* 30 * * * *');
_ArtFilter = new maintain.ArtworkFilter("https://search.artsmia.org/room:G3*1", '* 30 11 * * 1,3,5'); //process.env.collection_host

app.set('_DeviceSessions', _SessionMgr);
app.set('_ArtFilter', _ArtFilter);
//TODO keep a table of MACs matched to session IDs, map and handle creation/destruction here
var DeviceSessionManager = function (req, res, next) {
  //TODO basic auth scheme for filtering known MACs
  if(req.query.deviceid){
    if(req.query.status){
      _SessionMgr._touch(req.query.deviceid, req.query.status);
    }else{
      _SessionMgr._touch(req.query.deviceid);
    }
    req.device_session = _SessionMgr._get(req.query.deviceid);
  }
  next()
}

particle.login({username: process.env.photonemail, password: process.env.photonpw}).then(
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

app.use('/', index),
app.use('/users', users),
app.use('/generate', generate),
app.use('/setup', setup),
app.use('/onboard', onboard),
app.use('/path', dkpath),
app.use('/status', status),
app.use('/goal', goal),
app.use('/artwork', artwork),
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
