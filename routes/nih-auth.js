const express = require('express');
const router = express.Router();
const url = require('url');
const config = require('../config');
const nodeFetch = require("node-fetch");

module.exports = function (passport) {

    // TODO ADD Custom Redirect URL
    router.get(
        '/nih_external_login',
        (request, response, next) => {
            const urlParam = {
                client_id: config.nih.clientId,
                redirect_uri: "http://localhost:4010/profile",
                ...config.nih.params
            }
            const params = new URLSearchParams(urlParam).toString();
            response.redirect(`${config.nih.authorizeUrl}?${params}`);
        }
    );

    router.get(
        '/profile',
        (request, response, next) => {
            const queryObject = url.parse(request.url, true).query;
            response.redirect(`/?code=${queryObject.code}&type=nih`);
        }
    );

    router.get(
        '/nih_user',
        async (request, response, next) => {
            const queryObject = url.parse(request.url, true).query;
            const auth_code = queryObject.code;

            try {
                const token = await getToken(auth_code);
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
        const response = await nodeFetch(config.nih.userInfoUrl, {
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
        const response = await nodeFetch(config.nih.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code: auth_code,
                redirect_uri: "http://localhost:4010/profile",
                grant_type: "authorization_code",
                client_id: config.nih.clientId,
                client_secret: config.nih.clientSecret,
                scope: "openid email profile"
            })
        });
        const jsonResponse = await response.json();
        const token = jsonResponse.access_token;
        return token;
    }

    router.get('/nih_login', (req, res) => {
        res.send('<span>nih login failed</span>');
    });

    // TODO NIH LOGOUT
    router.get('/nih_logout', async (req, res) => {
        try {
            // TODO add custom redirect url
            const response = await nodeFetch(config.nih.logoutUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(config.nih.clientId + ':' + config.nih.clientSecret).toString('base64')
                },
                body: new URLSearchParams({
                    id_token: req.session.tokens,
                })
            });
            const jsonResponse = await response.json();
            console.log('jsonResponse' + jsonResponse);
            if (jsonResponse.session_status) {
                res.status(200).send({status: 'success'});
            } else throw 500;
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({error: e.message});
        }
    });

    return router;
}