const express = require('express');
const {createSession} = require("./services/session");
const {errorHandler, throwError, createLogStream} = require("./middleware/error");
const {importHTML} = require("./view/import-html");
const cors = require('cors');
const config = require('./config');
console.log(config);
// var passport = require('passport');
var loginGov = require('./login-gov');
const app = express();
app.use(cors());
// Declare All Routes
const indexRoutes = require('./routes/index');
app.use(indexRoutes);
app.use(createLogStream(__dirname))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(createSession({ session_timeout: config.session_timeout }))
app.use(importHTML(express));

// app.use(passport.initialize());
// app.use(passport.session());
//
// passport.serializeUser(function(user, done) { done(null, user); });
// passport.deserializeUser(function(user, done) { done( null, user); }); // this is where you might fetch a user record from the database. see http://www.passportjs.org/docs/configure/#sessions

// loginGov.configure(passport); // configure LOA1 strategy

async function activatePassport() {
  return await require('./lib/passport')(app);
}
activatePassport().then((passport) => {
    const authRouter = require('./routes/google-auth')(passport);
    app.use('/api/auth', authRouter);
    const nihRouter = require('./routes/nih-auth')(passport);
    app.use('', nihRouter);
  // catch 404 and forward to error handler
    app.use(throwError);
    app.use(errorHandler);
});
module.exports = app;
