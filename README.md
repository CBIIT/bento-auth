# Bento AuthN/AuthZ service

## Environmental Variables
Following environmental variables are needed

- VERSION: version number
- DATE: build date
- COOKIE_SECRET: secret used to sign cookies
- SESSION_TIMEOUT: session timeout in seconds, default is 30 minutes
- AUTHORIZATION_ENABLED: enable to store Neo4j's user information into session storage 
# Neo4j configuration
- NEO4J_URI: Bolt URI of the Neo4j database
- NEO4J_USER: Neo4j username
- NEO4J_PASSWORD: Neo4j password
# Test-data loading configuration
- DATA_LOADING_MODE: (for testing only) set to "overwrite" to wipe the database before loading
- DATA_FILE: (for testing only) file containing data to load into the database for testing
# MySQL session storage configuration
- MY_SQL_HOST: MySQL hostname
- MY_SQL_PORT: MySQL port number
- MY_SQL_PASSWORD: MySQL password
- MY_SQL_USER: MySQL username
- MY_SQL_DATABASE: MySQL database name to store session
# Email notification configuration
- EMAIL_SERVICE_EMAIL: bento administrator's email address
- EMAIL_SMTP_HOST: email server hostname
- EMAIL_SMTP_PORT: email server port number
# Additional configuration for email server
- EMAIL_USER: email server's username as an additional parameter 
- EMAIL_PASSWORD: email server's password as an additional parameter
# Google login configuration
- GOOGLE_CLIENT_ID: Google cloud client id
- GOOGLE_CLIENT_SECRET: Google cloud client secret
- GOOGLE_REDIRECT_URL: redirecting url after successful authentication
# NIH login configuration
- NIH_CLIENT_ID: NIH login server client id
- NIH_CLIENT_SECRET: NIH login client secret
- NIH_BASE_URL: NIH login server url
- NIH_REDIRECT_URL: redirecting url after successful authentication
- NIH_USERINFO_URL: NIH API address to search user information
- NIH_AUTHORIZE_URL: NIH API address to authenticate for login
- NIH_TOKEN_URL: NIH API address to create token for login
- NIH_LOGOUT_URL: NIH API address to invalidate token for logout
- NIH_SCOPE: space-separated lists of identifiers to specify access privileges
- NIH_PROMPT: to force re-authorization event when a current session is still active 