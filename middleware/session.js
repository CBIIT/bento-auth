const config = require('../config');
const session = require("express-session");
const FileStore = require('session-file-store')(session)
const fileStoreOptions = {ttl: config.session_timeout, reapInterval: 10};
console.log(config);
function setSession() {
    return session({
        secret: config.cookie_secret,
        // rolling: true,
        saveUninitialized: false,
        resave: true,
        store: new FileStore(fileStoreOptions),
    });
}

module.exports = {
    setSession
};