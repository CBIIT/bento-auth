require('dotenv').config();

//TODO Implement NIH authentication
function getCurrentUser() {
    return process.env.TEST_USER_EMAIL
}

exports.getCurrentUser = getCurrentUser