const { google } = require('googleapis');
const config = require('../config');


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
        const name = payload.given_name;
        const email = payload.email;
        return { name, tokens, email, idp: "GOOGLE" };
    }
}

module.exports = client;