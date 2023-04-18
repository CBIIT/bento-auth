class AuthenticationService{

    constructor(tokenService, userService){
        this.tokenService = tokenService;
        this.userService = userService;
    }

    async authenticate(req){
        if (!req || !req.headers || !req.session || !req.session.userInfo) return false;
        const token = getTokenFromRequest(req.headers['authorization']);
        const UUIDArray = await this.userService.getUserTokenUUIDs(req.session.userInfo)
        return Boolean((token && await this.tokenService.authenticateUserToken(token, UUIDArray)) || (!token && req.session.tokens))
    }
}

function getTokenFromRequest(authHeader) {
    if (!authHeader) return undefined;
    const splits = authHeader.split(' ');
    if (splits.length < 2) return "invalid token value";
    return splits[1];
}

module.exports = {
    AuthenticationService
};