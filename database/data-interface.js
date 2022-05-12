const {v4} = require('uuid')
const neo4j = require('./neo4j-service')

function getMyUser(email) {
    const parameters = {email: email}
    return neo4j.getMyUser(parameters)
}

function listUsers(email) {
    return neo4j.listUsers()
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
    const parameters = args
    parameters['status'] = "approved"
    parameters['approvalDate'] = (new Date()).toString()
    return neo4j.reviewUser(parameters)
}

function rejectUser(args) {
    const parameters = args
    parameters['status'] = "rejected"
    parameters['approvalDate'] = (new Date()).toString()
    return neo4j.reviewUser(parameters)
}

function deleteUser(args) {
    const parameters = args
    return neo4j.deleteUser(parameters)
}

function disableUser(args) {
    const parameters = args
    return neo4j.disableUser(parameters)
}

function editUser(args) {
    const parameters = args
    parameters['editDate'] = (new Date()).toString()
    return neo4j.editUser(parameters)
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





