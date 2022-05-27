const express = require('express');
const {googleAuthenticated, googleLogout} = require("../controllers/google-auth");
const router = express.Router();

module.exports = function (passport) {
  router.get('/login_process',
      passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
      // TODO SET Failure Redirect
      passport.authenticate('google', {
          successRedirect: '/',
          failureRedirect: '/gov_login'
      })
  );

  router.get('/logout', googleLogout);
  router.get('/authenticated', googleAuthenticated);
  return router;
}