const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthcheck');
const compression = require("compression");

// compress all responses
router.use(compression());
// Failed Route
router.get('/gov_login', (req, res) => {
    res.send('<a href="/auth/login_process">login</a>');
});
router.use(healthRoutes);

module.exports = router;