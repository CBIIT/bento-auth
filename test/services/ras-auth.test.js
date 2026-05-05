const nodeFetch = require('node-fetch');

jest.mock('node-fetch');

const {
    getRASTokenBundle,
    refreshRASTokenBundle,
    rasUserInfo,
    validateRASPassport
} = require('../../services/ras-auth');

describe('RAS auth service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getRASTokenBundle returns structured token bundle', async () => {
        nodeFetch.mockResolvedValue({
            status: 200,
            json: async () => ({
                access_token: 'a',
                refresh_token: 'r',
                id_token: 'i',
                token_type: 'Bearer',
                scope: 'openid ga4gh_passport_v1',
                expires_in: 1800
            })
        });

        const tokenBundle = await getRASTokenBundle('code', 'https://redirect');

        expect(tokenBundle.accessToken).toBe('a');
        expect(tokenBundle.refreshToken).toBe('r');
        expect(tokenBundle.idToken).toBe('i');
        expect(tokenBundle.tokenType).toBe('Bearer');
        expect(tokenBundle.expiresAt).toBeGreaterThan(Date.now());
    });

    test('refreshRASTokenBundle returns structured token bundle', async () => {
        nodeFetch.mockResolvedValue({
            status: 200,
            json: async () => ({
                access_token: 'a2',
                refresh_token: 'r2',
                id_token: 'i2',
                token_type: 'Bearer',
                scope: 'openid ga4gh_passport_v1',
                expires_in: 1800
            })
        });

        const tokenBundle = await refreshRASTokenBundle('refresh-token');

        expect(tokenBundle.accessToken).toBe('a2');
        expect(tokenBundle.refreshToken).toBe('r2');
    });

    test('rasUserInfo returns JSON payload', async () => {
        nodeFetch.mockResolvedValue({
            status: 200,
            json: async () => ({ email: 'u@example.org' })
        });

        const payload = await rasUserInfo('access');

        expect(payload.email).toBe('u@example.org');
    });

    test('validateRASPassport returns true for Valid response', async () => {
        nodeFetch.mockResolvedValue({ status: 200, text: async () => 'Valid' });

        await expect(validateRASPassport('passport.jwt')).resolves.toBe(true);
    });
});
