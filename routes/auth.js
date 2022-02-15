const express = require('express');
const router = express.Router();
const idpClient = require('../idps/google');
const config = require('../config');


/* Login */
router.post('/login', async function(req, res, next) {
  try {
    const code = req.body['code'];
    const { name, tokens } = await idpClient.login(code);
    req.session.tokens = tokens;
    res.json({ name });
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e});
  }
});

/* Logout */
router.post('/logout', async function(req, res, next) {
  try {
    if (req.session.tokens) {
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
router.post('/authenticated', async function(req, res, next) {
  try {
    if (req.session.tokens) {
      if (await idpClient.authenticated(req.session.tokens)) {
        return res.status(200).send({status: true});
      } else {
        return res.status(200).send({status: false});
      }
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
