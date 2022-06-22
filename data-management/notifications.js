const {sendEmail} = require("./email");
const yaml = require('js-yaml');
const fs   = require('fs');

let email_constants = undefined
try{
    email_constants = yaml.load(fs.readFileSync('yaml/notification_email_values.yaml', 'utf8'));
}
catch (e) {
    console.error(e)
}


module.exports = {
    sendAdminNotification: async (admins) => {
        if (email_constants){
            if (Array.isArray(admins)){
                admins.forEach((adminEmail) => {
                    sendEmail(
                        adminEmail,
                        email_constants.ADMIN_NOTIFICATION_SUBJECT,
                        email_constants.ADMIN_NOTIFICATION_CONTENT
                    );
                })
            }
            else {
                console.error('send email failed, admins parameter of sendAdminNotification is not an array');
            }
        }
        else{
            console.error("Unable to load email constants from file, email not sent")
        }

    },
    sendRegistrationConfirmation: async (email) => {
        if (email_constants) {
            sendEmail(
                email,
                email_constants.CONFIRMATION_SUBJECT,
                email_constants.CONFIRMATION_CONTENT
            );
        }
        else{
            console.error("Unable to load email constants from file, email not sent")
        }

    },
    sendApprovalNotification: async (email) => {
        if (email_constants) {
            sendEmail(
                email,
                email_constants.APPROVAL_SUBJECT,
                email_constants.APPROVAL_CONTENT
            );
        }
        else{
            console.error("Unable to load email constants from file, email not sent")
        }
    },
    sendRejectionNotification: async (email, comment) => {
        if (email_constants) {
            sendEmail(
                email,
                email_constants.REJECTION_SUBJECT,
                email_constants.REJECTION_CONTENT_PRE_COMMENT + comment + email_constants.REJECTION_CONTENT_POST_COMMENT
            );
        }
        else {
            console.error("Unable to load email constants from file, email not sent")
        }
    },
    sendEditNotification: async (email, comment) => {
        if (email_constants) {
            sendEmail(
                email,
                email_constants.EDIT_SUBJECT,
                email_constants.EDIT_CONTENT_PRE_COMMENT + comment + email_constants.EDIT_CONTENT_POST_COMMENT
            );
        }
        else {
            console.error("Unable to load email constants from file, email not sent")
        }
    }
}