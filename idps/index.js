const config = require('../config');
const googleClient = require('./google');

let oauth2Client;
switch (config.idp) {
    case 'fence':
        oauth2Client = null;
    case 'google':
    default:
        oauth2Client = googleClient;
}

module.exports = oauth2Client;