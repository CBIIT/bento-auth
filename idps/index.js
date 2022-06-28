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
    logout: async(idp, tokens) => {
        if (isCaseInsensitiveEqual(idp,'NIH')) {
            return nihClient.logout(tokens);
        }
    },
    // authorize a user after file acl authentication
    authorized: (userAcl, fileAcl)=> {
        return authFileACL(userAcl, fileAcl);
    }
}

module.exports = oauth2Client;