# Calendar AI Assistant

> An AI-powered conversational Google Calendar assistant built with Node.js, Express, PostgreSQL, Prisma, Google OAuth 2.0, Google Calendar API, and Groq tool calling.

## 📌 Project Overview

The **Calendar AI Assistant** allows users to interact with their Google Calendar using natural language.

Instead of manually navigating Google Calendar, users can communicate with the assistant:

```text
"What events do I have tomorrow?"

"Create a project discussion tomorrow from 10 AM to 11 AM."

"Show me my meetings for Friday."

"Delete the Project Discussion."

"Move my meeting to 4 PM."
```

The assistant interprets the user's request, decides whether a calendar operation is required, invokes the appropriate calendar tool, and communicates with Google Calendar on behalf of the authenticated user.

The project is designed with a clean separation between:

* Authentication
* Conversation management
* AI/tool orchestration
* Calendar business logic
* Google Calendar integration
* Database persistence

The architecture is also designed so that the same Calendar Service can later be exposed through **MCP/plugin interfaces** to external AI applications.

---

# 🏗️ Architecture

```text
                         USER
                           │
                           ▼
                    ┌──────────────┐
                    │   React UI   │
                    │    (Next)    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Node.js    │
                    │   Express    │
                    │     API      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        Authentication  Chat API   Calendar API
              │            │            │
              │            ▼            │
              │      Context Service    │
              │            │            │
              │            ▼            │
              │       AI Service        │
              │            │            │
              │            ▼            │
              │          Groq           │
              │            │            │
              │       Tool Calling      │
              │            │            │
              │            ▼            │
              │     Calendar Tools      │
              │            │            │
              │            ▼            │
              │     Calendar Service    │
              │            │            │
              │            ▼            │
              │   Google Calendar API   │
              │                         │
              ▼                         │
        PostgreSQL ◄────────────────────┘
```

---

# 🎯 Core Design Principles

### Google Calendar is the source of truth

Calendar events are **not duplicated into our PostgreSQL database**.

```text
Google Calendar
      │
      └── Source of truth for events
```

PostgreSQL stores only application-owned data such as:

* Users
* OAuth credentials
* Conversations
* Messages

---

### AI does not directly access Google Calendar

The AI does not receive direct access to Google APIs.

Instead:

```text
User
 ↓
AI
 ↓
Tool
 ↓
Calendar Service
 ↓
Google Calendar
```

This gives the application control over:

* Authentication
* Authorization
* Validation
* Tool arguments
* Error handling
* Business rules

---

### User isolation

Every calendar operation is executed using the authenticated user's internal ID.

```text
User A
 ↓
Credential A
 ↓
Calendar A

User B
 ↓
Credential B
 ↓
Calendar B
```

One user cannot access another user's calendar through the application.

---

# 🛠️ Technology Stack

## Backend

* Node.js
* JavaScript
* CommonJS
* Express.js

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Google OAuth 2.0
* Express Session

## Calendar

* Google Calendar API
* Google APIs Node.js client

## AI

* Groq API
* OpenAI-compatible SDK
* `openai/gpt-oss-20b`
* Chat Completions
* Function/tool calling

## Frontend

* React
* Planned

## Testing

* Jest
* Supertest
* Planned

## Future Integration

* MCP
* Plugin interface

---

# 📂 Project Structure

Current backend structure:

```text
chatbot/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── src/
    │
    ├── app.js
    ├── server.js
    │
    ├── config/
    │   ├── google.js
    │   ├── database.js
    │   └── groq.js
    │
    ├── controllers/
    │   ├── calendar.controller.js
    │   ├── chat.controller.js
    │   └── conversation.controller.js
    │
    ├── middleware/
    │   ├── auth.middleware.js
    │   └── error.middleware.js
    │
    ├── routes/
    │   ├── health.routes.js
    │   ├── calendar.routes.js
    │   ├── conversation.routes.js
    │   └── chat.routes.js
    │
    ├── services/
    │   ├── calendar.service.js
    │   ├── conversation.service.js
    │   ├── context.service.js
    │   └── ai.service.js
    │
    ├── providers/
    │   └── google-calendar.provider.js
    │
    ├── tools/
    │   └── calendar.tools.js
    │
    ├── validators/
    │   └── calendar.validator.js
    │
    └── errors/
        └── app.error.js
```

---

# 🔐 Authentication

The application uses Google OAuth 2.0.

## Authentication flow

```text
User
 │
 ▼
/auth/google
 │
 ▼
Google OAuth
 │
 ▼
User grants calendar permissions
 │
 ▼
OAuth callback
 │
 ▼
Google user information
 │
 ▼
Find/Create User
 │
 ▼
Store OAuth credentials
 │
 ▼
Create application session
 │
 ▼
Authenticated
```

The application uses:

* Google Client ID
* Google Client Secret
* OAuth Redirect URI
* Per-user access token
* Per-user refresh token

The OAuth client credentials identify the **application**.

The OAuth tokens identify the **user's authorization**.

---

# 🔑 OAuth Scopes

The application currently requests:

```text
openid
email
profile
https://www.googleapis.com/auth/calendar.events
```

The calendar scope allows the application to create, modify, and delete calendar events.

---

# 👤 User Model

The application maintains its own user identity.

```text
Google User
     │
     ▼
Application User
     │
     ├── Google ID
     ├── Email
     ├── Name
     └── Profile picture
```

`googleId` is used as the stable Google provider identity.

---

# 🗄️ Database Design

PostgreSQL is used for application persistence.

Current database models:

```text
User
 │
 ├── GoogleCredential
 │
 └── Conversation
          │
          └── Message
```

## User

Stores application-level user information.

```text
User
├── id
├── googleId
├── email
├── name
├── picture
├── createdAt
└── updatedAt
```

---

## GoogleCredential

Stores OAuth credentials belonging to a specific user.

```text
GoogleCredential
├── id
├── userId
├── accessToken
├── refreshToken
├── expiryDate
├── createdAt
└── updatedAt
```

Each user has one credential record.

---

## Conversation

Represents a chat session.

```text
Conversation
├── id
├── userId
├── createdAt
└── updatedAt
```

A conversation belongs to exactly one user.

---

## Message

Stores individual conversation messages.

```text
Message
├── id
├── conversationId
├── role
├── content
└── createdAt
```

Currently supported message roles are:

```text
user
assistant
```

---

# 💬 Conversation Persistence

The chat API supports continuing an existing conversation.

First request:

```json
{
  "message": "What events do I have tomorrow?"
}
```

The server creates a conversation and returns:

```json
{
  "conversationId": "conversation-id",
  "message": "..."
}
```

Subsequent messages use the same conversation:

```json
{
  "conversationId": "conversation-id",
  "message": "What about Friday?"
}
```

This allows the assistant to maintain conversational context.

---

# 🧠 Context Management

The database stores the **complete conversation history**.

However, we don't blindly send the entire history to the LLM.

Current architecture:

```text
Complete Conversation
        │
        ▼
Context Service
        │
        ▼
Latest 20 Messages
        │
        ▼
Groq
```

The current context limit is:

```text
20 messages
```

This is only a limit on what is sent to the AI.

It does **not** delete older messages from PostgreSQL.

```text
Database
│
├── Message 1
├── Message 2
├── ...
├── Message 80
├── Message 81
├── ...
└── Message 100

AI Context
│
└── Messages 81 → 100
```

This approach keeps the V1 implementation simple while preventing unnecessary growth in LLM context.

---

# 🤖 AI Architecture

The AI uses Groq through its OpenAI-compatible API.

The application uses:

```text
Groq Chat Completions
        +
Tool Calling
        +
Local Tool Execution
```

The AI does not directly execute functions.

Instead:

```text
User Message
      │
      ▼
   Groq AI
      │
      ▼
Tool Call
      │
      ▼
Application
      │
      ▼
Calendar Tool
      │
      ▼
Calendar Service
      │
      ▼
Google Calendar
```

---

# 🔧 Calendar Tools

Current AI tools:

```text
list_calendar_events
get_calendar_event
create_calendar_event
update_calendar_event
delete_calendar_event
```

## List events

```text
list_calendar_events
```

Used for requests such as:

```text
"What meetings do I have tomorrow?"
```

---

## Get event

```text
get_calendar_event
```

Used when the assistant needs details about a specific event.

---

## Create event

```text
create_calendar_event
```

Example:

```text
"Create Project Discussion tomorrow from 10 AM to 11 AM."
```

The AI converts the request into structured tool arguments.

---

## Update event

```text
update_calendar_event
```

Used for requests such as:

```text
"Move Project Discussion to 4 PM."
```

Partial update support is the next improvement planned for this tool.

---

## Delete event

```text
delete_calendar_event
```

Used for requests such as:

```text
"Delete Project Discussion."
```

Destructive actions will receive confirmation handling during the conversational phase.

---

# 📅 Calendar Service

The Calendar Service acts as the application's calendar business layer.

```text
AI Tool
   │
   ▼
Calendar Service
   │
   ▼
Google Calendar Provider
   │
   ▼
Google Calendar API
```

The AI never directly communicates with Google Calendar.

Current service operations:

```text
listEvents()
getEvent()
createEvent()
updateEvent()
deleteEvent()
```

---

# 🔌 Provider Architecture

The calendar integration is separated behind a provider layer.

Current:

```text
Calendar Service
      │
      ▼
Google Calendar Provider
      │
      ▼
Google Calendar API
```

Future:

```text
Calendar Service
      │
      ├── GoogleCalendarProvider
      │
      └── MicrosoftCalendarProvider
```

This allows support for additional calendar providers without rewriting the application's business logic.

---

# 🌐 REST API

## Health

```http
GET /health
```

Example:

```json
{
  "status": "UP",
  "message": "Calendar AI Assistant is running"
}
```

---

# 🔐 Authentication APIs

```http
GET /auth/google
GET /auth/google/callback
GET /auth/me
```

---

# 📅 Calendar APIs

```http
GET    /calendar/events
GET    /calendar/events/:eventId
POST   /calendar/events
PUT    /calendar/events/:eventId
DELETE /calendar/events/:eventId
```

All calendar endpoints require authentication.

---

# 💬 Conversation APIs

```http
GET    /conversations
GET    /conversations/:conversationId
DELETE /conversations/:conversationId
```

Conversation ownership is verified against the authenticated user.

---

# 🤖 Chat API

```http
POST /chat
```

Request:

```json
{
  "conversationId": "optional",
  "message": "What meetings do I have tomorrow?"
}
```

Response:

```json
{
  "conversationId": "conversation-id",
  "message": "You have 2 meetings tomorrow."
}
```

---

# 🛡️ Error Handling

The application has centralized error handling.

```text
Controller
    │
    ▼
Service
    │
    ▼
Provider
    │
    ▼
Error
    │
    ▼
Central Error Middleware
    │
    ▼
Consistent HTTP Response
```

The application handles common cases including:

* Bad requests
* Unauthorized requests
* Missing conversations
* Missing calendar events
* Google API errors
* Invalid event IDs
* Validation errors
* Tool execution failures

---

# 🔒 Security Foundations

Current security design includes:

* Google OAuth 2.0
* OAuth `state` validation
* Session-based authentication
* User-specific OAuth credentials
* User ownership checks
* Input validation
* Centralized error handling
* No client-side exposure of OAuth tokens
* No direct AI access to Google credentials

Production security hardening is planned for a later phase.

---

# 🧪 Current Testing

The backend has been manually tested for:

### Authentication

```text
Google Login                  ✅
Authenticated user            ✅
Session-based authentication  ✅
```

### Calendar

```text
List events                   ✅
Get event                     ✅
Create event                  ✅
Update event                  ✅
Delete event                  ✅
Validation errors             ✅
```

### AI

```text
Calendar read tool            ✅
Create tool                   ✅
Delete tool                   ✅
Update intent detection       ✅
Tool execution loop           ✅
Groq integration              ✅
```

### Conversations

```text
Create conversation           ✅
Persist user messages         ✅
Persist assistant messages    ✅
Continue conversation         ✅
List conversations            ✅
Get conversation              ✅
Delete conversation           ✅
Context limit                 ✅
```

---

# 🚧 Current Development Status

```text
Phase 1  Requirements & Architecture       ✅
Phase 2  Node.js Foundation                ✅
Phase 3  Google OAuth + Identity           ✅
Phase 4  PostgreSQL + Prisma               ✅
Phase 5  Google Calendar Integration       ✅
Phase 6  Calendar REST API                 ✅
Phase 7  AI Tool Calling                   ✅
Phase 8  Conversational Calendar           🔨
```

### Phase 8

```text
8.1 Architecture                         ✅
8.2 Database Design                      ✅
8.3 Conversation Persistence             ✅
8.4 Conversation APIs                    ✅
8.5 Context Management                   ✅
8.6 Multi-turn Calendar Operations       🔨
```

---

# 🔨 Next Development Tasks

The next backend work is focused on making the assistant behave naturally across multiple turns.

## 8.6 Multi-turn Calendar Operations

Planned improvements:

```text
1. Partial event updates
2. Better event lookup
3. Multi-turn clarification
4. Ambiguity handling
5. Confirmation for destructive actions
6. Date/time handling
7. Timezone handling
8. End-to-end conversational testing
```

Example target behavior:

```text
User:
Move Project Discussion.

Assistant:
Which Project Discussion do you mean?

User:
The one tomorrow.

Assistant:
What time should I move it to?

User:
2 PM.

Assistant:
What timezone should I use?

User:
Asia/Kolkata.

Assistant:
Done. I've moved Project Discussion to 2 PM.
```

---

# 🖥️ Frontend

After the core conversational behavior is stable, the next major phase is the React UI.

Planned UI:

```text
┌─────────────────────────────────────────────┐
│ Calendar AI Assistant                       │
├───────────────┬─────────────────────────────┤
│ Conversations │                             │
│               │       Chat Window            │
│ + New Chat    │                             │
│               │  User: What meetings...     │
│ Conversation  │                             │
│ Conversation  │  AI: You have 2 meetings... │
│ Conversation  │                             │
│               │                             │
│               ├─────────────────────────────┤
│               │ Type a message...     Send  │
└───────────────┴─────────────────────────────┘
```

The React application will consume the existing REST APIs rather than putting calendar logic into the frontend.

---

# 🗺️ Remaining Roadmap

```text
Current
   │
   ▼
Phase 8.6
Multi-turn Calendar Operations
   │
   ▼
Phase 9
React Chat UI
   │
   ▼
Phase 10
Free-Time & Scheduling Logic
   │
   ▼
Phase 11
Security & Production Hardening
   │
   ▼
Phase 12
Automated Testing
   │
   ▼
Phase 13
MCP / Plugin Interface
   │
   ▼
Phase 14
Deployment
```

---

# 🔮 Future MCP Architecture

The project is intentionally structured so MCP can be added later without duplicating calendar logic.

Current:

```text
React
  │
  ▼
Chat API
  │
  ▼
AI Service
  │
  ▼
Calendar Service
  │
  ▼
Google Calendar
```

Future:

```text
                    ┌── React Chat
                    │
                    ▼
              Application API
                    │
                    ▼
             Calendar Service
                    │
                    ▼
             Google Calendar


External AI
     │
     ▼
    MCP
     │
     ▼
Calendar Service
     │
     ▼
Google Calendar
```

The same `CalendarService` remains the central business layer.

---

# 🎯 Project Goals

The final application aims to demonstrate practical implementation of:

* OAuth 2.0
* User authentication and authorization
* REST APIs
* PostgreSQL
* Prisma ORM
* Google Calendar API
* LLM tool calling
* AI agents
* Conversational context
* Multi-turn operations
* Event-driven thinking
* Service-layer architecture
* Provider abstraction
* MCP integration
* Secure multi-user application design

The project intentionally avoids unnecessary distributed-system complexity in V1.

Technologies such as:

```text
Kafka
RabbitMQ
Redis
Kubernetes
Microservices
Vector databases
```

are **not part of the current architecture** because they do not solve a current requirement.

The goal is to build a clean, production-oriented **modular backend first**, then progressively extend it into a complete AI-powered calendar platform.
