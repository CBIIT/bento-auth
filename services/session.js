const session = require('express-session');
const {randomBytes} = require("crypto");
const FileStore = require('session-file-store')(session)

function createSession({ sessionSecret, session_timeout } = {}) {
    sessionSecret = sessionSecret || randomBytes(16).toString("hex");
    return session({
        secret: sessionSecret,
        // rolling: true,
        saveUninitialized: false,
        resave: true,
        store: new FileStore({ttl: session_timeout, reapInterval: 10}),
    });
}

module.exports = {
    createSession
};