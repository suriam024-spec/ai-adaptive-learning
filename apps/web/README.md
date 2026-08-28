# AI Adaptive Learning - Web

Frontend ของ AI Adaptive Learning Platform MVP

## Stack

- Next.js
- React
- TypeScript
- App Router

## Run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

เปิด http://localhost:3000

## Structure

- `app/` - routes/pages
- `components/` - shared UI
- `features/` - domain-specific UI and types
- `hooks/` - reusable React hooks
- `lib/` - frontend utilities/config
- `services/` - API and AI service clients
- `public/` - static assets

## Backend integration

ตั้งค่า:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

แล้วให้ Backend เปิด endpoints ตาม service ที่อยู่ใน `services/`.
