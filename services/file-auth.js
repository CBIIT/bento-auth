const {strToArr} = require("../util/file-util");
/* File ACL Authentication */
// Return true or false
// compares user acl array with file acl array
// If a user has at least one acl value in a file acl array, it returns true
function authFileACL(userAclArr, fileAclArr) {
    const aclSet = new Set();
    for (let acl of strToArr(fileAclArr)) aclSet.add(acl);
    for (let acl of userAclArr ? userAclArr : []) {
        if (aclSet.has(acl)) return true;
    }
    return false;
}

module.exports = {
    authFileACL
};