const dotenv = require('dotenv')
dotenv.config();
const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  idp: process.env.IDP ? process.env.IDP.toLowerCase() : 'google',
  cookie_secret: process.env.COOKIE_SECRET,
  session_timeout: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) : 30 * 60,
  google: JSON.parse(process.env.GOOGLE_LOGIN),
  nih: JSON.parse(process.env.NIH_LOGIN),
  login_gov: JSON.parse(process.env.LOGIN_GOV)
};

if (!config.version) {
  config.version = 'Version not set'
}

if (!config.date) {
  config.date = new Date();
}

module.exports = config;
