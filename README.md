# Eventra

Modern event management platform built with React + Vite + Tailwind CSS + Node.js + Express.

## Run

```bash
cd eventra
npm install
npm run dev
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:4000

## Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router, Framer Motion, Recharts, Lucide Icons
- **Backend:** Node.js, Express, lowdb (JSON file storage)

## Pages

| Route | Description |
|---|---|
| `/` | Home with hero, carousel, event grid |
| `/events` | Browse with filters, search, sort, grid/list toggle |
| `/events/:id` | Details, schedule, ticket selector, registration modal |
| `/events/new` | Multi-step create event form |
| `/events/:id/edit` | Edit existing event |
| `/dashboard` | Stats, charts, events table, attendee list + CSV export |

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | List events (supports `?category=`, `?search=`, `?sort=`, `?maxPrice=`) |
| POST | `/api/events` | Create event |
| GET | `/api/events/:id` | Get event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/events/:id/register` | Register for event |
| GET | `/api/registrations` | List all registrations |
