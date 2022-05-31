const neo4j = require('neo4j-driver');
const config = require('../config');
const driver = neo4j.driver(config.NEO4J_URI, neo4j.auth.basic(config.NEO4J_USER, config.NEO4J_PASSWORD));

//Queries
async function getMyUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE user.email = $email
        return user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    if (result && result[0]){
        return result[0].properties;
    }
    return;
}

async function listUsers() {
    const cypher =
    `
        MATCH (user:User)
        return user 
    `
    const users = []
    const result = await executeQuery({}, cypher, 'user');
    result.forEach(x => {users.push(x.properties)});
    return users;
}

//Mutations
async function registerUser(parameters) {
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
            status: $status,
            acl: $acl,
            role: $role
        }) 
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

async function updateMyUser(parameters) {
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
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

async function reviewUser(parameters) {
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
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

async function deleteUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.status = "deleted"
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

async function disableUser(parameters) {
    const cypher =
    `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.status = "disabled"
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

async function editUser(parameters) {
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
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

async function wipeDatabase(){
    return await executeQuery({}, `MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE r,n`, {})
}

async function executeQuery(parameters, cypher, returnLabel) {
    const session = driver.session();
    const tx = session.beginTransaction();
    try{
        const result = await tx.run(cypher, parameters);
        return result.records.map(record => {
            return record.get(returnLabel)
        })
    }
    catch (error){
        throw error;
    }
    finally{
        try{
            await tx.commit();
        }
        catch(err){}
        await session.close();
    }
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
exports.wipeDatabase = wipeDatabase