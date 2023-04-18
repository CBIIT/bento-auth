const jwt = require("jsonwebtoken");

class TokenService {

    constructor(tokenSecret) {
        this.tokenSecret = tokenSecret;
    }

    authenticateUserToken (token, UUIDArray) {
        const isValidToken = verifyToken(token, this.tokenSecret);
        const userInfo = isValidToken ? decodeToken(token, this.tokenSecret) : {};
        return (userInfo) && isElementInArrayCaseInsensitive(UUIDArray, userInfo.uuid);
    }

}

function verifyToken(token , tokenSecret) {
    let isValid = false;
    jwt.verify(token, tokenSecret, (error, _) => {
        if (!error) isValid = true;
    });
    return isValid;
}

function decodeToken(token, tokenSecret) {
    let userInfo;
    jwt.verify(token, tokenSecret, (error, encoded) => {
        userInfo = error ? {} : encoded;
    });
    return userInfo;
}

function isElementInArrayCaseInsensitive(array, target) {
    if (!array || !target) return false;
    return array.some((element) => element.toLowerCase() === target.toLowerCase());
}

module.exports = {
    TokenService
};
