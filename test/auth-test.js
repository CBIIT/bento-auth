const {ping, version} = require('../controllers/auth')
const {login, authenticated} = require("../idps/google");

jest.mock("../idps/test_oauth");
const {getToken, verifyIdToken} = require("../idps/google-oauth2-tokens");


describe('Authentication Test', () => {
    test('/login', async () => {
        getToken.mockReturnValue(Promise.resolve({
            "id_token": "TEST BENTO TOKENS"
        }));

        verifyIdToken.mockReturnValue(Promise.resolve({
            "given_name": "BENTO LOGIN TEST ID",
            "family_name": "BENTO"
        }));

        const {name, tokens} = await login("TEST");
        expect(name).toBe("BENTO LOGIN TEST ID");
        expect(tokens).hasOwnProperty("id_token");
        expect(tokens.id_token).toBe("TEST BENTO TOKENS");
    });
});

describe('Routes Test', () => {
    const req= {};
    const res = {
        status: jest.fn(()=>res),
        send: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn();

    test('/ping', async () => {
        await ping(req,res,next);
        expect(res.send).toBeCalledWith('pong');
    });

    test('/version', async () => {
        await version(req, res, next);
        expect(res.json).toBeCalledWith({version: "1.0", date:"2022.05.19"});
    });
});

