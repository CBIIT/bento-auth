const { ping, version } = require('../controllers/healthcheck')
const express = require('express');
const config = require("../config");
const router = express.Router();
// health-check route
router.get('/ping', (req, res, next) => {
    res.send(`pong`);
});

router.get('/version', (req, res, next) => {
    res.json({
        version: config.version,
        date: config.date
    });
});
module.exports = router;