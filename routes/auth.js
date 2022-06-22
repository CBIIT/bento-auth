const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const {getUserSessionData} = require("../data-management/data-interface");
const axios = require('axios');
const {logout} = require('../controllers/auth-api')
const {withAsync} = require("../middleware/middlewares");

/* Login */
router.post('/login', async function(req, res, next) {
  function getUserSession(session) {
    return {name: session.userInfo.name, email: session.userInfo.email, tokens: session.tokens}
  }
  try {
    const { name, tokens, email } = (req.session && req.session.userInfo) ? getUserSession(req.session) : await idpClient.login(req.body['code'], req.body['type'], req.body['redirectUri']);
    req.session.tokens = tokens;
    // Set User Session Including ACL property
    await getUserSessionData(req.session, email);
    res.json({ name });
  } catch (e) {
    console.log(e);
    if (e.code && parseInt(e.code)) {
      res.status(e.code);
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
    return res.status(200).send({status: status});
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
