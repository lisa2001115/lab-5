# Lab 5 — APIs, Databases & Full-Stack

**Course:** GIX — Week 5  
**Student:** Lisa  
**Stack:** Next.js 14 (App Router) · Tailwind CSS · Supabase (PostgreSQL)  
**Lab Manual:** [lab-manual.md](./lab-manual.md)

---

## Live Deployments

| App | URL |
|-----|-----|
| GIX Equipment Returns | [lab-5-pi.vercel.app](https://lab-5-pi.vercel.app) |
| GIX Events | [lab-5-event.vercel.app](https://lab-5-event.vercel.app) |

---

## Overview

This repo contains two separate full-stack Next.js applications built for Week 5. Both connect to a shared Supabase database and are deployed independently on Vercel.

| App | Folder | Purpose |
|-----|--------|---------|
| GIX Equipment Returns | `gix-equipment/` | Helps GIX staff (Maason & Kevin) track and update equipment return status at end of semester |
| GIX Events | `gix-events/` | Displays upcoming GIX guest lectures, workshops, and career panels with category filtering |

---

## Apps

### `gix-equipment` — Component B

**Live:** [lab-5-pi.vercel.app](https://lab-5-pi.vercel.app)

An internal tool for GIX operations staff to manage equipment returns. Replaces the manual process of checking items one by one against a purchase list.

**Features:**
- Fetches all items from the Supabase `items` table
- Filter by category (IT / maker_space / discard) and status (returned / missing / consumed / checked_out)
- Inline status update — click a dropdown in any row to update status live
- Loading spinner, error banner, and empty state
- Mobile responsive (horizontally scrollable table)

**Run locally:**
```bash
cd gix-equipment
npm install
npm run dev
# Open http://localhost:3000
```

---

### `gix-events` — Component E

**Live:** [lab-5-event.vercel.app](https://lab-5-event.vercel.app)

A public-facing events board for GIX community members to browse upcoming events.

**Features:**
- Fetches all events from the Supabase `events` table
- Category filter pills: All / guest_lecture / workshop / career
- Card layout with title, description, date, location, and category badge
- 3 error scenarios handled: fetch failure, no events found, missing required fields
- 2 `console.assert` statements for contract validation
- GIX brand colors (#39275B purple, #DFDDE8 lavender background)
- Mobile responsive (single-column card grid on narrow screens)

**Run locally:**
```bash
cd gix-events
npm install
npm run dev
# Open http://localhost:3000
```

---

## Supabase Schema

### `items` table (Component B)

```sql
CREATE TABLE items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_name text NOT NULL,
  raw_title text,
  asset_tag text,
  category text,
  status text,
  team_name text,
  notes text,
  created_at timestamp DEFAULT now()
);
```

### `events` table (Component E)

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

Both tables have Row Level Security (RLS) enabled with a public read policy.

---

## Environment Variables

Each app has its own `.env.local` (not committed to git):

```
NEXT_PUBLIC_SUPABASE_URL=https://zpqeqgwtkcfkjizymdii.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

---

## Security

- No API keys or secrets are hardcoded in any source file
- All secrets stored in `.env.local`, which is listed in `.gitignore`
- Supabase RLS enabled on both tables — only SELECT is permitted via anon key

---

## Component D — Contract Testing

Tested 3 scenarios against the Supabase `events` pipeline:

| # | Test Case | Input | Expected | Actual | Pass/Fail |
|---|-----------|-------|----------|--------|-----------|
| 1 | Valid fetch | Normal query with correct credentials | 200, array of event objects | 200, events returned and rendered as cards | Pass |
| 2 | Invalid Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` set to `https://invalid.supabase.co` | Error banner shown | Red "Failed to load events" banner displayed | Pass |
| 3 | Missing auth key | Wrong anon key in `.env.local` | Error or empty result | Fetch error caught, error banner shown | Pass |

**Assert statements** (in `gix-events/app/page.tsx`):
```typescript
console.assert(Array.isArray(data), "Events response should be an array");
console.assert(data?.[0]?.title !== undefined, "Each event should have a title field");
```

---

## Component E — Error Scenarios

| # | Scenario | What I did | Expected | Actual |
|---|----------|-----------|----------|--------|
| 1 | Supabase fetch fails | Set invalid Supabase URL, restarted dev server | Red error banner | "Failed to load events" banner shown |
| 2 | No events in table | Ran `DELETE FROM events` in SQL Editor | Empty state message | Calendar icon + "No events found" shown |
| 3 | Filter with no results | Clicked category filter with no matching rows | Category-specific empty state | "No [category] events yet. Try a different category." shown |
