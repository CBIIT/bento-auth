const jwt = require("jsonwebtoken");

class TokenService {

    constructor(tokenSecret, userService) {
        this.tokenSecret = tokenSecret;
        this.userService = userService;
    }

    async authenticateUserToken(token) {
        const isValidToken = verifyToken(token, this.tokenSecret);
        let userInfo;
        if (isValidToken) {
            userInfo = decodeToken(token, this.tokenSecret);
        }
        else{
            console.warn("Token was invalid");
        }
        let UUIDArray = [];
        if (userInfo){
            UUIDArray = await this.userService.getUserTokenUUIDs(userInfo)
        }
        else {
            console.warn("User info missing from token")
        }
        if (!isElementInArrayCaseInsensitive(UUIDArray, userInfo.uuid)){
            console.warn("Token not in whitelist for the user")
            return false;
        }
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
