# Datrix

Datrix is an AI-powered data routing, automation, and analytics platform. It is designed to take scattered or unstructured business data from files, emails, and user input, understand that data with AI, map it to the correct connected system, write it safely or autonomously depending on the mode, and provide visual reporting on what happened.

## Core product areas

- **DatrixAI** — conversational data ingestion, schema discovery, field mapping, confirmation-based writes, and persistent chat history.
- **Automation** — unattended AI-driven routing and insertion of structured data into connected systems.
- **Email processing** — Gmail / webhook ingestion, AI email classification, attachment handling, and downstream automation.
- **Sticky Analysis** — AI-generated business analysis rendered as movable chart nodes on a React Flow board.
- **Dashboard** — run history and status tracking for data operations.
- **Profile & integrations** — profile settings, password management, integration credentials, Gmail OAuth, and connection status.

## Technology stack

- Next.js 13.5 / App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth + Database
- OpenAI + Vercel AI SDK
- Airtable API
- Google APIs / Gmail OAuth
- React Flow
- Recharts
- Framer Motion
- Radix UI / shadcn-style components
- Zod
- PostgreSQL client libraries

## Main routes

```text
/
├── auth
├── onboarding
├── dashboard
├── datrixai
├── profile
└── stickyanalysis
```

## Main API routes

```text
/api/airtable/bases
/api/airtable/tables
/api/airtable/records
/api/chat
/api/automation
/api/analyze
/api/analyze/format
/api/webhook
/api/gmail/oauth/start
/api/gmail/oauth/callback
/api/integrations/gmail/connect
/api/integrations/gmail/callback
/api/webhooks/gmail
```

## Core data flow

```text
User / File / Email
        ↓
AI understanding / classification
        ↓
Integration discovery + schema inspection
        ↓
Exact field mapping
        ↓
Interactive confirmation OR autonomous execution
        ↓
Airtable / connected destination
        ↓
Run logging
        ↓
Dashboard / analysis
```

## Interactive vs autonomous write behavior

Datrix has two different AI write modes:

| Mode | Endpoint | Behavior |
|---|---|---|
| DatrixAI | `/api/chat` | Inspects integrations and schemas, proposes exact mapping, asks for confirmation before insertion |
| Automation | `/api/automation` | Inspects integrations and schemas, chooses a target and writes automatically without asking for confirmation |

## Integrations

### Implemented / strongest support

- Airtable
- Gmail OAuth and email-processing infrastructure

### Partial / mock

- PostgreSQL — current AI integration uses a mocked schema and simulated insert result in the relevant tool implementation.

### UI-defined / future-facing

- Google Sheets
- Notion
- Slack
- Google Calendar
- Custom API

## Airtable capabilities

Datrix can:

- fetch Airtable bases
- fetch tables
- fetch real-time field schemas
- inspect field types and options
- read records
- insert records
- validate exact field names
- format values according to field type
- avoid writing into read-only/system fields
- use linked-record IDs rather than plain text when appropriate

The AI flow is designed to avoid hallucinating field names by inspecting the live Airtable schema before mapping data.

## DatrixAI

Frontend: `app/datrixai/page.tsx`

Backend: `app/api/chat/route.ts`

Main behavior:

1. Authenticate the user with Supabase.
2. Load the user's existing conversation.
3. Accept direct chat input or uploaded file data.
4. Inspect connected integrations.
5. Fetch real-time schemas.
6. Analyze the user's data.
7. Choose the best destination.
8. Present exact field mapping.
9. Ask for confirmation before writing.
10. Insert records after confirmation.
11. Log the operation.
12. Persist the conversation.

Supported upload types in the DatrixAI UI include CSV, Excel, PDF, and plain text. Files are sent to the external document-processing endpoint configured through `NEXT_PUBLIC_BACKEND_URL`.

## Conversation persistence

DatrixAI persists conversation state using the Supabase `chatbot` table through helpers in `lib/chatbot.ts`.

The current structure behaves like one ongoing conversation per user rather than a multi-thread chat history.

## Email processing pipeline

The webhook/email pipeline is designed for business documents and structured transactional data.

```text
Google Apps Script / Gmail data
        ↓
Webhook
        ↓
Identify user
        ↓
AI email classifier
        ↓
Process or discard
        ↓
Attachment?
   ┌────┴────┐
  yes       no
   ↓         ↓
Document    Direct email data
processor        ↓
   └─────────┬───┘
             ↓
       Automation AI
             ↓
       Connected system
```

The email classifier uses structured AI output and evaluates fields such as:

- shouldProcess
- confidence
- reasoning
- category
- priority
- sender
- subject
- key topics
- sentiment
- attachment presence
- urgency indicators

Typical transactional content targeted by the classifier includes invoices, purchase orders, receipts, payments, order confirmations, sales reports, and credit notes.

If AI classification fails, the fallback behavior defaults to not processing the email.

## Sticky Analysis

Frontend: `app/stickyanalysis/page.tsx`

Backend: `app/api/analyze/route.ts` and `app/api/analyze/format/route.ts`

Sticky Analysis uses React Flow to render movable chart nodes. The AI can inspect connected data, produce an analysis explanation, format results as structured chart JSON, and append new charts to the existing board.

Supported chart types:

- bar
- line
- pie
- area
- donut

Analysis state is persisted in the Supabase `analysis` table as `analysis_json` containing nodes and edges.

Currently defined analysis types include:

- Sales Reporting — available
- Financial Summaries — defined but unavailable
- Sales Forecasting — defined but unavailable
- Customer Segments — defined but unavailable
- Product Performance — defined but unavailable
- Time Analysis — defined but unavailable

## Dashboard

Frontend: `app/dashboard/page.tsx`

The dashboard loads up to the latest 50 user runs from the Supabase `runs` table and displays:

- date and time
- data type
- source
- destination
- status

Common statuses:

- Success
- Failed
- In Progress

The UI initially shows the first five runs and can expand to show more.

## Supabase tables referenced by the application

| Table | Purpose |
|---|---|
| `user_profiles` | onboarding and user profile data |
| `user_data_sources` | connected integrations and credentials/config |
| `chatbot` | persistent DatrixAI conversation |
| `runs` | automation / AI operation history |
| `analysis` | Sticky Analysis nodes, edges, and board state |

## Profile and account features

The profile area supports:

- name
- role/title
- company
- main goal
- password update
- integration connection/disconnection
- Gmail OAuth start

The UI also contains feedback and support forms, but their current handlers are placeholder-style implementations that log/show alerts rather than send to a production support backend.

## Implementation status

### Strongly implemented

- Supabase authentication
- onboarding/profile state
- DatrixAI chat UI
- persistent chat
- file upload UI
- external document-processing hook
- Airtable credential management
- Airtable schema discovery
- Airtable record reading
- Airtable insertion
- schema-aware mapping
- confirmation-based DatrixAI writes
- autonomous automation writes
- run logging
- dashboard
- AI email classification
- webhook email pipeline
- Gmail connection infrastructure
- Sticky Analysis UI
- AI-generated chart data
- analysis persistence

### Partial

- PostgreSQL integration
- full end-to-end Gmail ingestion depending on environment/configuration
- external document processor because that service lives outside this repository

### Future-facing / placeholder

- Notion
- Slack
- Google Sheets
- Google Calendar
- Custom API
- most analysis types beyond Sales Reporting
- production feedback/support delivery

## Known technical concerns

These are important areas to review before production hardening:

1. **Sensitive debug logging** — some Airtable code logs credential metadata and a token prefix. Remove this in production.
2. **Module-level user state in `/api/chat`** — avoid request-shared mutable state such as a module-level `user_id`; pass user context explicitly through each call.
3. **Mock PostgreSQL tool** — do not treat its current simulated insert response as a real database write.
4. **Integration UI vs backend support** — the UI exposes more integrations than are implemented end-to-end.
5. **Password current-value handling** — the profile UI collects a current password value but the shown update flow does not use it for explicit reauthentication.
6. **Autonomous writes** — `/api/automation` is intentionally configured to write without confirmation, so authorization and scope controls should be hardened.
7. **Webhook logging** — incoming email bodies and request metadata may be logged verbosely; review for privacy and data-retention requirements.
8. **External document processor dependency** — document extraction is not fully self-contained in this repository.

## Detailed internal documentation

See:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/FEATURES.md`](docs/FEATURES.md)

These files contain a deeper code-level view of the current Datrix implementation.
