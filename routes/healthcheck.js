const express = require('express');
const router = express.Router();
const { ping, version } = require('../controllers/healthcheck')
// health-check route
router.get('/ping', ping);
router.get('/version', version);
module.exports = router;