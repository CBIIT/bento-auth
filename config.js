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
  neo4j_uri:process.env.NEO4J_URI,
  neo4j_user:process.env.NEO4J_USER,
  neo4j_password:process.env.NEO4J_PASSWORD
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
