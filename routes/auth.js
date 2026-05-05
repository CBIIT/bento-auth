const express = require('express');
const router = express.Router();
const logger = require('winston');
const idpClient = require('../idps');
const config = require('../config');
const {logout} = require('../controllers/auth-api')
const {formatVariables, formatMap} = require("../bento-event-logging/const/format-constants");
const {TokenService} = require("../services/token-service");
const {AuthenticationService} = require("../services/authenticatation-service");
const {EventService} = require("../neo4j/event-service");
const {UserService} = require("../services/user-service");
const {CleaningService} = require("../services/clean-events.js")
const { checkTokenAndClean } = require("../services/clean-events.js")
const mySQLOps = require("../services/mySQL/mySQL-operations.js");
const { refreshRASTokenBundle, rasUserInfo, validateRASPassport } = require("../services/ras-auth");

let eventService = null;
let cleaningService = null;
let userService = null;
let tokenService = null;

if (config.database_type.toUpperCase() == 'MYSQL') {
    
    const connectionParams = {
            userName: config.mysql_user,
            password: config.mysql_password,
            url: config.mysql_host,
            database: config.mysql_database
    }

    eventService = new EventService(connectionParams);
    cleaningService = new CleaningService(config.token_secret);
    userService = new UserService(mySQLOps);
    tokenService = new TokenService(config.token_secret,userService);
    authService = new AuthenticationService(tokenService, userService);
}
else {
    throw new Error("Invalid database_type")
}

/* Login */
/* Granting an authenticated token */
router.post('/login', async function (req, res) {
    logger.debug(`[${req.method}] ${req.path} - Login attempt with IDP: ${req.body['IDP']}`);
    try {
        logger.info('Processing login request');
        const reqIDP = config.getIdpOrDefault(req.body['IDP']);
        const { name, lastName, tokens, email, idp, passportJWT } = await idpClient.login(req.body['code'], reqIDP, config.getUrlOrDefault(reqIDP, req.body['redirectUri']));
        req.session.userInfo = {
            email: email,
            IDP: idp,
            firstName: name,
            lastName: lastName,
            tokens: tokens,
            passport: passportJWT
        };
        req.session.userInfo = formatVariables(req.session.userInfo, ["IDP"], formatMap);
       
        try{
            if (!req.session?.userInfo || !req.session.userInfo?.firstName){
                logger.warn("Login: userInfo missing or firstName not set"); 
                return 
            }
            await eventService.storeLoginEvent(req.session.userInfo.firstName,req.session.userInfo.email,req.session.userInfo.IDP,config.database_type);
            logger.info(`Login successful for user: ${email}`);
        }   
        catch (err){
            logger.error(`Failed to store login event: ${err.message}`);
        }

        if (passportJWT && typeof idp === 'string' && idp.toLowerCase() === 'ras') {
            await userService.persistUserPassportJWT({
                email,
                IDP: idp,
                passportJWT
            });
        }

        req.session.tokens = tokens;
        res.json({name, email, "timeout": config.session_timeout / 1000});
    } catch (e) {
        const statusCode = e.code && parseInt(e.code) ? parseInt(e.code) : (e.statusCode && parseInt(e.statusCode) ? parseInt(e.statusCode) : 500);
        logger.error(`Login failed with status ${statusCode}: ${e.message}`);
        res.status(statusCode);
        res.json({error: e.message});
    }
});

/* Logout */
router.post('/logout', async function (req, res, next) {
    logger.debug(`[${req.method}] ${req.path} - Logout attempt with IDP: ${req.body['IDP']}`);
    try {
        logger.info('Processing logout request');
        const idp = config.getIdpOrDefault(req.body['IDP']);
        await idpClient.logout(idp, req.session.tokens);
        if (!req.session?.userInfo){
            logger.warn("Logout: userInfo not found in session"); 
            return logout(req, res);
        }
        await eventService.storeLogoutEvent(req.session.userInfo.firstName,req.session.userInfo.email,req.session.userInfo.IDP,config.database_type);
        logger.info(`Logout successful for user: ${req.session.userInfo.email}`);
        // Remove User Session
        return logout(req, res);
         } catch (e) {
            logger.error(`Logout failed: ${e.message}`);
            res.status(500).json({errors: e});
        }
 
});

/* Authenticated */
// Return {status: true} or {status: false}
//Calling this API will refresh the session
router.post('/authenticated', async function (req, res) {
    logger.debug(`[${req.method}] ${req.path} - Checking authentication status`);
    try {
        if (!req?.session?.userInfo || !req?.session?.tokens) {
            logger.info('Authentication check: false');
            return res.status(200).send({ status : false });
        }

        const authResult = await idpClient.authenticated(req.session.userInfo, req.session.tokens);
        const isAuthenticated = typeof authResult === 'object'
            ? Boolean(authResult.isAuthenticated)
            : Boolean(authResult);

        if (typeof authResult === 'object' && authResult.tokens) {
            req.session.tokens = authResult.tokens;
        }

        if (!isAuthenticated) {
            req.session.tokens = null;
        }

        logger.info(`Authentication check: ${isAuthenticated}`);
        res.status(200).send({ status : isAuthenticated });
    } catch (e) {
        logger.error(`Authentication check failed: ${e.message}`);
        res.status(500).json({errors: e});
    }
});

/* Refresh Token */
// Refresh RAS tokens using refresh token from session
router.post('/refresh', async function (req, res) {
    logger.debug(`[${req.method}] ${req.path} - Token refresh attempt`);
    try {
        const sessionId = req.body?.session_id || req.sessionID;
        
        if (!sessionId) {
            logger.warn('Token refresh: no session_id provided');
            return res.status(400).json({ error: 'session_id is required' });
        }

        // Get current tokens from session
        let tokens = req.session?.tokens;
        
        // If not in current session, try to fetch from database
        if (!tokens) {
            tokens = await mySQLOps.getSessionTokens(sessionId);
        }
        
        if (!tokens || !tokens.refreshToken) {
            logger.warn(`Token refresh: no refresh token found for session ${sessionId}`);
            return res.status(401).json({ error: 'No refresh token available' });
        }

        logger.info(`Token refresh initiated for session: ${sessionId}`);

        // Refresh the token bundle
        const newTokens = await refreshRASTokenBundle(tokens.refreshToken);
        logger.debug('Token refresh successful from RAS');

        // Get user info with new access token
        const userInfo = await rasUserInfo(newTokens.accessToken);
        const passportJWT = userInfo?.passport_jwt_v11;

        // Validate passport
        const isValid = await validateRASPassport(passportJWT);
        if (!isValid) {
            logger.warn('Token refresh: passport validation failed');
            return res.status(401).json({ error: 'Passport validation failed' });
        }

        // Update session tokens in memory
        if (req.session) {
            req.session.tokens = newTokens;
        }
        
        // Update tokens in database
        const updateSuccess = await mySQLOps.updateSessionTokens(sessionId, newTokens);
        if (!updateSuccess) {
            logger.error(`Token refresh: failed to update session ${sessionId} in database`);
            return res.status(500).json({ error: 'Failed to persist updated tokens' });
        }
        
        logger.debug(`Session tokens updated for session: ${sessionId}`);

        // Update passport if user is RAS
        if (passportJWT && req.session?.userInfo?.IDP?.toLowerCase() === 'ras') {
            await userService.persistUserPassportJWT({
                email: req.session.userInfo.email,
                IDP: req.session.userInfo.IDP,
                passportJWT
            });
            logger.debug(`Passport updated for user: ${req.session.userInfo.email}`);
        }

        logger.info(`Token refresh successful for session: ${sessionId}`);
        res.status(200).json({
            status: 'success',
            email: req.session.userInfo?.email,
            expires_at: newTokens.expiresAt
        });
    } catch (e) {
        logger.error(`Token refresh failed: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});


router.post('/cleanUp', async function (req, res) {
    logger.debug(`[${req.method}] ${req.path} - Cleanup tokens`);
    try {
        logger.info('Processing token cleanup');
        let response = await checkTokenAndClean(req,res);
        logger.info(`Cleanup status: ${response}`);
        res.status(200).send({ status : response });
    } catch (e) {
        logger.error(`Cleanup failed: ${e.message}`);
        res.status(500).json({errors: e});
    }
});

/* Get User Info */
// Returns the authenticated user's stored GA4GH Passport JWT
router.get('/userInfo', async function (req, res) {
    logger.debug(`[${req.method}] ${req.path} - User info retrieval request`);
    try {
        // Extract session ID from Express session
        const sessionId = req.sessionID;
        
        if (!sessionId) {
            logger.info('User info retrieval: session_id not provided');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Retrieve passport using UserService
        const passportJWT = await userService.getPassportBySession(sessionId);

        if (!passportJWT) {
            logger.debug(`User info retrieval: passport not found for session ${sessionId}`);
            return res.status(404).json({ error: 'Passport not found' });
        }

        logger.info(`User info retrieval successful for session: ${sessionId}`);
        res.status(200).json({ passportJWT });
    } catch (error) {
        logger.error(`User info retrieval failed: ${error.message}`);
        res.status(500).json({ error: 'Failed to retrieve passport' });
    }
});

module.exports = router;
