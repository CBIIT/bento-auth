const googleClient = require('./google');
const nihClient = require('./nih');
const testIDP = require('./testIDP');
const {isCaseInsensitiveEqual} = require("../util/string-util");

const oauth2Client = {
    login: async (code, idp, redirectingURL) => {
        // if google
        if (isCaseInsensitiveEqual(idp, 'google')) {
            return googleClient.login(code, redirectingURL);
        } else if (isCaseInsensitiveEqual(idp,'NIH')) {
            return nihClient.login(code, redirectingURL);
        }
        else if (isCaseInsensitiveEqual(idp,'test-idp')) {
            return testIDP.login();
        }
    },
    authenticated: async (userSession, tokens, fileAcl) => {
        // Check Valid Token
        if (isCaseInsensitiveEqual(userSession.idp,'google')) {
            return await googleClient.authenticated(tokens);
        } else if (isCaseInsensitiveEqual(userSession.idp,'NIH')) {
            return await nihClient.authenticated(tokens);
        }
        return false;
    },
    logout: async(idp, tokens) => {
        if (isCaseInsensitiveEqual(idp,'NIH')) {
            return nihClient.logout(tokens);
        }
    }
}

module.exports = oauth2Client;