# Component Architecture

## Component Diagram

```mermaid
graph TB
    subgraph "Express Application Layer"
        App["app.js<br/>Express App"]
        Routes["routes/auth.js<br/>Route Handlers"]
        Controllers["controllers/<br/>auth-api.js"]
    end
    
    subgraph "IDP Integration Layer"
        IDPIndex["idps/index.js<br/>IDP Dispatcher"]
        GoogleIDP["idps/google.js<br/>Google Client"]
        NihIDP["idps/nih.js<br/>NIH Client"]
        DcfIDP["idps/dcf.js<br/>DCF Client"]
        RasIDP["idps/ras.js<br/>RAS Client"]
        TestIDP["idps/testIDP.js<br/>Test Client"]
    end
    
    subgraph "Service Layer"
        AuthService["AuthenticationService<br/>Token Verification"]
        TokenService["TokenService<br/>JWT Ops"]
        UserService["UserService<br/>User + Passport Lookup"]
        SessionService["session.js<br/>Session Init"]
        CleanService["CleaningService<br/>Token Cleanup"]
        RasAuth["ras-auth.js<br/>RAS Refresh + Passport Validation"]
    end
    
    subgraph "Data Access Layer"
        EventService["EventService<br/>Event Storage"]
        MySQLOps["mySQL/<br/>mySQL-operations.js"]
    end
    
    subgraph "External Systems"
        MySQLDB[(MySQL DB<br/>Sessions, Users, Passports)]
        IDPServers["OAuth Servers<br/>(Google, NIH, DCF, RAS)"]
    end
    
    subgraph "Logging & Monitoring"
        Morgan["morgan<br/>HTTP Logging"]
        NewRelic["NewRelic<br/>APM"]
    end
    
    App -->|Use| Routes
    Routes -->|Call| IDPIndex
    Routes -->|Use| AuthService
    Routes -->|Use| TokenService
    Routes -->|Log Events| EventService
    Routes -->|Manage| SessionService
    
    IDPIndex -->|Dispatch to| GoogleIDP
    IDPIndex -->|Dispatch to| NihIDP
    IDPIndex -->|Dispatch to| DcfIDP
    IDPIndex -->|Dispatch to| RasIDP
    IDPIndex -->|Dispatch to| TestIDP
    
    GoogleIDP -->|OAuth| IDPServers
    NihIDP -->|OAuth| IDPServers
    DcfIDP -->|OAuth| IDPServers
    RasIDP -->|OAuth| IDPServers
    
    TokenService -->|Verify| UserService
    UserService -->|Query| MySQLOps
    Routes -->|Use| RasAuth
    RasAuth -->|Refresh / Validate| IDPServers
    
    EventService -->|Write| MySQLOps
    
    MySQLOps -->|Read/Write| MySQLDB
    
    SessionService -->|Store| MySQLDB
    
    App -->|Metrics| NewRelic
    Routes -->|Logs| Morgan
```

## Component Descriptions

### Application Layer

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **Express App** | [app.js](../../app.js) | Main Express server initialization; middleware setup; error handler |
| **Route Handler** | [routes/auth.js](../../routes/auth.js) | HTTP route definitions for `/api/auth/*`; request marshaling |
| **Controller** | [controllers/auth-api.js](../../controllers/auth-api.js) | Logout implementation |

### IDP Integration Layer

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **IDP Dispatcher** | [idps/index.js](../../idps/index.js) | Factory pattern; routes login/logout/auth calls to correct IDP client |
| **Google Client** | [idps/google.js](../../idps/google.js) | **Observed**: Handles Google OAuth 2.0 flow |
| **NIH Client** | [idps/nih.js](../../idps/nih.js) | **Observed**: Handles NIH and Login.gov OAuth flows |
| **DCF Client** | [idps/dcf.js](../../idps/dcf.js) | **Inferred**: DCF (Data Commons Framework) OAuth client |
| **RAS Client** | [idps/ras.js](../../idps/ras.js) | **Observed**: Handles RAS login and authenticated-session checks |
| **Test IDP** | [idps/testIDP.js](../../idps/testIDP.js) | For local/test environments; bypasses real OAuth |

### Service Layer

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **AuthenticationService** | [services/authenticatation-service.js](../../services/authenticatation-service.js) | Verifies tokens in Authorization header; checks session validity |
| **TokenService** | [services/token-service.js](../../services/token-service.js) | JWT signing/verification; token format parsing |
| **UserService** | [services/user-service.js](../../services/user-service.js) | Retrieves user token UUIDs, persists RAS passports, and resolves stored passports by session |
| **SessionService** | [services/session.js](../../services/session.js) | Creates express-session middleware with MySQL store |
| **CleaningService** | [services/clean-events.js](../../services/clean-events.js) | **Inferred**: Token validation and expired session cleanup |
| **RAS Auth Helpers** | [services/ras-auth.js](../../services/ras-auth.js) | Refreshes RAS token bundles, fetches userinfo, and validates GA4GH passports |

### Data Access Layer

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **EventService Runtime Path** | [services/mySQL/mySQL-operations.js](../../services/mySQL/mySQL-operations.js) | Event persistence functions used by current route initialization |
| **MySQL Operations** | [services/mySQL/mySQL-operations.js](../../services/mySQL/mySQL-operations.js) | SQL query execution for user/session/event data, session token refresh persistence, and passport lookup |

### Event Logging Layer

| Component | File(s) | Purpose |
|-----------|---------|---------|
| **Event Models** | [bento-event-logging/model/](../../bento-event-logging/model/) | Event classes (LoginEvent, LogoutEvent, ReviewEvent, DownloadEvent, etc.) |
| **Event Constants** | [bento-event-logging/const/](../../bento-event-logging/const/) | Event type enums, access control constants, format maps |

### External Integrations

| System | Usage | Config |
|--------|-------|--------|
| **Google OAuth** | User authentication | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URL` |
| **NIH OAuth** | User authentication (NIH & Login.gov) | `NIH_CLIENT_ID`, `NIH_CLIENT_SECRET`, `NIH_AUTHORIZE_URL`, etc. |
| **DCF OAuth** | User authentication | `DCF_CLIENT_ID`, `DCF_CLIENT_SECRET`, `DCF_AUTHORIZE_URL`, etc. |
| **RAS OAuth** | User authentication, token refresh, passport validation | `RAS_CLIENT_ID`, `RAS_CLIENT_SECRET`, `RAS_TOKEN_URL`, `RAS_USERINFO_URL`, `RAS_VALIDATE_URL` |
| **MySQL** | Session store & user data | `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_DATABASE`, etc. |
| **NewRelic** | APM/monitoring | [newrelic.js](../../newrelic.js) config |

## Dependency Relationships

```
Login Request
    ├─> route handler (/api/auth/login)
    ├─> IDP dispatcher (idps/index.js)
    │   └─> IDP client (Google/NIH/DCF/RAS/Test)
    │       └─> external OAuth server
    ├─> UserService (persist RAS passport when returned)
    ├─> EventService (log login event)
    └─> response with timeout and session-backed auth state

Authentication Check
    ├─> AuthenticationService.authenticate()
    ├─> TokenService.authenticateUserToken()
    ├─> UserService.getUserTokenUUIDs()
    └─> [response: token valid or not]

Passport Retrieval
    ├─> route handler (/api/auth/userInfo)
    ├─> UserService.getPassportBySession()
    ├─> MySQLOps.getSessionTokens()
    ├─> MySQLOps.getPassportByEmail()
    └─> [response: passportJWT or error]

RAS Refresh
    ├─> route handler (/api/auth/refresh)
    ├─> ras-auth.refreshRASTokenBundle()
    ├─> ras-auth.rasUserInfo()
    ├─> ras-auth.validateRASPassport()
    ├─> MySQLOps.updateSessionTokens()
    └─> UserService.persistUserPassportJWT()
```

## Configuration Scope

All components use centralized config ([config.js](../../config.js)) for:
- IDP credentials (Google, NIH, DCF, RAS, test)
- Database connection strings (MySQL)
- Session timeout and secrets
- Logging paths
- Environment mode (development/production)

---

Next: [Runtime Flows](./runtime-flows.md) — See how these components interact during authentication requests.
