const {getNIHToken, nihUserInfo, nihLogout} = require("../services/nih-auth");

const client = {
    login: async (code, redirectingURL) => {
        const token = await getNIHToken(code, redirectingURL);
        const user = await nihUserInfo(token);
        return {name: user.first_name, email: user.email, tokens: token , idp: "NIH"};
    },
    logout: async(tokens) => {
        return await nihLogout(tokens);
    }
}

module.exports = client;