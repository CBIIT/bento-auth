const {TokenService} = require("../../services/token-service");
const {v4} = require("uuid");
const {sign} = require("jsonwebtoken");

const tokenSecret = "secret";
const tokenTimeout = 60;
const tokenService = new TokenService(tokenSecret);

describe('authenticate user token tests', () => {

    let token, userInfo, uuid;

    beforeEach(() => {
        uuid = v4();
        userInfo = {
            email: 'placeholderEmail',
            IDP: 'placeholderIDP',
            uuid: uuid
        }
    });


    test('invalid token', () => {
        token = createToken(userInfo, "secret2", tokenTimeout);
        expect(tokenService.authenticateUserToken(token, [uuid])).toBeFalsy();
        expect(tokenService.authenticateUserToken(undefined, [uuid])).toBeFalsy();
    });

    test('token uuid not in array', () => {
        token = createToken(userInfo, tokenSecret, tokenTimeout);
        expect(tokenService.authenticateUserToken(token, ["placeholderUUID"])).toBeFalsy();
        expect(tokenService.authenticateUserToken(token, [])).toBeFalsy();
    });

    test('invalid or missing user info', () => {
        token = createToken({}, tokenSecret, tokenTimeout);
        expect(tokenService.authenticateUserToken(token, [uuid])).toBeFalsy();
    });

    test('valid token and uuid in array', () => {
        token = createToken(userInfo, tokenSecret, tokenTimeout);
        expect(tokenService.authenticateUserToken(token, [uuid])).toBeTruthy();
    });


});

function createToken(userInfo, token_secret, tokenTimeout) {
    return sign(
        userInfo,
        token_secret,
        {expiresIn: tokenTimeout }
    );
}