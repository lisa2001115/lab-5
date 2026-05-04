# GIX Events

A Next.js app that displays upcoming GIX events — guest lectures, workshops, and career panels — fetched from Supabase and browsable with category filters.

Built for **Week 5 Lab — Component E**.

---

## Features

- Fetches events from Supabase `events` table
- Category filter pills: All / guest_lecture / workshop / career
- Event cards showing title, description, date, location, and category badge
- GIX brand colors (#39275B dark purple, #DFDDE8 lavender background)
- 3 error scenarios handled gracefully (see below)
- 2 assert statements for contract validation
- Mobile responsive — cards stack vertically on narrow screens

---

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Supabase JS client (`@supabase/supabase-js`)

---

## Getting Started

1. Create a `.env.local` file in this directory:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Install dependencies and run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

---

## Supabase Schema

```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  location text,
  event_date timestamp,
  created_at timestamp DEFAULT now()
);
```

RLS is enabled with a public read policy:

```sql
CREATE POLICY "Allow public read access"
ON events FOR SELECT USING (true);
```

---

## Error Handling

| Scenario | How the app responds |
|----------|---------------------|
| Supabase fetch fails (bad URL or network error) | Red error banner: "Failed to load events. Please check your connection and try again." |
| No events in table or filter returns no results | Empty state with calendar icon and context-aware message |
| Event row missing required `title` field | Card is skipped silently; yellow warning shows how many were skipped |

---

## Assert Statements

Located in `app/page.tsx`, run after every successful Supabase fetch:

```typescript
console.assert(Array.isArray(data), "Events response should be an array");
console.assert(data?.[0]?.title !== undefined, "Each event should have a title field");
```

---

## Security

- Supabase credentials stored in `.env.local` only — never hardcoded
- `.env.local` is excluded from git via `.gitignore`
- Supabase RLS enabled — anon key can only read, not write or delete
