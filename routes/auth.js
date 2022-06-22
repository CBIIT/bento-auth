const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const {getUserSessionData} = require("../data-management/data-interface");
const axios = require('axios');
const {logout} = require('../controllers/auth-api')
const {withAsync} = require("../middleware/middlewares");
const config = require("../config");
function getUserSession(session) {
  return {name: session.userInfo.name, email: session.userInfo.email, tokens: session.tokens}
}
/* Login */
router.post('/login', async function(req, res, next) {
  try {
    const { name, tokens, email } = (req.session.userInfo && req.session.userInfo.email) ? getUserSession(req.session) : await idpClient.login(req.body['code'], req.body['type'], req.body['redirectUri']);
    req.session.tokens = tokens;
    // Set User Session Including ACL property
    if (config.authorization_enabled) {
      await getUserSessionData(req.session, email)
    }
    res.json({ name, email });
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
    await idpClient.logout(req.body['type'], req.session.tokens);
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
    let status = false;
    if (req.session.tokens && req.session.userInfo && req.headers.acl) {
      status = await idpClient.authenticated(req.session.userInfo, req.session.tokens,req.headers.acl);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({errors: e});
  }
});

/* TODO Temporary redirect file download request to avoid CORS issue */
router.get('/files/:fileId', withAsync(async function(req, res, next) {
  const fileId = req.params.fileId;
  const result = await axios.get('http://localhost:3000/api/files/' + fileId, {
    headers: {
      Cookie: req.headers.cookie
    }
  });
  res.json(result.data);
}));

module.exports = router;
