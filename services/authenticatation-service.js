class AuthenticationService{

    constructor(tokenService, userService){
        this.tokenService = tokenService;
        this.userService = userService;
    }

    async authenticate(req){
        const session = req?.session;
        if (!session) return false;
        const authHeader = req?.headers?.authorization;
        if (authHeader) {
            const token = getTokenFromAuthHeader(authHeader);
            const UUIDArray = await this.userService.getUserTokenUUIDs(req.session.userInfo);
            return Boolean(token && await this.tokenService.authenticateUserToken(token, UUIDArray));
        }
        return Boolean(req.session.tokens);
    }
}

function getTokenFromAuthHeader(authHeader) {
    const splits = authHeader.split(' ');
    if (splits.length < 2) return "invalid token value";
    return splits[1];
}

module.exports = {
    AuthenticationService
};