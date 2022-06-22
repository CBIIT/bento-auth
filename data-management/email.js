//Placeholder email function
module.exports = {
    sendEmail: (recipient, subject, content) =>{
        let email = {
            email: {
                from: "sender@email.com",
                to: recipient,
                subject: subject,
                message: content
            }
        }
        console.log(email)
    }
}