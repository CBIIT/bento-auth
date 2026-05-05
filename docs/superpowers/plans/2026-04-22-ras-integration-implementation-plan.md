# RAS Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an explicit `ras` provider path with reactive refresh, passport validation, and database persistence of `passport_jwt_v11`, while keeping existing `nih` behavior unchanged.

**Architecture:** Keep the current route -> idp dispatcher -> provider client pattern. Add dedicated RAS config/constants/client code paths in parallel to NIH. Store structured token bundles in session and persist validated `passport_jwt_v11` in MySQL through explicit data-service methods.

**Tech Stack:** Node.js, Express, `node-fetch`, MySQL (`mysql` package), Jest, Supertest.

---

### Task 1: Add RAS Configuration and Provider Dispatch

**Files:**
- Modify: `config.js`
- Modify: `constants/idp-constants.js`
- Modify: `idps/index.js`
- Modify: `test/auth.test.js`

- [ ] **Step 1: Write failing test for `ras` login dispatch in `test/auth.test.js`**

```js
jest.mock("../idps/ras");

const {NIH, LOGIN_GOV, GOOGLE, RAS} = require("../constants/idp-constants");

// ...inside describe block

test(`auth ras login called once`, async () => {
  const rasClient = require('../idps/ras');
  rasClient.login.mockReturnValue(Promise.resolve(mockLoginResult));
  await request(app)
    .post(LOGIN_ROUTE)
    .send({ code: 'code', IDP: RAS })
    .expect(200);
  expect(rasClient.login).toBeCalledTimes(1);
});
```

- [ ] **Step 2: Run test to verify it fails (RAS not wired yet)**

Run: `npx jest test/auth.test.js -t "auth ras login called once"`
Expected: FAIL because `idps/index.js` does not route `ras`.

- [ ] **Step 3: Add RAS constant in `constants/idp-constants.js`**

```js
module.exports = Object.freeze({
  GOOGLE: 'google',
  LOGIN_GOV: 'login.gov',
  NIH: 'nih',
  TEST: 'test-idp',
  DCF: 'dcf',
  RAS: 'ras'
});
```

- [ ] **Step 4: Add RAS config block in `config.js` and redirect fallback**

```js
ras: {
  CLIENT_ID: process.env.RAS_CLIENT_ID,
  CLIENT_SECRET: process.env.RAS_CLIENT_SECRET,
  BASE_URL: process.env.RAS_BASE_URL,
  REDIRECT_URL: process.env.RAS_REDIRECT_URL,
  USERINFO_URL: process.env.RAS_USERINFO_URL,
  AUTHORIZE_URL: process.env.RAS_AUTHORIZE_URL,
  TOKEN_URL: process.env.RAS_TOKEN_URL,
  LOGOUT_URL: process.env.RAS_LOGOUT_URL,
  VALIDATE_URL: process.env.RAS_VALIDATE_URL,
  SCOPE: process.env.RAS_SCOPE,
  PROMPT: process.env.RAS_PROMPT
},

// in getUrlOrDefault
if (!url && isCaseInsensitiveEqual(idp,'RAS')) return process.env.RAS_REDIRECT_URL;
```

- [ ] **Step 5: Wire RAS branch in `idps/index.js` login/authenticated routing**

```js
const rasClient = require('./ras');
const {NIH, GOOGLE, LOGIN_GOV, TEST, DCF, RAS} = require("../constants/idp-constants");

// login switch
case isCaseInsensitiveEqual(idp, RAS):
  return rasClient.login(code, redirectingURL);

// authenticated route
} else if (isCaseInsensitiveEqual(userSession.idp, RAS)) {
  return await rasClient.authenticated(tokens);
}
```

- [ ] **Step 6: Run targeted auth tests**

Run: `npx jest test/auth.test.js`
Expected: PASS for existing tests and new RAS dispatch test.

- [ ] **Step 7: Commit Task 1**

```bash
git add config.js constants/idp-constants.js idps/index.js test/auth.test.js
git commit -m "feat(auth): add ras provider config and dispatch"
```

### Task 2: Implement RAS Service for Token, UserInfo, Refresh, Validation

**Files:**
- Create: `services/ras-auth.js`
- Create: `test/services/ras-auth.test.js`

- [ ] **Step 1: Write failing service tests in `test/services/ras-auth.test.js`**

```js
const nodeFetch = require('node-fetch');
jest.mock('node-fetch');

const {
  getRASTokenBundle,
  refreshRASTokenBundle,
  rasUserInfo,
  validateRASPassport
} = require('../../services/ras-auth');

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

test('validateRASPassport returns true for Valid response', async () => {
  nodeFetch.mockResolvedValue({ status: 200, text: async () => 'Valid' });
  await expect(validateRASPassport('passport.jwt')).resolves.toBe(true);
});
```

- [ ] **Step 2: Run failing tests**

Run: `npx jest test/services/ras-auth.test.js`
Expected: FAIL because `services/ras-auth.js` does not exist.

- [ ] **Step 3: Implement `services/ras-auth.js`**

```js
const nodeFetch = require("node-fetch");
const config = require("../config");

const client = config.ras;

function normalizeTokenResponse(jsonResponse) {
  const expiresInMs = (jsonResponse.expires_in || 0) * 1000;
  const skewMs = 60 * 1000;
  return {
    accessToken: jsonResponse.access_token,
    refreshToken: jsonResponse.refresh_token,
    idToken: jsonResponse.id_token,
    tokenType: jsonResponse.token_type,
    scope: jsonResponse.scope,
    expiresAt: Date.now() + Math.max(expiresInMs - skewMs, 0)
  };
}

async function getRASTokenBundle(code, redirectURI) {
  const response = await nodeFetch(client.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectURI,
      client_id: client.CLIENT_ID,
      client_secret: client.CLIENT_SECRET,
      scope: client.SCOPE
    })
  });
  const jsonResponse = await response.json();
  if (response.status !== 200) throw new Error('RAS token exchange failed');
  return normalizeTokenResponse(jsonResponse);
}

async function refreshRASTokenBundle(refreshToken) {
  const response = await nodeFetch(client.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: client.CLIENT_ID,
      client_secret: client.CLIENT_SECRET
    })
  });
  const jsonResponse = await response.json();
  if (response.status !== 200) throw new Error('RAS refresh failed');
  return normalizeTokenResponse(jsonResponse);
}

async function rasUserInfo(accessToken) {
  const result = await nodeFetch(client.USERINFO_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (result.status !== 200) throw new Error('RAS userinfo failed');
  return result.json();
}

async function validateRASPassport(passportJwt) {
  const result = await nodeFetch(client.VALIDATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${passportJwt}`
    }
  });
  const payload = await result.text();
  return result.status === 200 && payload.trim() === 'Valid';
}

module.exports = {
  getRASTokenBundle,
  refreshRASTokenBundle,
  rasUserInfo,
  validateRASPassport
};
```

- [ ] **Step 4: Run service tests to verify pass**

Run: `npx jest test/services/ras-auth.test.js`
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add services/ras-auth.js test/services/ras-auth.test.js
git commit -m "feat(auth): implement ras token and passport service"
```

### Task 3: Implement RAS IDP Client with Reactive Refresh

**Files:**
- Create: `idps/ras.js`
- Create: `test/services/ras-idp.test.js`

- [ ] **Step 1: Write failing IDP tests in `test/services/ras-idp.test.js`**

```js
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

test('login returns user and structured tokens', async () => {
  getRASTokenBundle.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', idToken: 'i', tokenType: 'Bearer', scope: 'openid ga4gh_passport_v1', expiresAt: Date.now() + 1000 });
  rasUserInfo.mockResolvedValue({ email: 'u@example.org', first_name: 'U', last_name: 'One', passport_jwt_v11: 'p.jwt' });
  validateRASPassport.mockResolvedValue(true);

  const result = await rasClient.login('code', 'redirect');
  expect(result.email).toBe('u@example.org');
  expect(result.tokens.accessToken).toBe('a');
  expect(result.passportJWT).toBe('p.jwt');
});

test('authenticated refreshes once on token failure', async () => {
  rasUserInfo
    .mockRejectedValueOnce(new Error('401'))
    .mockResolvedValueOnce({ email: 'u@example.org', passport_jwt_v11: 'p.jwt' });
  refreshRASTokenBundle.mockResolvedValue({ accessToken: 'new', refreshToken: 'r2', idToken: 'i2', tokenType: 'Bearer', scope: 'openid', expiresAt: Date.now() + 1000 });
  validateRASPassport.mockResolvedValue(true);

  const state = { tokens: { accessToken: 'old', refreshToken: 'r1' } };
  const ok = await rasClient.authenticated(state);
  expect(ok).toBe(true);
  expect(state.tokens.accessToken).toBe('new');
});
```

- [ ] **Step 2: Run failing tests**

Run: `npx jest test/services/ras-idp.test.js`
Expected: FAIL because `idps/ras.js` does not exist.

- [ ] **Step 3: Implement `idps/ras.js`**

```js
const {
  getRASTokenBundle,
  refreshRASTokenBundle,
  rasUserInfo,
  validateRASPassport
} = require("../services/ras-auth");

const client = {
  login: async (code, redirectingURL) => {
    const tokens = await getRASTokenBundle(code, redirectingURL);
    const user = await rasUserInfo(tokens.accessToken);
    const passportJWT = user.passport_jwt_v11;
    const valid = await validateRASPassport(passportJWT);
    if (!valid) throw new Error('RAS passport validation failed');

    return {
      name: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email,
      idp: 'ras',
      tokens,
      passportJWT,
      userInfo: user
    };
  },

  authenticated: async (state) => {
    if (!state?.tokens?.accessToken) return false;

    try {
      const user = await rasUserInfo(state.tokens.accessToken);
      return await validateRASPassport(user.passport_jwt_v11);
    } catch (_) {
      try {
        if (!state.tokens.refreshToken) return false;
        const refreshedTokens = await refreshRASTokenBundle(state.tokens.refreshToken);
        state.tokens = refreshedTokens;
        const user = await rasUserInfo(state.tokens.accessToken);
        return await validateRASPassport(user.passport_jwt_v11);
      } catch (refreshErr) {
        return false;
      }
    }
  },

  logout: async () => true
};

module.exports = client;
```

- [ ] **Step 4: Run RAS IDP tests**

Run: `npx jest test/services/ras-idp.test.js`
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add idps/ras.js test/services/ras-idp.test.js
git commit -m "feat(auth): add ras idp client with reactive refresh"
```

### Task 4: Persist `passport_jwt_v11` to MySQL

**Files:**
- Modify: `services/mySQL/mySQL-operations.js`
- Modify: `services/user-service.js`
- Create: `test/services/user-passport-storage.test.js`

- [ ] **Step 1: Write failing persistence tests in `test/services/user-passport-storage.test.js`**

```js
jest.mock('../../services/mySQL/mySQL-operations', () => ({
  upsertUserPassportJWT: jest.fn()
}));

const mySQLOps = require('../../services/mySQL/mySQL-operations');
const { UserService } = require('../../services/user-service');

test('persistUserPassportJWT calls data layer with required fields', async () => {
  const svc = new UserService(mySQLOps);
  await svc.persistUserPassportJWT({
    email: 'u@example.org',
    IDP: 'ras',
    passportJWT: 'passport.jwt'
  });
  expect(mySQLOps.upsertUserPassportJWT).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run failing tests**

Run: `npx jest test/services/user-passport-storage.test.js`
Expected: FAIL because service method/data method do not exist.

- [ ] **Step 3: Add MySQL upsert operation in `services/mySQL/mySQL-operations.js`**

```js
async function upsertUserPassportJWT({ email, idp, passportJWT }) {
  let currentConnection = null;
  try {
    currentConnection = await new Promise((resolve, reject) => {
      connection.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ctdc.user_passports (
        email VARCHAR(320) NOT NULL,
        idp VARCHAR(64) NOT NULL,
        passport_jwt_v11 LONGTEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (email, idp)
      )`;

    await new Promise((resolve, reject) => {
      currentConnection.query(createTableSQL, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const upsertSQL = `
      INSERT INTO ctdc.user_passports (email, idp, passport_jwt_v11)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE passport_jwt_v11 = VALUES(passport_jwt_v11)`;

    await new Promise((resolve, reject) => {
      currentConnection.query(upsertSQL, [email, idp, passportJWT], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return true;
  } finally {
    if (currentConnection) currentConnection.release();
  }
}

module.exports = {
  getCreateCommand,
  getEventAfterTimestamp,
  compareSessionID,
  getLastLogin,
  clearEventsBeforeTimestamp,
  upsertUserPassportJWT
};
```

- [ ] **Step 4: Add user-service wrapper in `services/user-service.js`**

```js
class UserService {
  constructor(dataService) {
    this.dataService = dataService;
  }

  getUserTokenUUIDs(userInfo) {
    if (!userInfo?.email || !userInfo?.IDP) {
      return [];
    }
    return this.dataService.getUserTokenUUIDs({
      email: userInfo.email,
      IDP: userInfo.IDP
    });
  }

  async persistUserPassportJWT({ email, IDP, passportJWT }) {
    if (!email || !IDP || !passportJWT) {
      throw new Error('persistUserPassportJWT requires email, IDP, and passportJWT');
    }
    return this.dataService.upsertUserPassportJWT({
      email,
      idp: IDP,
      passportJWT
    });
  }
}
```

- [ ] **Step 5: Run persistence tests**

Run: `npx jest test/services/user-passport-storage.test.js`
Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```bash
git add services/mySQL/mySQL-operations.js services/user-service.js test/services/user-passport-storage.test.js
git commit -m "feat(auth): persist ras passport_jwt_v11 in mysql"
```

### Task 5: Integrate RAS Login Session and Passport Persistence in Route

**Files:**
- Modify: `routes/auth.js`
- Modify: `test/auth.test.js`

- [ ] **Step 1: Add failing route tests for passport persistence and structured tokens**

```js
jest.mock('../services/user-service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      persistUserPassportJWT: jest.fn().mockResolvedValue(true)
    }))
  };
});

// In login tests for RAS response shape
expect(response.body).toHaveProperty('name');
expect(response.body).toHaveProperty('email');
```

- [ ] **Step 2: Run failing route tests**

Run: `npx jest test/auth.test.js`
Expected: FAIL where route still assumes non-RAS token shape and no passport persistence call.

- [ ] **Step 3: Update login flow in `routes/auth.js` to persist passport and structured tokens**

```js
const { name, lastName, tokens, email, idp, passportJWT } = await idpClient.login(
  req.body['code'],
  reqIDP,
  config.getUrlOrDefault(reqIDP, req.body['redirectUri'])
);

req.session.userInfo = {
  email,
  IDP: idp,
  firstName: name,
  lastName,
  tokens
};

if (passportJWT && idp.toLowerCase() === 'ras') {
  await userService.persistUserPassportJWT({
    email,
    IDP: idp,
    passportJWT
  });
}

req.session.tokens = tokens;
```

- [ ] **Step 4: Update authenticated route in `routes/auth.js` to use provider validation path**

```js
const isAuthenticated = await idpClient.authenticated(req.session.userInfo, req.session.tokens);
if (!isAuthenticated) {
  req.session.tokens = null;
}
res.status(200).send({ status: Boolean(isAuthenticated) });
```

- [ ] **Step 5: Run route tests**

Run: `npx jest test/auth.test.js`
Expected: PASS and no regressions on existing login/logout coverage.

- [ ] **Step 6: Commit Task 5**

```bash
git add routes/auth.js test/auth.test.js
git commit -m "feat(auth): integrate ras passport persistence in login route"
```

### Task 6: Final Integration and Regression Verification

**Files:**
- Verify: `routes/auth.js`
- Verify: `idps/index.js`
- Verify: `services/ras-auth.js`
- Verify: `services/mySQL/mySQL-operations.js`
- Verify: `test/auth.test.js`
- Verify: `test/services/ras-auth.test.js`
- Verify: `test/services/ras-idp.test.js`
- Verify: `test/services/user-passport-storage.test.js`

- [ ] **Step 1: Run targeted suite for changed behavior**

Run: `npx jest test/auth.test.js test/services/ras-auth.test.js test/services/ras-idp.test.js test/services/user-passport-storage.test.js`
Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run: `npx jest`
Expected: PASS (or documented pre-existing failures unchanged by this work).

- [ ] **Step 3: Validate security assertions manually in code diff**

```bash
git --no-pager diff -- routes/auth.js services/ras-auth.js services/mySQL/mySQL-operations.js | cat
```

Expected checks:
- No raw `access_token`, `refresh_token`, `id_token`, or `passport_jwt_v11` in logs.
- Passport persistence uses parameterized SQL placeholders (`?`).

- [ ] **Step 4: Final state report for review**

Run:
```bash
git --no-pager log --oneline -n 6 | cat
```
Expected: task commits present in order with clear scope.
