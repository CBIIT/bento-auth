const { google } = require('googleapis');
const logger = require('winston');
const config = require('../config');
const {GOOGLE} = require("../constants/idp-constants");

let client = {
    login: async (code, redirectURL) => {
        logger.debug('Fence login attempt');
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
                logger.debug('Fence token validated successfully');
                return true;
            } else {
                logger.warn('Fence authentication check: no tokens found');
                return false;
            }

        } catch (e) {
           logger.error(`Fence token validation failed: ${e.message}`);
           return false;
        }
    }
}

module.exports = client;