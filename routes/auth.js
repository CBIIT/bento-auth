const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {logout} = require('../controllers/auth-api')
const {storeLoginEvent, storeLogoutEvent} = require("../neo4j/neo4j-operations");
const {formatVariables, formatMap} = require("../bento-event-logging/const/format-constants");
const {createToken, verifyToken} = require("../services/tokenizer");

/* Login */
/* Granting an authenticated token */
router.post(['/login', '/token-login'], async function (req, res) {
    try {
        const reqIDP = config.getIdpOrDefault(req.body['IDP']);
        const { name, lastName, tokens, email, idp } = await idpClient.login(req.body['code'], reqIDP, config.getUrlOrDefault(reqIDP, req.body['redirectUri']));
        const userInfo = formatVariables({
            email: email,
            IDP: idp,
            firstName: name,
            lastName: lastName
        }, ["IDP"], formatMap);

        if (!req.originalUrl.includes("/token-login")) {
            req.session.userInfo = userInfo
            req.session.tokens = tokens;
        }
        await storeLoginEvent(userInfo.email, userInfo.IDP);
        res.json({name, email, accessToken: await createToken(userInfo), "timeout": config.session_timeout / 1000});
    } catch (e) {
        if (e.code && parseInt(e.code)) {
            res.status(parseInt(e.code));
        } else if (e.statusCode && parseInt(e.statusCode)) {
            res.status(parseInt(e.statusCode));
        } else {
            res.status(500);
        }
        res.json({error: e.message});
    }
});

/* Logout */
router.post('/logout', async function (req, res, next) {
    try {
        const idp = config.getIdpOrDefault(req.body['IDP']);
        await idpClient.logout(idp, req.session.tokens);
        let userInfo = req.session.userInfo;
        await storeLogoutEvent(userInfo.email, userInfo.IDP);
        // Remove User Session
        return logout(req, res);
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
});

/* Authenticated */
// Return {status: true} or {status: false}
router.post('/authenticated', async (req, res, _) => {
    try {
        const auth = req.headers['authorization']
        const token = auth && auth.split(' ')[1];
        let status = false;
        if (token) status = await verifyToken(token);
        else {
            if (req.session.tokens) status = true;
        }
        res.status(200).send({ status });
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
});

module.exports = router;
