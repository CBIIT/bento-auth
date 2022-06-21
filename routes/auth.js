const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {getUserSessionData} = require("../data-management/data-interface");
const axios = require('axios');

/* Login */
router.post('/login', async function(req, res, next) {
  function getUserSession(session) {
    return {name: session.userInfo.name, email: session.userInfo.email, tokens: session.tokens}
  }
  try {
    const { name, tokens, email } = (req.session && req.session.userInfo) ? getUserSession(req.session) : await idpClient.login(req.body['code'], req.body['type'], req.body['redirectUri']);
    // TODO temporary acl values
    // @Austin TODO USER SESSION
    req.session.userInfo = {idp: req.body['type'], email: email, acl: ["Open"]}
    req.session.tokens = tokens;

    // TODO Add ACL SESSION
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
    if (req.session) {
      req.session.destroy( (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send({errors: err});
        }
        res.status(200).send({status: 'success'});
      });
    } else {
      return res.status(200).send({status: 'success'});
    }
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
router.get('/files/:fileId', async function(req, res, next) {
  const fileId = req.params.fileId;
  const result = await axios.get('http://localhost:3000/api/files/' + fileId, {
    headers: {
      Cookie: req.headers.cookie
    }
  });
  res.json(result.data);
});

module.exports = router;
