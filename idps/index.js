const googleClient = require('./google');
const nihClient = require('./nih');
const {isCaseInsensitiveEqual} = require("../util/string-util");
const {authFileACL} = require("../services/file-auth");

const oauth2Client = {
    login: async (code, idp, redirectingURL) => {
        // if google
        if (isCaseInsensitiveEqual(idp, 'google')) {
            return googleClient.login(code);
        } else if (isCaseInsensitiveEqual(idp,'NIH')) {
            return nihClient.login(code, redirectingURL);
        }
    },
    authenticated: async (userSession, tokens) => {
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
    },
    authorized: (userAcl, fileAcl)=> {
        // Check File ACL Validation in User Session
        return authFileACL(userAcl, fileAcl);
    }
}

module.exports = oauth2Client;