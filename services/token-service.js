const jwt = require("jsonwebtoken");

class TokenService {

    constructor(tokenSecret, userService) {
        this.tokenSecret = tokenSecret;
        this.userService = userService;
    }

    async authenticateUserToken(token) {
        const isValidToken = verifyToken(token, this.tokenSecret);
        const userInfo = isValidToken ? decodeToken(token, this.tokenSecret) : null;
        const UUIDArray = (userInfo) ? await this.userService.getUserTokenUUIDs(userInfo): [];
        return UUIDArray.length > 0 && isElementInArrayCaseInsensitive(UUIDArray, userInfo.uuid);
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
