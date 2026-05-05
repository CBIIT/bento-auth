const nodeFetch = require("node-fetch");
const config = require("../config");

const client = config.ras;

function normalizeTokenResponse(jsonResponse) {
    const expiresInMs = (jsonResponse.expires_in || 0) * 1000;
    const skewMs = 60 * 1000;
    return {
        accessToken: jsonResponse.access_token,
        refreshToken: jsonResponse.refresh_token,
        idToken: jsonResponse.id_token,
        tokenType: jsonResponse.token_type,
        scope: jsonResponse.scope,
        expiresAt: Date.now() + Math.max(expiresInMs - skewMs, 0)
    };
}

async function getRASTokenBundle(code, redirectURI) {
    const response = await nodeFetch(client.TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectURI,
            client_id: client.CLIENT_ID,
            client_secret: client.CLIENT_SECRET,
            scope: client.SCOPE
        })
    });
    const jsonResponse = await response.json();
    if (response.status !== 200) {
        const error = new Error("RAS token exchange failed");
        error.status = response.status;
        throw error;
    }
    return normalizeTokenResponse(jsonResponse);
}

async function refreshRASTokenBundle(refreshToken) {
    const response = await nodeFetch(client.TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: client.CLIENT_ID,
            client_secret: client.CLIENT_SECRET
        })
    });
    const jsonResponse = await response.json();
    if (response.status !== 200) {
        const error = new Error("RAS refresh failed");
        error.status = response.status;
        error.oauthError = jsonResponse?.error;
        throw error;
    }
    return normalizeTokenResponse(jsonResponse);
}

async function rasUserInfo(accessToken) {
    const result = await nodeFetch(client.USERINFO_URL, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    if (result.status !== 200) {
        const error = new Error("RAS userinfo failed");
        error.status = result.status;
        throw error;
    }
    return result.json();
}

async function validateRASPassport(passportJwt) {
    const result = await nodeFetch(client.VALIDATE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${passportJwt}`
        }
    });
    const payload = await result.text();
    return result.status === 200 && payload.trim() === "Valid";
}

module.exports = {
    getRASTokenBundle,
    refreshRASTokenBundle,
    rasUserInfo,
    validateRASPassport
};