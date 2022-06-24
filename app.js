const newrelic = require('newrelic');
const graphql = require("./data-management/init-graphql");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const {createSession} = require("./services/session");
const {createLogStream} = require("./middleware/middleware");
const cors = require('cors');
const config = require('./config');
console.log(config);

var authRouter = require('./routes/auth');
var app = express();
app.use(cors());
// setup the logger
app.use(createLogStream(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(createSession({ session_timeout: config.session_timeout }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/auth/graphql', graphql);
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
