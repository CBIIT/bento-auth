const {getNIHToken, nihUserInfo, nihLogout} = require("../services/nih-auth");
const UserInfo = require("../model/user-info");
const {getUserInfo} = require("../services/user");

const NIH = "NIH";

const client = {
    login: async (code, redirectingURL) => {
        const token = await getNIHToken(code, redirectingURL);
        const user = await nihUserInfo(token);
        // inspect user registered already. If not, store user in database
        const userInfo = await getUserInfo(new UserInfo(user.first_name, user.last_name, user.email, NIH));
        return {tokens : token, ...userInfo.getLoginUser()};
    },
    logout: async(tokens) => {
        return await nihLogout(tokens);
    }
}

module.exports = client;