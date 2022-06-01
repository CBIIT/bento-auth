const express = require('express');
const {googleAuthenticated, googleLogout} = require("../controllers/google-auth");
const router = express.Router();


module.exports = function (passport) {
    router.get('/login_process',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    router.get('/gov_external_login',
      passport.authenticate('loginGov', { scope: ['email'] })
    );

    router.get('/external_login',
        passport.authenticate('loginGov',
            {
                successRedirect: '/',
                failureRedirect: '/gov_login',
                scope: ['email']
            }
        )
    );

    router.get('/google/callback',
      // TODO SET Failure Redirect
      passport.authenticate('google', {
          successRedirect: '/',
          failureRedirect: '/gov_login'
      })
    );

    router.get('/gov_logout', (request, response, next) => {
        console.log("user:" + request.user);
        if (request.user) {
            // var postLogoutRedirectUrl = `http://localhost:4010${logoutPath}`; // redirect to the logout path to sign the user out of this app after the response comes back, or else the user will still be signed in!
            var postLogoutRedirectUrl = `http://localhost:4010/`; // redirect to the logout path to sign the user out of this app after the response comes back, or else the user will still be signed in!
            var requestUrl = `https://idp.int.identitysandbox.gov/openid_connect/logout?id_token_hint=${request.user.token}&post_logout_redirect_uri=${postLogoutRedirectUrl}&state=${request.user.state}`;
            // request.logout(() => response.redirect('/'));
            request.logout(() => response.redirect('/'));
            //return response.redirect(requestUrl);
        }
        // request.logout(function(err) {
        //     if (err) {
        //         return next(err);
        //     }
        //     request.session.destroy();
        //     response.send({status: 'success'});
        //     // return response.redirect('/');
        // });
    });

    router.get('/logout', googleLogout);
    router.get('/authenticated', googleAuthenticated);
    return router;
}