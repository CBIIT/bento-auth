# Bento AuthN/AuthZ service

## Environmental Variables
Following environmental variables are needed

- VERSION : version number
- DATE : build date
- IDP : Identification provider, e.g., "google"
- CLIENT_ID : IDP's client ID
- CLIENT_SECRET : IDP's client secret
- REDIRECT_URL : valid redirect URL set with IDP
- COOKIE_SECRET : secret used to sign cookies
- SESSION_TIMEOUT : session timeout in seconds, default is 30 minutes