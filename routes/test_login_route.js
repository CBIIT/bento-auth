const express = require('express');
const router = express.Router();

module.exports = function (passport) {
    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/protected',
            failureRedirect: '/auth/google/failure' ,

        })
    );

    router.get('/auth/logout', function (request, response, next) {
        // request.logout();
        request.logout(function(err) {
            if (err) {
                return next(err);
            }
            request.session.destroy();
            response.send({status: 'success'});
            // return response.redirect('/');
        });
    });

    router.get('/auth/authenticated', function (req, res) {
        try {
            if (req.user) {
                return res.status(200).send({status: true});
            } else {
                return res.status(200).send({status: false});
            }
        } catch (e) {
            console.log(e);
            res.status(500).send({errors: e});
        }
    });
    return router;
}