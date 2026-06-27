# Render Deployment Guide

Use this guide to deploy the Library Management System backend on Render.

## Render Form Values

Use these values on the **New Web Service** screen:

```text
Name: library-management-system
Language: Node
Branch: main
Region: Oregon (US West)
Root Directory: leave empty
Build Command: npm ci
Start Command: npm start
Instance Type: Free
```

`npm start` runs:

```bash
node src/server.js
```

## Environment Variables

Add these in Render under **Environment Variables**:

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/library_management?retryWrites=true&w=majority
JWT_SECRET=<long-random-production-secret>
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
DEFAULT_BORROW_LIMIT=5
DAILY_FINE_RATE=5
```

Do not add your local `.env` file to GitHub. Render reads these values from its own dashboard.

You do not need to set `PORT` manually. Render provides `PORT`, and the app already reads it with `process.env.PORT`.

## MongoDB Atlas Checklist

Before deploying, check MongoDB Atlas:

```text
Database user exists
Database username/password are correct in MONGODB_URI
Network Access allows Render to connect
```

For a simple project, many learners use:

```text
0.0.0.0/0
```

This allows connections from anywhere. It is convenient for deployment testing, but stricter IP rules are better for production systems.

## After Deployment Tests

Replace `<render-url>` with your Render service URL.

Health:

```http
GET https://<render-url>/health
```

Root URL:

```http
GET https://<render-url>/
```

The root URL now returns a small JSON status response instead of a 404, so the browser view feels clean and the API still keeps `/health` for monitoring.

Register:

```http
POST https://<render-url>/api/auth/register
Content-Type: application/json

{
  "name": "Library Staff",
  "email": "staff@example.com",
  "password": "Password123"
}
```

Login:

```http
POST https://<render-url>/api/auth/login
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "Password123"
}
```

Use the returned token:

```http
Authorization: Bearer <accessToken>
```

Create book:

```http
POST https://<render-url>/api/books
Authorization: Bearer <accessToken>
Content-Type: application/json

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

```http
POST https://<render-url>/api/members
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Asha Kumar",
  "email": "asha@example.com",
  "phone": "+91-9876543210",
  "address": "Chennai",
  "activeBorrowLimit": 5
}
```

Borrow book:

```http
POST https://<render-url>/api/borrow-records/borrow
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bookId": "<bookId>",
  "memberId": "<memberId>",
  "dueDate": "2026-07-15T00:00:00.000Z",
  "notes": "Issued from front desk"
}
```

Return book:

```http
POST https://<render-url>/api/borrow-records/<borrowRecordId>/return
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "notes": "Returned in good condition"
}
```

## Common Render Errors

### `MONGODB_URI is required`

The environment variable was not added in Render.

### `JWT_SECRET must be set`

`NODE_ENV=production` is active, but `JWT_SECRET` is missing.

### MongoDB connection timeout

Atlas Network Access is blocking Render.

### Build fails with package-lock error

Use `npm install` instead of `npm ci` if your lockfile is out of sync. This repo should work with `npm ci` after running `npm install` locally and committing `package-lock.json`.
