# Portfolio backend

Spring Boot REST API for Omar Abusahmoud's portfolio.

## Stack

- Java 21
- Spring Boot 4.1
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway
- Maven

The local Compose database is exposed on host port `5433` to avoid conflicts
with PostgreSQL installations that commonly use `5432`.

The API uses port `8081` by default because this development machine runs
Jenkins on the conventional Java web port `8080`.

## Run locally

1. Start PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

2. Configure the environment values shown in `.env.example`. The defaults in
   `application.yml` match `compose.yaml`, so local development works without
   copying secrets into the repository.

3. Start the API:

   ```bash
   mvn spring-boot:run
   ```

   On Windows, after creating `backend/.env`, use the local launcher so secrets
   are loaded into the backend process without being printed:

   ```powershell
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-local.ps1
   ```

4. Check the API:

   ```text
   GET http://localhost:8081/api/v1/health
   GET http://localhost:8081/actuator/health
   ```

## Swagger and OpenAPI

With the backend running, use the interactive Swagger UI to inspect and test
the endpoints:

```text
http://localhost:8081/swagger-ui.html
```

The generated OpenAPI document is available as JSON:

```text
http://localhost:8081/v3/api-docs
```

## Booking API

```text
GET  /api/v1/bookings/availability?month=2026-08
GET  /api/v1/bookings/availability?month=2026-08&date=2026-08-11
POST /api/v1/bookings/requests
```

Example booking request:

```json
{
  "startsAt": "2026-08-11T07:00:00Z",
  "fullName": "Example Visitor",
  "email": "visitor@example.com",
  "topic": "I would like to discuss a software project.",
  "idempotencyKey": "browser-generated-unique-key",
  "company": ""
}
```

Availability is calculated in `Europe/Brussels`. Booking requests are stored as
`PENDING`, and the requested slot is revalidated inside the transaction. Unique
database constraints on `starts_at` and `idempotency_key` provide the final
double-booking and retry safeguards.

Pending requests are confirmed by the owner from the owner booking panel. When
the separate `oauth-workspace` profile is enabled and the Workspace mailbox is
connected, confirmation creates a Google Calendar event with a Google Meet
link and sends the visitor a confirmation email from the configured Workspace
mailbox. Without that connection, confirmation is rejected safely instead of
claiming that a meeting was created.

### Google Workspace Calendar, Meet, and Gmail setup

Use a separate Google Cloud OAuth web client for the Workspace mailbox. Add the
exact callback URL below to the client, then configure the values in
`backend/.env`:

```text
Authorized redirect URI: http://localhost:8081/login/oauth2/code/google-workspace
GOOGLE_WORKSPACE_EMAIL=hello@omarcode.dev
GOOGLE_WORKSPACE_CLIENT_ID=...
GOOGLE_WORKSPACE_CLIENT_SECRET=...
GOOGLE_WORKSPACE_REDIRECT_URI=http://localhost:8081/login/oauth2/code/google-workspace
GOOGLE_WORKSPACE_ENCRYPTION_KEY=<base64 encoding of exactly 32 random bytes>
```

For PowerShell, generate a suitable local key with:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

The OAuth consent must grant Calendar and Gmail send access. Start the backend
with `oauth-workspace` enabled, sign in as the owner, then use **Connect Google
Workspace** in the pending-bookings panel. The refresh token is encrypted at
rest in PostgreSQL; it is never sent to the browser. Add the production
callback URL to the same OAuth client before deploying.

## Portfolio assistant API

```text
POST /api/v1/assistant/messages
```

Example request:

```json
{ "message": "What technologies does Omar use?" }
```

Set `OPENAI_API_KEY` in `backend/.env` to enable OpenAI Responses API answers.
`OPENAI_MODEL` defaults to `gpt-5.6-luna`. When the key is missing or the
provider is unavailable, the API returns a deterministic Omar-specific local
answer instead; the API key is never returned to the browser.

Omi uses hybrid retrieval-augmented generation. Editable knowledge chunks live
in `assistant_knowledge_documents`; semantic vectors are generated with
`OPENAI_EMBEDDING_MODEL` (default `text-embedding-3-small`) and cached in
PostgreSQL. Retrieval combines semantic and lexical relevance and injects only
the top three chunks into the response request. The OpenAI key therefore needs
Write permission for both Responses and Embeddings.

## Contact API

```text
POST /api/v1/contact-inquiries
```

Contact inquiries are validated and persisted with a `NEW` status. Idempotency,
a honeypot field, and a configurable per-email hourly limit protect the public
endpoint. Notification delivery is intentionally not claimed until an email
provider is configured.

## Guestbook API

```text
GET    /api/v1/guestbook/messages?page=0&size=20
POST   /api/v1/guestbook/messages
PATCH  /api/v1/guestbook/messages/{id}
DELETE /api/v1/guestbook/messages/{id}
GET    /api/v1/guestbook/moderation/messages
PATCH  /api/v1/guestbook/moderation/messages/{id}/approve
PATCH  /api/v1/guestbook/moderation/messages/{id}/hide
GET    /api/v1/auth/providers
GET    /api/v1/auth/me
GET    /api/v1/auth/csrf
```

New messages are stored as `PENDING`; only owner-approved `VISIBLE` messages
are returned publicly. Creating, editing, and deleting
messages requires an authenticated OAuth session, and ownership is enforced in
the service layer. Moderation endpoints require the configured GitHub owner
login. Deletion is a moderation-friendly soft hide. Activate the
`oauth-github` and/or `oauth-google` profile only after supplying the matching
environment variables documented in `.env.example`.

### GitHub OAuth setup

Create a GitHub OAuth App with these local-development values:

```text
Homepage URL:               http://localhost:3000
Authorization callback URL: http://localhost:8081/login/oauth2/code/github
```

Copy `.env.example` to `.env`, replace `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` with the generated values, and use the Windows launcher
command shown above. The `.env` file is ignored by Git and the launcher never
prints credential values.

### Google OAuth setup

Create a Google OAuth 2.0 Client ID for a Web application with:

```text
Authorized JavaScript origin: http://localhost:3000
Authorized redirect URI:      http://localhost:8081/login/oauth2/code/google
```

Add the generated values directly to `backend/.env` as `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`, then change `SPRING_PROFILES_ACTIVE` to:

```text
oauth-github,oauth-google
```

Never commit the `.env` file or paste its secret values into chat.

## Global portfolio authentication and owner access

The GitHub and Google OAuth session is shared across the homepage, Guestbook,
Links, and Booking routes. First-time OAuth login acts as account registration;
there is no separate password or sign-up form.

Owner access is always enforced by the backend. Configure one or both values:

```text
PORTFOLIO_OWNER_GITHUB_LOGINS=CodeArmour
PORTFOLIO_OWNER_GOOGLE_EMAILS=omarcode.business@gmail.com
```

The floating navigation shows the current session. Normal authenticated users
can use the Guestbook but never receive owner controls. Configured owner
identities can review booking requests and moderate Guestbook messages.

Owner booking endpoints:

```text
GET   /api/v1/bookings/admin/requests?status=PENDING
PATCH /api/v1/bookings/admin/requests/{id}/confirm
PATCH /api/v1/bookings/admin/requests/{id}/reject
PATCH /api/v1/bookings/admin/requests/{id}/cancel
```

These endpoints require both an authenticated OAuth session and a configured
owner identity. OAuth login entry points accept a safe relative `returnTo`
value so users return to the route where sign-in began.

## Cloudinary project images

Owner project images are uploaded through the Spring backend using Cloudinary's
signed Upload API. The API secret is never sent to Next.js. Configure these
server-only values in `backend/.env`:

```text
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_PROJECT_FOLDER=omar-portfolio/projects
```

The upload endpoint accepts JPEG, PNG, WebP, and AVIF images up to 10 MB:

```text
POST /api/v1/projects/admin/images
```

It requires the authenticated owner session and CSRF token. PostgreSQL stores
the returned secure delivery URL, Cloudinary public ID, width, and height with
the project record. Existing local project assets continue to work.

## Commands

```bash
mvn test
mvn verify
mvn spring-boot:run
```

## Package structure

The backend uses package-by-feature with explicit layers inside each feature:

```text
com.omarabusahmoud.portfolio
|-- booking
|   |-- config
|   |-- controller
|   |-- dto
|   |-- entity
|   |-- exception
|   |-- model
|   |-- repository
|   `-- service
|-- common
|   |-- controller
|   |-- dto
|   `-- exception
`-- config
```

Future `guestbook`, `assistant`, and `contact` features will follow the same
internal layering. This keeps each business feature cohesive while preventing
controllers, persistence entities, and API contracts from being mixed together.

Database changes must be added as versioned Flyway migrations under
`src/main/resources/db/migration`. JPA schema generation is intentionally set
to `validate`; Hibernate must not modify production schemas implicitly.
