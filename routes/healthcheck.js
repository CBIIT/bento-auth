const { ping, version } = require('../controllers/healthcheck')
const express = require('express');
const router = express.Router();
// health-check route
router.get('/ping', ping);
router.get('/version', version);
module.exports = router;