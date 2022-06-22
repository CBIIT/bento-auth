const {ping, version} = require('../controllers/healthcheck')

describe('Connection Test', () => {
    const req= {};
    const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn();

    test('/api/auth/ping', async () => {
        await ping(req,res,next);
        expect(res.send).toBeCalledWith('pong');
    });

    test('/api/auth/version', async () => {
        await version(req, res, next);
        expect(res.json).toBeCalledWith({version: "1.0", date:"2022.05.19"});
    });
});