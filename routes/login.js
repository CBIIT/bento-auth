const express = require('express');
const router = express.Router();
const { login, logout, authenticated } = require('../controllers/auth')
const healthcareRouter = require('./healthcheck');
const passport = require("passport");

/* Login */
router.post('/login',login);
router.get('/login',(req, res, next) => {
    passport.authenticate('google', { scope:
            [ 'email', 'profile' ] });

});
router.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);
// api/auth/session
router.get('/session', (request, response) => {
    const { cookie, passport } = request.session;
    const { expires } = cookie;
    const user = (passport && passport.user)
        ? { authenticated: true, user: request.user }
        : { authenticated: false };

    response.json({ expires, ...user });
});





/* Logout */
router.post('/logout', (req, res) => {
    req.logout();
    res.redirect("/login");
});
/* Authenticated */
// Return {status: true} or {status: false}
// Calling this API will refresh the session
router.post('/authenticated', authenticated);
/* GET ping-ping for health checking. */
router.use(healthcareRouter);
module.exports = router;
