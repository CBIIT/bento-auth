const { google } = require('googleapis');
const config = require('../config');
const {GOOGLE} = require("../constants/idp-constants");

let client = {
    login: async (code, redirectURL) => {
        this.oauth2Client = new google.auth.OAuth2(
            config.google.CLIENT_ID,
            config.google.CLIENT_SECRET,
            redirectURL
        );
        const {tokens} = await this.oauth2Client.getToken(code)
        const ticket = await this.oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.google.CLIENT_ID
        });
        const payload = ticket.getPayload();
        const name = payload.given_name;
        const email = payload.email;
        return { name, lastName: payload.family_name ? payload.family_name : '', tokens, email, idp: GOOGLE};
    },
    authenticated: async (tokens) => {
        try {
            if (tokens) {
                const ticket = await this.oauth2Client.verifyIdToken({
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