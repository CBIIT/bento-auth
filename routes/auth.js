const express = require('express');
const router = express.Router();

module.exports = function (passport) {
  router.get('/login_process',
      passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
      passport.authenticate('google', { failureRedirect: '/gov_login' }),
      function(req, res) {
        res.header('Authorization', req.user);
        res.redirect('/');
      });

  return router;
}