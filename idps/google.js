const { google } = require('googleapis');
const config = require('../config');
const neo4j = require("../data-management/neo4j-service");
const UserInfo = require("../model/user-info");

const GOOGLE = 'GOOGLE';
const oauth2Client = new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    config.redirect_url
);

 let client = {
    login: async (code) => {
        const {tokens} = await oauth2Client.getToken(code)
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.client_id
        });
        const payload = ticket.getPayload();
        // inspect user registered already
        const dbUser = await neo4j.getMyUser({email: payload.email, idp: GOOGLE});
        const userInfo = (dbUser.firstName) ? new UserInfo(dbUser.firstName, dbUser.email, GOOGLE) : new UserInfo(payload.given_name, payload.email, GOOGLE);
        return {tokens, ...userInfo.getUserInfo()};
    }
}

module.exports = client;