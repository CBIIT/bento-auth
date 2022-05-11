const {v4} = require('uuid')
const db = require('./neo4j-service')

function getMyUser(email) {
    const parameters = {email: email};
    return db
        .getMyUser(parameters)
        .then(result => {
            return result[0].properties
        })
        .catch(error => {
            throw error;
        })
}

function listUsers(email) {
    return db
        .listUsers(email)
        .then(result => {
            const response = []
            for (const user of result){
                response.push(user.properties)
            }
            return response
        })
        .catch(error => {
            throw error;
        })
}

function registerUser(args) {
    const parameters = args['userInfo'];
    parameters['userID'] = v4()
    parameters['registrationDate'] = (new Date()).toString()
    parameters['status'] = "registered"
    return db
        .registerUser(parameters)
        .then(result => {
            return result[0].properties
        })
        .catch(error => {
            throw error;
        })
}

exports.getMyUser = getMyUser
exports.registerUser = registerUser
exports.listUsers = listUsers





