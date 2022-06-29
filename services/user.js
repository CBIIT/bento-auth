const neo4j = require("../data-management/neo4j-service");
const UserInfo = require("../model/user-info");
const {v4} = require("uuid");
const {errorName} = require("../data-management/graphql-api-constants");

async function getUserInfo(userInfo) {
    // inspect user registered already
    const dbUser = await neo4j.getMyUser({email: userInfo.getEmail(), idp: userInfo.getIDP()});
    if (dbUser && dbUser.firstName) {
        return new UserInfo(dbUser.firstName, dbUser.lastName, dbUser.email, dbUser.IDP);
    }

    const registrationInfo = {
        // generatedInfo,
        userID: v4(),
        creationDate: (new Date()).toString(),
        registrationDate: (new Date()).toString(),
        status: "initialized",
        ...userInfo.getRegisterUser()
    };
    let response = await neo4j.registerUser(registrationInfo);
    if (!response) return new Error(errorName.UNABLE_TO_REGISTER_USER);
    return userInfo;
}

module.exports = {
    getUserInfo
};


