const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {logout} = require('../controllers/auth-api')
const {storeLoginEvent, storeLogoutEvent} = require("../neo4j/neo4j-operations");

/* Login */
router.post('/login', async function (req, res) {
    try {
        const reqIDP = config.getIdpOrDefault(req.body['IDP']);
        const { name, lastName, tokens, email, idp } = await idpClient.login(req.body['code'], reqIDP, config.getUrlOrDefault(reqIDP, req.body['redirectUri']));
        req.session.userInfo = {
            email: email,
            idp: idp,
            firstName: name,
            lastName: lastName
        };
        await storeLoginEvent(email, idp);
        req.session.tokens = tokens;
        res.json({name, email, "timeout": config.session_timeout / 1000});
    } catch (e) {
        if (e.code && parseInt(e.code)) {
            res.status(e.code);
        } else if (e.statusCode && parseInt(e.statusCode)) {
            res.status(e.statusCode);
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
        await storeLogoutEvent(userInfo.email, userInfo.idp);
        // Remove User Session
        return logout(req, res);
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
});

/* Authenticated */
// Return {status: true} or {status: false}
// Calling this API will refresh the session
router.post('/authenticated', async function (req, res, next) {
    try {
        if (req.session.tokens) {
            return res.status(200).send({status: true});
        } else {
            return res.status(200).send({status: false});
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
});


/* GET ping-ping for health checking. */
router.get('/ping', function (req, res, next) {
    res.send(`pong`);
});

/* GET version for health checking and version checking. */
router.get('/version', function (req, res, next) {
    res.json({
        version: config.version, date: config.date
    });
});

module.exports = router;
