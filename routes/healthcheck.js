const { Router } = require('express');
const { ping, version } = require('../controllers/auth')
const router = Router();
// health-check route
router.get('/ping', ping);
router.get('/version', version);
module.exports = router;