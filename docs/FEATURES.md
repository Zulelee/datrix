# Datrix Feature Inventory

This file lists the features currently present in the Datrix repository, their implementation status, and the main files involved.

## Authentication and onboarding

### Supabase authentication
**Status:** Implemented

Main files:
- `app/auth/page.tsx`
- `lib/supabaseClient.ts`

Behavior:
- sign-in/registration through Supabase
- fetch current authenticated user
- redirect unauthenticated users to `/auth`
- route users based on onboarding completion

### Onboarding
**Status:** Implemented

Main file:
- `app/onboarding/page.tsx`

Behavior:
- collect profile information
- save/update `user_profiles`
- track onboarding completion

## Profile management

### User profile editing
**Status:** Implemented

Main file:
- `app/profile/page.tsx`

Fields:
- name
- role/title
- company
- main goal

Writes to:
- `user_profiles`
- Supabase auth user metadata

### Password update
**Status:** Implemented with a UX/security caveat

Main file:
- `app/profile/page.tsx`

Behavior:
- validates that new password and confirmation match
- calls `supabase.auth.updateUser({ password })`

Caveat:
- the current-password field is present in UI state but is not used for explicit reauthentication in the shown implementation

### Feedback/support forms
**Status:** Placeholder

Main file:
- `app/profile/page.tsx`

Current behavior:
- logs content
- clears modal/input
- shows an alert

No production delivery backend is currently shown.

## Integration management

### Integration credential persistence
**Status:** Implemented

Main file:
- `lib/saveDataSource.ts`

Supabase table:
- `user_data_sources`

Capabilities:
- save/upsert a data source
- retrieve a user's data sources
- disconnect/delete a data source

### Airtable connection
**Status:** Implemented

Main files:
- `app/profile/page.tsx`
- `lib/saveDataSource.ts`
- `app/api/airtable/*`

Capabilities:
- store Airtable token/config
- discover bases
- discover tables
- discover field schema
- read records
- write records

### Gmail connection
**Status:** Substantially implemented / environment dependent

Main files:
- `app/profile/page.tsx`
- `app/api/gmail/oauth/start/route.ts`
- `app/api/gmail/oauth/callback/route.ts`
- `app/api/integrations/gmail/connect/route.ts`
- `app/api/integrations/gmail/callback/route.ts`
- `app/api/webhooks/gmail/route.ts`

Behavior:
- starts OAuth using authenticated Supabase session context
- redirects user to Google authorization URL
- processes callback through backend routes

### PostgreSQL connection
**Status:** Partial / mocked in AI tool flow

Libraries are present and the profile UI supports a PostgreSQL integration entry, but the AI integration logic currently returns a hardcoded `contacts` schema and simulated successful writes.

### Google Sheets
**Status:** UI-defined / future-facing

### Notion
**Status:** UI-defined / future-facing

### Slack
**Status:** UI-defined / future-facing

### Google Calendar
**Status:** UI-defined / future-facing

### Custom API
**Status:** UI-defined / future-facing

## DatrixAI

### Conversational AI assistant
**Status:** Implemented

Frontend:
- `app/datrixai/page.tsx`

Backend:
- `app/api/chat/route.ts`

Model/tool stack:
- Vercel AI SDK
- OpenAI model tooling
- Zod tool schemas

Capabilities:
- chat with authenticated user
- automatically inspect connected integrations when data is provided
- fetch real-time schema
- reason about data type and destination
- map source fields to exact destination fields
- read example Airtable records if needed
- ask for confirmation before insertion
- execute Airtable insertion after confirmation
- stream AI output

### Conversation persistence
**Status:** Implemented

Main file:
- `lib/chatbot.ts`

Supabase table:
- `chatbot`

Capabilities:
- create/save conversation
- update conversation
- retrieve user conversation
- reset chat to empty

Current UX model:
- one ongoing conversation per user

### File upload
**Status:** Implemented with external dependency

Frontend:
- `app/datrixai/page.tsx`

Supported types:
- CSV
- XLS
- XLSX
- PDF
- TXT

Processing path:
- upload file to `NEXT_PUBLIC_BACKEND_URL/test/process-document`
- receive structured JSON
- inject structured result into the chat context

## Airtable AI behavior

### Real-time schema discovery
**Status:** Implemented

The tool builds a runtime schema containing:
- bases
- base IDs
- tables
- table IDs
- field names
- field types
- required flags
- options
- descriptions
- `fieldsList`

### Record reading
**Status:** Implemented

Supports optional values such as:
- page size
- offset
- filter formula
- sort
- view

### Record writing
**Status:** Implemented

Behavior:
- validates `baseId`
- validates table name
- validates records array
- wraps records in Airtable `fields`
- sends through the Airtable records API route
- reports clearer messages for common Airtable errors

### Field-formatting intelligence
**Status:** Prompt-enforced

The interactive AI is instructed to handle:
- text
- numbers
- ISO dates
- select/multiselect allowed options
- booleans
- URLs
- email
- phone
- currency
- percent
- duration
- ratings
- linked records
- read-only formulas/rollups/count/system timestamps

## Automation mode

### Autonomous AI routing/writing
**Status:** Implemented

Backend:
- `app/api/automation/route.ts`

Behavior:
- discover user integrations
- inspect schemas
- analyze input data
- choose best target
- format records
- write automatically
- report outcome

Important difference from `/api/chat`:
- it is intentionally configured to **not ask for user confirmation** before writing

## Email processing

### Webhook receiver
**Status:** Implemented

Main file:
- `app/api/webhook/route.ts`

Capabilities:
- receive JSON webhook payloads
- recognize Google Apps Script email payloads
- inspect request metadata
- process email arrays
- resolve a Datrix user from recipient email
- invoke AI email classification
- branch based on attachment presence
- call document processor when required
- forward structured data to the automation agent

### AI email classifier
**Status:** Implemented

Main file:
- `lib/ai-agent.ts`

Structured output:
- shouldProcess
- confidence
- reasoning
- category
- priority
- sender
- subject
- key topics
- sentiment
- hasAttachments
- urgency indicators

Primary target data:
- invoices
- purchase orders
- receipts
- payments
- order confirmations
- sales reports
- credit notes

Typical non-target content:
- customer support
- non-transactional business chat
- marketing
- newsletters
- promotions
- unrelated generic mail

### Safe classifier fallback
**Status:** Implemented

If model processing throws an exception, the system defaults to:
- do not process
- confidence 0.1
- category `other`
- low priority
- neutral/empty extracted metadata

### Attachment/document workflow
**Status:** Implemented with external dependency

If an accepted email has attachments:
- send data/document to document-processing endpoint
- use returned structured result as input to automation

If there are no attachments:
- send email data directly to automation

## Dashboard and run tracking

### Run logger
**Status:** Implemented

Main file:
- `lib/runLogger.ts`

Supabase table:
- `runs`

Capabilities:
- create a run
- update status

### Dashboard
**Status:** Implemented

Main file:
- `app/dashboard/page.tsx`

Behavior:
- load latest 50 user runs
- order descending by run time
- initially show 5
- show more/show less

Displayed information:
- date/time
- data type
- source
- destination
- status

Status handling:
- Success
- Failed
- In Progress

## Sticky Analysis

### Visual analysis board
**Status:** Implemented

Main files:
- `app/stickyanalysis/page.tsx`
- `components/ChartNode.tsx`

Libraries:
- React Flow
- Recharts

Capabilities:
- add chart nodes
- drag/reposition nodes
- connect nodes with edges
- delete chart nodes
- zoom/pan/fit board
- restore saved nodes/edges

### AI analysis
**Status:** Implemented

Backend:
- `app/api/analyze/route.ts`

Capabilities:
- inspect user integrations
- inspect Airtable schema
- read Airtable records
- stream an analysis response

### Analysis formatting
**Status:** Implemented

Backend:
- `app/api/analyze/format/route.ts`

Transforms analysis text into structured components that can be rendered as charts.

### Chart types
**Status:** Implemented

Supported:
- bar
- line
- pie
- area
- donut

### Analysis persistence
**Status:** Implemented

Supabase table:
- `analysis`

Stored state:
- React Flow nodes
- edges
- chart metadata
- positions

### Analysis categories

| Analysis | Status |
|---|---|
| Sales Reporting | Available |
| Financial Summaries | Defined but unavailable |
| Sales Forecasting | Defined but unavailable |
| Customer Segments | Defined but unavailable |
| Product Performance | Defined but unavailable |
| Time Analysis | Defined but unavailable |

## Landing/marketing UI

### Hero/brand UI
**Status:** Implemented

Uses:
- Framer Motion
- animated typewriter text
- hand-drawn visual styling
- reusable hero/navbar components

Brand typewriter terms include:
- STRUCTURE.
- INSIGHT.
- CLARITY.

### Team section
**Status:** Implemented

Main component:
- `components/MeetTheTeam.tsx`

## Current known issues / production-hardening items

### Sensitive credential logging
Some integration code logs token diagnostics, including token prefixes. This should be removed before production.

### Module-level user state in chat API
`app/api/chat/route.ts` currently uses request-shared mutable user state for some logging behavior. This should be refactored to explicit per-request function parameters.

### Mock PostgreSQL writes
The PostgreSQL AI tool currently reports simulated write success. It must not be presented as a real successful external write until implemented.

### UI/backend integration mismatch
The profile UI advertises integrations that are not implemented end-to-end. Their status should be clearly marked.

### Autonomous write permissions
`/api/automation` is designed to mutate connected systems without confirmation. Production code should independently enforce authorization, integration ownership, scopes, and destination restrictions.

### Verbose webhook logs
The webhook logs substantial message/request content. Review for PII, secrets, retention, and production privacy requirements.

### External document service dependency
Document extraction is performed outside this Next.js repository, so Datrix is not self-contained for that capability.

### Password reauthentication
The password UI includes a current password field, but the shown update implementation does not use that value to perform explicit reauthentication.

## Key source-file map

```text
app/
├── page.tsx                         Landing page
├── auth/page.tsx                    Authentication
├── onboarding/page.tsx              Onboarding
├── dashboard/page.tsx               Run dashboard
├── datrixai/page.tsx                DatrixAI chat UI
├── profile/page.tsx                 Profile + integrations
├── stickyanalysis/page.tsx          Visual AI analysis board
└── api/
    ├── airtable/
    │   ├── bases/route.ts
    │   ├── tables/route.ts
    │   └── records/route.ts
    ├── chat/route.ts                Interactive AI
    ├── automation/route.ts          Autonomous AI
    ├── analyze/route.ts             Analysis AI
    ├── analyze/format/route.ts      Analysis → chart JSON
    ├── webhook/route.ts             Email/webhook pipeline
    ├── gmail/oauth/...              Gmail OAuth
    ├── integrations/gmail/...       Gmail integration OAuth
    └── webhooks/gmail/route.ts      Gmail webhook handling

lib/
├── ai-agent.ts                      AI email classifier
├── chatbot.ts                       Chat persistence
├── saveDataSource.ts                Integration persistence
├── runLogger.ts                     Run logging
├── supabaseClient.ts                Client Supabase access
└── supabaseRoleClient.ts            Server/service-role access
```
