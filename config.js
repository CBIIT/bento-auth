const dotenv = require('dotenv')
dotenv.config();
const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  idp: process.env.IDP ? process.env.IDP.toLowerCase() : 'google',
  cookie_secret: process.env.COOKIE_SECRET,
  session_timeout: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) : 30 * 60,
  mysql: JSON.parse(process.env.MY_SQL),
  google: JSON.parse(process.env.GOOGLE_LOGIN),
  nih: JSON.parse(process.env.NIH_LOGIN),
  neo4j: JSON.parse(process.env.NEO4J)
};

if (!config.version) {
  config.version = 'Version not set'
}

if (!config.date) {
  config.date = new Date();
}

module.exports = config;
