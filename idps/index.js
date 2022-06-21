const googleClient = require('./google');
const nihClient = require('./nih');

let oauth2Client = {
    login: async (code, type, redirectingURL) => {
        // if google
        if (type === 'google') {
            return googleClient.login(code);
        } else if (type === 'NIH') {
            return nihClient.login(code, redirectingURL);
        }
        // TODO Login.gov
    },
    authenticated: async (tokens) => {
        if (type === 'google') {
            return googleClient.authenticated(tokens);
        } else if (type === 'NIH') {
            return nihClient.authenticated(tokens);
        }
        // TODO Login.gov
    },
    logout: async(type, tokens) => {
        if (type === 'NIH') {
            return nihClient.logout(tokens);
        }
        // TODO Login.gov
    }
}

module.exports = oauth2Client;