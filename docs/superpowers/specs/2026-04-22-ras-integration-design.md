# RAS Integration Design

## Summary

Extend the existing authentication service with a new explicit `ras` identity provider path that runs in parallel with the existing `nih` path. The new path will support NIH RAS token exchange, userinfo retrieval, passport validation, and reactive refresh-token handling without changing current `nih` behavior.

## Goals

- Add an explicit `ras` IDP selection alongside existing providers.
- Keep the existing `nih` integration unchanged.
- Support NIH RAS token responses that include `access_token`, `refresh_token`, `id_token`, `expires_in`, `scope`, and related metadata.
- Validate passport material from RAS userinfo before granting access.
- Refresh access tokens reactively after token-protected calls fail due to expired or invalid access tokens.

## Non-Goals

- Refactor the existing `nih` path to share a common implementation in this change.
- Proactively refresh tokens on a timer.
- Generalize the feature for non-NIH deployments in this iteration.

## Architecture

The feature is additive. A new `ras` provider constant will be introduced in `constants/idp-constants.js`, with a dedicated `ras` configuration block in `config.js` backed by `RAS_*` environment variables. The provider will be wired into `idps/index.js` as a separate dispatch path.

The implementation will introduce a new RAS-focused service module responsible for token exchange, refresh exchange, userinfo retrieval, and passport validation. A new RAS IDP wrapper will expose the same high-level lifecycle used by the existing auth flow: login, authenticated check, and logout behavior if needed by the route layer.

The existing `nih` path remains available and unchanged. Callers opt in to RAS only by selecting the explicit `ras` IDP.

## Components

### Configuration

- Add a `ras` provider block in `config.js`.
- Use dedicated `RAS_*` environment variables for client ID, secret, endpoints, redirect URI, validation endpoint, and other provider-specific settings.
- Do not reuse the `nih` configuration block.

### Provider Constant and Dispatch

- Add `ras` to `constants/idp-constants.js`.
- Update provider resolution logic so the auth flow can route `IDP=ras` requests.
- Keep current `nih` routing intact.

### RAS Service Module

The RAS service module owns provider-specific protocol work:

- exchange authorization code for a token bundle
- refresh an expired access token using `refresh_token`
- call the RAS userinfo endpoint
- call the passport validation endpoint
- normalize errors into route-friendly auth failures

### RAS IDP Module

The RAS IDP module adapts the service module to the existing IDP interface used by the route layer. It should:

- perform login flow and return a user object plus structured tokens
- perform authenticated checks using the stored token bundle
- trigger reactive refresh when downstream token-protected calls fail due to expired or invalid access tokens
- clear session-compatible state when authentication can no longer be recovered

### Route Layer

The route layer should continue to own session storage and session clearing. It will store a structured token bundle for `ras` sessions instead of a bare token string.

## Data Model

For `ras`, session token storage should use a structured object similar to:

```json
{
  "idp": "ras",
  "accessToken": "...",
  "refreshToken": "...",
  "idToken": "...",
  "tokenType": "Bearer",
  "scope": "openid profile email ga4gh_passport_v1 ...",
  "expiresAt": 1776869836000
}
```

Notes:

- `refreshToken` is treated as an opaque secret string.
- `expiresAt` is derived from `expires_in` with a small skew subtracted for internal checks.
- `idToken` is retained only if needed for downstream claims or audit context.
- The `passport_jwt_v11` value returned from the userinfo endpoint is not part of the browser session token bundle; it must also be persisted in the database for downstream authorization and audit needs.

## Login Flow

1. Request enters the existing auth route with `IDP=ras`.
2. Route dispatches through `idps/index.js` to the new RAS IDP module.
3. RAS exchanges the authorization code at the configured token endpoint using the authorization-code grant.
4. The token response is normalized into the session token bundle.
5. RAS calls the userinfo endpoint with the access token.
6. RAS extracts identity fields and passport material from the userinfo response.
7. RAS calls the validation endpoint for passport validation.
8. If validation succeeds with `Valid`, the system persists the `passport_jwt_v11` value from the userinfo response in the database and the route stores the user and token bundle in session.
9. If validation fails, login fails closed and the session is not established.

## Authenticated Request Flow

1. A protected request uses the stored `ras` token bundle.
2. The system performs the required token-protected call, typically userinfo and passport validation.
3. If the call succeeds, the request is authenticated.
4. If the call fails due to an auth failure such as 401 or equivalent invalid-token signal, the system attempts one refresh-token exchange.
5. If refresh succeeds, the session token bundle is updated and the original call is retried once.
6. If the retry succeeds, the request is authenticated.
7. If refresh fails or the retry still fails, the session is cleared and the user must log in again.

## Token and Validation Rules

- Store the full token response for `ras`, not only the access token.
- Use the access token for bearer-protected API calls.
- Do not use the `id_token` as a bearer token.
- Treat the `passport_jwt_v11` value from userinfo as the authoritative passport material to validate.
- Persist the `passport_jwt_v11` value from userinfo in the database after successful validation.
- Require the validation endpoint to return `Valid` before granting protected access.
- Enforce exactly one refresh attempt per request path to avoid loops.

## Error Handling

### Refresh Failures

- If refresh returns `invalid_grant`, `invalid_token`, or another unrecoverable auth error, clear the session immediately.
- Do not retry refresh more than once for the same request.

### Validation Failures

- If passport validation does not return `Valid`, deny access and clear the session.
- Treat malformed validation responses as failures.

### Network and Upstream Failures

- Distinguish transient upstream failures from auth failures.
- Network errors, timeouts, and 5xx responses from token, userinfo, or validation endpoints should surface as temporary auth-service errors rather than silently clearing the session unless auth recovery has already failed.
- Apply explicit timeout and retry limits so upstream instability does not hang requests.

## Security Requirements

- Never log raw `access_token`, `refresh_token`, `id_token`, or full passport JWT values.
- If token-related logging is required, log only non-secret metadata such as issuer, scope, token expiry, or truncated identifiers.
- Protect the persisted `passport_jwt_v11` value in the database as sensitive credential material.
- Protect session storage appropriately if it persists beyond in-memory sessions.
- Verify expected scopes, including `openid` and `ga4gh_passport_v1`.
- Confirm token issuer and audience against configured RAS client expectations where validation logic supports it.
- Minimize persisted personally identifiable information to what is needed for the session.

## Testing Strategy

### Unit Tests

Add unit coverage for the RAS service module to verify:

- authorization-code token exchange parsing
- refresh-token exchange parsing
- userinfo parsing and extraction of identity and passport fields
- persistence of `passport_jwt_v11` after successful validation
- validation success and validation failure behavior
- invalid-grant, invalid-token, timeout, and network-error branches

### IDP Tests

Add provider-layer tests to verify:

- `ras.login` returns a user plus structured token bundle
- `ras.authenticated` succeeds with a valid access token
- `ras.authenticated` performs one refresh-and-retry path on token failure
- session-compatible auth state is cleared after unrecoverable refresh failure or validation failure

### Route and Integration Tests

Add route or integration coverage for:

- login callback with `IDP=ras`
- session persistence of the structured RAS token bundle
- database persistence of `passport_jwt_v11` from the userinfo response
- authenticated route success with valid RAS session
- authenticated route recovery through refresh after expired access token
- authenticated route failure after refresh failure
- unchanged `nih` behavior in parallel

## Rollout and Compatibility

- Ship `ras` as an additive provider.
- Keep `nih` unchanged and still selectable in parallel.
- Use dedicated `RAS_*` configuration to avoid coupling or accidental behavior changes.
- Gate the new flow by explicit provider selection only.
- Target NIH-backed RAS integration first while keeping the design isolated enough for later extension if needed.

## Risks and Constraints

- The current auth flow stores a simpler token shape, so session handling must expand for `ras` without breaking existing providers.
- Upstream RAS error semantics must be normalized carefully so token expiry, invalid refresh state, and transient outages are handled differently.
- Passport validation is now part of the access decision, so test coverage must include both valid and invalid passport cases.

## Implementation Boundaries

This design intentionally limits scope to the new explicit `ras` provider path, session token-bundle support for that path, reactive refresh, and passport validation. Broader provider unification or proactive refresh can be considered in later work.