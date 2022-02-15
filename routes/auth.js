const express = require('express');
const router = express.Router();
const google_client = require('../idps/google');
const config = require('../config');
console.log(config);

/* Login */
router.post('/login', async function(req, res, next) {
  const code = req.body['code'];
  console.log(code);
  const token = await google_client.login(code);
  res.json({code: code});
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
