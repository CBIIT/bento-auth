const googleClient = require('./google');
const nihClient = require('./nih');
const {isCaseInsensitiveEqual} = require("../util/string-util");

const oauth2Client = {
    login: async (code, idp, redirectingURL) => {
        // if google
        if (isCaseInsensitiveEqual(idp, 'google')) {
            return await googleClient.login(code);
        } else if (isCaseInsensitiveEqual(idp,'NIH')) {
            return await nihClient.login(code, redirectingURL);
        }
    },
    logout: async(idp, tokens) => {
        if (isCaseInsensitiveEqual(idp,'NIH')) {
            return await nihClient.logout(tokens);
        }
    }
}

module.exports = oauth2Client;