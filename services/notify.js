const { createTransport } = require('nodemailer');
const config = require('../config');

async function sendNotification({ from, to = [], cc = [], bcc = [], subject, html }) {

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
    return await transport.sendMail(params);
}

function asArray(values = []) {
    return Array.isArray(values)
        ? values
        : [values];
}

module.exports = { sendNotification }
