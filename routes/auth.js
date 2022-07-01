const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {logout} = require('../controllers/auth-api')
const fetch = require("node-fetch");

/* Login */
router.post('/login', async function (req, res) {
    try {
        const idp = config.getIdpOrDefault(req.body['IDP']);
        const { name, tokens, email } = await idpClient.login(req.body['code'], idp, config.getUrlOrDefault(idp, req.body['redirectUri']));
        req.session.tokens = tokens;
        if (config.authorization_enabled) {
            try {
                let response = await fetch(config.authorization_url+'/api/users/graphql', {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                        'email': email,
                        'idp': req.body['IDP']
                    }, body: JSON.stringify({query: '{getMyUser{role}}'})
                });
                let result = await response.json();
                if (result && result.data && result.data.getMyUser && result.data.getMyUser.role) {
                    let role = result.data.getMyUser.role;
                    req.session.userInfo = {name, email, idp: req.body['IDP'], role};
                    res.json({name, email, role});
                } else if (result && result.errors && result.errors[0] && result.errors[0].error) {
                    let error = result.errors[0].error;
                    req.session.userInfo = {name, email, idp: req.body['IDP'], role: 'None'};
                    res.json({name, email, error});
                } else {
                    throw new Error("No response");
                }
            } catch (err) {
                let error = 'Unable to query role: '+err.message;
                req.session.userInfo = {name, email, idp: req.body['IDP'], role: "None"};
                res.json({name, email, error});
            }
        } else {
            req.session.userInfo = {name, email, idp: req.body['IDP'], role: "None"}
            res.json({name, email});
        }
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
        await idpClient.logout(req.body['IDP'], req.session.tokens);
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
