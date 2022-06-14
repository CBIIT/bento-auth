const newrelic = require('newrelic');
const graphql = require("./data-management/init-graphql");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var logger = require('morgan');
const fs = require('fs');
const cors = require('cors');
const config = require('./config');
const notify = require("./routes/notification");
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


var fileStoreOptions = {ttl: config.session_timeout, reapInterval: 10};

app.use(session({
  secret: config.cookie_secret,
  rolling: true,
  store: new FileStore(fileStoreOptions),
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/auth/graphql', graphql);
app.use('/api', notify);
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
