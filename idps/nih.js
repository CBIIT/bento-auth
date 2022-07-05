const {getNIHToken, nihUserInfo, nihLogout} = require("../services/nih-auth");
const UserInfoBuilder = require("../model/user-info");
const client = {
    login: async (code, redirectingURL) => {
        const token = await getNIHToken(code, redirectingURL);
        const user = await nihUserInfo(token);
        const userInfo = UserInfoBuilder.createUser(user.first_name, user.email);
        return {tokens: token, ...userInfo.getUserInfo()};
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