class AuthenticationService{

    constructor(tokenService){
        this.tokenService = tokenService;
    }

    async authenticate(req){
        const authHeader = req?.headers?.authorization;
        if (authHeader) {
            const token = getTokenFromAuthHeader(authHeader);
            return Boolean(token && await this.tokenService.authenticateUserToken(token));
        }
        return Boolean(req?.session?.tokens);
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