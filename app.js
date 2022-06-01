const express = require('express');
const {createSession} = require("./services/session");
const {errorHandler, throwError, createLogStream} = require("./middleware/error");
const {importHTML} = require("./view/import-html");
const cors = require('cors');
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
