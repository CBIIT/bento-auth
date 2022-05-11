require('dotenv').config();

const neo4j = require('neo4j-driver')
const uri = process.env.NEO4J_URI
const basicAuth = neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4j_PASSWORD)
const driver = neo4j.driver(uri, basicAuth)

function getMyUser(parameters) {
    const session = driver.session();
    return session.readTransaction((tx) =>
        tx.run(`
            MATCH (user:User)
            WHERE user.email = email
            return user 
        `, parameters))
        .then(result => {
            return result.records.map(record => {
                return record.get('user')
            })
        })
        .catch(error => {
            throw error;
        })
        .finally(() => {
            return session.close();
        });
}

function listUsers(email) {
    const session = driver.session();
    return session.readTransaction((tx) =>
        tx.run(`
            MATCH (user:User)
            return user 
        `, {}))
        .then(result => {
            return result.records.map(record => {
                return record.get('user')
            })
        })
        .catch(error => {
            throw error;
        })
        .finally(() => {
            return session.close();
        });
}

function registerUser(parameters) {
    const session = driver.session();
    return session.writeTransaction((tx) =>
        tx.run(`
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
        `, parameters))
        .then(result => {
            return result.records.map(record => {
                return record.get('user')
            })
        })
        .catch(error => {
            throw error;
        })
        .finally(() => {
            return session.close();
        });
}

exports.getMyUser = getMyUser
exports.registerUser = registerUser
exports.listUsers = listUsers