const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthcheck');


router.get('/gov_login', (req, res) => {
    res.send('<a href="/auth/login_process">login</a>');
});
router.use(healthRoutes);


module.exports = router;