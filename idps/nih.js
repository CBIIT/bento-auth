const {getNIHToken, nihUserInfo, nihLogout} = require("../services/nih-auth");
const neo4j = require("../data-management/neo4j-service");
const UserInfo = require("../model/user-info");

const NIH = "NIH";

const client = {
    login: async (code, redirectingURL) => {
        const token = await getNIHToken(code, redirectingURL);
        const user = await nihUserInfo(token);
        // inspect user registered already
        const dbUser = await neo4j.getMyUser({email: user.email, idp: NIH});
        const userInfo = (dbUser.firstName) ? new UserInfo(dbUser.firstName, dbUser.email, NIH) : new UserInfo(user.first_name, user.email, NIH);
        return {tokens : token, ...userInfo.getUserInfo()};
    },
    logout: async(tokens) => {
        return await nihLogout(tokens);
    }
}

module.exports = client;