# Datrix Architecture

This document describes the current architecture of the Datrix repository as implemented in code.

## 1. Product architecture

Datrix is organized around three primary product modes:

1. **DatrixAI** — conversational, user-confirmed data routing and insertion.
2. **Automation** — autonomous data routing and insertion for unattended workflows.
3. **Sticky Analysis** — AI-powered analysis and visual chart generation over connected business data.

Supporting systems include Supabase authentication and persistence, Gmail/email ingestion, Airtable integration, run logging, profile/integration management, and an external document-processing backend.

## 2. Frontend routes

### `/`
Landing/marketing experience using reusable animated components.

### `/auth`
Supabase-backed sign-in/registration experience. After authentication, onboarding state is checked through `user_profiles`.

### `/onboarding`
Collects user profile information and writes it to Supabase. The profile data includes name, role, company, and goal, and tracks onboarding completion.

### `/dashboard`
Loads recent entries from `runs` and presents operation history with status, source, destination, data type, date, and time.

### `/datrixai`
Main conversational AI interface. Uses `@ai-sdk/react` `useChat()` against `/api/chat`, handles file uploads, restores the user's saved conversation, and persists updates.

### `/profile`
Account/profile and integration-management area. Supports profile edits, password updates, Airtable/Postgres credential entry, Gmail OAuth initiation, and integration disconnects.

### `/stickyanalysis`
React Flow-based visual analysis board. Loads and saves chart nodes/edges from the `analysis` table and calls AI analysis endpoints to generate new visualizations.

## 3. API routes

### Airtable

- `POST /api/airtable/bases`
- `POST /api/airtable/tables`
- `GET/POST /api/airtable/records`

These routes proxy Airtable metadata and record access.

### AI chat

`POST /api/chat`

Responsibilities:

- receive chat messages and user ID
- inspect connected integrations
- expose integration tools to the model
- retrieve real-time Airtable schema
- read Airtable records when needed
- write Airtable records after user confirmation
- log successful/failed operations
- stream responses back to the frontend

The current interactive system prompt is intentionally confirmation-based before data insertion.

### Automation AI

`POST /api/automation`

Responsibilities mirror `/api/chat`, but this mode is intentionally autonomous. The model is instructed to inspect schemas, choose a destination, map fields, and write immediately without user confirmation.

### Analysis

- `POST /api/analyze`
- `POST /api/analyze/format`

`/api/analyze` performs the AI analysis and can inspect connected Airtable data. `/api/analyze/format` converts the resulting analysis into structured chart-friendly JSON.

### Email/webhook ingestion

- `POST /api/webhook`
- `POST /api/webhooks/gmail`

The main webhook endpoint can recognize Google Apps Script email payloads, identify the corresponding Datrix user, classify the email with AI, process attachments if present, and pass structured results to the autonomous automation path.

### Gmail OAuth

- `/api/gmail/oauth/start`
- `/api/gmail/oauth/callback`
- `/api/integrations/gmail/connect`
- `/api/integrations/gmail/callback`

The profile page uses the integrations Gmail connect route to initiate OAuth after retrieving a Supabase session token.

## 4. Data storage

### `user_profiles`
Stores profile/onboarding information such as name, role, company, goal, and onboarding completion.

### `user_data_sources`
Stores per-user connected integration configuration and credentials.

### `chatbot`
Stores the DatrixAI conversation JSON. The current UX behaves as a single continuing conversation per user.

### `runs`
Stores run/activity records. Typical fields include user ID, run time, data type, source, destination, and status.

### `analysis`
Stores Sticky Analysis board state, including React Flow nodes and edges inside `analysis_json`.

## 5. Integration abstraction

Helpers in `lib/saveDataSource.ts` provide the basic persistence layer for integrations:

- save/upsert user data source
- fetch connected data sources
- disconnect/delete data source

AI endpoints call these helpers to discover the integrations available to the current user.

## 6. Airtable architecture

Airtable is the most complete destination integration.

### Schema discovery

The AI tool calls the Airtable bases route, then the tables route for each base, and constructs a runtime schema containing:

- base name and ID
- table name and ID
- base ID per table
- field names
- field types
- required flags
- field options
- field descriptions
- a plain `fieldsList` for validation

### Record retrieval

The `getRecords` action supports optional settings such as:

- `pageSize`
- `offset`
- `filterByFormula`
- `sort`
- `view`

### Record insertion

The write path validates required parameters, wraps each object as Airtable `fields`, sends it through `/api/airtable/records`, converts common Airtable errors into clearer messages, and logs operation status.

## 7. DatrixAI architecture

Frontend flow:

```text
User input or file
      ↓
app/datrixai/page.tsx
      ↓
useChat()
      ↓
/api/chat
      ↓
OpenAI model + tools
      ↓
Connected integrations
      ↓
Schema-aware recommendation
      ↓
Confirmation
      ↓
Write + run log
```

### File handling

Supported UI file types:

- CSV
- legacy Excel
- XLSX
- PDF
- text

The file itself is not parsed by the Next.js app. It is sent to:

`NEXT_PUBLIC_BACKEND_URL/test/process-document`

The returned structured JSON is then sent into DatrixAI as contextual user data.

### Conversation persistence

After an AI response completes, the current messages are written to the saved conversation using helpers in `lib/chatbot.ts`.

The Reset Chat action clears the frontend and persists an empty conversation.

## 8. Automation architecture

Automation uses the same broad integration tooling but a different system policy:

```text
Structured input
     ↓
Discover integrations
     ↓
Fetch schema
     ↓
Analyze data type
     ↓
Choose target
     ↓
Format exact fields
     ↓
Write automatically
     ↓
Report result
```

Because this path intentionally omits confirmation, production deployments should enforce strong server-side authorization and integration scope controls.

## 9. Email architecture

`lib/ai-agent.ts` defines a structured AI email-processing agent.

The model returns:

- `shouldProcess`
- `confidence`
- `reasoning`
- `category`
- `priority`
- structured extracted metadata

The target use case is transactional business data such as invoices, POs, receipts, payments, order confirmations, and sales reports.

### Failure mode

If AI classification fails, the agent defaults to:

- not processing
- low confidence
- low priority
- neutral/empty extracted metadata

This prevents accidental downstream writes during model failures.

### Attachment path

```text
Email
  ↓
AI classification
  ↓
Accepted?
  ↓
Attachment?
 ┌───────┴───────┐
yes              no
 ↓                ↓
Document          Email data
processor         directly
 └───────┬────────┘
         ↓
Automation agent
         ↓
Destination integration
```

## 10. Sticky Analysis architecture

Sticky Analysis uses React Flow with custom `ChartNode` components.

The UI maintains:

- nodes
- edges
- chart metadata
- node position
- delete handlers

On load, saved board state is restored from the `analysis` table.

When AI analysis runs:

1. `/api/analyze` generates streaming analysis text.
2. `/api/analyze/format` structures the result.
3. Chart components are transformed into React Flow nodes.
4. New nodes are appended to the existing board.
5. Board state is persisted.

Supported chart types are bar, line, pie, area, and donut.

## 11. Run logging

`lib/runLogger.ts` provides reusable run creation/status update behavior. The AI write paths also write into `runs` directly in places.

The dashboard uses those records as the activity history for the user.

## 12. Current implementation boundaries

### Production-like / real integration

- Supabase auth and database persistence
- Airtable schema/read/write flows
- DatrixAI chat
- conversation persistence
- dashboard
- AI email classification
- React Flow analysis board
- Gmail OAuth infrastructure

### Partial / environment dependent

- email ingestion end-to-end
- external document extraction
- Gmail webhook configuration

### Mock / placeholder

- PostgreSQL AI integration currently returns a hardcoded schema and simulated writes
- Notion
- Slack
- Google Sheets
- Google Calendar
- Custom API
- most analysis types beyond Sales Reporting

## 13. Technical risks to address

### Request-shared mutable state
`/api/chat` uses module-level mutable user state in the current implementation. User context should instead be passed explicitly to logging/write helpers to prevent concurrency issues.

### Sensitive logging
Airtable/tool code currently emits verbose credential diagnostics, including a token prefix. Production logging should never expose credential material.

### Webhook privacy
The webhook emits detailed incoming metadata and content. Review logging, retention, PII handling, and redaction before production use.

### Integration status clarity
The UI currently lists integrations that are not fully implemented. Distinguish available, beta, mock, and coming-soon states.

### Autonomous writes
Automation intentionally performs writes without user confirmation. The server must enforce user ownership, integration authorization, and destination restrictions independently of the model prompt.

### Password UX
The profile screen collects a current-password value but the shown password-update implementation does not use it for explicit reauthentication.

## 14. High-level architecture map

```text
                         DATRIX
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
   DatrixAI             Email pipeline      Sticky Analysis
       │                    │                    │
Chat / upload          Gmail / webhook      User analysis prompt
       │                    │                    │
       ▼                    ▼                    ▼
AI + integration     AI email classifier    AI analysis
    tools                   │                    │
       │                    ▼                    ▼
       ▼              document processing   structured chart JSON
schema discovery           (optional)            │
       │                    │                    ▼
       ▼                    ▼                React Flow board
field mapping         automation endpoint        │
       │                    │                    ▼
confirmation               ▼                Supabase analysis
       │               integration write
       ▼                    │
integration write           ▼
       │                 runs log
       └──────────────┬─────┘
                      ▼
                  Dashboard
```
