const session = require('express-session');
const {randomBytes} = require("crypto");
const config = require('../config');
const MySQLStore = require('express-mysql-session')(session);

function createSession({ sessionSecret, session_timeout } = {}) {
    sessionSecret = sessionSecret || randomBytes(16).toString("hex");
    return session({
        secret: sessionSecret,
        // rolling: true,
        saveUninitialized: false,
        resave: true,
        store: new MySQLStore({
          host: config.mysql.HOST,
          port: config.mysql.PORT,
          user: config.mysql.USER,
          password: config.mysql.PASSWORD,
          database: config.mysql.DATABASE,
          checkExpirationInterval: 10,
          expiration: session_timeout
        })
    });
}

module.exports = {
    createSession
};