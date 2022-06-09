const { google } = require('googleapis');
const config = require('../config');

const oauth2Client = new google.auth.OAuth2(
    config.client_id,
    config.client_secret,
    config.redirect_url
);

const oauth_tokens = {
    getToken: async (code) => {
        const result = await oauth2Client.getToken(code);
        return result.tokens;
    },
    verifyIdToken:  async (tokens) => {
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.client_id
        });
        return ticket.getPayload();
    }
}

module.exports = oauth_tokens;