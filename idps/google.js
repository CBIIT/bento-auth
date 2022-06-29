const { google } = require('googleapis');
const config = require('../config');
const UserInfo = require("../model/user-info");
const {getUserInfo} = require("../services/user");

const GOOGLE = 'GOOGLE';
const oauth2Client = new google.auth.OAuth2(
    config.google.CLIENT_ID,
    config.google.CLIENT_SECRET,
    config.google.REDIRECT_URL
);

 let client = {
    login: async (code) => {
        const {tokens} = await oauth2Client.getToken(code)
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.client_id
        });
        const payload = ticket.getPayload();
        // inspect user registered already. If not, store user in database
        const userInfo = await getUserInfo(new UserInfo(payload.given_name, payload.family_name, payload.email, GOOGLE));
        return {tokens, ...userInfo.getLoginUser()};
    }
}

module.exports = client;