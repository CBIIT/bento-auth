const yaml = require('js-yaml');
const fs = require('fs');
const {sendNotification} = require("../services/notify");
const {createEmailTemplate} = require("../lib/create-email-template");

let email_constants = undefined
try {
    email_constants = yaml.load(fs.readFileSync('yaml/notification_email_values.yaml', 'utf8'));
} catch (e) {
    console.error(e)
}

module.exports = {
    sendAdminNotification: async (admins, template_params) => {
        if (email_constants) {
            await sendNotification(
                email_constants.NOTIFICATION_SENDER,
                email_constants.ADMIN_NOTIFICATION_SUBJECT,
                await createEmailTemplate("notification-template.html", {
                    message: email_constants.ADMIN_NOTIFICATION_CONTENT, ...template_params
                }),
                admins
            );
        } else {
            console.error("Unable to load email constants from file, email not sent")
        }

    },
    sendRegistrationConfirmation: async (email, template_params) => {
        if (email_constants) {
            await sendNotification(
                email_constants.NOTIFICATION_SENDER,
                email_constants.CONFIRMATION_SUBJECT,
                await createEmailTemplate("notification-template.html", {
                    message: email_constants.CONFIRMATION_CONTENT, ...template_params
                }),
                email
            );
        } else {
            console.error("Unable to load email constants from file, email not sent")
        }
    },
    sendApprovalNotification: async (email, template_params) => {
        if (email_constants) {
            await sendNotification(
                email_constants.NOTIFICATION_SENDER,
                email_constants.APPROVAL_SUBJECT,
                await createEmailTemplate("notification-template.html", {
                    message: email_constants.APPROVAL_CONTENT, ...template_params
                }),
                email
            );
        } else {
            console.error("Unable to load email constants from file, email not sent")
        }
    },
    sendRejectionNotification: async (email, template_params) => {
        if (email_constants) {
            await sendNotification(
                email_constants.NOTIFICATION_SENDER,
                email_constants.REJECTION_SUBJECT,
                await createEmailTemplate("notification-template.html", {
                    message: email_constants.REJECTION_CONTENT_PRE_COMMENT + template_params.comment + email_constants.REJECTION_CONTENT_POST_COMMENT, ...template_params
                }),
                email
            );
        } else {
            console.error("Unable to load email constants from file, email not sent")
        }
    },
    sendEditNotification: async (email, template_params) => {
        if (email_constants) {
            await sendNotification(
                email_constants.NOTIFICATION_SENDER,
                email_constants.EDIT_SUBJECT,
                await createEmailTemplate("notification-template.html", {
                    message: email_constants.EDIT_CONTENT_PRE_COMMENT + template_params.comment + email_constants.EDIT_CONTENT_POST_COMMENT, ...template_params
                }),
                email
            );
        } else {
            console.error("Unable to load email constants from file, email not sent")
        }
    }
}