const {sendEmail} = require("./email");

const EMAIL_PLACEHOLDERS = {
    PLACEHOLDER_SENDER: "bento-notifications@email.com",
    ADMIN_NOTIFICATION_SUBJECT: "Bento user registration received",
    ADMIN_NOTIFICATION_CONTENT: "There is a new user registration pending review",
    CONFIRMATION_SUBJECT: "Bento registration confirmation",
    CONFIRMATION_CONTENT: "Thank you for your interest in Bento Software, your registration has been received and is under review",
    APPROVAL_SUBJECT: "Bento account approved",
    APPROVAL_CONTENT: "Thank you for your interest in Bento Software, your account has been approved. You can now log in to Bento via this url [include URL]. If further assistance is required, please contact the Bento help desk at bento-help@nih.gov",
    REJECTION_SUBJECT: "Bento account rejected",
    REJECTION_CONTENT1: "Thank you for your interest in Bento Software, your account has been rejected according to the following criteria: ",
    REJECTION_CONTENT2: ". For further assistance please contact the Bento help desk at bento-help@nih.gov"
}

module.exports = {
    sendAdminNotification: async (admins) => {
        if (Array.isArray(admins)){
            admins.forEach((adminEmail) => {
                sendEmail(
                    adminEmail,
                    EMAIL_PLACEHOLDERS.ADMIN_NOTIFICATION_SUBJECT,
                    EMAIL_PLACEHOLDERS.ADMIN_NOTIFICATION_CONTENT
                );
            })
        }
        else {
            console.error('send email failed, admins parameter of sendAdminNotification is not an array');
        }
    },
    sendRegistrationConfirmation: async (email) => {
        sendEmail(
            email,
            EMAIL_PLACEHOLDERS.CONFIRMATION_SUBJECT,
            EMAIL_PLACEHOLDERS.CONFIRMATION_CONTENT
        );
    },
    sendApprovalNotification: async (email) => {
        sendEmail(
            email,
            EMAIL_PLACEHOLDERS.APPROVAL_SUBJECT,
            EMAIL_PLACEHOLDERS.APPROVAL_CONTENT
        );
    },
    sendRejectionNotification: async (email, comment) => {
        sendEmail(
            email,
            EMAIL_PLACEHOLDERS.REJECTION_SUBJECT,
            EMAIL_PLACEHOLDERS.REJECTION_CONTENT1 + comment + EMAIL_PLACEHOLDERS.REJECTION_CONTENT2
        );
    }
}