const googleClient = require('./google');
const nihClient = require('./nih');
const {isCaseInsensitiveEqual} = require("../util/string-util");
const neo4j = require("../data-management/neo4j-service");
const UserInfo = require("../model/user-info");

const oauth2Client = {
    login: async (code, idp, redirectingURL) => {
        // if google
        let result;
        if (isCaseInsensitiveEqual(idp, 'google')) {
            result = await googleClient.login(code);
        } else if (isCaseInsensitiveEqual(idp,'NIH')) {
            result = await nihClient.login(code, redirectingURL);
        }
        // inspect user registered already
        if (result) {
            const dbUser = await neo4j.getMyUser({email: result.email, idp: result.idp});
            return (dbUser.firstName) ? {tokens: result.tokens, ...new UserInfo(dbUser.firstName, dbUser.email, idp).getUserInfo()} : result;
        }
    },
    logout: async(idp, tokens) => {
        if (isCaseInsensitiveEqual(idp,'NIH')) {
            return await nihClient.logout(tokens);
        }
    }
}

module.exports = oauth2Client;