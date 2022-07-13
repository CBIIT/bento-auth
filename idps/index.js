const googleClient = require('./google');
const nihClient = require('./nih');
const testIDP = require('./testIDP');
const {isCaseInsensitiveEqual} = require("../util/string-util");
const {NIH, GOOGLE, LOGIN_GOV} = require("../constants/idp-constants");

const oauth2Client = {
    login: async (code, idp, redirectingURL) => {
        // if google
        if (isCaseInsensitiveEqual(idp, GOOGLE)) {
            return googleClient.login(code, redirectingURL);
        } else if (isCaseInsensitiveEqual(idp,NIH) || isCaseInsensitiveEqual(idp, LOGIN_GOV)) {
            return nihClient.login(code, redirectingURL);
        }
        else if (isCaseInsensitiveEqual(idp,'test-idp')) {
            return testIDP.login();
        }
    },
    authenticated: async (userSession, tokens, fileAcl) => {
        // Check Valid Token
        if (isCaseInsensitiveEqual(userSession.idp,GOOGLE)) {
            return await googleClient.authenticated(tokens);
        } else if (isCaseInsensitiveEqual(userSession.idp,NIH)) {
            return await nihClient.authenticated(tokens);
        }
        return false;
    },
    logout: async(idp, tokens) => {
        if (isCaseInsensitiveEqual(idp,NIH) || isCaseInsensitiveEqual(idp,LOGIN_GOV)) {
            return nihClient.logout(tokens);
        }
    }
}

module.exports = oauth2Client;