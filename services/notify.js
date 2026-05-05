const { createTransport } = require('nodemailer');
const config = require('../config');
const logger = require('winston');

async function sendNotification(from, subject, html, to = [], cc = [], bcc = []) {

    if (!to?.length) {
        throw new Error('Missing recipient');
    }

    if (!html) {
        throw new Error('Missing HTML CONTENTS');
    }

    to = asArray(to);
    cc = asArray(cc);
    bcc = asArray(bcc);

    return await sendMail({ from, to, cc, bcc, subject, html });
}

async function sendMail(params) {
    const transport = createTransport(config.email_transport);
    logger.debug(`Generating email to: ${params.to.join(', ')}`);
    if (config.emails_enabled){
        try{
            let result = await transport.sendMail(params);
            logger.info(`Email sent successfully to: ${params.to.join(', ')}`);
            return result;
        }
        catch (err){
            logger.error(`Email failed to send: ${err.message}`);
            return err;
        }
    }
    else {
        logger.warn('Email not sent: emails are disabled by configuration');
        return true;
    }
}

function asArray(values = []) {
    return Array.isArray(values)
        ? values
        : [values];
}

module.exports = { sendNotification }
