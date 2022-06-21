const express = require('express');
const router = express.Router();
const idpClient = require('../idps');
const config = require('../config');
const {getUserSessionData} = require("../data-management/data-interface");


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
    await getUserSessionData(req.session, email)
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
module.exports = router;
