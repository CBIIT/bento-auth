const {TokenService} = require("../../services/token-service");
const {UserService} =  require("../../services/user-service");
const {AuthenticationService} = require("../../services/authenticatation-service");

// setup mock services
jest.mock("../../services/token-service.js");
jest.mock("../../services/user-service.js");
const mockTokenService = new TokenService();
const mockUserService = new UserService();

describe('authenticate tests', () => {

    const authService = new AuthenticationService(mockTokenService, mockUserService);
    let placeholderSession, placeholderAuthHeader;
    mockUserService.getUserTokenUUIDs.mockImplementation( () => {
        return [];
    });

    beforeEach( () => {
       placeholderSession =  {
           userInfo: {
               email: "placeholderemail",
               IDP: "placeholderidp"
           },
           tokens: {}
       };
       placeholderAuthHeader = {
           authorization: "Bearer placeholdertoken"
       };
    });

    test('request undefined', async () => {
        expect(await authService.authenticate(null)).toBeFalsy();
        expect(await authService.authenticate()).toBeFalsy();
    });

    test('request.session missing', async () => {
        let req = {
            headers: placeholderAuthHeader
        };
        expect(await authService.authenticate(req)).toBeFalsy();
        req.session = null;
        expect(await authService.authenticate(req)).toBeFalsy();
    });

    test('incomplete userInfo', async () => {
        let req = {
            headers: placeholderAuthHeader,
            session: {}
        };
        expect(await authService.authenticate(req)).toBeFalsy();
        req.session.userInfo = {};
        expect(await authService.authenticate(req)).toBeFalsy();
        req.session.userInfo = {email: "placeholderemail"};
        expect(await authService.authenticate(req)).toBeFalsy();
        req.session.userInfo = {IDP: "placeholderidp"};
        expect(await authService.authenticate(req)).toBeFalsy();
    });

    test('missing headers', async () => {
        let req = {
            session: placeholderSession
        };
        expect(await authService.authenticate(req)).toBeFalsy();
        req.headers = null;
        expect(await authService.authenticate(req)).toBeFalsy();
    });

    test('missing or invalid auth header', async () => {
        let req = {
            session: placeholderSession,
            headers: {}
        };
        expect(await authService.authenticate(req)).toBeTruthy();
        req.headers.authorization = null;
        expect(await authService.authenticate(req)).toBeTruthy();
        req.headers.authorization = "";
        expect(await authService.authenticate(req)).toBeTruthy();
        req.headers.authorization = "invalid";
        expect(await authService.authenticate(req)).toBeFalsy();
    });

    test('invalid token, valid session', async () => {
        let req = {
           session: placeholderSession,
           headers: placeholderAuthHeader
        };
        mockTokenService.authenticateUserToken.mockImplementation( () => {
            return false;
        });
        expect(await authService.authenticate(req)).toBeFalsy();
    });

    test('valid token, valid session', async () => {
        let req = {
            session: placeholderSession,
            headers: placeholderAuthHeader
        };
        mockTokenService.authenticateUserToken.mockImplementation( () => {
            return true;
        });
        expect(await authService.authenticate(req)).toBeTruthy();
    });

    test('no token, valid session', async () => {
        let req = {
            session: placeholderSession
        };
        req.headers = {};
        expect(await authService.authenticate(req)).toBeTruthy();
    });

    test('no token, invalid session', async () => {
        let req = {
            session: placeholderSession
        };
        req.headers = {};
        req.session.tokens = undefined;
        expect(await authService.authenticate(req)).toBeFalsy();
        req.session.tokens = null;
        expect(await authService.authenticate(req)).toBeFalsy();
    });
});

