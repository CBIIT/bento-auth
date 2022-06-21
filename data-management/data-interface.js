const {v4} = require('uuid')
const neo4j = require('./neo4j-service')
const config = require('../config');
const {errorName, valid_idps} = require("./graphql-api-constants");
const {sendAdminNotification, sendRegistrationConfirmation, sendApprovalNotification, sendRejectionNotification,
    sendEditNotification
} = require("./notifications");

async function checkUnique(email, IDP){
    return await neo4j.checkUnique(IDP+":"+email);
}

async function getAdminEmails(){
    return await neo4j.getAdminEmails();
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
    return checkApproved(userInfo) && (userInfo.role === 'standard' || userInfo.role === 'admin');
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
        let result = await neo4j.registerUser(registrationInfo);
        let adminEmails = await getAdminEmails();
        await sendAdminNotification(adminEmails);
        await sendRegistrationConfirmation(input.userInfo.email)
        return result;
    } catch (err) {
        return err;
    }
}


const approveUser = async (parameters, context) => {
    try {
        let userInfo = context.session.userInfo;
        parameters.role = parameters.role.toLowerCase();
        if (!userInfo) {
            return new Error(errorName.NOT_LOGGED_IN);
        } else if (!checkAdminPermissions(userInfo)) {
            return new Error(errorName.NOT_AUTHORIZED);
        } else if (await neo4j.checkAlreadyApproved(parameters.userID)) {
            return new Error(errorName.ALREADY_APPROVED);
        } else if (!(parameters.role === 'admin' || parameters.role === 'standard')){
            return new Error(errorName.INVALID_ROLE);
        }
        else {
            parameters.approvalDate = (new Date()).toString()
            let response = await neo4j.approveUser(parameters)
            if (response) {
                if (response.email) {
                    await sendApprovalNotification(response.email);
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


const rejectUser = async (parameters, context) => {
    try {
        let userInfo = context.session.userInfo;
        if (!userInfo) {
            return new Error(errorName.NOT_LOGGED_IN);
        } else if (!checkAdminPermissions(userInfo)) {
            return new Error(errorName.NOT_AUTHORIZED);
        } else if (await neo4j.checkAlreadyRejected(parameters.userID)) {
            return new Error(errorName.ALREADY_REJECTED);
        } else {
            parameters.rejectionDate = (new Date()).toString()
            let response = await neo4j.rejectUser(parameters)
            if (response) {
                if (response.email) {
                    await sendRejectionNotification(response.email, response.comment);
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


const editUser = async (parameters, context) => {
    try {
        let userInfo = context.session.userInfo;
        if (!userInfo) {
            return new Error(errorName.NOT_LOGGED_IN);
        } else if (!checkAdminPermissions(userInfo)) {
            return new Error(errorName.NOT_AUTHORIZED);
        }
        else {
            if (parameters.role) {
                parameters.role = parameters.role.toLowerCase();
                if (!(parameters.role === 'admin' || parameters.role === 'standard')){
                    return new Error(errorName.INVALID_ROLE);
                }
            }
            if (parameters.status) {
                parameters.status = parameters.status.toLowerCase();
                if (!(parameters.status === 'approved' || parameters.status === 'rejected' || parameters.status === 'registered')){
                    return new Error(errorName.INVALID_STATUS);
                }
            }
            parameters.editDate = (new Date()).toString()
            if (parameters.status === 'approved') {
                parameters.approvalDate = parameters.editDate
                let response = await neo4j.approveUser(parameters)
                if (!response) {
                    return new Error(errorName.USER_NOT_FOUND);
                }
            }
            else if (parameters.status === 'rejected') {
                parameters.rejectionDate = parameters.editDate
                let response = await neo4j.rejectUser(parameters)
                if (!response) {
                    return new Error(errorName.USER_NOT_FOUND);
                }
            }
            else if (parameters.status === 'registered') {
                let response = await neo4j.resetApproval(parameters)
                if (!response) {
                    return new Error(errorName.USER_NOT_FOUND);
                }
            }
            let response = await neo4j.editUser(parameters)
            if (response) {
                if (response.email) {
                    await sendEditNotification(response.email, response.comment);
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

// const updateMyUser = (input, context) => {
//     try{
//         let userInfo = context.session.userInfo;
//         input.userInfo.email = userInfo.email;
//         input.userInfo.editDate = (new Date()).toString();
//         return neo4j.updateMyUser(input.userInfo);
//     }
//     catch (err) {
//         return err;
//     }
// }
// const deleteUser = (parameters, context) => {
//     try{
//         let userInfo = context.session.userInfo;
//         if (checkAdminPermissions(userInfo)) {
//             return neo4j.deleteUser(parameters)
//         }
//         else{
//             new Error(errorName.NOT_AUTHORIZED)
//         }
//     }
//     catch (err) {
//         return err;
//     }
// }
//
// const disableUser = (parameters, context) => {
//     try{
//         let userInfo = context.session.userInfo;
//         if (checkAdminPermissions(userInfo)) {
//             return neo4j.disableUser(parameters)
//         }
//         else{
//             new Error(errorName.NOT_AUTHORIZED)
//         }
//     }
//     catch (err) {
//         return err;
//     }
// }


module.exports = {
    getMyUser: getMyUser,
    listUsers: listUsers,
    registerUser: registerUser,
    approveUser: approveUser,
    rejectUser: rejectUser,
    editUser: editUser,
    getUserSessionData: getUserSessionData,
    // updateMyUser: updateMyUser,
    // deleteUser: deleteUser,
    // disableUser: disableUser,
}