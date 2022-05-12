const {v4} = require('uuid')
const neo4j = require('./neo4j-service')
const {getCurrentUser} = require("../authentication/authentication")
const {getPermissionLevel} = require('../authorization/authorization')

function getMyUser() {
    const parameters = getCurrentUser()
    return neo4j.getMyUser(parameters)
}

function listUsers() {
    return getMyUser()
        .then(userInfo => {
            if (getPermissionLevel(userInfo) != 'none'){
                return neo4j.listUsers()
            }
            else{
                return new Error("Not Authorized")
            }
        })
}

function registerUser(args) {
    const parameters = args['userInfo']
    parameters['userID'] = v4()
    parameters['registrationDate'] = (new Date()).toString()
    parameters['status'] = "registered"
    return neo4j.registerUser(parameters)
}

function updateMyUser(args) {
    const parameters = args['userInfo']
    return neo4j.updateMyUser(parameters)
}

function approveUser(args) {
    args['status'] = "approved"
    return reviewUser(args)
}

function rejectUser(args) {
    args['status'] = "rejected"
    return reviewUser(args)
}

function reviewUser(args) {
    const parameters = args
    parameters['approvalDate'] = (new Date()).toString()
    return getMyUser()
        .then(userInfo => {
            if (getPermissionLevel(userInfo) === 'admin'){
                return neo4j.reviewUser(parameters)
            }
            else{
                return new Error("Not Authorized")
            }
        })
}

function deleteUser(args) {
    const parameters = args
    return getMyUser()
        .then(userInfo => {
            if (getPermissionLevel(userInfo) === 'admin'){
                return neo4j.deleteUser(parameters)
            }
            else{
                return new Error("Not Authorized")
            }
        })
}

function disableUser(args) {
    const parameters = args
    return getMyUser()
        .then(userInfo => {
            if (getPermissionLevel(userInfo) === 'admin'){
                return neo4j.disableUser(parameters)
            }
            else{
                return new Error("Not Authorized")
            }
        })
}

function editUser(args) {
    const parameters = args
    parameters['editDate'] = (new Date()).toString()
    return getMyUser()
        .then(userInfo => {
            if (getPermissionLevel(userInfo) === 'admin'){
                return neo4j.editUser(parameters)
            }
            else{
                return new Error("Not Authorized")
            }
        })
}

exports.getMyUser = getMyUser
exports.listUsers = listUsers
exports.registerUser = registerUser
exports.updateMyUser = updateMyUser
exports.approveUser = approveUser
exports.rejectUser = rejectUser
exports.deleteUser = deleteUser
exports.disableUser = disableUser
exports.editUser = editUser





