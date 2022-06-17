const express = require('express');
const {authenticated, logout, nihLogin, googleLogin, nihLogout} = require("../controllers/auth-api");
const router = express.Router();
const axios = require('axios');
const {withAsync, withSync} = require("../middleware/error");

module.exports = function () {
    /* Login */
    router.post('/login', withAsync(async (req, res) => {
        // NIH LOGIN
        if (req.body['type'] === 'NIH') return await nihLogin(req,res);
        // GOOGLE LOGIN
        return await googleLogin(req,res);
    }));

    router.get('/logout', withAsync(async (req, res) => {
        if (req.body['type'] === 'NIH') return await nihLogout(req, res);
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