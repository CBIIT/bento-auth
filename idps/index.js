const config = require('../config');
const googleClient = require('./google');
const testIDP = require('./testIDP');

let oauth2Client;
switch (config.idp) {
    case 'test-idp':
        oauth2Client = testIDP;
        break;
    case 'fence':
        oauth2Client = null;
        break;
    case 'google':
    default:
        oauth2Client = googleClient;
}

module.exports = oauth2Client;