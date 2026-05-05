# Runtime Flows & Request Processing

## Top-Level Flow Categories

```mermaid
graph TB
    Request["Incoming Request"]
    
    Request -->|POST /login| LoginFlow["Login Flow"]
    Request -->|POST /logout| LogoutFlow["Logout Flow"]
    Request -->|POST /authenticated| AuthCheckFlow["Auth Check Flow"]
    Request -->|POST /refresh| RefreshFlow["RAS Refresh Flow"]
    Request -->|GET /userInfo| PassportFlow["Passport Retrieval Flow"]
    Request -->|POST /cleanUp| CleanupFlow["Cleanup Flow"]
    Request -->|GET /ping or /version or /session-ttl| HealthFlow["Health Check"]
    
    LoginFlow --> L1["1. Exchange auth code with IDP<br/>2. Retrieve user profile<br/>3. Persist session and optional passport<br/>4. Log login event<br/>5. Return session-backed auth state"]
    
    LogoutFlow --> L2["1. Notify IDP for logout<br/>2. Destroy session<br/>3. Log logout event"]
    
    AuthCheckFlow --> L3["1. Check session tokens exist<br/>2. Return auth status"]

    RefreshFlow --> L6["1. Load refresh token from session<br/>2. Exchange for new RAS tokens<br/>3. Validate refreshed passport<br/>4. Persist updated tokens and passport"]

    PassportFlow --> L7["1. Resolve req.sessionID<br/>2. Load session userInfo<br/>3. Query stored passport by email and IDP<br/>4. Return raw passport JWT"]
    
    CleanupFlow --> L4["1. Verify JWT signature<br/>2. Validate token expiry<br/>3. Clean up stale sessions"]
    
    HealthFlow --> L5["1. Return pong or version"]
```

## 1. Login Flow

**Endpoint**: `POST /api/auth/login`  
**Input**: `{ code: string, IDP: string, redirectUri: string }`  
**Output**: `{ name, email, timeout }`

```mermaid
sequenceDiagram
    actor Client
    participant AuthServer as Auth Server
    participant IDP as IDP Client<br/>(Google/NIH/DCF/RAS/Test)
    participant IDPServer as IDP Server
    participant MySQL as MySQL DB
    participant EventService as Event Service
    
    Client->>AuthServer: POST /login<br/>(authCode, IDP, redirectUri)
    
    AuthServer->>IDP: login(code, redirectUri)
    IDP->>IDPServer: Exchange code for tokens<br/>(OAuth token endpoint)
    IDPServer-->>IDP: Access token, ID token, user info
    IDP->>IDPServer: Fetch user profile<br/>(userinfo endpoint)
    IDPServer-->>IDP: { name, email, ... }
    IDP-->>AuthServer: { name, lastName, tokens, email, idp, passport }
    
    AuthServer->>MySQL: Store session<br/>{ email, IDP, tokens, name }
    MySQL-->>AuthServer: Session ID

    alt RAS login includes passport
        AuthServer->>MySQL: Upsert session{ email, idp, passport_jwt_v11 }
        MySQL-->>AuthServer: Stored
    end
    
    AuthServer->>EventService: storeLoginEvent(...)
    EventService-->>AuthServer: OK
    
    AuthServer-->>Client: { name, email, timeout }
    
    Note over Client: Client stores token in Authorization header
```

**Code Path**:  
1. [routes/auth.js — POST /login handler](../../routes/auth.js#L52-L83)  
2. [idps/index.js — oauth2Client.login()](../../idps/index.js#L7-L19)  
3. IDP clients in [idps/](../../idps/) including [idps/ras.js](../../idps/ras.js)  
4. [services/session.js — express-session middleware](../../services/session.js)  
5. [services/mySQL/mySQL-operations.js — storeLoginEvent()](../../services/mySQL/mySQL-operations.js)

---

## 2. Logout Flow

**Endpoint**: `POST /api/auth/logout`  
**Input**: `{ IDP: string }`  
**Output**: `{ status: 'success' }`

```mermaid
sequenceDiagram
    actor Client
    participant AuthServer as Auth Server
    participant IDP as IDP Client
    participant IDPServer as IDP Server
    participant MySQL as MySQL DB
    participant EventStore as Event Store
    
    Client->>AuthServer: POST /logout<br/>{ IDP }
    
    AuthServer->>IDP: logout(idp, tokens)
    alt IDP is NIH or Login.gov
        IDP->>IDPServer: Revoke tokens
        IDPServer-->>IDP: OK / Revoked
    end
    IDP-->>AuthServer: Logout complete
    
    AuthServer->>EventStore: Log LogoutEvent<br/>{ email, IDP, timestamp }
    EventStore-->>AuthServer: OK
    
    AuthServer->>MySQL: Destroy session
    MySQL-->>AuthServer: Session destroyed
    
    AuthServer-->>Client: { status: 'success' }
```

**Code Path**:  
1. [routes/auth.js — POST /logout handler](../../routes/auth.js#L86-L107)  
2. [idps/index.js — oauth2Client.logout()](../../idps/index.js#L32-L37)  
3. [idps/nih.js — logout() implementation](../../idps/nih.js)  
4. [controllers/auth-api.js — logout() session destroy](../../controllers/auth-api.js#L1-L10)

---

## 3. Authentication Check Flow

**Endpoint**: `POST /api/auth/authenticated`  
**Input**: (session required)  
**Output**: `{ status: true | false }`

```mermaid
sequenceDiagram
    actor Client
    participant AuthServer as Auth Server
    participant SessionStore as Express-Session<br/>(MySQL)
    
    Client->>AuthServer: POST /authenticated<br/>(with session cookie)
    
    AuthServer->>SessionStore: Retrieve session
    SessionStore-->>AuthServer: Session data or null
    
    alt Session exists and tokens present
        AuthServer-->>Client: { status: true }
    else
        AuthServer-->>Client: { status: false }
    end
    
    Note over SessionStore,AuthServer: Session TTL is refreshed on each request
```

**Code Path**:  
1. [routes/auth.js — POST /authenticated handler](../../routes/auth.js#L110-L120)  
2. Session middleware: [services/session.js](../../services/session.js)

---

## 4. Cleanup Flow

**Endpoint**: `POST /api/auth/cleanUp`  
**Input**: (Authorization header with JWT token optional)  
**Output**: `{ status: true | false }`

```mermaid
sequenceDiagram
    participant Client
    participant AuthServer as Auth Server
    participant TokenService as TokenService
    participant UserService as UserService
    participant MySQL as MySQL DB
    
    Client->>AuthServer: POST /cleanUp<br/>(Bearer token in Authorization header)
    
    AuthServer->>TokenService: authenticateUserToken(token)
    TokenService->>TokenService: Verify JWT signature
    
    alt Signature valid
        TokenService->>TokenService: Decode token payload
        TokenService->>UserService: getUserTokenUUIDs(userInfo)
        UserService->>MySQL: Query user tokens
        MySQL-->>UserService: [token_uuids...]
        UserService-->>TokenService: UUIDs array
        
        alt Token UUID in valid UUIDs list
            TokenService-->>AuthServer: true
            AuthServer-->>Client: { status: true }
        else
            TokenService-->>AuthServer: false
            AuthServer-->>Client: { status: false }
        end
    else Signature invalid
        TokenService-->>AuthServer: false
        AuthServer-->>Client: { status: false }
    end
```

**Code Path**:  
1. [routes/auth.js — POST /cleanUp handler](../../routes/auth.js#L122-L130)  
2. [services/clean-events.js — checkTokenAndClean()](../../services/clean-events.js)  
3. [services/token-service.js — TokenService.authenticateUserToken()](../../services/token-service.js#L8-L14)

---

## 5. RAS Refresh Flow

**Endpoint**: `POST /api/auth/refresh`  
**Input**: session ID from request body or current session; existing refresh token in session-backed data  
**Output**: `{ status: 'success', email, expires_at }`

```mermaid
sequenceDiagram
    actor Client
    participant AuthServer as Auth Server
    participant SessionStore as MySQL Session Store
    participant RAS as RAS OAuth APIs

    Client->>AuthServer: POST /refresh
    AuthServer->>SessionStore: Load current tokens by req.sessionID or body.session_id
    SessionStore-->>AuthServer: { refreshToken, ... }
    AuthServer->>RAS: refreshRASTokenBundle(refreshToken)
    RAS-->>AuthServer: new token bundle
    AuthServer->>RAS: rasUserInfo(accessToken)
    RAS-->>AuthServer: user info with passport_jwt_v11
    AuthServer->>RAS: validateRASPassport(passportJWT)
    RAS-->>AuthServer: Valid / Invalid

    alt passport valid and session update succeeds
        AuthServer->>SessionStore: updateSessionTokens(sessionId, newTokens,email, IDP, passportJWT)
        AuthServer-->>Client: 200 success payload
    else refresh or validation fails
        AuthServer-->>Client: 4xx/5xx error payload
    end
```

**Code Path**:  
1. [routes/auth.js — POST /refresh handler](../../routes/auth.js#L135-L211)  
2. [services/ras-auth.js — refreshRASTokenBundle()](../../services/ras-auth.js#L34-L53)  
3. [services/ras-auth.js — rasUserInfo()](../../services/ras-auth.js#L55-L67)  
4. [services/ras-auth.js — validateRASPassport()](../../services/ras-auth.js#L69-L79)  
5. [services/mySQL/mySQL-operations.js — updateSessionTokens()](../../services/mySQL/mySQL-operations.js#L341-L384)

---

## 6. Passport Retrieval Flow

**Endpoint**: `GET /api/auth/userInfo`  
**Input**: authenticated session cookie  
**Output**: `{ passportJWT }` or an error response

```mermaid
sequenceDiagram
    actor Client
    participant AuthServer as Auth Server
    participant UserService as UserService
    participant SessionStore as MySQL Session Store

    Client->>AuthServer: GET /userInfo<br/>(with session cookie)
    AuthServer->>UserService: getPassportBySession(req.sessionID)
    UserService->>SessionStore: getSessionTokens(sessionId)
    SessionStore-->>UserService: sessionData.userInfo

    alt session contains email and IDP
        alt passport found
            UserService-->>AuthServer: passportJWT
            AuthServer-->>Client: 200 { passportJWT }
        else passport missing
            UserService-->>AuthServer: null
            AuthServer-->>Client: 404 { error: 'Passport not found' }
        end
    else session missing or incomplete
        UserService-->>AuthServer: null
        AuthServer-->>Client: 401/404 error payload
    end
```

**Code Path**:  
1. [routes/auth.js — GET /userInfo handler](../../routes/auth.js#L236-L261)  
2. [services/user-service.js — getPassportBySession()](../../services/user-service.js#L29-L58)  
3. [services/mySQL/mySQL-operations.js — getSessionTokens()](../../services/mySQL/mySQL-operations.js)  
4. [services/mySQL/mySQL-operations.js — getPassportByEmail()](../../services/mySQL/mySQL-operations.js#L387-L414)

---

## 7. Health Check Flow

**Endpoint**: `GET /api/auth/ping` and `GET /api/auth/version`  
**Purpose**: Lightweight readiness/health checks for load balancers and orchestrators

```mermaid
sequenceDiagram
    participant LB as Load Balancer
    participant AuthServer as Auth Server
    
    LB->>AuthServer: GET /ping
    AuthServer-->>LB: 200 "pong"
    
    LB->>AuthServer: GET /version
    AuthServer-->>LB: 200 { version, date }
```

**Code Path**:  
1. [app.js — GET /ping handler](../../app.js#L40-L43)  
2. [app.js — GET /version handler](../../app.js#L45-L50)

---

## Cross-Cutting Concerns

### Session Management

- **Technology**: `express-session` + `express-mysql-session` store  
- **Behavior**: HTTP-only session cookies; server-side store in MySQL  
- **TTL**: Configurable via `SESSION_TIMEOUT` env var (default 30 min)  
- **Refresh**: Session expiry is reset on every request  
- **Code**: [services/session.js](../../services/session.js)

### Token Validation Strategy

**Two methods** depending on context:

| Method | Use Case | Code |
|--------|----------|------|
| **Session Token** | Intra-service requests | Check `req.session.tokens` |
| **JWT Bearer Token** | Cross-service/API calls | Parse `Authorization: Bearer <jwt>` header; verify signature |

- Session checks are fast (in-memory after MySQL read)  
- JWT checks require cryptographic verification  
- **Code**: [services/token-service.js](../../services/token-service.js)

### Event Logging

All authentication events are recorded to database:

| Event Type | When | Fields |
|----------|------|--------|
| `LOGIN` | Successful login | email, IDP, firstName, timestamp |
| `LOGOUT` | Successful logout | email, IDP, firstName, timestamp |
| `REVIEW` | User reviews data | (format depends on domain) |
| `DOWNLOAD` | User downloads file | (format depends on domain) |

- **Code**: [bento-event-logging/model/](../../bento-event-logging/model/)  
- **Observed runtime path**: Event writes are handled through [services/mySQL/mySQL-operations.js](../../services/mySQL/mySQL-operations.js) in the current startup path

### RAS Passport Lifecycle

- **Observed**: RAS login may return `passportJWT`, which is written to `ctdc.user_passports`
- **Observed**: `POST /api/auth/refresh` refreshes tokens, fetches updated user info, validates the refreshed passport, and persists it back to MySQL when the session IDP is RAS
- **Observed**: `GET /api/auth/userInfo` returns the raw stored passport JWT for the authenticated session without decoding claims

---

## Known Gaps & Uncertainties

| Unknown | Impact | Status |
|---------|--------|--------|
| DCF client implementation | May have special error handling | Not inspected |
| Event format for REVIEW/DOWNLOAD events | Audit logging accuracy | Deferred to feature docs |
| Non-RAS token refresh strategy | Session extension mechanics for other IDPs | Not yet confirmed |
| MySQL event volume perf characteristics | Deployment decisions | Needs load test |

---

Next: [Modules README](../modules/README.md) for per-module detail.
