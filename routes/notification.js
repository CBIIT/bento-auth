const express = require('express');
const {sendEmail} = require("../mailer");
const {withAsync} = require("../middleware/middleware");
const {createEmailTemplate} = require("../lib/create-email-template");
const router = express.Router();

// Send email notification to multiple users
router.post(
    "/notifications",
    // EMAIL Access Policy
    withAsync(async (request, response) => {
        const { to, subject, params } = request.body;
        const templateParams = JSON.parse(params);
        // Set parameters for the desired html template
        // {
        //     firstName: "Bento",
        //     lastName: "TEST"
        // }
        const htmlContents = await createEmailTemplate("notification-template.html", templateParams);
        const result = await sendEmail(to, subject, htmlContents);
        console.log(result)
        response.json(true);
    }),
);

module.exports = router;