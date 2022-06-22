const googleClient = require('./google');
const nihClient = require('./nih');
const {authFileWithACL} = require("../services/file-auth");

const oauth2Client = {
    login: async (code, type, redirectingURL) => {
        // if google
        if (type === 'google') {
            return googleClient.login(code);
        } else if (type === 'NIH') {
            return nihClient.login(code, redirectingURL);
        }
        // TODO Login.gov
    },
    authenticated: async (userSession, tokens, fileAcl) => {
        // Validate File ACL in User ACL
        if (!authFileWithACL(userSession.acl, fileAcl)) return false;
        // Check Valid Token
        if (userSession.idp === 'google') {
            return await googleClient.authenticated(tokens);
        } else if (userSession.idp === 'NIH') {
            return await nihClient.authenticated(tokens);
        }
        // TODO Login.gov
        return false;
    },
    logout: async(type, tokens) => {
        if (type === 'NIH') {
            return nihClient.logout(tokens);
        }
        // TODO Login.gov
    }
}

module.exports = oauth2Client;