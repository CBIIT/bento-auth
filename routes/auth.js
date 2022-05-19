const express = require('express');
const router = express.Router();
const { login, logout, ping, version, authenticated } = require('../controllers/auth')

/* Login */
router.post('/login', login);
/* Logout */
router.post('/logout', logout);

/* Authenticated */
// Return {status: true} or {status: false}
// Calling this API will refresh the session
router.post('/authenticated', authenticated);
/* GET ping-ping for health checking. */
router.get('/ping', ping);
/* GET version for health checking and version checking. */
router.get('/version', version);

module.exports = router;
