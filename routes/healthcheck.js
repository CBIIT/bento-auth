const express = require('express');
const router = express.Router();
const { ping, version } = require('../controllers/healthcheck')
/* GET ping-ping for health checking. */
router.get('/ping', ping);
/* GET version for health checking and version checking. */
router.get('/version', version);
module.exports = router;