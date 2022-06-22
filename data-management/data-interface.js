const {v4} = require('uuid')
const neo4j = require('./neo4j-service')
const config = require('../config');
const IDPs = ["google", "nih", "login.gov"];
const API_ERRORS = {
    NOT_LOGGED_IN: "User is either not logged in or not yet registered",
    INVALID_IDP: "Invalid IDP, the valid IDPs are the following: "+IDPs.join(", "),
    NOT_UNIQUE: "The provided email and IDP combination is already registered",
    MISSING_INPUTS: "Inputs for email and IDP are required inputs for registration",
    NOT_AUTHORIZED: "Not authorized"
}

async function checkUnique(email, IDP){
    let result = await neo4j.checkUnique(IDP+":"+email);
    return result;
}

// Sets userInfo in the session
async function getUserSessionData(session, email) {
    session.userInfo = {
        email: email,
        idp: config.idp
    }
    let result = await neo4j.getMyUser(session.userInfo);
    if (result){
        if (result.status){
            session.userInfo.status = result.status;
        }
        if (result.role){
            session.userInfo.role = result.role;
        }
        // IDP stored in user table
        if (result.IDP){
            session.userInfo.idp = result.IDP;
        }

        if (result.acl){
            session.userInfo.acl = result.acl;
        }
    }
    return;
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
            return new Error(API_ERRORS.NOT_LOGGED_IN)
        }
    }
    catch (err){
        return err
    }
}

const listUsers = (_, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkAdminPermissions(userInfo)) {
            return neo4j.listUsers()
        }
        else {
            new Error(API_ERRORS.NOT_AUTHORIZED)
        }
    }
    catch (err){
        return err
    }
}

const registerUser = async (input, context) => {
    if (input.userInfo && input.userInfo.email && input.userInfo.IDP) {
        let idp = input.userInfo.IDP;
        if (!IDPs.includes(idp.toLowerCase())){
            return new Error(API_ERRORS.INVALID_IDP);
        }
        let unique = await checkUnique(input.userInfo.email, idp)
        if (!unique) {
            return new Error(API_ERRORS.NOT_UNIQUE);
        }
    } else {
        return new Error(API_ERRORS.MISSING_INPUTS);
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
        let result = neo4j.registerUser(registrationInfo);
        return result;
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

function reviewUser(parameters, userInfo) {
    try{
        if (checkAdminPermissions(userInfo)) {
            parameters.approvalDate = (new Date()).toString()
            return neo4j.reviewUser(parameters)
        }
        else{
            new Error(API_ERRORS.NOT_AUTHORIZED)
        }
    }
    catch (err) {
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
            new Error(API_ERRORS.NOT_AUTHORIZED)
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
            new Error(API_ERRORS.NOT_AUTHORIZED)
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
            new Error(API_ERRORS.NOT_AUTHORIZED)
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
    apiErrors: API_ERRORS
}