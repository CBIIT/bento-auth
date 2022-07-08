const {getNIHToken, nihUserInfo, nihLogout} = require("../services/nih-auth");
const {NIH, LOGIN_GOV} = require("../constants/idp-constants");
// if a preferred name field exists, it is login.gov.
const getIDP = (user)=> {
    return user['preferred_username'] ? LOGIN_GOV : NIH;
}

const client = {
    login: async (code, redirectingURL) => {
        const token = await getNIHToken(code, redirectingURL);
        const user = await nihUserInfo(token);
        // Leave as blank if no name exits
        return {name: user.first_name ? user.first_name: '', email: user.email, tokens: token, idp: getIDP(user)};
    },
    authenticated: async (tokens) => {
        try {
            if (!tokens) {
                console.log('No tokens found!');
                return false
            }
            // If not passing, throw error
            await nihUserInfo(tokens);
            return true;

        } catch (e) {
            console.log(e);
        }
        return false;
    },
    logout: async(tokens) => {
        return await nihLogout(tokens);
    }
}

module.exports = client;