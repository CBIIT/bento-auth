const app = require('../app');
const config = require("../config");
const request = require('supertest');

jest.useFakeTimers('legacy');
describe('GET /health test', ()=> {
    test(`ping`, async () => {
        const res = await request(app)
            .get('/api/auth/ping')
            .expect(200);
        expect(res.text).toBe('pong');
    });

    test(`version & date`, async () => {
        const res = await request(app)
            .get('/api/auth/version')
            .expect(200);
        expect(res._body.version).toBe(config.version);
    });

});
