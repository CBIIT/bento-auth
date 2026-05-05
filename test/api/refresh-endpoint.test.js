const request = require('supertest');
const express = require('express');
const session = require('express-session');
const logger = require('winston');

// Mock dependencies
jest.mock('../../services/ras-auth');
jest.mock('../../services/mySQL/mySQL-operations');
jest.mock('../../neo4j/event-service');
jest.mock('../../idps', () => ({
    login: jest.fn(),
    authenticated: jest.fn(),
    logout: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mock.jwt.token'),
    verify: jest.fn(() => ({ sub: 'mock-user' })),
    decode: jest.fn(() => ({ sub: 'mock-user' }))
}));

const { refreshRASTokenBundle, rasUserInfo, validateRASPassport } = require('../../services/ras-auth');
const mySQLOps = require('../../services/mySQL/mySQL-operations');

// Create test app
const app = express();
app.use(express.json());

// Add session middleware
app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true
}));

// Import router after mocks are setup
const authRouter = require('../../routes/auth');
app.use('/api/auth', authRouter);

describe('POST /api/auth/refresh', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default logger behavior
        logger.debug = jest.fn();
        logger.info = jest.fn();
        logger.warn = jest.fn();
        logger.error = jest.fn();
    });

    it('should return 401 when no refresh token is available for implicit session id', async () => {
        mySQLOps.getSessionTokens.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({})
            .expect(401);

        expect(response.body.error).toBe('No refresh token available');
    });

    it('should return 401 if no refresh token available', async () => {
        mySQLOps.getSessionTokens.mockResolvedValue(null);

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({ session_id: 'test_session' })
            .expect(401);

        expect(response.body.error).toBe('No refresh token available');
        expect(mySQLOps.getSessionTokens).toHaveBeenCalledWith('test_session');
    });

    it('should successfully refresh tokens', async () => {
        const oldTokens = {
            accessToken: 'old_access',
            refreshToken: 'old_refresh',
            idToken: 'old_id',
            tokenType: 'Bearer',
            scope: 'openid email profile',
            expiresAt: Date.now()
        };

        const newTokens = {
            accessToken: 'new_access',
            refreshToken: 'new_refresh',
            idToken: 'new_id',
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

        mySQLOps.getSessionTokens.mockResolvedValue(oldTokens);
        refreshRASTokenBundle.mockResolvedValue(newTokens);
        rasUserInfo.mockResolvedValue(userInfo);
        validateRASPassport.mockResolvedValue(true);
        mySQLOps.updateSessionTokens.mockResolvedValue(true);

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({ session_id: 'test_session' })
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.email).toBeUndefined();
        expect(response.body.expires_at).toBe(newTokens.expiresAt);
        
        // Verify calls
        expect(refreshRASTokenBundle).toHaveBeenCalledWith(oldTokens.refreshToken);
        expect(rasUserInfo).toHaveBeenCalledWith(newTokens.accessToken);
        expect(validateRASPassport).toHaveBeenCalledWith(userInfo.passport_jwt_v11);
        expect(mySQLOps.updateSessionTokens).toHaveBeenCalledWith('test_session', newTokens);
    });

    it('should return 401 if passport validation fails', async () => {
        const oldTokens = {
            accessToken: 'old_access',
            refreshToken: 'old_refresh'
        };

        const newTokens = {
            accessToken: 'new_access',
            refreshToken: 'new_refresh',
            expiresAt: Date.now() + 3600000
        };

        const userInfo = {
            email: 'user@example.org',
            passport_jwt_v11: 'invalid_passport'
        };

        mySQLOps.getSessionTokens.mockResolvedValue(oldTokens);
        refreshRASTokenBundle.mockResolvedValue(newTokens);
        rasUserInfo.mockResolvedValue(userInfo);
        validateRASPassport.mockResolvedValue(false);

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({ session_id: 'test_session' })
            .expect(401);

        expect(response.body.error).toBe('Passport validation failed');
        expect(mySQLOps.updateSessionTokens).not.toHaveBeenCalled();
    });

    it('should return 500 if database update fails', async () => {
        const oldTokens = {
            accessToken: 'old_access',
            refreshToken: 'old_refresh'
        };

        const newTokens = {
            accessToken: 'new_access',
            refreshToken: 'new_refresh',
            expiresAt: Date.now() + 3600000
        };

        const userInfo = {
            email: 'user@example.org',
            passport_jwt_v11: 'valid_passport'
        };

        mySQLOps.getSessionTokens.mockResolvedValue(oldTokens);
        refreshRASTokenBundle.mockResolvedValue(newTokens);
        rasUserInfo.mockResolvedValue(userInfo);
        validateRASPassport.mockResolvedValue(true);
        mySQLOps.updateSessionTokens.mockResolvedValue(false);

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({ session_id: 'test_session' })
            .expect(500);

        expect(response.body.error).toBe('Failed to persist updated tokens');
    });

    it('should handle RAS API errors gracefully', async () => {
        const oldTokens = {
            accessToken: 'old_access',
            refreshToken: 'invalid_refresh'
        };

        mySQLOps.getSessionTokens.mockResolvedValue(oldTokens);
        refreshRASTokenBundle.mockRejectedValue(new Error('RAS service unavailable'));

        const response = await request(app)
            .post('/api/auth/refresh')
            .send({ session_id: 'test_session' })
            .expect(500);

        expect(response.body.error).toContain('RAS service unavailable');
    });

    it('should use session tokens if available instead of fetching from DB', async () => {
        const tokens = {
            accessToken: 'session_access',
            refreshToken: 'session_refresh',
            expiresAt: Date.now() + 3600000
        };

        const newTokens = {
            accessToken: 'new_access',
            refreshToken: 'new_refresh',
            expiresAt: Date.now() + 3600000
        };

        const userInfo = {
            email: 'user@example.org',
            passport_jwt_v11: 'valid_passport'
        };

        // Create app with session
        const testApp = express();
        testApp.use(express.json());
        testApp.use(session({
            secret: 'test-secret',
            resave: false,
            saveUninitialized: true
        }));

        testApp.use((req, res, next) => {
            req.session.tokens = tokens;
            req.session.userInfo = { email: 'user@example.org', IDP: 'ras' };
            next();
        });

        testApp.use('/api/auth', authRouter);

        refreshRASTokenBundle.mockResolvedValue(newTokens);
        rasUserInfo.mockResolvedValue(userInfo);
        validateRASPassport.mockResolvedValue(true);
        mySQLOps.updateSessionTokens.mockResolvedValue(true);

        const response = await request(testApp)
            .post('/api/auth/refresh')
            .send({})
            .expect(200);

        expect(response.body.status).toBe('success');
        // Should NOT fetch from DB since session tokens exist
        expect(mySQLOps.getSessionTokens).not.toHaveBeenCalled();
        expect(refreshRASTokenBundle).toHaveBeenCalledWith('session_refresh');
    });
});
