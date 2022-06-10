const express = require('express');
const router = express.Router();
const url = require('url');
const config = require('../config');
const nodeFetch = require("node-fetch");
const {userInfo} = require("../controllers/auth-api");

module.exports = ()=> {

    // TODO ADD Custom Redirect URL
    router.get(
        '/nih_external_login',
        (request, response) => {
            const urlParam = {
                client_id: config.nih.CLIENT_ID,
                redirect_uri: "http://localhost:4010/profile",
                response_type: "code",
                scope: config.nih.SCOPE
            }
            // Optional parameter; to force re-authorization event when a current session is active
            if (config.nih.PROMPT) urlParam.prompt = config.nih.PROMPT;
            const params = new URLSearchParams(urlParam).toString();
            response.redirect(`${config.nih.AUTHORIZE_URL}?${params}`);
        }
    );

    router.get(
        '/profile',
        (request, response) => {
            const queryObject = url.parse(request.url, true).query;
            response.redirect(`/?code=${queryObject.code}&type=nih`);
        }
    );

    router.get(
        '/nih_user',
        async (request, response) => {
            const queryObject = url.parse(request.url, true).query;
            const auth_code = queryObject.code;
            try {
                const token = request.session.tokens ? request.session.tokens : await getToken(auth_code);
                const user = await userInfo(token);
                request.session.tokens = token;
                response.send({ user });
            } catch (e) {
                console.log(e);
                response.status(500);
                response.json({error: e.message});
            }
        }
    );

    async function getToken(auth_code) {

        // TODO add custom redirect url
        const response = await nodeFetch(config.nih.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                code: auth_code,
                redirect_uri: "http://localhost:4010/profile",
                grant_type: "authorization_code",
                client_id: config.nih.CLIENT_ID,
                client_secret: config.nih.CLIENT_SECRET,
                scope: "openid email profile"
            })
        });
        const jsonResponse = await response.json();
        const token = jsonResponse.access_token;
        return token;
    }

    router.get('/nih_login', (req, res) => {
        res.send('<span>nih lib failed</span>');
    });

    // TODO NIH LOGOUT
    router.get('/nih_logout', async (req, res) => {
        try {
            // TODO add custom redirect url
            const response = await nodeFetch(config.nih.LOGOUT_URL, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(config.nih.CLIENT_ID + ':' + config.nih.CLIENT_SECRET).toString('base64')
                },
                body: new URLSearchParams({
                    id_token: req.session.tokens,
                })
            });
            const jsonResponse = await response.json();
            console.log('jsonResponse' + jsonResponse);
            if (jsonResponse.session_status) {
                // TODO add logout module
                if (req.session) {
                    req.session.destroy( (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).send({errors: err});
                        }
                        res.status(200).send({status: 'success'});
                    });
                } else {
                    return res.status(200).send({status: 'success'});
                }
            } else throw 500;
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({error: e.message});
        }
    });

    return router;
}