const {v4} = require('uuid')
const neo4j = require('./neo4j-service')
const config = require('../config');
const {errorName, valid_idps} = require("./graphql-api-constants");

async function checkUnique(email, IDP){
    return await neo4j.checkUnique(IDP+":"+email);
}

// Sets userInfo in the session
async function getUserSessionData(session, email) {
    session.userInfo = {
        email: email,
        idp: config.idp
    }
    let result = await neo4j.getMyUser(session.userInfo);
    if (result) {
        if (result.status) {
            session.userInfo.status = result.status;
        }
        if (result.role) {
            session.userInfo.role = result.role;
        }
    }
}

function checkAdminPermissions(userInfo) {
    return checkApproved(userInfo) && userInfo.role === 'admin';
}

function checkStandardPermissions(userInfo) {
    return checkApproved(userInfo) && userInfo.role === 'standard';
}

function checkApproved(userInfo) {
    return checkForUserInfo(userInfo) && userInfo.role && userInfo.status === 'approved';
}

function checkForUserInfo(userInfo) {
    return userInfo && userInfo.status;
}

const getMyUser = async (_, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkForUserInfo(userInfo)) {
            return neo4j.getMyUser(userInfo);
        }
        else {
            return new Error(errorName.NOT_LOGGED_IN)
        }
    }
    catch (err){
        return err
    }
}

const listUsers = (input, context) => {
    try{
        let userInfo = context.session.userInfo;
        //Check if not logged in
        if (!userInfo){
            return new Error(errorName.NOT_LOGGED_IN);
        }
        //Check if not admin
        else if (!checkAdminPermissions(userInfo)) {
            return new Error(errorName.NOT_AUTHORIZED);
        }
        //Execute query
        else {
            return neo4j.listUsers(input);
        }
    }
    catch (err){
        return err;
    }
}

const registerUser = async (input, context) => {
    if (input.userInfo && input.userInfo.email && input.userInfo.IDP) {
        let idp = input.userInfo.IDP;
        if (!valid_idps.includes(idp.toLowerCase())){
            return new Error(errorName.INVALID_IDP);
        }
        let unique = await checkUnique(input.userInfo.email, idp)
        if (!unique) {
            return new Error(errorName.NOT_UNIQUE);
        }
    } else {
        return new Error(errorName.MISSING_INPUTS);
    }
    try {
        let generatedInfo = {
            userID: v4(),
            registrationDate: (new Date()).toString(),
            status: "registered",
            role: "standard"
        };
        let registrationInfo = {
            ...input.userInfo,
            ...generatedInfo
        };
        return neo4j.registerUser(registrationInfo);
    } catch (err) {
        return err;
    }
}

const updateMyUser = (input, context) => {
    try{
        let userInfo = context.session.userInfo;
        input.userInfo.email = userInfo.email;
        input.userInfo.editDate = (new Date()).toString();
        return neo4j.updateMyUser(input.userInfo);
    }
    catch (err) {
        return err;
    }
}

const approveUser = (parameters, context) => {
    parameters.status = 'approved';
    let userInfo = context.session.userInfo;
    return reviewUser(parameters, userInfo);
}

const rejectUser = (parameters, context) => {
    parameters.status = 'rejected';
    let userInfo = context.session.userInfo;
    return reviewUser(parameters, userInfo);
}

async function reviewUser(parameters, userInfo) {
    try {
        //Check if not logged in
        if (!userInfo) {
            return new Error(errorName.NOT_LOGGED_IN);
        }
        //Check if not admin
        else if (!checkAdminPermissions(userInfo)) {
            return new Error(errorName.NOT_AUTHORIZED);
        }
        //Execute query
        else {
            parameters.approvalDate = (new Date()).toString()
            let response = await neo4j.reviewUser(parameters)
            if (response) {
                if (parameters.comment) {
                    console.log(parameters.comment);
                }
                return response;
            } else {
                return new Error(errorName.USER_NOT_FOUND);
            }
        }
    } catch (err) {
        return err;
    }
}

const deleteUser = (parameters, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkAdminPermissions(userInfo)) {
            return neo4j.deleteUser(parameters)
        }
        else{
            new Error(errorName.NOT_AUTHORIZED)
        }
    }
    catch (err) {
        return err;
    }
}

const disableUser = (parameters, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkAdminPermissions(userInfo)) {
            return neo4j.disableUser(parameters)
        }
        else{
            new Error(errorName.NOT_AUTHORIZED)
        }
    }
    catch (err) {
        return err;
    }
}

const editUser = (parameters, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkAdminPermissions(userInfo)) {
            return neo4j.editUser(parameters)
        }
        else{
            new Error(errorName.NOT_AUTHORIZED)
        }
    }
    catch (err) {
        return err;
    }
}

module.exports = {
    getMyUser: getMyUser,
    listUsers: listUsers,
    registerUser: registerUser,
    updateMyUser: updateMyUser,
    approveUser: approveUser,
    rejectUser: rejectUser,
    deleteUser: deleteUser,
    disableUser: disableUser,
    editUser: editUser,
    getUserSessionData: getUserSessionData,
}