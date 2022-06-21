const express = require('express');
const router = express.Router();
const url = require('url');
const config = require('../config');

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

    router.get('/nih_login', (req, res) => {
        res.send('<span>nih login failed</span>');
    });

    return router;
}