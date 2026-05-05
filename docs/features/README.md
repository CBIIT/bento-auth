# Features Index

This directory contains documentation for end-to-end user-facing features and workflows. Each feature doc traces a business capability from client request through service response.

## Feature Inventory

### Authentication Features

| Feature | Endpoint(s) | Status | Document |
|---------|-----------|--------|----------|
| **Google Login** | `POST /api/auth/login` (IDP=Google) | Implemented | — |
| **NIH Login** | `POST /api/auth/login` (IDP=NIH) | Implemented | — |
| **DCF/Fence Login** | `POST /api/auth/login` (IDP=DCF) | ✅ Documented | [dcf-fence-login.md](./dcf-fence-login.md) |
| **Local Test Login** | `POST /api/auth/login` (IDP=test) | Implemented | — |
| **Logout** | `POST /api/auth/logout` | Implemented | — |
| **Session Check** | `POST /api/auth/authenticated` | Implemented | — |
| **RAS Token Refresh** | `POST /api/auth/refresh` | Implemented | — |
| **Passport Retrieval** | `GET /api/auth/userInfo` | Implemented | — |
| **Token Cleanup** | `POST /api/auth/cleanUp` | Implemented | — |

### System Features

| Feature | Status | Purpose |
|---------|--------|---------|
| **Health Check** | `GET /api/auth/ping` | Verify server is running (load balancer use) |
| **Version Endpoint** | `GET /api/auth/version` | Report build version and date |
| **Session TTL Query** | `GET /api/auth/session-ttl` | Report remaining session lifetime |
| **Event Auditing** | Async logging to MySQL | Record all authentication events for compliance |
| **CORS Support** | Enabled by `cors()` middleware | Allow cross-origin requests from frontends |

## Feature Documentation Files

When detailed feature-level analysis is needed, create a doc file using the pattern:

```
docs/features/[feature-name].md
```

Example structure:

```markdown
# [Feature Name]

## Overview
Business purpose and user journey.

## Prerequisites
What must be true for this feature to work.

## Happy Path Flow
Step-by-step sequence diagram.

## Error Scenarios
Failure modes and error responses.

## Configuration
Environment variables or settings that affect behavior.

## Data Structures
Request/response object shapes.

## Known Limitations
Unsupported scenarios or edge cases.

## Related Features
Links to dependent or related features.
```

---

## Suggested Feature Docs to Create

1. **Login Flow** (`docs/features/login.md`)
   - Covers all IDP-specific login logic
   - Error handling for invalid codes
   - Session creation and token issuance

2. **Logout Flow** (`docs/features/logout.md`)
   - Session destruction
   - IDP token revocation (NIH/DCF only)
   - Event logging

3. **Token Validation** (`docs/features/token-validation.md`)
   - JWT signature verification
   - Token expiry checking
   - Session fallback validation

4. **Multi-IDP Support** (`docs/features/multi-idp-strategy.md`)
   - How multiple IDPs are coordinated
   - IDP selection logic
   - User profile consolidation across IDPs

5. **Event Auditing** (`docs/features/event-auditing.md`)
   - What events are logged
   - MySQL event store behavior and query strategy
   - Query examples for compliance reports

---

## Quick Reference: How to Use These Features

**"I need to log a user in"**  
→ Call `POST /api/auth/login` with auth code from your IDP  
→ Response includes JWT + session cookie  
→ See feature doc: `login.md`

**"I need to verify a user's session"**  
→ Call `POST /api/auth/authenticated` with session cookie  
→ Response: `{ status: true/false }`  
→ See feature doc: `token-validation.md`

**"I need the authenticated user's GA4GH passport"**  
→ Call `GET /api/auth/userInfo` with the session cookie  
→ Response: `{ passportJWT }` or a 401/404/500 error  
→ See system docs: [../system-overview.md](../system-overview.md)

**"I need to refresh a RAS session"**  
→ Call `POST /api/auth/refresh` with the active session  
→ Service refreshes tokens, validates the new passport, and persists updated session data  
→ See system docs: [../architecture/runtime-flows.md](../architecture/runtime-flows.md)

**"I need to log a user out"**  
→ Call `POST /api/auth/logout`  
→ Session is destroyed, IDP is notified  
→ See feature doc: `logout.md`

**"I need to audit user actions"**  
→ Query MySQL `events` table for time-range and user email  
→ See feature doc: `event-auditing.md`

---

See [System Overview](../system-overview.md) for architecture context.
