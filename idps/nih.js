const {getNIHToken, nihUserInfo, nihLogout, getIDP} = require("../services/nih-auth");
const logger = require('winston');
const client = {
    login: async (code, redirectingURL) => {
        logger.debug('NIH login attempt');
        const token = await getNIHToken(code, redirectingURL);
        const user = await nihUserInfo(token);
        // use a preferred name or email as identity
        const idp = getIDP(user['preferred_username'] ? user['preferred_username'] : user.email);
        // Leave as blank if no name exits
        logger.info(`NIH login successful for user: ${user.email}`);
        return {name: user.first_name ? user.first_name: '', lastName: user.last_name ? user.last_name: '', email: user.email, tokens: token, idp: idp};
    },
    authenticated: async (tokens) => {
        try {
            if (!tokens) {
                logger.warn('NIH authentication check: no tokens found');
                return false
            }
            // If not passing, throw error
            await nihUserInfo(tokens);
            logger.debug('NIH token validated successfully');
            return true;

        } catch (e) {
            logger.error(`NIH token validation failed: ${e.message}`);
        }
        return false;
    },
    logout: async(tokens) => {
        return await nihLogout(tokens);
    }
}

module.exports = client;