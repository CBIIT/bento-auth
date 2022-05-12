require('dotenv').config();

//TODO Implement NIH authentication
function getCurrentUser() {
    let email = process.env.TEST_USER_EMAIL
    let firstName = process.env.TEST_USER_FIRST
    let lastName = process.env.TEST_USER_LAST
    return {email:email, firstName:firstName, lastName:lastName}
}

exports.getCurrentUser = getCurrentUser