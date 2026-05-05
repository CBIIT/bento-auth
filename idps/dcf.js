const {getDCFToken, dcfUserInfo, dcfLogout} = require("../services/dcf-auth");
const logger = require('winston');
const client = {
    login: async (code, redirectingURL) => {
        logger.debug(`DCF login attempt, redirectingURL: ${redirectingURL}`);
        const token = await getDCFToken(code, redirectingURL);
        const user = await dcfUserInfo(token);
        logger.info(`DCF login successful for user: ${user.email}`);
       return {name: user.username ? user.username: '', lastName: user.username ? user.username: '', email: user.email, tokens: token, idp: 'dcf'};
    },

    authenticated: async (tokens) => {
        try {
            if (!tokens) {
                logger.warn('DCF authentication check: no tokens found');
                return false
            }
            // If not passing, throw error
            await dcfUserInfo(tokens);
            logger.debug('DCF token validated successfully');
            return true;

        } catch (e) {
            logger.error(`DCF token validation failed: ${e.message}`);
        }
        return false;
    },
    logout: async(tokens) => {
        return await dcfLogout(tokens);
    }
}

module.exports = client;