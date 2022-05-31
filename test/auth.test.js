const {ping, version, logout, authenticated } = require('../controllers/auth')
const {login} = require("../idps/google");
const config = require('../config');
jest.mock("../idps/google-oauth2-tokens");
const {getToken, verifyIdToken} = require("../idps/google-oauth2-tokens");

const id_token = {
    "id_token": "TEST BENTO TOKENS"
};

const pay_load = {
    "given_name": "BENTO LOGIN TEST ID",
    "family_name": "BENTO"
};

// describe('Authentication Test', () => {
//     test('/login', async () => {
//         getToken.mockReturnValue(Promise.resolve(id_token));
//         verifyIdToken.mockReturnValue(Promise.resolve(pay_load));
//
//         const {name, tokens} = await login("TEST");
//         expect(name).toBe("BENTO LOGIN TEST ID");
//         expect(tokens).hasOwnProperty("id_token");
//         expect(tokens.id_token).toBe("TEST BENTO TOKENS");
//     });
// });
//
//
// describe('Login Status Test', () => {
//
//     let req = {
//         session: {
//             tokens: id_token
//         }
//     };
//
//     const res = {
//         status: jest.fn(()=>res),
//         send: jest.fn()
//     };
//
//     test('/authenticated true', async () => {
//         await authenticated(req, res, jest.fn());
//         expect(res.status).toBeCalledWith(200);
//         expect(res.send).toBeCalledWith({status: true});
//     });
//
//     test('/authenticated false', async () => {
//         req.session.tokens = null;
//         await authenticated(req, res, jest.fn());
//         expect(res.status).toBeCalledWith(200);
//         expect(res.send).toBeCalledWith({status: false});
//     });
//
//     test('/authenticated throw error', async () => {
//         await authenticated({}, res, jest.fn());
//         expect(res.status).toBeCalledWith(500);
//     });
//
// });
//
// describe('Logout After Login Test', () => {
//     let req = {session: {
//             // TODO session destroy
//             destroy: async ()=> Promise.resolve(true)
//         }};
//     // Login Before Logout
//     beforeAll(async () => {
//         getToken.mockReturnValue(Promise.resolve({}));
//         verifyIdToken.mockReturnValue(Promise.resolve({}));
//         const {tokens} = await login("TEST");
//         req.session.tokens= tokens;
//     });
//
//     test('/logout', async () => {
//         const res = {
//             status: jest.fn(()=>res),
//             send: jest.fn()
//         }
//         const err = jest.fn();
//         await logout(req, res, err);
//         expect(res.status).toBeCalledWith(200);
//         expect(res.send).toBeCalledWith({status: 'success'});
//     });
// });

describe('Connection Test', () => {
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

describe('Authentication Property Read TEST', () => {
    test('/null check', async () => {
        expect(config.nih).not.toBeNull();
        expect(config.login_gov).not.toBeNull();
    });
});


