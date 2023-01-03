const newrelic = require('newrelic');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const {createSession} = require("./services/session");
var logger = require('morgan');
const fs = require('fs');
const cors = require('cors');
const config = require('./config');
const {getTTL, getPing, getVersion} = require("./services/mysql-connection");
const cookieParser = require('cookie-parser');

console.log(config);

const LOG_FOLDER = 'logs';
if (!fs.existsSync(LOG_FOLDER)) {
  fs.mkdirSync(LOG_FOLDER);
}


// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, LOG_FOLDER, 'access.log'), { flags: 'a'})

var authRouter = require('./routes/auth');
var app = express();
app.use(cors());

// setup the logger
app.use(logger('combined', { stream: accessLogStream }))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.get('/api/auth/session-ttl', (req, res) => {
  getTTL(req, res);
});
/* GET ping-ping for health checking. */
app.get('/api/auth/ping', (req, res) => {
  getPing(req, res);
});
/* GET version for health checking and version checking. */
app.get('/api/auth/version', (req, res) => {
  getVersion(req, res);
});
app.use(createSession({ sessionSecret: config.cookie_secret, session_timeout: config.session_timeout }));


app.use('/api/auth', authRouter);

if (process.env.NODE_ENV === 'development') {
  console.log("Running in development mode, local test page enabled");
  app.set('view engine', 'ejs');

  app.get('/', (req, res) => {
    res.render('index', {
      googleClientID: config.google.CLIENT_ID,
      nihClientID: config.nih.CLIENT_ID,
      nihRedirectURL: config.nih.REDIRECT_URL,
      noAutoLogin: config.noAutoLogin
    });
  });
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(res.locals.message);
});

module.exports = app;
