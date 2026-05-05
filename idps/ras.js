const {
    getRASTokenBundle,
    refreshRASTokenBundle,
    rasUserInfo,
    validateRASPassport
} = require("../services/ras-auth");
const logger = require("winston");

function isAuthFailure(error) {
    return error?.status === 401 || /401|invalid[_ ]token/i.test(error?.message || "");
}

const client = {
    login: async (code, redirectingURL) => {
        logger.debug("RAS login attempt");
        const tokens = await getRASTokenBundle(code, redirectingURL);
        const user = await rasUserInfo(tokens.accessToken);
        const passportJWT = user?.passport_jwt_v11;
        const isValid = await validateRASPassport(passportJWT);

        if (!isValid) {
            throw new Error("RAS passport validation failed");
        }

        logger.info(`RAS login successful for user: ${user.email}`);
        return {
            name: user.first_name || "",
            lastName: user.last_name || "",
            email: user.email,
            idp: "ras",
            tokens,
            passportJWT,
            userInfo: user
        };
    },

    authenticated: async (tokens) => {
        try {
            if (!tokens?.accessToken) {
                logger.warn("RAS authentication check: no token bundle found");
                return { isAuthenticated: false, tokens };
            }

            const user = await rasUserInfo(tokens.accessToken);
            const isValid = await validateRASPassport(user?.passport_jwt_v11);
            return { isAuthenticated: isValid, tokens };
        } catch (error) {
            if (!isAuthFailure(error) || !tokens?.refreshToken) {
                logger.error(`RAS authentication check failed: ${error.message}`);
                return { isAuthenticated: false, tokens };
            }

            try {
                const refreshedTokens = await refreshRASTokenBundle(tokens.refreshToken);
                const user = await rasUserInfo(refreshedTokens.accessToken);
                const isValid = await validateRASPassport(user?.passport_jwt_v11);
                return { isAuthenticated: isValid, tokens: refreshedTokens };
            } catch (refreshError) {
                logger.error(`RAS refresh authentication failed: ${refreshError.message}`);
                return { isAuthenticated: false, tokens };
            }
        }
    },

    logout: async () => true
};

module.exports = client;