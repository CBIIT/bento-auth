const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {logout} = require('../controllers/auth-api')
const {formatVariables, formatMap} = require("../bento-event-logging/const/format-constants");
const {TokenService} = require("../services/token-service");
const {AuthenticationService} = require("../services/authenticatation-service");
const {EventService} = require("../neo4j/event-service");
const {Neo4jDriver} = require("../neo4j/neo4j");
const {Neo4jService} = require("../neo4j/neo4j-service");
const {UserService} = require("../services/user-service");
//services
const neo4j = new Neo4jDriver(config.neo4j_uri, config.neo4j_user, config.neo4j_password);
const neo4jService = new Neo4jService(neo4j);
const eventService = new EventService(neo4j);
const tokenService = new TokenService(config.token_secret);
const userService = new UserService(neo4jService);
const authService = new AuthenticationService(tokenService, userService);

/* Login */
/* Granting an authenticated token */
router.post('/login', async function (req, res) {
    try {
        const reqIDP = config.getIdpOrDefault(req.body['IDP']);
        const { name, lastName, tokens, email, idp } = await idpClient.login(req.body['code'], reqIDP, config.getUrlOrDefault(reqIDP, req.body['redirectUri']));
        req.session.userInfo = {
            email: email,
            IDP: idp,
            firstName: name,
            lastName: lastName
        };
        req.session.userInfo = formatVariables(req.session.userInfo, ["IDP"], formatMap);
        await eventService.storeLoginEvent(req.session.userInfo.email, req.session.userInfo.IDP);
        req.session.tokens = tokens;
        res.json({name, email, "timeout": config.session_timeout / 1000});
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
        await eventService.storeLogoutEvent(userInfo.email, userInfo.IDP);
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
router.post('/authenticated', async function (req, res) {
    try {
        const status = await authService.authenticate(req);
        res.status(200).send({ status });
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
});

module.exports = router;
