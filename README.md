# Library Management System API

Production-style REST API built with Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, and express-validator.

## What This Backend Does

- Authenticates library staff with register and login.
- Manages books with inventory counts.
- Manages library members.
- Borrows and returns books with active-borrow checks, stock updates, due dates, and fines.
- Uses a layered backend structure: route -> validator -> controller -> service -> repository -> model.
- Uses centralized error handling so API failures have a consistent shape.

## Project Structure

```text
src/
  app.js                  Express app, middleware, routes, error pipeline
  server.js               Process startup, database connection, shutdown
  config/                 Environment and MongoDB setup
  constants/              Shared enums such as roles and statuses
  controllers/            HTTP request/response handlers
  middleware/             Auth, authorization, validation, errors
  models/                 Mongoose schemas and indexes
  repositories/           Database query functions
  routes/                 API route definitions
  services/               Business logic and workflows
  utils/                  Small reusable helpers
  validators/             express-validator rules
```

## Setup

```bash
npm install
npm run dev
```

Create an environment file from `.env.example` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`

## Main Endpoints

### Health

- `GET /health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- Compatibility alias: `POST /api/users/register`, `POST /api/users/login`

### Books

- `POST /api/books`
- `GET /api/books?page=1&limit=10&search=clean&status=ACTIVE`
- `GET /api/books/:id`
- `PATCH /api/books/:id`
- `DELETE /api/books/:id`

### Members

- `POST /api/members`
- `GET /api/members?page=1&limit=10&search=asha&status=ACTIVE`
- `GET /api/members/:id`
- `PATCH /api/members/:id`
- `DELETE /api/members/:id`

### Borrow Records

- `POST /api/borrow-records/borrow`
- `POST /api/borrow-records/:id/return`
- `GET /api/borrow-records`
- `GET /api/borrow-records/:id`

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

## Example Requests

Register:

```json
{
  "name": "Library Staff",
  "email": "staff@example.com",
  "password": "Password123"
}
```

Create book:

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "category": "Software Engineering",
  "publisher": "Prentice Hall",
  "publishedYear": 2008,
  "totalCopies": 3,
  "shelfLocation": "A-01"
}
```

Create member:

```json
{
  "name": "Asha Kumar",
  "email": "asha@example.com",
  "phone": "+91-9876543210",
  "address": "Chennai",
  "activeBorrowLimit": 5
}
```

Borrow book:

```json
{
  "bookId": "replace-with-book-id",
  "memberId": "replace-with-member-id",
  "dueDate": "2026-07-15T00:00:00.000Z",
  "notes": "Issued from front desk"
}
```

## Verification

```bash
npm run check
```

For a deeper local syntax pass:

```powershell
Get-ChildItem -Recurse -Filter *.js src | ForEach-Object { node --check $_.FullName }
```
