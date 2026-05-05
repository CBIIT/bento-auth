const logger = require('winston');

exports.logout = (req, res) => {
    logger.debug('Destroying user session on logout');
    if (req.session) {
        req.session.destroy( (err) => {
            if (err) {
                logger.error(`Session destruction failed: ${err.message}`);
                return res.status(500).send({errors: err});
            }
            logger.info('Session destroyed successfully');
            res.status(200).send({status: 'success'});
        });
    } else {
        logger.warn('Logout called but no active session found');
        return res.status(200).send({status: 'success'});
    }
}