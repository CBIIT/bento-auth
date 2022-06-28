const { google } = require('googleapis');
const config = require('../config');


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
        const name = payload.given_name;
        const email = payload.email;
        const idp = "GOOGLE";
        return { name, tokens, email, idp };
    }
}

module.exports = client;