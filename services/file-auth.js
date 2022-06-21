const {strToArr} = require("../util/file");
function authFileWithACL(userAclArr, fileAclArr) {
    const aclSet = new Set();
    for (let acl of strToArr(fileAclArr)) aclSet.add(acl);
    // Get user acl with valid email and idp
    for (let acl of userAclArr ? userAclArr : []) {
        if (aclSet.has(acl)) return true;
    }
    return false;
}

module.exports = {
    authFileWithACL
};