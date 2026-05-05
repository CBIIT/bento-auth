NIH RAS Integration Guide


# RAS Overview

RAS (Researcher Auth Service) is a cloud-based authentication and authorization platform used to securely access NIH data. It provides single sign-on (SSO) across multiple systems, verifies user identities, manages permissions, and logs access activity. This improves security, usability, and efficiency for researchers working with sensitive biomedical data.

# Why RAS is Required

RAS is required to access NIH Controlled Access Data Repositories (CADRs). While eRA Commons accounts typically operate at **IAL1 (low assurance)**, CADRs require at least **IAL2 (moderate assurance)**, which ensures verified real-world identity.

RAS enables this higher level of assurance by enforcing security standards and providing consistent authentication, authorization, and auditing across NIH systems.

## How to Meet IAL2 Requirements

To comply with IAL2 for CADR access:

- **Create or use an IAL2-verified identity**
  - Use providers such as **Login.gov** or **ID.me**
  - Requires identity verification (e.g., government ID, phone, SSN)
- **Sign in to RAS using the IAL2 account**
  - RAS recognizes and trusts the verified identity
- **Link the IAL2 identity to your eRA Commons account**
  - Connects your verified identity with your NIH account
- **Access CADRs through RAS (SSO)**
  - Meets the minimum IAL2 compliance requirement

This approach enhances your existing access without replacing eRA Commons-RAS acts as a secure bridge that strengthens identity assurance.

## Reference: Identity Assurance Levels

**IAL1 (Low Assurance)**

- No requirement to verify real-world identity
- User attributes are self-asserted
- Suitable for low-risk applications
- **Not acceptable for CADR access**

**IAL2 / IAP High (Moderate Assurance)**

- Requires verification of real-world identity
- Supports remote or in-person identity proofing
- Appropriate for accessing sensitive (but not classified) data

**IAL3 (High Assurance)**

- Highest level of identity verification
- May require biometrics or multiple forms of identification
- High-risk scenarios (e.g., controlled or sensitive government data)

## Supported IAL2 Identity Providers for CADRs

- Login.gov
- ID.me
- NIH PIV / Smart Card
- InCommon Federation (REFEDS IAP High certified institutions)

## Linking Staging eRA Commons Test Accounts to Login.gov and ID.me

Please follow the steps below to test and link accounts to IdPs:

- **High-level:** Account linking is initiated from the IdP side. Users first authenticate with Login.gov or ID.me, then link their eRA Commons account (not the other way around).
- Documentation:
- Please use [NIH-RAS-CADR UserGuidev2.pdf](https://nih.sharepoint.com/:b:/r/sites/NCI-CBIITFNLRAS/Shared%20Documents/General/RASDocumentation/NIH-RAS-CADR%20UserGuidev2.pdf?csf=1&web=1&e=TRPAvx&xsdata=MDV8MDJ8eWl6aGVuLmNoZW5AbmloLmdvdnxhNmJlMzhlYTAxMjY0ZjJhYmRmZTA4ZGU5MWM0YjA5N3wxNGI3NzU3ODk3NzM0MmQ1ODUwNzI1MWNhMmRjMmIwNnwwfDB8NjM5MTA4NDcxMTEzOTYxMTY1fFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=eVpBT2Q3aG45RE4yRlV5Zzlsd0NTWHRDb2RNMlRLZGx4NStMYUFmYVU0dz0%3d) . While written for Production, the same steps apply to Staging and have been validated.
- RAS also provided an additional [helpful document](https://nih.sharepoint.com/:b:/r/sites/NCI-CBIITFNLRAS/Shared%20Documents/General/RASDocumentation/Guidance.for.ID.me.Verification.for.IAL2.pdf?csf=1&web=1&e=VyBNn1&xsdata=MDV8MDJ8eWl6aGVuLmNoZW5AbmloLmdvdnxhNmJlMzhlYTAxMjY0ZjJhYmRmZTA4ZGU5MWM0YjA5N3wxNGI3NzU3ODk3NzM0MmQ1ODUwNzI1MWNhMmRjMmIwNnwwfDB8NjM5MTA4NDcxMTEzOTczMjI0fFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=L1ozT0haSEF5b2ljQTJtbzltdWpUNjgzWEtGTndOM0NCNkZmNE5pMTYvUT0%3d) for creating ID.me accounts for IAL2 linking in Staging.
- **Steps**:
- Use RAS UI for linking- [**https://authtest.nih.gov/settings2/profile**](https://authtest.nih.gov/settings2/profile)
- Login using the IdP assigned in the TAPF. Do **not** use real data during this process (fake ID/SSN is acceptable in Staging).
- Click **Link** to attach the provided staging eRA Commons account.
- **Note:** Currently, RAS allows an eRA account to be linked to only one IdP at a time in the UI. To switch IdPs, use: <https://authtest.nih.gov/settings2/testView>
- If testers encounter issues, please compile them [here](https://nih.sharepoint.com/:x:/r/sites/NCI-CBIITFNLRAS/Shared%20Documents/General/TestPlan/LoginIssues.xlsx?d=w093b7d5fb2c843278e5e5026d3e315d6&csf=1&web=1&e=UBLSeX&xsdata=MDV8MDJ8eWl6aGVuLmNoZW5AbmloLmdvdnxhNmJlMzhlYTAxMjY0ZjJhYmRmZTA4ZGU5MWM0YjA5N3wxNGI3NzU3ODk3NzM0MmQ1ODUwNzI1MWNhMmRjMmIwNnwwfDB8NjM5MTA4NDcxMTEzOTg2MzUzfFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=L3JSRm1mVGhhMHBlRFVidm5ZdksvNVUvNXBjVDdGZ2N4MU4rdlFLdmtkWT0%3d) so that we can escalate to RAS

All RAS documentation received to date has been consolidated here. Please review and familiarize yourselves.

[RASDocumentation](https://nih.sharepoint.com/:f:/r/sites/NCI-CBIITFNLRAS/Shared%20Documents/General/RASDocumentation?csf=1&web=1&e=klohze&xsdata=MDV8MDJ8eWl6aGVuLmNoZW5AbmloLmdvdnxhNmJlMzhlYTAxMjY0ZjJhYmRmZTA4ZGU5MWM0YjA5N3wxNGI3NzU3ODk3NzM0MmQ1ODUwNzI1MWNhMmRjMmIwNnwwfDB8NjM5MTA4NDcxMTEzOTk4MzMwfFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=YmoyRm9tTUk1NC8wU2VvMEp3K3V1ZGRKdnB3ZHQ5RXhBRHJ0d3NwM096Zz0%3d)

&nbsp;

# workflow

## Authentication

```mermaid
sequenceDiagram
autonumber
actor User
participant Browser as User Browser
participant CTDC as CTDC Subsystem
participant RAS as NIH RAS
participant IdP as IAL2 IdP (Login.gov / ID.me / NIH SSO PIV)

User->>Browser: Click "Login" in CTDC UI
Browser-->>RAS: Redirect to /authorize (direct)
RAS-->>User: Select IAL2 IdP
User->>IdP: Enter credentials + MFA
IdP->>RAS: Authentication successful
RAS-->>Browser: Redirect to CTDC callback (authorization code)
Browser->>CTDC: Send authorization code
CTDC->>RAS: POST /token (Client ID + Secret + code)
RAS-->>CTDC: Access Token + Refresh Token
CTDC->>RAS: GET /userinfo (Access Token)
RAS-->>CTDC: User identity + Passport + Visas
CTDC->>CTDC: Validate Passport and Visas
CTDC->>CTDC: Establish session
CTDC-->>Browser: Set secure Session ID cookie
Browser-->>User: Authenticated session established
```

The following steps are taken for users logging into the Clinical and Translational Data Commons (CTDC) subsystem to authenticate with NIH RAS and establish authorized sessions:

- The user clicks the NIH RAS "Login" button in the CTDC user interface.
- The user is redirected to the RAS /authorize endpoint, where they can select an IAL2-compliant IdP (Login.gov, ID.me, NIH SSO with PIV).
- The user provides credentials and completes multi-factor authentication.
- RAS returns an authorization code to the CTDC callback URL.
- CTDC exchanges the authorization code at the RAS /token endpoint using its Client ID and Client Secret.
- RAS issues an Access Token and Refresh Token, along with the encoded Passport.
- CTDC calls the /userinfo endpoint with the Access Token.
- RAS returns user identity details along with the Passport and Visas.
- CTDC validates the Passport and establishes a session, storing a secure Session ID cookie in the user's browser.

### Step 1 - User Initiates Login

The user clicks the **"Login using NIH RAS"** button in the User interface.

- This action triggers a redirect to the **RAS /authorize endpoint** to begin the authentication flow.
- The user is presented with a list of **IAL2-compliant Identity Providers (IdPs)** and selects one:
  - **Login.gov**
  - **ID.me**
  - **NIH SSO (PIV / Smart Card)**

This step initiates the secure authentication process required for accessing controlled NIH data.

GET <https://stsstg.nih.gov/auth/oauth/v2/authorize>

?client_id={client_id}

&response_type=code

&redirect_uri=<https://clinical-dev.datacommons.cancer.gov/api/auth/callback>

&scope= openid profile email ga4gh_passport_v1 researcher_role federated_identities_ial2 federated_identities federated_sources source

### **Step 2 - User Authenticates**

The user enters their credentials with the selected Identity Provider and completes **multi-factor authentication (MFA)** to verify their identity at the required IAL2 level.

### **Step 3 - RAS Returns Authorization Code**

After successful authentication, RAS redirects the user's browser back to the **CTDC callback URL**, including an **authorization code**.

### **Step 4 - Exchange Code for Tokens**

Sends a **POST request** to the RAS **/token endpoint**, including:

- Authorization Code
- Client ID
- Client Secret

RAS validates the request and prepares to issue tokens for the session.

**Endpoint:** <https://stsstg.nih.gov/auth/oauth/v2/token>

curl -X POST "<https://stsstg.nih.gov/auth/oauth/v2/token>" \\

\-H "Content-Type: application/x-www-form-urlencoded" \\

\-d "grant_type=authorization_code" \\

\-d "code=YOUR_AUTH_CODE" \\

\-d "redirect_uri=YOUR_CALLBACK_URL" \\

\-d "client_id=YOUR_CLIENT_ID" \\

\-d "client_secret=YOUR_CLIENT_SECRET" \\

\-d "scope=profile email ga4gh_passport_v1 openid"

### **Step 5 - RAS Returns Tokens**

RAS responds with a set of tokens used for authentication and session management:

- **Access Token** - used to call RAS-protected APIs
- **Refresh Token** - used to obtain new tokens when the session expires
- **ID Token** - contains basic identity information about the user

### **Step 6 - Fetch User Info (Error)**

CTDC attempts to retrieve user information from the **RAS /userinfo endpoint** using the Access Token.

- If the request fails (e.g., invalid token, expired session, or network issue), an **error condition** occurs
- CTDC must handle the error appropriately, such as:
  - Prompting the user to re-authenticate
  - Logging the failure for troubleshooting
  - Preventing session establishment until resolved

This step ensures that user identity, Passport, and Visas can be securely retrieved before granting access.

curl -X GET "<https://stsstg.nih.gov/openid/connect/v1.1/userinfo>"

\-H "Authorization: Bearer YOUR_ACCESS_TOKEN"

\-H "Accept: application/json"

RAS returns user identity information from the **/userinfo endpoint**, along with the encoded **GA4GH Passport**, which includes the user's **Visas** (authorization claims).

### **Step 7 - CTDC Validates Passport and Creates Session**

CTDC validates the returned Passport and associated Visas to confirm the user's access permissions.

- Upon successful validation, CTDC establishes an authenticated user session
- A secure cookie is set in the user's browser containing a **Session ID**
- The session is configured with a **30-minute expiration (TTL)** to enforce security and re-authentication requirements

curl -X POST "<https://stsstg.nih.gov/passport/validate>"

\-H "Authorization: Bearer YOUR_PASSPORT_TOKEN"

\-H "Content-Type: application/json"

## Access Data Files

```mermaid
sequenceDiagram
autonumber
participant User
participant CTDC as CTDC
participant DB as CTDC Database
participant RASV as NIH RAS /passport/validate
participant RASU as NIH RAS /userinfo
participant RASI as NIH RAS /auth/oauth/v2/introspect
participant DCF as DCF DRS
participant Storage as Object Storage

User->>CTDC: Request controlled-access file
CTDC->>DB: Read access token + stored passport
CTDC->>RASV: POST /passport/validate (stored passport)
alt Passport valid
  RASV-->>CTDC: Passport active
else Passport expired or invalid
  RASV-->>CTDC: Passport invalid/expired
  CTDC->>RASU: GET /userinfo (Bearer access token from DB)
  alt Userinfo succeeds
    RASU-->>CTDC: New ga4gh_passport_v1 / Visas
    CTDC->>DB: Save refreshed passport
  else Userinfo fails (access token expired)
    RASU-->>CTDC: 401/invalid token
    CTDC->>RASI: POST /auth/oauth/v2/introspect (token refresh attempt)
    alt Introspect/refresh succeeds
      RASI-->>CTDC: Active/new access token
      CTDC->>RASU: Retry GET /userinfo with new access token
      alt Retry succeeds
        RASU-->>CTDC: New ga4gh_passport_v1 / Visas
        CTDC->>DB: Save new access token + passport
      else Retry fails
        RASU-->>CTDC: Error
        CTDC-->>User: Re-authenticate through RAS
      end
    else Introspect/refresh fails
      RASI-->>CTDC: Inactive/error
      CTDC-->>User: Re-authenticate through RAS
    end
  end
end

alt Valid passport available for request
  CTDC->>DCF: Forward Passport / Visas for DRS object request
  Note over CTDC,DCF: Passport / Visas sent via Authorization header or DRS-specific mechanism
  DCF->>DCF: Validate Passport / Visas
  Note over DCF: Validate signature and Visa claims referencing dbGaP approvals

  alt Authorization succeeds
    DCF-->>CTDC: HTTP 200 + pre-signed URL
    CTDC->>CTDC: Validate HTTP 200 response
    CTDC->>CTDC: Inspect signed URL format and expiry
    CTDC->>Storage: Fetch object using signed URL
    alt Download or redirect succeeds
      Storage-->>CTDC: Object content or valid redirect
      CTDC-->>User: Authorized access confirmed
    else Download fails
      Storage-->>CTDC: Error / invalid redirect
      CTDC-->>User: Download validation failed
    end
  else Authorization fails
    DCF-->>CTDC: Access denied / non-200 response
    CTDC-->>User: Access denied
  end
else Passport unavailable
  CTDC-->>User: Re-authenticate through RAS
end
```


The CTDC portal enables authenticated users to browse metadata and distinguish between open-access and controlled-access files. Authorization is enforced using RAS Passports and Visas obtained during login.

Explore Workflow:

The authenticated user navigates to the CTDC Explore page.

The portal displays open-access metadata and indicates which controlled-access files are available based on the user's RAS Passport Visas.

Controlled Data Access Workflow:

When the user requests controlled-access files for download:

CTDC reads the stored Access Token and Passport from the database.

CTDC validates the stored Passport through the RAS **/passport/validate** endpoint.

If the Passport is expired or invalid, CTDC calls **/userinfo** using the Access Token from the database to fetch a new **ga4gh_passport_v1**.

If **/userinfo** fails (for example, Access Token expired), CTDC attempts token recovery using **/auth/oauth/v2/introspect**, then retries **/userinfo**.

If retry succeeds, CTDC saves the refreshed Access Token and Passport back to the database.

If retry still fails, the user must re-authenticate through RAS before controlled-access requests can proceed.

CTDC forwards the Passport/Visas to the DCF DRS endpoint using the required mechanism (e.g., Authorization header or DRS-specific method).

DCF validates the Passport and Visas, including signature verification and evaluation of Visa claims (e.g., dbGaP approvals).

If authorized, DCF returns an HTTP 200 response with a pre-signed URL for the requested DRS object.

CTDC validates the HTTP 200 response and inspects the signed URL (e.g., format, expiration).

CTDC attempts to retrieve the object using the signed URL and verifies a successful download or valid redirect.

Throughout this process, CTDC enforces session validation, aligns Passport refresh with session TTL, and performs authorization checks via the AuthZ service to ensure continued access compliance.


## **Access Token Refresh Flow**

```mermaid
sequenceDiagram
autonumber
actor User
participant CTDC as CTDC
participant RAS as NIH RAS

User->>CTDC: Authenticate via CTDC using RAS User Flow 1
CTDC->>RAS: Token exchange
RAS-->>CTDC: Access Token + Refresh Token
Note over CTDC: Access Token expires or is nearing expiration
CTDC->>RAS: POST /token (Refresh Token request)
RAS->>RAS: Validate Refresh Token
RAS-->>CTDC: New Access Token
CTDC->>RAS: GET /openid/connect/v1.1/userinfo
Note over CTDC,RAS: Authorization: Bearer new Access Token
RAS-->>CTDC: Userinfo + ga4gh_passport_v1
```

- The user authenticates to CTDC using the RAS login flow (User Flow 1).
- During token exchange, CTDC receives an **Access Token** and a **Refresh Token** from RAS.
- When the Access Token expires or is about to expire:
  - CTDC sends a **refresh token request** to the RAS /token endpoint.
  - RAS validates the Refresh Token and issues a **new Access Token**.

curl -X POST https://stsstg.nih.gov/auth/oauth/v2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"

- CTDC then uses the new Access Token to call the **/openid/connect/v1.1/userinfo endpoint**.
- RAS returns the user information, including the **ga4gh_passport_v1 claim**.




## Log out


curl -X POST https://stsstg.nih.gov/auth/oauth/v2/token/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=YOUR_REFRESH_TOKEN" \
  -d "token_type_hint=refresh_token" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
  
# Reference

## RAS API Specification

<https://stsstg.nih.gov/apidocs/auth/oauth/v2/swagger>

## RAS Sharepoint

<https://nih.sharepoint.com/sites/NCI-CBIITFNLRAS/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FNCI-CBIITFNLRAS%2FShared%20Documents%2FGeneral&viewid=4e1ee38c-e7d1-402c-b1e8-b67038ce14c5>

## RAS github issue

<https://github.com/NIH-Auth-Services/CIT-IAM-RAS/issues>

## Researcher Auth Service (RAS) Project Service Offerings

<https://auth.nih.gov/docs/RAS/serviceofferings.html>
