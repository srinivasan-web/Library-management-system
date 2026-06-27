# Backend Mentor Guide

This guide explains the Library Management System like a junior backend engineer joining a software team.

## Phase 1: Business Understanding

### Business Problem

A library needs to track books, members, staff users, and borrow/return activity. The backend must prevent impossible real-world states, such as borrowing a book that has no available copies or deleting a member who still has active borrowed books.

### Business Domain

- Book: an item in the library catalog and inventory.
- Member: a person who borrows books.
- User: a staff account that logs in to operate the system.
- Borrow record: the historical proof that a member borrowed a book.

### Actors

- Librarian: manages books, members, borrowing, and returns.
- Admin: same operational permissions today, with room for future user management.
- Member: represented in the database, but not authenticated in this version.

### Business Rules

- A staff user must log in before managing protected resources.
- A member must be active before borrowing.
- A book must be active and have at least one available copy before borrowing.
- One member cannot have two active borrow records for the same book.
- A member cannot exceed their active borrow limit.
- Returning a book increments available copies and calculates a fine when late.
- A book or member with active borrow records cannot be deleted.

### User Stories

- As a librarian, I want to register and log in so I can use the system securely.
- As a librarian, I want to add books so the catalog reflects inventory.
- As a librarian, I want to add members so people can borrow books.
- As a librarian, I want to borrow a book for a member so inventory and history stay accurate.
- As a librarian, I want to return a book so the copy becomes available again.

### Acceptance Criteria

- Invalid input returns `400`.
- Duplicate unique resources return `409`.
- Missing records return `404`.
- Protected APIs reject missing or invalid JWTs.
- Borrowing reduces `availableCopies` by one.
- Returning increases `availableCopies` by one.
- Late returns produce a calculated `fineAmount`.

## Phase 2: Software Architecture

### Architecture Style

This is a modular monolith. That means the whole backend deploys as one Express app, but the code is separated into modules and layers. This is the right choice for a learning project and many real products because it is simpler to deploy, debug, and reason about than microservices.

### Layered Flow

```text
HTTP request
  -> route
  -> validator
  -> middleware
  -> controller
  -> service
  -> repository
  -> Mongoose model
  -> MongoDB
```

### Why Each Layer Exists

- Route: declares URL and HTTP method.
- Validator: rejects invalid input before business logic runs.
- Middleware: handles cross-cutting concerns like auth and errors.
- Controller: maps HTTP to application actions.
- Service: owns business rules.
- Repository: owns database queries.
- Model: defines document shape, indexes, and database-level constraints.

### Request Lifecycle

```text
Client sends request
Express matches route
Validation middleware checks body/params/query
Authentication verifies JWT
Authorization checks role
Controller calls service
Service applies business rules
Repository queries MongoDB
Controller sends JSON response
Error middleware handles failures
```

### Authentication Flow

```text
Register/Login
  -> validate email/password
  -> hash or compare password with bcrypt
  -> sign JWT with user id and role
  -> client sends token on protected requests
  -> authenticate middleware verifies token
```

### Borrowing Flow

```text
Borrow request
  -> validate bookId, memberId, dueDate
  -> check book exists and is ACTIVE
  -> check member exists and is ACTIVE
  -> check member borrow limit
  -> check duplicate active borrow
  -> atomically decrement availableCopies
  -> create borrow record
```

## Phase 3: Backend Thinking Process

Before coding an endpoint, ask:

- What real-world action does this represent?
- Who is allowed to do it?
- What input can be trusted?
- What database state must be true before the action?
- What state changes must happen together?
- What can fail halfway?
- What error should the client receive?
- What index will the query use?

Real-world analogy: a controller is the front desk, a service is the librarian applying policy, a repository is the catalog system, and the database is the archive.

Common mistakes:

- Putting business rules directly in routes.
- Trusting request bodies without validation.
- Hashing passwords in controllers.
- Updating inventory without atomic checks.
- Returning raw internal errors to clients.

Interview questions:

- Why split controller and service layers?
- Why should passwords be hashed instead of encrypted?
- What race condition exists when two users borrow the last copy?
- Why use indexes on `isbn`, `email`, and active borrow records?
- What is the difference between authentication and authorization?

## Phase 4: Database Design

### Users

- `name`: staff display name.
- `email`: unique login identifier.
- `passwordHash`: bcrypt hash, excluded from normal queries.
- `role`: authorization level.
- `isActive`: disables access without deleting history.

Indexes:

- `email` unique for login lookup.

### Books

- `title`, `author`, `isbn`, `category`: core catalog data.
- `totalCopies`: physical inventory count.
- `availableCopies`: copies not currently borrowed.
- `status`: supports archiving without losing history.
- `shelfLocation`: operational lookup for staff.

Indexes:

- `isbn` unique.
- text index over title, author, category.
- `category + status` for filtered lists.

### Members

- `membershipId`: library-facing identifier.
- `name`, `email`, `phone`, `address`: member profile.
- `status`: active, suspended, or inactive.
- `activeBorrowLimit`: per-member borrowing cap.

Indexes:

- `membershipId` unique.
- `email` unique.
- `status` for filtering.

### Borrow Records

- `book`: reference to `Book`.
- `member`: reference to `Member`.
- `borrowedBy`: staff user who issued the book.
- `returnedBy`: staff user who accepted return.
- `dueDate`, `returnedAt`: timing.
- `status`: active, returned, or lost.
- `fineAmount`: calculated when returned late.

Indexes:

- partial unique index on `member + book + status=ACTIVE`.
- `book + status` and `member + status` for active borrow checks.
- `dueDate + status` for future overdue workflows.

## Phase 5: Folder Structure

The dependency direction is inward:

```text
routes -> controllers -> services -> repositories -> models
```

Rules:

- Models do not import controllers.
- Repositories do not know HTTP exists.
- Services do not depend on Express request/response objects.
- Controllers should be thin.
- Middleware handles concerns shared across many routes.

## Phase 6: File-by-File Build Order

Recommended learning order:

1. `src/config/env.js`
2. `src/config/database.js`
3. `src/app.js`
4. `src/server.js`
5. `src/utils/ApiError.js`
6. `src/middleware/errorHandler.js`
7. `src/models/User.js`
8. `src/services/authService.js`
9. `src/controllers/authController.js`
10. `src/routes/auth.js`
11. Book model/repository/service/controller/route.
12. Member model/repository/service/controller/route.
13. Borrow record model/repository/service/controller/route.

## Phase 7: Authentication

JWT exists so the server can issue a signed proof that a user has logged in. The payload contains `sub` for user id and `role` for authorization. The server verifies the signature on every protected request.

bcrypt exists because passwords must never be stored in plain text. It adds a salt and intentionally slow hashing work, making stolen hashes harder to crack.

Best practices:

- Use a strong `JWT_SECRET`.
- Keep tokens short-lived.
- Do not put passwords or private data in JWT payloads.
- Always compare passwords with bcrypt, never manually.

## Phase 8: CRUD APIs

Every CRUD endpoint follows the same pattern:

```text
validate input
authenticate user
authorize role
call controller
call service
query repository
return consistent response
```

Performance notes:

- Paginated lists avoid returning the full collection.
- Unique indexes make duplicate checks reliable.
- Query filters are indexed where they are common.

## Phase 9: Borrow System

Borrowing is the most important workflow because it changes multiple pieces of state. The system uses a transaction and an atomic copy decrement:

```js
availableCopies: { $gt: 0 }
$inc: { availableCopies: -1 }
```

This prevents two requests from both borrowing the last copy.

Failure recovery: if borrow record creation fails inside the transaction, the inventory decrement is rolled back.

## Phase 10: Validation

Validation happens at multiple levels:

- Request validation: express-validator.
- Business validation: services.
- Database validation: Mongoose schema rules.
- Authentication validation: JWT verification.
- Authorization validation: role checks.

## Phase 11: Error Handling

The API uses `ApiError` for expected operational failures. The global error middleware maps:

- Validation errors to `400`.
- Duplicate keys to `409`.
- Missing records to `404`.
- JWT errors to `401`.
- Unexpected failures to `500`.

## Phase 12: Testing Strategy

Manual Postman order:

1. `GET /health`
2. Register user.
3. Login user.
4. Use token for all protected requests.
5. Create book.
6. Create member.
7. Borrow book.
8. Confirm book `availableCopies` decreased.
9. Return book.
10. Confirm book `availableCopies` increased.

Negative cases:

- Login with wrong password.
- Create duplicate ISBN.
- Borrow inactive member.
- Borrow unavailable book.
- Delete book with active borrow.
- Call protected route without token.

## Phase 13: Deployment Notes

For Render:

- Set build command: `npm install`.
- Set start command: `npm start`.
- Set environment variables from `.env.example`.
- Use MongoDB Atlas for `MONGODB_URI`.
- Keep `NODE_ENV=production`.

Common deployment mistakes:

- Missing `MONGODB_URI`.
- Weak or missing `JWT_SECRET`.
- IP access not configured in MongoDB Atlas.
- Using localhost database URL in production.

## Phase 14: Interview Preparation

Be ready to explain:

- Why this is a modular monolith.
- Why service layer owns business logic.
- How JWT authentication works.
- How bcrypt protects passwords.
- How MongoDB indexes improve reads.
- How atomic updates prevent inventory race conditions.
- How centralized errors improve API consistency.
- Why transactions matter for borrow/return workflows.
