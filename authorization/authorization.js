

function getPermissionLevel(userInfo){
    if (userInfo && userInfo['role'] && userInfo['status'] === 'approved'){
        return userInfo['role']
    }
    else{
        return 'none'
    }
}

exports.getPermissionLevel = getPermissionLevel