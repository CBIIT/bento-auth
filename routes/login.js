const express = require('express');
const router = express.Router();
const { login, logout, authenticated } = require('../controllers/auth')
const healthcareRouter = require('./healthcheck');
const passport = require("passport");

/* Login */

/* Logout */

// router.post('/logout', logout);
/* Authenticated */
// Return {status: true} or {status: false}

// Calling this API will refresh the session
// router.post('/authenticated', authenticated);
/* GET ping-ping for health checking. */
// router.use(healthcareRouter);
module.exports = router;
