const neo4j = require('neo4j-driver');
const config = require('../config');
const driver = neo4j.driver(config.NEO4J_URI, neo4j.auth.basic(config.NEO4J_USER, config.NEO4J_PASSWORD));

//Queries
async function getAdminEmails() {
    const cypher =
        `
        MATCH (n:User)
        WHERE n.role = 'admin' AND n.status = 'approved'
        RETURN COLLECT(DISTINCT n.email) AS result
    `
    const result = await executeQuery({}, cypher, 'result');
    return result[0];
}

async function checkUnique(key) {
    let parameters = {key: key};
    const cypher =
        `
        MATCH (n:User)
        WITH COLLECT(DISTINCT n.IDP+":"+n.email) AS keys
        RETURN NOT $key in keys as result
    `
    const result = await executeQuery(parameters, cypher, 'result');
    return result[0];
}

async function checkAlreadyApproved(userID) {
    return checkStatus(userID, 'approved');
}

async function checkAlreadyRejected(userID) {
    return checkStatus(userID, 'rejected');
}

async function checkStatus(userID, status) {
    let parameters = {userID: userID, status: status};
    const cypher =
        `
        MATCH (n:User)
            WHERE n.userID = $userID
        RETURN n.status = $status as result
    `
    const result = await executeQuery(parameters, cypher, 'result');
    return result[0];
}

async function getMyUser(parameters) {
    const cypher =
        `
        MATCH (user:User)
        WHERE user.email = $email AND user.IDP = $idp
        return user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    if (result && result[0]) {
        return result[0].properties;
    }
    return;
}

async function listUsers(parameters) {
    const cypher =
        `
        MATCH (user:User)
        WHERE user.role IN $role AND user.status IN $status
        return user 
    `
    const users = []
    const result = await executeQuery(parameters, cypher, 'user');
    result.forEach(x => {
        users.push(x.properties)
    });
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

async function approveUser(parameters) {
    const cypher =
        `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.approvalDate = $approvalDate
        SET user.role = $role
        SET user.status = 'approved'
        SET user.rejectionDate = Null
        SET user.comment = Null
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    if (result && result[0]) {
        return result[0].properties;
    }
    return;
}

async function rejectUser(parameters) {
    const cypher =
        `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.rejectionDate = $rejectionDate
        SET user.comment = $comment
        SET user.status = 'rejected'
        SET user.approvalDate = Null
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    if (result && result[0]) {
        return result[0].properties;
    }
    return;
}

async function resetApproval(parameters) {
    const cypher =
        `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.status = 'registered'
        SET user.rejectionDate = Null
        SET user.approvalDate = Null
        SET user.comment = Null
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    if (result && result[0]) {
        return result[0].properties;
    }
    return;
}

async function editUser(parameters) {
    const cypher =
        `
        MATCH (user:User)
        WHERE 
            user.userID = $userID
        SET user.role = $role
        SET user.organization = $organization
        SET user.acl = $acl
        SET user.editDate = $editDate
        SET user.comment = $comment
        RETURN user
    `
    const result = await executeQuery(parameters, cypher, 'user');
    return result[0].properties;
}

// async function updateMyUser(parameters) {
//     const cypher =
//         `
//         MATCH (user:User)
//         WHERE
//             user.email = $email
//         SET user.firstName = $firstName
//         SET user.lastName = $lastName
//         SET user.email = $email
//         SET user.IDP = $IDP
//         SET user.organization = $organization
//         SET user.editDate = $editDate
//         RETURN user
//     `
//     const result = await executeQuery(parameters, cypher, 'user');
//     return result[0].properties;
// }
//
// async function deleteUser(parameters) {
//     const cypher =
//     `
//         MATCH (user:User)
//         WHERE
//             user.userID = $userID
//         SET user.status = "deleted"
//         RETURN user
//     `
//     const result = await executeQuery(parameters, cypher, 'user');
//     return result[0].properties;
// }
//
// async function disableUser(parameters) {
//     const cypher =
//     `
//         MATCH (user:User)
//         WHERE
//             user.userID = $userID
//         SET user.status = "disabled"
//         RETURN user
//     `
//     const result = await executeQuery(parameters, cypher, 'user');
//     return result[0].properties;
// }


async function wipeDatabase() {
    return await executeQuery({}, `MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE r,n`, {})
}

async function executeQuery(parameters, cypher, returnLabel) {
    const session = driver.session();
    const tx = session.beginTransaction();
    try {
        const result = await tx.run(cypher, parameters);
        return result.records.map(record => {
            return record.get(returnLabel)
        })
    } catch (error) {
        throw error;
    } finally {
        try {
            await tx.commit();
        } catch (err) {
        }
        await session.close();
    }
}

//Exported functions
exports.getMyUser = getMyUser
exports.listUsers = listUsers
exports.registerUser = registerUser
exports.approveUser = approveUser
exports.rejectUser = rejectUser
exports.editUser = editUser
exports.wipeDatabase = wipeDatabase
exports.checkUnique = checkUnique
exports.getAdminEmails = getAdminEmails
exports.checkAlreadyApproved = checkAlreadyApproved
exports.checkAlreadyRejected = checkAlreadyRejected
exports.resetApproval = resetApproval
// exports.deleteUser = deleteUser
// exports.disableUser = disableUser
// exports.updateMyUser = updateMyUser