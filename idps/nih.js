const {getNIHToken, nihUserInfo, nihLogout} = require("../services/auth");

const client = {
    login: async (code, redirectingURL) => {
        const token = await getNIHToken(code, redirectingURL);
        const user = await this.userInfo(token);
        return {user: user, tokens: token};
    },
    userInfo: async (tokens) => {
        // @Austin
        // TODO Database access logic after login success
        const response = await nihUserInfo(tokens);
        return await response.json();
    },
    authenticated: async (tokens) => {
        try {
            if (!tokens) {
                console.log('No tokens found!');
                return false
            }
            await this.userInfo(tokens);
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