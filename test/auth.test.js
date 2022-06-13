const {login} = require("../idps/google");
const config = require('../config');
jest.mock("../idps/google-oauth2-tokens");
const {getToken, verifyIdToken} = require("../idps/google-oauth2-tokens");
const {authenticated} = require("../controllers/auth-api");

const id_token = {
    "id_token": "TEST BENTO TOKENS"
};

const pay_load = {
    "given_name": "BENTO LOGIN TEST ID",
    "family_name": "BENTO"
};

describe('Authentication Test', () => {
    test('/login', async () => {
        getToken.mockReturnValue(Promise.resolve(id_token));
        verifyIdToken.mockReturnValue(Promise.resolve(pay_load));

        const {name, tokens} = await login("TEST");
        expect(name).toBe("BENTO LOGIN TEST ID");
        expect(tokens).hasOwnProperty("id_token");
        expect(tokens.id_token).toBe("TEST BENTO TOKENS");
    });
});

describe('Login Status Test', () => {

    let req = {
        session: {
            tokens: id_token
        }
    };

    const res = {
        status: jest.fn(()=>res),
        send: jest.fn()
    };

    test('/authenticated true', async () => {
        await authenticated(req, res, jest.fn());
        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({status: true});
    });

    test('/authenticated false', async () => {
        req.session.tokens = null;
        await authenticated(req, res, jest.fn());
        expect(res.status).toBeCalledWith(200);
        expect(res.send).toBeCalledWith({status: false});
    });
});

describe('Authentication Property Read TEST', () => {
    test('/null check', async () => {
        expect(config.nih).not.toBeNull();
        expect(config.google).not.toBeNull();
    });
});
