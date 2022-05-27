const express = require('express');
var path = require('path');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

const {errorHandler, throwError, createLogStream} = require("./middleware/error");
const {importPublicHTML} = require("./view/import-html");

var logger = require('morgan');
const fs = require('fs');
const cors = require('cors');
const config = require('./config');
console.log(config);

const app = express();
app.use(cors());

// Declare All Routes
const indexRoutes = require('./routes/index');

app.use(indexRoutes);

// setup the logger
// create a write stream (in append mode)
// TODO REFACTORING
const LOG_FOLDER = 'logs';
if (!fs.existsSync(LOG_FOLDER)) {
  fs.mkdirSync(LOG_FOLDER);
}
const accessLogStream = fs.createWriteStream(path.join(__dirname, LOG_FOLDER, 'access.log'), { flags: 'a'})
app.use(logger('combined', { stream: accessLogStream }))
// app.use(createLogStream)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


var fileStoreOptions = {ttl: config.session_timeout, reapInterval: 10};

app.use(session({
  secret: config.cookie_secret,
  // rolling: true,
  saveUninitialized: false,
  resave: true,
  store: new FileStore(fileStoreOptions),
}));

app.use(importPublicHTML(express));
async function activatePassport() {
  return await require('./lib/passport')(app);
}
activatePassport().then((passport) => {
  const authRouter = require('./routes/google-auth')(passport);
  app.use('/api/auth', authRouter);
  // catch 404 and forward to error handler
  app.use(throwError);
  app.use(errorHandler);
});
module.exports = app;
