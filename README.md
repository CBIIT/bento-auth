# Bento AuthN/AuthZ service

## Environmental Variables
Following environmental variables are needed

- VERSION : version number
- DATE : build date
- IDP : default identification provider, enabled if IDP is not provided from the client side e.g., "google" 
- COOKIE_SECRET : secret used to sign cookies
- SESSION_TIMEOUT : session timeout in seconds, default is 30 minutes

# Neo4j configuration
- NEO4J_URI: Bolt URI of the Neo4j database
- NEO4J_USER: Neo4j username
- NEO4J_PASSWORD: Neo4j password
 
# Testing
- TEST_EMAIL : The email to be logged in if "test-idp" is specified as the IDP
 
# MYSQL configuration
- MYSQL_HOST : The host URL of the MYSQL database
- MYSQL_PORT : The port of the MYSQL database
- MYSQL_USER : The service user of the MYSQL database
- MYSQL_PASSWORD : The password for the service user of the MYSQL database
- MYSQL_DATABASE : The MYSQL database name
 
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

# Local development configuration
- NODE_ENV: If set to "development", a test html page will be activated in the route "/"
- NO_AUTO_LOGIN: If set to "true", local test page will only display authorization codes, instead of calling /login automatically