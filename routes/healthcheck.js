const { ping, version } = require('../controllers/healthcheck')
var express = require('express');
var router = express.Router();
// health-check route
router.get('/ping', ping);
router.get('/version', version);
module.exports = router;