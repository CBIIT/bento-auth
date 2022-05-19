const request = require('supertest');

jest.mock('../idps/google');
const idpClient = require('../idps/google');
const app = require('../app')



describe('Routes Test', () => {
    test('/ping', async () => {
        const res = await request(app).get('/api/auth/ping');
        expect(res.statusCode).toBe(200);
        expect(res.text).toEqual('pong');
    });


    test('/version', async () => {
        const res = await request(app).get('/api/auth/version');
        expect(res.statusCode).toBe(200);
        expect(res.text).hasOwnProperty('version');
        expect(res.text).hasOwnProperty('date');
    });
});

describe('Google Login Test', () => {
    test('/login', async () => {









    });
;
});