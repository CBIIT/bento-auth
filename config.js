// TODO DELETE DOTENV
const dotenv = require('dotenv')
dotenv.config();
const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  idp: process.env.IDP ? process.env.IDP.toLowerCase() : 'google',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_url: process.env.REDIRECT_URL,
  cookie_secret: process.env.COOKIE_SECRET,
  session_timeout: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) : 30 * 60,  // 30 minutes

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
  mysql_host: process.env.MY_SQL_HOST,
  mysql_port: process.env.MY_SQL_PORT,
  mysql_user: process.env.MY_SQL_USER,
  mysql_password: process.env.MY_SQL_PASSWORD,
  mysql_database: process.env.MY_SQL_DATABASE,
  // Email settings
  email_service_email: process.env.EMAIL_FROM,
  email_smtp_host: process.env.EMAIL_SMTP_HOST,
  email_smtp_port: process.env.EMAIL_SMTP_PORT,
  email_transport: getTransportConfig(),
  // Neo4J
  NEO4J_URI:process.env.NEO4J_URI,
  NEO4J_USER:process.env.NEO4J_USER,
  NEO4J_PASSWORD:process.env.NEO4J_PASSWORD
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
