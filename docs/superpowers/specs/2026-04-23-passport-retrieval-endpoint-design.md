# Design: Passport Retrieval Endpoint

**Date**: 2026-04-23  
**Status**: Approved for implementation  
**Scope**: Add authenticated endpoint to retrieve GA4GH Passport JWT from session

---

## Purpose

Enable clients to retrieve the stored GA4GH Passport JWT for the current authenticated session. This supports downstream services that need to validate or extract passport claims for authorization and audit purposes.

---

## Requirements

### Functional Requirements

1. **Session-Scoped Access**: Clients can only retrieve the passport for their own session via the `connect.sid` cookie
2. **Passport-Only Response**: Return only the JWT itself, not metadata or decoded claims
3. **Graceful Degradation**: Handle missing passports (not all IDPs support passports), expired sessions, and database errors with appropriate HTTP codes
4. **RAS-Primary, Future-Ready**: Initially used for RAS passports; design should support other IDPs adding passport support later

### Non-Functional Requirements

1. **Security**: No unauthenticated access; session validation required
2. **Performance**: Single database query to retrieve passport (no JOIN bloat)
3. **Testability**: Service-layer isolation for unit testing
4. **Consistency**: Follow existing service layer patterns (UserService, mySQLOps)

---

## Architecture

### Components

#### 1. **mySQLOps (Data Access Layer)**
New function: `getPassportByEmail(email, idp)`

```javascript
// services/mySQL/mySQL-operations.js
async function getPassportByEmail(email, idp) {
    // Retrieve passport_jwt_v11 from ctdc.user_passports table
    // Return null if not found; throw on database error
    // Uses parameterized query to prevent SQL injection
}
```

**Inputs**: email (string), idp (string)  
**Output**: passport_jwt_v11 (string) or null  
**Errors**: Database connection/query errors propagate as exceptions

---

#### 2. **UserService (Business Logic Layer)**
New method: `getPassportBySession(sessionId)`

```javascript
// services/user-service.js
async getPassportBySession(sessionId) {
    // 1. Query mySQLOps.getSessionTokens(sessionId) to get session data
    // 2. Extract email and IDP from session
    // 3. Call mySQLOps.getPassportByEmail(email, idp)
    // 4. Return passport JWT or null
}
```

**Inputs**: sessionId (string from `connect.sid`)  
**Output**: passport_jwt_v11 (string) or null  
**Errors**: 
- Session not found → returns null (handled by route as 401)
- Database error → propagates (handled by route as 500)

---

#### 3. **Route Handler (Controller)**
New endpoint: `GET /api/auth/passport`

**File**: `routes/auth.js`

```javascript
router.get('/passport', async function (req, res) {
    // 1. Extract sessionId from connect.sid cookie
    // 2. Call userService.getPassportBySession(sessionId)
    // 3. Return appropriate response based on result
});
```

---

## Request / Response Specification

### Request

**Method**: `GET`  
**Path**: `/api/auth/passport`  
**Authentication**: Via `connect.sid` cookie (Express session cookie)  
**Body**: None  
**Query Parameters**: None

**Example**:
```
GET /api/auth/passport HTTP/1.1
Host: auth.example.com
Cookie: connect.sid=s%3A<session-id>.<signature>
```

---

### Response - Success (200 OK)

When passport is found and session is valid:

```json
{
  "passportJWT": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJpZGVudGl0eUluZm8iLCJnYTRnaF9wYXNzcG9ydF92MSI6W3siYXR0cmlidXRlcyI6eyJvcmdhbml6YXRpb24iOls..."
}
```

**Schema**:
- `passportJWT` (string): The raw GA4GH Passport v1.1 JWT

---

### Response - Passport Not Found (404 Not Found)

When session is valid but no passport has been stored for this user:

```json
{
  "error": "Passport not found"
}
```

**When this occurs**: User authenticated with an IDP that doesn't support passports (Google, NIH, DCF) or RAS but passport persistence failed.

---

### Response - Invalid / Expired Session (401 Unauthorized)

When session_id is missing, invalid, or expired:

```json
{
  "error": "Unauthorized"
}
```

**When this occurs**: 
- `connect.sid` cookie missing or malformed
- Session expired
- User not authenticated

---

### Response - Server Error (500 Internal Server Error)

When database connection fails or query throws:

```json
{
  "error": "Failed to retrieve passport"
}
```

**When this occurs**: Database connection error, query syntax error, or other unexpected exception.

---

## Data Flow

```
Client Request (with connect.sid cookie)
    ↓
Route Handler: Extract sessionId from cookie
    ↓
UserService.getPassportBySession(sessionId)
    ├─ Get session data from mySQLOps.getSessionTokens(sessionId)
    │   └─ Query: SELECT data FROM sessions WHERE session_id = ?
    │       Returns: { userInfo: { email, IDP, ... }, tokens: {...} }
    │
    └─ Extract email + IDP
       ↓
       mySQLOps.getPassportByEmail(email, idp)
           └─ Query: SELECT passport_jwt_v11 FROM ctdc.user_passports WHERE email = ? AND idp = ?
               Returns: passport_jwt_v11 string or null
    ↓
Route Handler: Format response
    ├─ passport found → 200 with { passportJWT }
    ├─ passport null → 404 with { error }
    ├─ session null → 401 with { error }
    └─ exception → 500 with { error }
    ↓
Client receives response
```

---

## Error Handling

| Scenario | Detection | Response | Logging |
|----------|-----------|----------|---------|
| No session | `getSessionTokens()` returns null | 401 | Info: "getPassportBySession: session not found" |
| No passport | `getPassportByEmail()` returns null | 404 | Debug: "getPassportBySession: passport not found for email/idp" |
| Session parse error | JSON.parse() throws | 500 | Error: "Failed to parse session data" |
| DB connection error | Connection acquisition fails | 500 | Error: "[method] error: [message]" |
| Cookie missing | No `connect.sid` header | 401 | Info: "getPassportBySession: session_id not provided" |

---

## Testing Strategy

### Unit Tests
- **mySQLOps.getPassportByEmail()**
  - ✅ Passport found → returns JWT string
  - ✅ Passport not found → returns null
  - ✅ Database error → throws exception
  - ✅ SQL injection protection → parameterized queries used

- **UserService.getPassportBySession()**
  - ✅ Valid session with passport → returns JWT
  - ✅ Valid session without passport → returns null
  - ✅ Invalid session → returns null
  - ✅ Database error propagates → throws exception

### Integration Tests
- **Route Handler GET /passport**
  - ✅ Authenticated session → 200 with JWT
  - ✅ Authenticated session (no passport) → 404
  - ✅ No session cookie → 401
  - ✅ Invalid session → 401
  - ✅ Database error → 500

---

## Implementation Files

### New Files
- `test/services/user-passport-retrieval.test.js` — Unit tests for service layer

### Modified Files
- `services/mySQL/mySQL-operations.js` — Add `getPassportByEmail()` function + export
- `services/user-service.js` — Add `getPassportBySession()` method
- `routes/auth.js` — Add `GET /passport` route handler

---

## Rollback Plan

If issues arise:

1. **Route only**: Remove `GET /passport` route handler from auth.js
2. **Full rollback**: Revert commits to undo all three files

No data migration or cleanup required (only adds read operations).

---

## Future Considerations

1. **Caching**: Session data is already cached in memory by express-session; no additional caching needed
2. **Claim Validation**: Route could be extended to decode and validate passport claims if downstream services need this
3. **Multi-IDP Support**: When other IDPs add passport support, logic automatically supports them (no code change)
4. **Passport Refresh**: Could add `POST /passport/refresh` endpoint later to refresh RAS passports
5. **Audit Logging**: Add event logging for passport access if compliance requires it

---

## Success Criteria

✅ Endpoint returns authenticated user's passport JWT  
✅ Proper HTTP status codes for all scenarios  
✅ No SQL injection vulnerabilities  
✅ Unit and integration tests pass  
✅ Follows existing service layer patterns  
✅ Generic error messages (no token values leaked)
