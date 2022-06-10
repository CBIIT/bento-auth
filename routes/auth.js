const express = require('express');
const {authenticated, logout, nihLogin, googleLogin, nihLogout} = require("../controllers/auth-api");
const router = express.Router();

module.exports = function () {
    /* Login */
    router.post('/login', async (req, res) => {
        try {
            // NIH LOGIN
            if (req.body['type'] === 'NIH') return await nihLogin(req,res);
            // GOOGLE LOGIN
            return await googleLogin(req,res);

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

    router.get('/logout', async (req, res) => {

        if (req.body['type'] === 'NIH') return await nihLogout(req, res);
        return await logout(req, res);

    });
    router.get('/authenticated', authenticated);
    return router;
}