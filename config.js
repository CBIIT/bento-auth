const fs = require('fs');
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
  // Email settings
  email: JSON.parse(process.env.EMAIL),
  email_transport: getTransportConfig()
};

function getTransportConfig() {
  const config = JSON.parse(process.env.EMAIL);
  return {
    host: config.MAILER_HOST,
    port: config.MAILER_PORT,
    // Optional AWS Email Identity
    ...(config.USER && {
          secure: true, // true for 465, false for other ports
          auth: {
            user: config.USER, // generated ethereal user
            pass: config.PASSWORD, // generated ethereal password
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
