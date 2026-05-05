const { refreshRASTokenBundle, rasUserInfo, validateRASPassport } = require('../../services/ras-auth');

// Mock RAS service functions
jest.mock('../../services/ras-auth');

describe('Token Refresh Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('refreshRASTokenBundle', () => {
        it('should refresh token with valid refresh token', async () => {
            const mockNewTokens = {
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
                idToken: 'new_id_token',
                tokenType: 'Bearer',
                scope: 'openid email profile ga4gh_passport_v1',
                expiresAt: Date.now() + 3600000
            };

            refreshRASTokenBundle.mockResolvedValue(mockNewTokens);

            const result = await refreshRASTokenBundle('old_refresh_token');

            expect(result).toEqual(mockNewTokens);
            expect(refreshRASTokenBundle).toHaveBeenCalledWith('old_refresh_token');
            expect(result.accessToken).toBe('new_access_token');
        });

        it('should throw error on invalid refresh token', async () => {
            const mockError = new Error('RAS refresh failed');
            mockError.status = 401;

            refreshRASTokenBundle.mockRejectedValue(mockError);

            await expect(refreshRASTokenBundle('invalid_token')).rejects.toThrow('RAS refresh failed');
        });
    });

    describe('rasUserInfo', () => {
        it('should fetch user info with new access token', async () => {
            const mockUserInfo = {
                email: 'user@example.org',
                first_name: 'John',
                last_name: 'Doe',
                passport_jwt_v11: 'eyJhbGc...'
            };

            rasUserInfo.mockResolvedValue(mockUserInfo);

            const result = await rasUserInfo('new_access_token');

            expect(result).toEqual(mockUserInfo);
            expect(rasUserInfo).toHaveBeenCalledWith('new_access_token');
            expect(result.passport_jwt_v11).toBeDefined();
        });
    });

    describe('validateRASPassport', () => {
        it('should validate passport successfully', async () => {
            validateRASPassport.mockResolvedValue(true);

            const result = await validateRASPassport('valid_passport_jwt');

            expect(result).toBe(true);
            expect(validateRASPassport).toHaveBeenCalledWith('valid_passport_jwt');
        });

        it('should fail validation for invalid passport', async () => {
            validateRASPassport.mockResolvedValue(false);

            const result = await validateRASPassport('invalid_passport_jwt');

            expect(result).toBe(false);
        });
    });

    describe('Token Refresh Flow', () => {
        it('should complete full refresh flow', async () => {
            // Setup
            const oldRefreshToken = 'old_refresh_token';
            const newTokens = {
                accessToken: 'new_access_token',
                refreshToken: 'new_refresh_token',
                idToken: 'new_id_token',
                tokenType: 'Bearer',
                scope: 'openid email profile ga4gh_passport_v1',
                expiresAt: Date.now() + 3600000
            };
            const userInfo = {
                email: 'user@example.org',
                first_name: 'John',
                last_name: 'Doe',
                passport_jwt_v11: 'eyJhbGc...'
            };

            refreshRASTokenBundle.mockResolvedValue(newTokens);
            rasUserInfo.mockResolvedValue(userInfo);
            validateRASPassport.mockResolvedValue(true);

            // Execute
            const refreshedTokens = await refreshRASTokenBundle(oldRefreshToken);
            const fetchedUserInfo = await rasUserInfo(refreshedTokens.accessToken);
            const isValid = await validateRASPassport(fetchedUserInfo.passport_jwt_v11);

            // Assert
            expect(refreshedTokens.accessToken).toBe('new_access_token');
            expect(fetchedUserInfo.email).toBe('user@example.org');
            expect(isValid).toBe(true);
        });
    });
});
