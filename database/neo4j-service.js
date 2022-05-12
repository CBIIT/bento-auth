require('dotenv').config();

const neo4j = require('neo4j-driver')
const uri = process.env.NEO4J_URI
const basicAuth = neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4j_PASSWORD)
const driver = neo4j.driver(uri, basicAuth)

//Queries
function getMyUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE user.email = email
        return user
    `
    return executeQuery(parameters, cypher, 'user')
}

function listUsers() {
    const cypher =
    `
        MATCH (user:User)
        return user 
    `
    return executeQuery({}, cypher, 'user')
}

//Mutations
function registerUser(parameters) {
    const cypher =
    `
        CREATE (user:User {
            firstName: $firstName,
            lastName: $lastName,
            email: $email,
            IDP: $IDP,
            organization: $organization,
            userID: $userID,
            registrationDate: $registrationDate,
            status: $status
        }) 
        RETURN user
    `
    return executeQuery(parameters, cypher, 'user')
}

function updateMyUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.email = $email
        SET user.firstName = $firstName
        SET user.lastName = $lastName
        SET user.email = $email
        SET user.IDP = $IDP
        SET user.organization = $organization
        SET user.editDate = $editDate
        RETURN user
    `
    return executeQuery(parameters, cypher, 'user')
}

function reviewUser(parameters) {
    //Used by both approveUser and rejectUser
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.approvalDate = $approvalDate
        SET user.status = $status
        RETURN user
    `
    return executeQuery(parameters, cypher, 'user')
}

function deleteUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.status = "deleted"
        RETURN user
    `
    return executeQuery(parameters, cypher, 'user')
}

function disableUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.status = "disabled"
        RETURN user
    `
    return executeQuery(parameters, cypher, 'user')
}

function editUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.role = $role
        SET user.status = $status
        SET user.organization = $organization
        SET user.editDate = $editDate
        RETURN user
    `
    return executeQuery(parameters, cypher, 'user')
}

function executeQuery(parameters, cypher, returnLabel) {
    const session = driver.session();
    return session.writeTransaction((tx) =>
        tx.run(cypher, parameters))
        .then(result => {
            return result.records.map(record => {
                return record.get(returnLabel)
            })
        })
        .catch(error => {
            throw error;
        })
        .finally(() => {
            return session.close();
        });
}

//Exported functions
exports.getMyUser = getMyUser
exports.listUsers = listUsers
exports.registerUser = registerUser
exports.updateMyUser = updateMyUser
exports.reviewUser = reviewUser
exports.deleteUser = deleteUser
exports.disableUser = disableUser
exports.editUser = editUser
exports.executeQuery = executeQuery