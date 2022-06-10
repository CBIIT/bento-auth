const { google } = require('googleapis');
const config = require('../config');

const oauth2Client = new google.auth.OAuth2(
    config.google.CLIENT_ID,
    config.google.CLIENT_SECRET,
    config.google.REDIRECT_URL
);

const oauth_tokens = {
    getToken: async (code) => {
        const result = await oauth2Client.getToken(code);
        return result.tokens;
    },
    verifyIdToken:  async (tokens) => {
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.google.CLIENT_ID
        });
        return ticket.getPayload();
    }
}

module.exports = oauth_tokens;