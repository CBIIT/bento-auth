const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {getUserSessionData} = require("../data-management/data-interface");
const {logout} = require('../controllers/auth-api')

/* Login */
router.post('/login', async function(req, res, next) {

  const getIdpOrDefault = (idp) => { return (idp) ? idp : config.idp; };
  const getUrlOrDefault = (url) => { return (url) ? url : config.redirectUri; }
  try {
    const { name, tokens, email, idp } = await idpClient.login(req.body['code'], getIdpOrDefault(req.body['IDP']), getUrlOrDefault(req.body['redirectUri']));
    req.session.tokens = tokens;
    if (config.authorization_enabled) {
      await getUserSessionData(req.session, email, idp);
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


/* Authorized File ACL Value */
// Return {status: true} or {status: false}
// Calling this API will authenticate with file acl
router.post('/authorized', async function(req, res) {
  try {
    let status = false;
    if (req.session.tokens && req.session.userInfo && req.headers.acl) {
      status = idpClient.authorized(req.session.userInfo.acl, req.headers.acl);
    }
    return res.status(200).send({status: status});
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
