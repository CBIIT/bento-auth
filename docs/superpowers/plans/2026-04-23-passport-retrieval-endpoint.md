# Passport Retrieval Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an authenticated endpoint that allows clients to retrieve their stored GA4GH Passport JWT via session cookie.

**Architecture:** Three-layer implementation — database access function in mySQLOps, service method in UserService, and route handler in auth.js. Passport queries use session_id from `connect.sid` cookie to look up user email/idp, then retrieves passport from `ctdc.user_passports` table.

**Tech Stack:** Node.js/Express, MySQL, existing service patterns (UserService, mySQLOps)

---

## File Structure & Responsibilities

| File | Responsibility | Change Type |
|------|-----------------|-------------|
| `services/mySQL/mySQL-operations.js` | Raw database queries for passport lookup | Modify: add `getPassportByEmail()` function |
| `services/user-service.js` | Business logic: session → email/idp → passport | Modify: add `getPassportBySession()` method |
| `routes/auth.js` | HTTP endpoint and response formatting | Modify: add `GET /passport` route |
| `test/services/user-passport-retrieval.test.js` | Unit tests for data and business logic layers | Create new |

---

## Task 1: Write Unit Tests for mySQLOps.getPassportByEmail()

**Files:**
- Create: `test/services/user-passport-retrieval.test.js`

- [ ] **Step 1: Create test file with mocked MySQL operations**

Create file `test/services/user-passport-retrieval.test.js`:

```javascript
const { mySQLOps } = require('../../services/mySQL/mySQL-operations');
const mysql = require('mysql');
const logger = require('winston');

// Mock logger to prevent output during tests
jest.mock('winston');

describe('User Passport Retrieval', () => {
    describe('mySQLOps.getPassportByEmail()', () => {
        let mockConnection;
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- test/services/user-passport-retrieval.test.js
```

**Expected output**: FAIL with "mySQLOps.getPassportByEmail is not a function"

---

## Task 2: Implement mySQLOps.getPassportByEmail()

**Files:**
- Modify: `services/mySQL/mySQL-operations.js`

- [ ] **Step 1: Add getPassportByEmail function to mySQLOps**

Find the end of the mySQLOps file (before module.exports), and add this function:

```javascript
async function getPassportByEmail(email, idp) {
    let currentConnection = null;
    try {
        currentConnection = await new Promise((resolve, reject) => {
            connection.getConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
            });
        });

        return await new Promise((resolve, reject) => {
            const query = `SELECT passport_jwt_v11 FROM ctdc.user_passports WHERE email = ? AND idp = ?`;
            currentConnection.query(query, [email, idp], (err, rows) => {
                if (err) reject(err);
                else {
                    if (!rows || rows.length === 0) {
                        resolve(null);
                    } else {
                        resolve(rows[0].passport_jwt_v11);
                    }
                }
            });
        });
    } catch (error) {
        logger.error(`getPassportByEmail error: ${error.message}`);
        throw error;
    } finally {
        if (currentConnection) {
            currentConnection.release();
        }
    }
}
```

- [ ] **Step 2: Export the new function**

Find the `module.exports` section at the end of `services/mySQL/mySQL-operations.js`. Locate the line with `updateSessionTokens` and add `getPassportByEmail` to the exports:

```javascript
module.exports = {
    getCreateCommand,
    getEventAfterTimestamp,
    compareSessionID,
    getLastLogin,
    clearEventsBeforeTimestamp,
    upsertUserPassportJWT,
    getSessionTokens,
    updateSessionTokens,
    getPassportByEmail
};
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
npm test -- test/services/user-passport-retrieval.test.js
```

**Expected output**: PASS (4 passing tests)

---

## Task 3: Write Unit Tests for UserService.getPassportBySession()

**Files:**
- Modify: `test/services/user-passport-retrieval.test.js`

- [ ] **Step 1: Add UserService tests to the same test file**

Add this new test suite to `test/services/user-passport-retrieval.test.js` (after the mySQLOps tests):

```javascript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- test/services/user-passport-retrieval.test.js
```

**Expected output**: FAIL for UserService tests with "getPassportBySession is not a function"

---

## Task 4: Implement UserService.getPassportBySession()

**Files:**
- Modify: `services/user-service.js`

- [ ] **Step 1: Add getPassportBySession method to UserService class**

Find the UserService class in `services/user-service.js` and add this method after the `persistUserPassportJWT` method:

```javascript
    async getPassportBySession(sessionId) {
        if (!sessionId) {
            return null;
        }
        if (typeof this.dataService.getSessionTokens !== 'function') {
            throw new Error('Session retrieval service is not configured');
        }
        if (typeof this.dataService.getPassportByEmail !== 'function') {
            throw new Error('Passport retrieval service is not configured');
        }

        try {
            // Get session data to extract email and IDP
            const sessionData = await this.dataService.getSessionTokens(sessionId);
            
            if (!sessionData || !sessionData.userInfo) {
                return null;
            }

            const { email, IDP } = sessionData.userInfo;
            
            if (!email || !IDP) {
                return null;
            }

            // Retrieve passport using email and IDP
            const passport = await this.dataService.getPassportByEmail(email, IDP);
            
            return passport;
        } catch (error) {
            throw error;
        }
    }
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm test -- test/services/user-passport-retrieval.test.js
```

**Expected output**: PASS (9 passing tests total: 4 for mySQLOps + 5 for UserService)

---

## Task 5: Implement GET /api/auth/passport Route Handler

**Files:**
- Modify: `routes/auth.js`

- [ ] **Step 1: Add route handler before the module.exports line**

Add this route handler to `routes/auth.js`, before the `module.exports = router;` line:

```javascript
/* Get Passport */
// Returns the authenticated user's GA4GH Passport JWT
router.get('/passport', async function (req, res) {
    logger.debug(`[${req.method}] ${req.path} - Passport retrieval request`);
    try {
        // Extract session ID from connect.sid cookie
        const sessionId = req.sessionID;
        
        if (!sessionId) {
            logger.info('Passport retrieval: session_id not provided');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Retrieve passport using UserService
        const passportJWT = await userService.getPassportBySession(sessionId);

        if (!passportJWT) {
            logger.debug(`Passport retrieval: passport not found for session ${sessionId}`);
            return res.status(404).json({ error: 'Passport not found' });
        }

        logger.info(`Passport retrieval successful for session: ${sessionId}`);
        res.status(200).json({ passportJWT });
    } catch (error) {
        logger.error(`Passport retrieval failed: ${error.message}`);
        res.status(500).json({ error: 'Failed to retrieve passport' });
    }
});
```

- [ ] **Step 2: Verify the route is accessible**

Check that the route appears in auth.js with no syntax errors:

```bash
node -c routes/auth.js
```

**Expected output**: No syntax errors (command exits with code 0)

---

## Task 6: Write Integration Test for Full Endpoint

**Files:**
- Modify: `test/services/user-passport-retrieval.test.js`

- [ ] **Step 1: Add integration test for the GET /passport route**

Add this test suite to `test/services/user-passport-retrieval.test.js` (at the end of the file):

```javascript
describe('GET /api/auth/passport Integration Test', () => {
    const request = require('supertest');
    const app = require('../../app');

    test('should return 200 with passport when authenticated and passport exists', async () => {
        const testPassport = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...';

        const response = await request(app)
            .get('/api/auth/passport')
            .expect(200);

        expect(response.body).toHaveProperty('passportJWT');
    });

    test('should return 404 when passport does not exist', async () => {
        const response = await request(app)
            .get('/api/auth/passport')
            .expect(404);

        expect(response.body).toEqual({ error: 'Passport not found' });
    });

    test('should return 401 when no session exists', async () => {
        const response = await request(app)
            .get('/api/auth/passport')
            .expect(401);

        expect(response.body).toEqual({ error: 'Unauthorized' });
    });
});
```

- [ ] **Step 2: Run integration tests**

```bash
npm test -- test/services/user-passport-retrieval.test.js --testNamePattern="Integration"
```

**Expected output**: PASS (3 integration tests pass)

---

## Task 7: Verify All Tests Pass and Commit

**Files:**
- Modified: `services/mySQL/mySQL-operations.js`
- Modified: `services/user-service.js`
- Modified: `routes/auth.js`
- Created: `test/services/user-passport-retrieval.test.js`

- [ ] **Step 1: Run all tests for the feature**

```bash
npm test -- test/services/user-passport-retrieval.test.js
```

**Expected output**: PASS (12+ total tests passing)

- [ ] **Step 2: Run full test suite to ensure no regressions**

```bash
npm test 2>&1 | tail -20
```

**Expected output**: All existing tests still pass; new tests added

- [ ] **Step 3: Stage and commit**

```bash
git add \
  services/mySQL/mySQL-operations.js \
  services/user-service.js \
  routes/auth.js \
  test/services/user-passport-retrieval.test.js
```

- [ ] **Step 4: Create commit**

```bash
git commit -m "feat(auth): add passport retrieval endpoint

- Add GET /api/auth/passport route for retrieving GA4GH passport from session
- Implement UserService.getPassportBySession() to retrieve passport via session_id
- Add mySQLOps.getPassportByEmail() database function with parameterized queries
- Include comprehensive unit and integration tests
- Endpoint returns 200 with passportJWT, 404 if not found, 401 if unauthorized"
```

- [ ] **Step 5: Verify commit**

```bash
git log -1 --oneline
```

**Expected output**: Shows the new commit with the feat(auth): message

---

## Execution Options

Plan complete and saved to `docs/superpowers/plans/2026-04-23-passport-retrieval-endpoint.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** 
- I dispatch a fresh subagent per task
- Provides intermediate review between tasks
- Fast iteration with fresh context per step

**2. Inline Execution** 
- Execute tasks in this session sequentially
- Batch execution with checkpoints

**Which approach would you prefer?**
