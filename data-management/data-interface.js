const {v4} = require('uuid')
const neo4j = require('./neo4j-service')

// Sets userInfo in the session
async function getUserSessionData(session, email) {
    session.userInfo = {
        email: email
    }
    let result = await neo4j.getMyUser(session.userInfo);
    if (result.status === 'approved') {
        session.userInfo.role = result.role
    } else {
        session.userInfo.role = "none"
    }
    return
}

function checkAdminPermissions(userInfo) {
    return checkApproved(userInfo) && userInfo.role === 'admin';
}

function checkStandardPermissions(userInfo) {
    return checkApproved(userInfo) && userInfo.role === 'standard';
}

function checkApproved(userInfo) {
    return checkForUserInfo(userInfo) && userInfo.status === 'approved';
}

function checkForUserInfo(userInfo) {
    return userInfo && userInfo.status && userInfo.role
}

const getMyUser = async (args, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkForUserInfo(userInfo)) {
            return neo4j.getMyUser(userInfo);
        }
        else {
            return new Error("User is either not logged in or not yet registered")
        }
    }
    catch (err){
        return err
    }
}

const listUsers = (args, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkAdminPermissions(userInfo)) {
            return neo4j.listUsers()
        }
        else {
            return new Error("Not Authorized")
        }
    }
    catch (err){
        return err
    }
}

const registerUser = (newUserInfo, context) => {
    try{
        let generatedInfo = {
            userID: v4(),
            registrationDate: (new Date()).toString(),
            status: "registered"
        };
        let registrationInfo = {
            ...newUserInfo,
            ...generatedInfo
        };
        return neo4j.registerUser(registrationInfo)
    }
    catch(err){
        return err;
    }
}

const updateMyUser = (newUserInfo, context) => {
    try{
        let userInfo = context.session.userInfo;
        if (checkApproved(userInfo) && newUserInfo.email && newUserInfo.email === userInfo.email) {
            return neo4j.updateMyUser(newUserInfo);
        }
        else{
            return new Error("Not Authorized")
        }
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
            return new Error("Not Authorized")
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
            return new Error("Not Authorized")
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
            return new Error("Not Authorized")
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
            return new Error("Not Authorized")
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