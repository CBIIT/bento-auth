const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {getUserSessionData} = require("../data-management/data-interface");
const {logout} = require('../controllers/auth-api')
const IDP = require("../model/idp");

/* Login */
router.post('/login', async function(req, res, next) {

  try {
    const idp = IDP.createIDP(req.body['IDP'], req.body['redirectUri']);
    const { name, tokens, email } = await idpClient.login(req.body['code'], idp.getType(), idp.getUrl());
    req.session.tokens = tokens;
    if (config.authorization_enabled) {
      await getUserSessionData(req.session, email, idp.getType())
      let role =  req.session.userInfo.role;
      res.json({name, email, role});
    }
    else{
      res.json({ name, email});
    }
  } catch (e) {
    console.log(e);
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
router.post('/logout', async function(req, res, next) {
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
router.post('/authenticated', async function(req, res, next) {
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
router.get('/ping', function(req, res, next) {
  res.send(`pong`);
});

/* GET version for health checking and version checking. */
router.get('/version', function(req, res, next) {
  res.json({
    version: config.version,
    date: config.date
  });
});

module.exports = router;
