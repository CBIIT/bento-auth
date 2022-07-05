const { google } = require('googleapis');
const config = require('../config');
const UserInfoBuilder = require("../model/user-info");

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
            audience: config.google.CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userInfo = UserInfoBuilder.createUser(payload.given_name, payload.email);
        return {tokens, ...userInfo.getUserInfo()};
    },
    authenticated: async (tokens) => {
        try {
            if (tokens) {
                const ticket = await oauth2Client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: config.google.CLIENT_ID
                });
                const payload = ticket.getPayload();
                return true;
            } else {
                console.log('No tokens found!');
                return false;
            }

        } catch (e) {
           console.log(e);
           return false;
        }
    }
}

module.exports = client;