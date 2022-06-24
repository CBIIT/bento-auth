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
- AUTHORIZATION_ENABLED : If not set to "true", then the authorization components will be disabled
- EMAILS_ENABLED : If not set to "true", then the email notifications will be disabled
# Neo4j configuration
- NEO4J_URI: Bolt URI of the Neo4j database
- NEO4J_USER: Neo4j username
- NEO4J_PASSWORD: Neo4j password
# Test-data loading configuration
- DATA_LOADING_MODE : (for testing only) set to "overwrite" to wipe the database before loading
- DATA_FILE : (for testing only) file containing data to load into the database for testing
# Testing
- TEST_EMAIL : The email to be logged in if "test-idp" is specified as the IDP
# MYSQL configuration
- MYSQL_HOST : The host URL of the MYSQL database
- MYSQL_PORT : The port of the MYSQL database
- MYSQL_USER : The service user of the MYSQL database
- MYSQL_PASSWORD : The password for the service user of the MYSQL database
- MYSQL_DATABASE : The MYSQL database name