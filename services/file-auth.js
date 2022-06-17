const {strToArr} = require("../util/file");
function authFileWithACL(userInfo, aclStrArr) {
    const aclSet = new Set();
    for (let acl of strToArr(aclStrArr)) aclSet.add(acl);
    // Get user acl with valid email and idp
    for (let acl of userInfo.acl ? userInfo.acl : []) {
        if (aclSet.has(acl)) return true;
    }
    return false;
}

module.exports = {
    authFileWithACL
};