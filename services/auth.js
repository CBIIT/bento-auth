const nodeFetch = require("node-fetch");
const config = require("../config");
async function getNIHToken(req) {
    const auth_code  = req.body['code'];
    const redirectUri  = req.body['redirectUri'];
    const response = await nodeFetch(config.nih.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: auth_code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            client_id: config.nih.CLIENT_ID,
            client_secret: config.nih.CLIENT_SECRET,
            scope: "openid email profile"
        })
    });
    const jsonResponse = await response.json();
    return jsonResponse.access_token;
}

async function nihLogout(req) {
    const result = await nodeFetch(config.nih.LOGOUT_URL, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(config.nih.CLIENT_ID + ':' + config.nih.CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
            id_token: req.session.tokens,
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
    return result;
}

module.exports = {
    getNIHToken,
    nihLogout,
    nihUserInfo
};