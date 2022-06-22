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
  authorization_enabled: process.env.AUTHORIZATION_ENABLED ? process.env.AUTHORIZATION_ENABLED.toLowerCase() === 'true' : true,

  //Neo4j connection
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  //Initial database loading
  DATA_LOADING_MODE: process.env.DATA_LOADING_MODE,
  DATA_FILE: process.env.DATA_FILE,
  //Testing
  TEST_EMAIL: process.env.TEST_EMAIL,
  // MySQL Session
  mysql_host: process.env.MY_SQL_HOST,
  mysql_port: process.env.MY_SQL_PORT,
  mysql_user: process.env.MY_SQL_USER,
  mysql_password: process.env.MY_SQL_PASSWORD,
  mysql_database: process.env.MY_SQL_DATABASE,
  // Email settings
  email_service_email: process.env.EMAIL_SERVICE_EMAIL,
  email_transport: getTransportConfig()
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
