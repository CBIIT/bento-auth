const express = require('express');
const {authenticated, logout} = require("../controllers/auth-api");
const authLogin = require('../idps/index');
const router = express.Router();
const axios = require('axios');
const {withAsync, withSync} = require("../middleware/error");

module.exports = function () {
    /* Login */
    router.post('/login', withAsync(async (req, res) => {
        const type = req.body['type'];
        const result = await authLogin.login(req.body['code'], type, req.body['redirectUri']);
        // TODO GOOGLE has not user.email yet
        // Store email address or any identity
        // TODO temporary acl values
        req.session.userInfo = {idp: type, email: result.user.email, acl: ["Open"]}
        req.session.tokens = result.tokens;
        res.json({ name: result.user.name, email: result.user.email });
    }));

    router.get('/logout', withAsync(async (req, res) => {
        const type = req.body['type'];
        if(type === 'NIH') await authLogin.logout(type, req.session.tokens);
        // Clear Session
        return await logout(req, res);
    }));

    router.post('/authenticated', withSync(authenticated));

    /* TODO Temporary redirect file download request to avoid CORS issue */
    router.get('/files/:fileId', withAsync(async function(req, res, next) {
        const fileId = req.params.fileId;
        const result = await axios.get('http://localhost:3000/api/files/' + fileId, {
            headers: {
                Cookie: req.headers.cookie
            }
        });
        res.json(result.data);
    }));

    return router;
}