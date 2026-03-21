# Atlas Engine

**Peptide Protocol Management Platform**

A full-stack clinical management application for peptide therapy practices. Built with Next.js 16, Supabase, and a custom dark design system.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, RSC)
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS v4 + custom Atlas Engine design system
- **UI Components:** shadcn/ui
- **PDF Generation:** @react-pdf/renderer
- **Email:** Resend
- **Forms:** React Hook Form + Zod

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase and Resend credentials.

### 3. Database setup

Run in Supabase SQL editor (in order):
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/seed.sql` (optional)

### 4. Create super admin user

In Supabase Auth, create a user, then:

```sql
insert into user_profiles (id, full_name, role)
values ('<user-uuid>', 'Your Name', 'super_admin');
```

### 5. Run development server

```bash

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
