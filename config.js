const dotenv = require('dotenv')
const {isCaseInsensitiveEqual} = require("./util/string-util");
dotenv.config();

const GOOGLE = 'GOOGLE';

const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  idp: process.env.IDP ? process.env.IDP.toLowerCase() : GOOGLE.toLowerCase(),
  cookie_secret: process.env.COOKIE_SECRET,
  session_timeout: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) * 1000 : 1000 * 30 * 60,  // 30 minutes
  token_secret: process.env.TOKEN_SECRET,
  token_timeout: process.env.TOKEN_TIMEOUT ? parseInt(process.env.TOKEN_TIMEOUT) : 30 * 60, // 30 minutes

  // Google login settings
  google: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL,
  },

  // NIH login settings
  nih: {
    CLIENT_ID: process.env.NIH_CLIENT_ID,
    CLIENT_SECRET: process.env.NIH_CLIENT_SECRET,
    BASE_URL: process.env.NIH_BASE_URL,
    REDIRECT_URL: process.env.NIH_REDIRECT_URL,
    USERINFO_URL: process.env.NIH_USERINFO_URL,
    AUTHORIZE_URL: process.env.NIH_AUTHORIZE_URL,
    TOKEN_URL: process.env.NIH_TOKEN_URL,
    LOGOUT_URL: process.env.NIH_LOGOUT_URL,
    SCOPE: process.env.NIH_SCOPE,
    PROMPT: process.env.NIH_PROMPT
  },

  // Neo4j Connection
  neo4j_uri: process.env.NEO4J_URI,
  neo4j_user: process.env.NEO4J_USER,
  neo4j_password: process.env.NEO4J_PASSWORD,

  // MySQL Session
  mysql_host: process.env.MYSQL_HOST,
  mysql_port: process.env.MYSQL_PORT,
  mysql_user: process.env.MYSQL_USER,
  mysql_password: process.env.MYSQL_PASSWORD,
  mysql_database: process.env.MYSQL_DATABASE,

  // Disable local test page automatically sends /login request, so Postman can use the auth code
  noAutoLogin: process.env.NO_AUTO_LOGIN ? process.env.NO_AUTO_LOGIN.toLowerCase() === "true" : false,

  getIdpOrDefault: (idp) => {
    return (idp) ? idp : config.idp;
  },
  getUrlOrDefault: (idp, url) => {
    // if (url) return url;
    if (!url && isCaseInsensitiveEqual(idp,'GOOGLE')) return process.env.GOOGLE_REDIRECT_URL;
    if (!url && isCaseInsensitiveEqual(idp,'NIH')) return process.env.NIH_REDIRECT_URL;
    return url;
  }
};

function getTransportConfig() {
  return {
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_SMTP_PORT,
    // Optional AWS Email Identity
    ...(process.env.EMAIL_USER && {
          secure: true, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER, // generated ethereal user
            pass: process.env.EMAIL_PASSWORD, // generated ethereal password
          }
        }
    )
  };
}


if (!config.version) {
  config.version = 'Version not set'
}

if (!config.date) {
  config.date = new Date();
}

module.exports = config;
