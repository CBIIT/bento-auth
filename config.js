const dotenv = require('dotenv')
const IDP = require("./model/idp");
dotenv.config();

const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  idp: process.env.IDP ? process.env.IDP.toLowerCase() : GOOGLE.toLowerCase(),
  redirectUri: getRedirectUri(process.env.IDP),
  cookie_secret: process.env.COOKIE_SECRET,
  session_timeout: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) : 30 * 60,  // 30 minutes
  authorization_enabled: process.env.AUTHORIZATION_ENABLED ? process.env.AUTHORIZATION_ENABLED.toLowerCase() === 'true' : true,
  emails_enabled: process.env.EMAILS_ENABLED ? process.env.EMAILS_ENABLED.toLowerCase() === 'true' : true,

  //Neo4j connection
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  //Initial database loading
  DATA_LOADING_MODE: process.env.DATA_LOADING_MODE,
  DATA_FILE: process.env.DATA_FILE,
  //Testing
  TEST_EMAIL: process.env.TEST_EMAIL,
  google: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL,
  },
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
  // MySQL Session
  mysql_host: process.env.MYSQL_HOST,
  mysql_port: process.env.MYSQL_PORT,
  mysql_user: process.env.MYSQL_USER,
  mysql_password: process.env.MYSQL_PASSWORD,
  mysql_database: process.env.MYSQL_DATABASE,
  // Email settings
  email_service_email: process.env.EMAIL_SERVICE_EMAIL,
  email_transport: getTransportConfig(),
  getIdpAndUrlOrDefault: (idp, url) => {
  // idp, url
  if (idp && url) return {idp, url};
  // no idp, url
  if (!idp && url) return {idp: config.idp, url};
  // idp, no url
  if (idp && !url) return {idp: idp, url: getRedirectUri(idp)};
  // no idp, no url
  return {idp: config.idp, url: 'http://localhost:4010'};
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
