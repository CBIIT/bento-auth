const nodeFetch = require("node-fetch");
const config = require("../config");
async function getNIHToken(code, redirectURi) {
    const response = await nodeFetch(config.nih.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: code,
            redirect_uri: redirectURi,
            grant_type: "authorization_code",
            client_id: config.nih.CLIENT_ID,
            client_secret: config.nih.CLIENT_SECRET,
            scope: "openid email profile"
        })
    });
    const jsonResponse = await response.json();
    return jsonResponse.access_token;
}

async function nihLogout(tokens) {
    const result = await nodeFetch(config.nih.LOGOUT_URL, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(config.nih.CLIENT_ID + ':' + config.nih.CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
            id_token: tokens,
        })
    });
    return result;
}

async function nihUserInfo(accessToken) {
    const result = await nodeFetch(config.nih.USERINFO_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ` + accessToken
        }
    });
    return result.json();
}

module.exports = {
    getNIHToken,
    nihLogout,
    nihUserInfo
};