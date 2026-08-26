# F18 Pay security design decision

## Decision

Retain the original defensive request flow for authenticated dashboard data.
The repeated session and store checks are intentional security behavior, not a
request deduplication bug.

## Request flow

When the dashboard opens, the application may perform the following checks:

1. The application bootstrap and dashboard lifecycle perform session checks.
2. The dashboard performs a session preflight through
   `/validate-fingerprint-check-username`.
3. The dashboard performs its direct `/stores` request to render the store
   tiles.
4. The dashboard also calls the shared `getStores()` action so the Pinia store
   has a separately refreshed copy of the store data.
5. The backend `/stores` handler independently calls `validateSession()` before
   querying any store data.

The backend check is authoritative. A successful frontend preflight must never
be treated as sufficient authorization for a protected data request.

## What is validated

The protected request carries the encrypted username, fingerprint, and key
rotation identifier. The backend validates the encryption key, decrypts and
validates the username, confirms the account, and checks that the fingerprint
and request IP match the stored account values. It also enforces the fingerprint
age limit and rejects blacklisted or limited accounts.

The `/stores` query then scopes returned rows to the user ID encoded in the
validated fingerprint. This keeps authorization close to the data access even
when the endpoint is called independently of the dashboard flow.

## Consequences

This design intentionally accepts additional latency and database work in
exchange for defense in depth and independent state refreshes. The dashboard
therefore keeps the shared application `working` state active across the full
session-and-store loading sequence and shows “Fetching stores details” until
both store reads have completed.

Do not consolidate these checks or remove the second store refresh without an
explicit security review. If performance work is needed, measure and optimize
the implementation while preserving the backend authorization check and the
separate Pinia refresh unless this decision is superseded.

## Account-management security

Account-management requests use the same original session binding. The backend
revalidates the encrypted username, rotating key identifier, fingerprint, IP
address, fingerprint age, and account status for every account request.

Changing a password requires two additional factors: the current password and
a fresh one-time code sent to the account email address. A successful password
change rotates the stored session fingerprint and marks the code as used, while
keeping the current session alive with the replacement fingerprint.

The security view describes this email-code protection as the current sensitive
change control. It does not present an authenticator-app or TOTP option because
the existing database and backend do not provide one.

## Relevant implementation

- Dashboard flow: `src/components/Dashboard.vue`
- Session and shared store actions: `src/stores/index.js`
- Account-management views: `src/components/AccountManagement.vue`,
  `src/components/AccountSecurity.vue`, and `src/components/AccountPassword.vue`
- Backend session preflight: `../f18_pay_backend/src/server.mjs`
- Backend request-level authorization: `../f18_pay_backend/src/functions/money.mjs`
