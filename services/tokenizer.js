const jwt = require("jsonwebtoken");
const config = require("../config");
const createToken = async (userInfo)=> {
     return await jwt.sign(
         userInfo,
         config.token_secret,
         { expiresIn: config.token_timeout });
}

const verifyToken = async (token) => {
    let status = false;
    jwt.verify(token, config.token_secret, (error, _) => {
        if (!error) status = true;
    });
    return status;
}

module.exports = {
    createToken,
    verifyToken
};