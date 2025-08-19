# Next.js Todo App (with Auth)

A complete Next.js 14 App Router Todo app with email/password authentication, SQLite persistence, and Tailwind UI.

## Features
- 🔐 Email/password auth with HTTP-only cookie sessions
- 🗂️ Per-user Todos (CRUD: add, rename, toggle, delete)
- 🧱 API routes under `/api/todos` & `/api/auth/*`
- 💾 SQLite database auto-created under `data/todos.db`
- 🎨 Tailwind UI components
- 🧰 TypeScript + zod validation

## Getting Started
```bash
npm install
npm run dev
# Open http://localhost:3000/signup to create an account
```

## Scripts
- `dev` — start dev server
- `build` — build for production
- `start` — start production server
- `postinstall` — ensures `data/` directory exists

## Security Notes
- Cookies are HttpOnly and SameSite=Lax. For production over HTTPS, consider setting `secure: true` when setting the cookie.
- Passwords are salted + hashed with `bcryptjs`.
- For multi-instance deployments, switch to Postgres (Prisma) or NextAuth.js with an adapter.

## API
- `POST /api/auth/signup` `{ email, password }`
- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/todos`
- `POST /api/todos` `{ title }`
- `PATCH /api/todos/[id]` `{ title? completed? }`
- `DELETE /api/todos/[id]`
