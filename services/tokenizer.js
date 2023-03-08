const jwt = require("jsonwebtoken");
const config = require("../config");
const createToken = async ()=> {
     return await jwt.sign(
         {},
         config.token_secret,
         { expiresIn: config.token_timeout });
}

const verifyTokenCallback = (error, _) => {
    if (error) throw new Error("invalid token");
}

const verifyToken = async (token, callback) => {
    jwt.verify(token, config.token_secret, callback);
}

module.exports = {
    createToken,
    verifyToken,
    verifyTokenCallback
};