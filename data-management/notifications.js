const yaml = require('js-yaml');
const fs   = require('fs');
const {sendNotification} = require("../services/notify");
const {createEmailTemplate} = require("../lib/create-email-template");

let email_constants = undefined
try{
    email_constants = yaml.load(fs.readFileSync('yaml/notification_email_values.yaml', 'utf8'));
}
catch (e) {
    console.error(e)
}

function validateEmailConstants(fn) {
    if (email_constants) return fn;
    console.error("Unable to load email constants from file, email not sent")
}

module.exports = {
    sendAdminNotification: validateEmailConstants(async (admins, template_params) => {
        console.log(admins);
        await sendNotification(
            email_constants.NOTIFICATION_SENDER,
            email_constants.ADMIN_NOTIFICATION_SUBJECT,
            await createEmailTemplate("notification-template.html", {
                message: email_constants.ADMIN_NOTIFICATION_CONTENT, title: email_constants.ADMIN_NOTIFICATION_SUBJECT, ...template_params
            }),
            admins
        );
    }),
    sendRegistrationConfirmation: validateEmailConstants(async (email, template_params) => {
        await sendNotification(
            email_constants.NOTIFICATION_SENDER,
            email_constants.CONFIRMATION_SUBJECT,
            await createEmailTemplate("notification-template.html", {
                message: email_constants.CONFIRMATION_CONTENT, title: email_constants.CONFIRMATION_SUBJECT, ...template_params
            }),
            email
        );
    }),
    sendApprovalNotification: validateEmailConstants(async (email, template_params) => {
        await sendNotification(
            email_constants.NOTIFICATION_SENDER,
            email_constants.APPROVAL_SUBJECT,
            await createEmailTemplate("notification-template.html", {
                message: email_constants.APPROVAL_CONTENT, title: email_constants.APPROVAL_SUBJECT, ...template_params
            }),
            email
        );
    }),
    sendRejectionNotification: validateEmailConstants(async (email, template_params) => {
        await sendNotification(
            email_constants.NOTIFICATION_SENDER,
            email_constants.REJECTION_SUBJECT,
            await createEmailTemplate("notification-template.html", {
                // @Austin TODO Adding following rejection reason
                message: email_constants.REJECTION_CONTENT_PRE_COMMENT + email_constants.REJECTION_CONTENT_POST_COMMENT, title: email_constants.REJECTION_SUBJECT, ...template_params
            }),
            email
        );
    }),
    sendEditNotification: validateEmailConstants(async (email, template_params) => {
        await sendNotification(
            email_constants.NOTIFICATION_SENDER,
            email_constants.EDIT_SUBJECT,
            await createEmailTemplate("notification-template.html", {
                // @Austin TODO Adding following rejection reason
                message: email_constants.EDIT_CONTENT_PRE_COMMENT + email_constants.EDIT_CONTENT_POST_COMMENT, title: email_constants.EDIT_SUBJECT, ...template_params
            }),
            email
        );
    })
}