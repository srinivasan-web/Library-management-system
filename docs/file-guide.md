# File Guide

## Startup Files

### `src/server.js`

Purpose: starts the process.

Responsibility:

- Validate required environment variables.
- Connect to MongoDB.
- Start Express.
- Shut down cleanly on `SIGTERM` and `SIGINT`.

Execution order:

```text
server.js -> validateEnv -> connectDatabase -> app.listen
```

### `src/app.js`

Purpose: creates the Express application.

Responsibility:

- Register middleware.
- Register routes.
- Register 404 handler.
- Register global error handler last.

## Config

### `src/config/env.js`

Loads `.env` values from root `.env` or legacy `src/.env`. It centralizes environment reading so the rest of the code imports `config` instead of reading `process.env` everywhere.

### `src/config/database.js`

Owns Mongoose connection setup. This keeps database lifecycle separate from Express.

## Middleware

### `authenticate.js`

Reads `Authorization: Bearer <token>`, verifies JWT, loads the active user, and attaches `req.user`.

### `authorize.js`

Checks whether the authenticated user role is allowed for a route.

### `validateRequest.js`

Turns express-validator results into a consistent API error.

### `errorHandler.js`

Maps application, Mongoose, MongoDB, and JWT errors into consistent JSON responses.

## Models

### `User.js`

Stores staff accounts. `passwordHash` is hidden by default with `select: false`.

### `Book.js`

Stores catalog and inventory data. `isbn` is unique. `availableCopies` cannot exceed `totalCopies`.

### `Member.js`

Stores library member profiles and borrow limits.

### `BorrowRecord.js`

Stores borrow history. A partial unique index prevents duplicate active borrows for the same member and book.

## Repositories

Repositories contain raw database operations. They hide Mongoose query details from services.

Examples:

- `bookRepository.decrementAvailableCopy`
- `borrowRecordRepository.countActiveByMember`
- `userRepository.findByEmailWithPassword`

## Services

Services contain business logic.

Examples:

- `authService.login`: compares password and signs token.
- `bookService.updateBook`: prevents invalid inventory math.
- `borrowRecordService.borrowBook`: validates member, validates book, decrements stock, creates history.

## Controllers

Controllers translate HTTP into service calls and service results into HTTP responses. They should stay thin.

## Validators

Validators reject invalid request data before the service layer runs. This protects services from avoidable bad input.

## Utilities

- `ApiError`: structured operational error.
- `asyncHandler`: forwards async errors to Express.
- `jwt`: signs and verifies access tokens.
- `password`: hashes and compares passwords.
- `pagination`: normalizes page and limit.
- `runInTransaction`: wraps MongoDB transaction work.
