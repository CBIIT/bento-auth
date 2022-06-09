const express = require('express');
const router = express.Router();
const url = require('url');
const config = require('../config');
const nodeFetch = require("node-fetch");
const crypto = require("crypto");


function randomString(length) {
    return crypto.randomBytes(length).toString('hex'); // source: https://github.com/18F/fs-permit-platform/blob/c613a73ae320980e226d301d0b34881f9d954758/server/src/util.es6#L232-L237
}

module.exports = function () {

    // TODO ADD Custom Redirect URL
    router.get(
        '/gov_external_login',
        (request, response, next) => {
            const urlParam = {
                client_id: config.login_gov.clientId,
                redirect_uri: "http://localhost:4010/log_gov_profile",
                nonce: randomString(32),
                state: randomString(32),
                ...config.login_gov.params
            }
            const params = new URLSearchParams(urlParam).toString();
            response.redirect(`${config.login_gov.authorizeUrl}?${params}`);
        }
    );

    router.get(
        '/log_gov_profile',
        (request, response, next) => {
            const queryObject = url.parse(request.url, true).query;
            response.redirect(`/?code=${queryObject.code}&type=gov`);
        }
    );

    router.get(
        '/log_gov_user',
        async (request, response, next) => {
            const queryObject = url.parse(request.url, true).query;
            const auth_code = queryObject.code;
            const token = await getToken(auth_code);
            try {
                const user = await getUserInfo(token);
                request.session.tokens = token;
                response.send({ user });

            } catch (e) {
                console.log(e);
                response.status(500);
                response.json({error: e.message});
            }
        }
    );

    async function getUserInfo(accessToken) {
        const response = await nodeFetch(config.login_gov.userInfoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ` + accessToken
            }
        });
        const jsonResponse = await response.json();
        return jsonResponse;
    }

    async function getToken(auth_code) {
        // TODO add custom redirect url
        const response = await nodeFetch(config.login_gov.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code: auth_code,
                client_assertion: config.login_gov.codeAssertion,
                client_assertion_type: config.login_gov.codeAssertionType,
                grant_type: config.login_gov.grantType,
            })
        });
        const jsonResponse = await response.json();
        const token = jsonResponse.access_token;
        return token;
    }

    router.get('/gov_login_failed', (req, res) => {
        res.send('<span>login gov failed</span>');
    });

    router.get('/gov_logout', async (req, res) => {
        //TODO

        const response = await nodeFetch(config.login_gov.tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ` + accessToken
            },
            body: new URLSearchParams({
                id_token: req.session.tokens,
                client_assertion_type: config.login_gov.codeAssertionType,
                grant_type: config.login_gov.grantType,
            })
        });

        const params = new URLSearchParams(urlParam).toString();
        res.redirect(`${config.nih.authorizeUrl}?${params}`);
        res.send('<span>login gov failed</span>');
    });
    return router;
}