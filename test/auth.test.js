const app = require('../app');
const request = require('supertest');
const {NIH, LOGIN_GOV} = require("../constants/idp-constants");
jest.mock("../idps/nih");
describe('GET /auth test', ()=> {
    const LOGOUT_ROUTE = '/api/auth/logout';
    afterEach(() => {
        jest.clearAllMocks();
    });

    test(`auth logout nih`, async () => {
        const nihClient = require('../idps/nih');
        nihClient.logout.mockReturnValue(Promise.resolve());
        await request(app)
            .post(LOGOUT_ROUTE)
            .send({IDP: NIH})
            .expect(200);
        expect(nihClient.logout).toBeCalledTimes(1);
    });

    test(`auth logout login.gov`, async () => {
        const nihClient = require('../idps/nih');
        nihClient.logout.mockReturnValue(Promise.resolve());
        await request(app)
            .post(LOGOUT_ROUTE)
            .send({IDP: LOGIN_GOV})
            .expect(200);
        expect(nihClient.logout).toBeCalledTimes(1);
    });
});
