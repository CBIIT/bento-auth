const express = require('express');
const {authenticated, logout} = require("../controllers/google-auth");
const router = express.Router();
const idpClient = require('../idps');


module.exports = function () {
    /* Login */
    router.post('/login', async function(req, res, next) {
        try {
            const code = req.body['code'];
            const { name, tokens } = await idpClient.login(code);
            req.session.tokens = tokens;
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
    router.get('/logout', logout);
    router.get('/authenticated', authenticated);
    return router;
}