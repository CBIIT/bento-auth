const logger = require('winston');

// Mock logger to prevent output during tests
jest.mock('winston');

// Mock newrelic to prevent initialization issues
jest.mock('newrelic');

// Mock session middleware to prevent database connections
jest.mock('../../services/session', () => ({
    createSession: jest.fn(() => (req, res, next) => {
        req.sessionID = 'test-session-id';
        req.session = {
            userInfo: {
                email: 'user@example.com',
                IDP: 'ras'
            }
        };
        next();
    })
}));

// Mock mysql before requiring the module
let mockConnection = {
    query: jest.fn(),
    release: jest.fn()
};

jest.mock('mysql', () => ({
    createPool: jest.fn(() => ({
        getConnection: jest.fn((callback) => {
            callback(null, mockConnection);
        })
    }))
}));

const mysql = require('mysql');
let mySQLOps;

describe('User Passport Retrieval', () => {
    beforeAll(() => {
        // Initialize mockConnection before requiring the app
        mockConnection = {
            query: jest.fn(),
            release: jest.fn()
        };
        
        // Require after mock is set up
        mySQLOps = require('../../services/mySQL/mySQL-operations').mySQLOps;
    });

    describe('mySQLOps.getPassportByEmail()', () => {
        let originalPool;

        beforeEach(() => {
            mockConnection = {
                query: jest.fn(),
                release: jest.fn()
            };

            originalPool = mysql.createPool;
            mysql.createPool = jest.fn(() => ({
                getConnection: jest.fn((callback) => {
                    callback(null, mockConnection);
                })
            }));
        });

        afterEach(() => {
            mysql.createPool = originalPool;
            jest.clearAllMocks();
        });

        test('should return passport JWT when found', async () => {
            const testPassport = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';
            const testEmail = 'user@example.com';
            const testIdp = 'ras';

            mockConnection.query.mockImplementation((query, params, callback) => {
                if (callback) {
                    callback(null, [{ passport_jwt_v11: testPassport }]);
                }
            });

            const result = await mySQLOps.getPassportByEmail(testEmail, testIdp);

            expect(result).toBe(testPassport);
            expect(mockConnection.release).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT passport_jwt_v11'),
                [testEmail, testIdp],
                expect.any(Function)
            );
        });

        test('should return null when passport not found', async () => {
            mockConnection.query.mockImplementation((query, params, callback) => {
                if (callback) {
                    callback(null, []);
                }
            });

            const result = await mySQLOps.getPassportByEmail('user@example.com', 'ras');

            expect(result).toBeNull();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        test('should throw error on database query failure', async () => {
            const dbError = new Error('Database connection failed');
            mockConnection.query.mockImplementation((query, params, callback) => {
                if (callback) {
                    callback(dbError);
                }
            });

            await expect(mySQLOps.getPassportByEmail('user@example.com', 'ras')).rejects.toThrow('Database connection failed');
            expect(mockConnection.release).toHaveBeenCalled();
        });

        test('should use parameterized queries to prevent SQL injection', async () => {
            mockConnection.query.mockImplementation((query, params, callback) => {
                if (callback) {
                    callback(null, []);
                }
            });

            await mySQLOps.getPassportByEmail('user@example.com', 'ras');

            expect(mockConnection.query).toHaveBeenCalledWith(
                expect.any(String),
                ['user@example.com', 'ras'],
                expect.any(Function)
            );
        });
    });

    describe('UserService.getPassportBySession()', () => {
        const { UserService } = require('../../services/user-service');
        let mockDataService;
        let userService;

        beforeEach(() => {
            mockDataService = {
                getSessionTokens: jest.fn(),
                getPassportByEmail: jest.fn()
            };
            userService = new UserService(mockDataService);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('should return passport JWT when session and passport exist', async () => {
            const sessionId = 'abc123';
            const testPassport = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';
            const sessionData = {
                userInfo: {
                    email: 'user@example.com',
                    IDP: 'ras'
                },
                tokens: {}
            };

            mockDataService.getSessionTokens.mockResolvedValue(sessionData);
            mockDataService.getPassportByEmail.mockResolvedValue(testPassport);

            const result = await userService.getPassportBySession(sessionId);

            expect(result).toBe(testPassport);
            expect(mockDataService.getSessionTokens).toHaveBeenCalledWith(sessionId);
            expect(mockDataService.getPassportByEmail).toHaveBeenCalledWith('user@example.com', 'ras');
        });

        test('should return null when session is invalid', async () => {
            const sessionId = 'invalid-session';
            mockDataService.getSessionTokens.mockResolvedValue(null);

            const result = await userService.getPassportBySession(sessionId);

            expect(result).toBeNull();
            expect(mockDataService.getPassportByEmail).not.toHaveBeenCalled();
        });

        test('should return null when passport does not exist', async () => {
            const sessionData = {
                userInfo: {
                    email: 'user@example.com',
                    IDP: 'google'
                },
                tokens: {}
            };

            mockDataService.getSessionTokens.mockResolvedValue(sessionData);
            mockDataService.getPassportByEmail.mockResolvedValue(null);

            const result = await userService.getPassportBySession('abc123');

            expect(result).toBeNull();
        });

        test('should throw error when session retrieval fails', async () => {
            const dbError = new Error('Database connection failed');
            mockDataService.getSessionTokens.mockRejectedValue(dbError);

            await expect(userService.getPassportBySession('abc123')).rejects.toThrow('Database connection failed');
        });

        test('should throw error when passport retrieval fails', async () => {
            const sessionData = {
                userInfo: {
                    email: 'user@example.com',
                    IDP: 'ras'
                },
                tokens: {}
            };
            const dbError = new Error('Passport query failed');

            mockDataService.getSessionTokens.mockResolvedValue(sessionData);
            mockDataService.getPassportByEmail.mockRejectedValue(dbError);

            await expect(userService.getPassportBySession('abc123')).rejects.toThrow('Passport query failed');
        });
    });


});
