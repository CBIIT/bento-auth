jest.mock('../../services/ras-auth', () => ({
    getRASTokenBundle: jest.fn(),
    refreshRASTokenBundle: jest.fn(),
    rasUserInfo: jest.fn(),
    validateRASPassport: jest.fn()
}));

const {
    getRASTokenBundle,
    refreshRASTokenBundle,
    rasUserInfo,
    validateRASPassport
} = require('../../services/ras-auth');

const rasClient = require('../../idps/ras');

describe('RAS IDP client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('login returns user and structured tokens', async () => {
        getRASTokenBundle.mockResolvedValue({
            accessToken: 'a',
            refreshToken: 'r',
            idToken: 'i',
            tokenType: 'Bearer',
            scope: 'openid ga4gh_passport_v1',
            expiresAt: Date.now() + 1000
        });
        rasUserInfo.mockResolvedValue({
            email: 'u@example.org',
            first_name: 'U',
            last_name: 'One',
            passport_jwt_v11: 'p.jwt'
        });
        validateRASPassport.mockResolvedValue(true);

        const result = await rasClient.login('code', 'redirect');

        expect(result.email).toBe('u@example.org');
        expect(result.tokens.accessToken).toBe('a');
        expect(result.passportJWT).toBe('p.jwt');
    });

    test('authenticated refreshes once on token failure', async () => {
        rasUserInfo
            .mockRejectedValueOnce(Object.assign(new Error('401'), { status: 401 }))
            .mockResolvedValueOnce({ email: 'u@example.org', passport_jwt_v11: 'p.jwt' });
        refreshRASTokenBundle.mockResolvedValue({
            accessToken: 'new',
            refreshToken: 'r2',
            idToken: 'i2',
            tokenType: 'Bearer',
            scope: 'openid',
            expiresAt: Date.now() + 1000
        });
        validateRASPassport.mockResolvedValue(true);

        const stateTokens = { accessToken: 'old', refreshToken: 'r1' };
        const result = await rasClient.authenticated(stateTokens);

        expect(result.isAuthenticated).toBe(true);
        expect(result.tokens.accessToken).toBe('new');
    });
});
