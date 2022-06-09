const express = require('express');
const {createSession} = require("./services/session");
const {errorHandler, throwError, createLogStream} = require("./middleware/error");
const {importHTML} = require("./view/import-html");
const cors = require('cors');

const authRouter = require('./routes/google-auth')();
const nihRouter = require('./routes/nih-auth')();
const govLoginRouter = require('./routes/gov-login-auth')();

const config = require('./config');
console.log(config);
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

app.use('/api/auth', authRouter);
app.use('', nihRouter);
app.use('', govLoginRouter);

// catch 404 and forward to error handler
app.use(throwError);
app.use(errorHandler);

module.exports = app;
