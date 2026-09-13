# 🌐 Clinic Appointment System — Frontend

> Frontend for **Clinic Appointment System**, a clinic and doctor scheduling
> platform. Built with React 19, TypeScript, Vite 8, Tailwind CSS 4,
> Zustand 5, TanStack React Query 5, and React Router 7.

## Tech Stack

- **React 19 + TypeScript 6** — type-safe, modern UI
- **Vite 8** — fast dev server and optimized production builds
- **Tailwind CSS 4** — utility-first styling via `@tailwindcss/vite`
- **Zustand 5** — lightweight global auth state (persisted to `localStorage`)
- **TanStack React Query v5** — server-state management with caching and invalidation
- **React Hook Form 7 + Zod 4** — validated, schema-driven forms via `@hookform/resolvers`
- **Axios** — HTTP client with a JWT interceptor that automatically refreshes expired access tokens
- **React Router v7** — role-based route guards (`Admin` / `Doctor` / `Patient`)
- **Lucide React** — icon library
- **date-fns** — lightweight date formatting
- **OxLint** — fast Rust-powered linter

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. API requests are proxied through
the Vite dev proxy (`/api` → `http://localhost:5136`), so no CORS configuration
is needed locally.

### Environment

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:5136` | Backend base URL (override for production) |

## Features

- **Auth** — login / register with JWT access + rotating refresh tokens; persisted
  via Zustand; protected routes via role-based route guards.
- **Token refresh cycle** — Axios interceptor automatically issues a silent
  `/api/auth/refresh` call on 401 and replays the failed request with the new
  access token.
- **Role-specific dashboards** — each role lands on a tailored screen: admins
  see system-wide stats, doctors see their daily schedule, and patients see
  their own appointments.
- **Appointment lifecycle** — create, reschedule, cancel, confirm, complete,
  mark no-show, and rate after completion.
- **Doctor management** — view by specialization, browse available time slots,
  configure working hours and unavailability.
- **RTL Arabic UI** — full right-to-left layout for all user-facing screens.
- **Verified forms** — Zod schemas at the type level; user-facing validation
  errors come directly from the backend without duplication.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run lint` | Run OxLint |
| `npm run preview` | Serve the production build locally |

## Project Structure

```
src/
  api/          # Axios client, typed endpoints, request/response types
  components/   # Shared UI components (cards, tables, forms, dialogs)
  hooks/        # Reusable query hooks (useCurrentPatient, useCurrentDoctor)
  lib/          # Helpers: toast utility, API error extraction, date/status formatting
  pages/        # Route-level views per role (admin, doctor, patient)
  routes/       # React Router configuration with auth guards
  stores/       # Zustand stores — auth state persisted to localStorage
  types/        # Shared TypeScript interfaces matching the backend DTOs
```

## Related

- Backend: [sief-elmenshawi/ClinicAppointmentSystem](https://github.com/sief-elmenshawi/ClinicAppointmentSystem)