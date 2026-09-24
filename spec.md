# Together Homecare — Care Portal Specification

**Version:** 1.0
**Date:** September 24, 2026
**Stack:** Next.js (Vercel) + Supabase (Postgres, Auth, Realtime, Storage)

---

## 1. Overview

A care portal connecting caregivers, families, and administrators at Together Homecare (Fremont, CA). The portal supports caregiver browsing, match requests, shift management, real-time chat, pop-up announcements with PIN acknowledgment, and is deployed as a PWA installable on phones.

**Service Area:** Alameda County (Fremont, Hayward, Livermore, Newark, Oakland) and Contra Costa County (San Ramon, Walnut Creek, Concord).

---

## 2. Brand Identity

- **Primary:** `#ac6b75` (rose)
- **Deep:** `#a76d83` (rose-deep)
- **Mid:** `#d99fb7` (rose-mid)
- **Light:** `#efb1d6` (rose-light)
- **Text:** `#000000` (black), `#3d3d3d` (body), `#777` (muted)
- **Canvas:** `#ffffff` (white)
- **Typography:** Playfair Display (serif, headlines) + Inter (sans-serif, body)
- **Dark mode:** Full support via CSS custom properties, respects system preference
- **App icon:** Square logo with rose background, house + heartbeat + heart mark

---

## 3. User Roles & Authentication

### Role Hierarchy

```
Super Admin (Supabase dashboard + portal)
  └── Admin (portal only, manages day-to-day)
        ├── Caregiver (caregiver portal)
        └── Family (family portal)
```

### Auth Flow

- **Provider:** Supabase Auth (email + password)
- **Account creation:** Admin creates all accounts (caregivers and families). No self-registration.
- **Super admin:** First account seeded during deployment. Manages other admins via Supabase dashboard.
- **Admins:** Created by super admin in Supabase. Full portal access.
- **Role stored:** `profiles.role` column (`super_admin`, `admin`, `caregiver`, `family`)
- **First login:** Forced password reset for caregiver/family accounts
- **4-digit PIN:** Set during first login. Used to acknowledge pop-up notices.

### Row Level Security (RLS)

| Table | Admin | Caregiver | Family |
|-------|-------|-----------|--------|
| profiles | Read/write all | Read/write own | Read/write own |
| caregiver_profiles | Read/write all | Read/write own | Read visible only |
| shifts | Full CRUD | Read only | No access |
| shift_interest | Read all | Create/read own | No access |
| match_requests | Full CRUD | No access | Read/create own |
| messages | Read all threads | Read own thread | Read own thread |
| announcements | Full CRUD | Read only | Read only |
| popup_notices | Full CRUD | Read assigned | Read assigned |
| popup_acks | Read all | Create/read own | Create/read own |

---

## 4. Database Schema

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | References auth.users |
| role | enum | `super_admin`, `admin`, `caregiver`, `family` |
| display_name | text | First name + last initial (caregiver) or family name |
| email | text | |
| phone | text | Optional |
| pin_hash | text | Hashed 4-digit PIN for popup acknowledgment |
| avatar_url | text | Storage bucket path |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `caregiver_profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | References profiles.id |
| first_name | text | |
| last_initial | char(1) | |
| location | text | City from service area |
| about_me | text | Bio / about me |
| skills | text[] | Array of skills |
| certifications | text[] | Array of certifications |
| hobbies | text[] | Array of hobbies |
| languages | text[] | Array of languages spoken |
| availability | jsonb | `{ "mon": "8am-3pm", "tue": "9am-5pm", ... }` |
| is_visible | boolean | Admin toggle — hidden from family browsing |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `family_profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | References profiles.id |
| family_name | text | |
| email | text | |
| phone | text | |
| care_needs | text | Description of care needs |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `shifts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| shift_code | text | Format: `CITY_XX` (e.g., `FREMONT_EW`) — auto-generated from client name initials |
| county | text | `ALAMEDA`, `CONTRA COSTA`, `SAN MATEO`, `SAN FRANCISCO`, or `OTHER` |
| city | text | City name (derived from address via county map) |
| schedule | text | Human-readable schedule (from "Posting Schedule" column) |
| care_type | text | Companion, Personal, Dementia, Mobility, etc. |
| admin_notes | text | Notes visible to caregivers |
| is_open | boolean | `true` when status = "Recruitment/Need to Hire CG"; `false` when "Active" |
| source_tab | text | Which spreadsheet tab: `RCEB` or `GGRC` |
| source_client_name | text | Original client name from spreadsheet (admin-only, never shown to caregivers) |
| source_status | text | Raw status string from spreadsheet |
| last_synced_at | timestamptz | Last time this row was synced from Google Sheets |
| created_by | uuid | References profiles.id (admin) or `null` if auto-synced |
| created_at | timestamptz | |

### `shift_interest`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| shift_id | uuid | References shifts.id |
| caregiver_id | uuid | References profiles.id |
| notes | text | Caregiver's negotiation/availability notes |
| status | enum | `pending`, `accepted`, `declined` |
| created_at | timestamptz | |

### `match_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| family_id | uuid | References profiles.id |
| status | enum | `pending`, `reviewing`, `matched`, `cancelled` |
| picks | jsonb | Array of 3 picks: `[{ caregiver_id, rank, availability, admin_note }]` |
| matched_caregiver_id | uuid | Final match (references profiles.id) |
| family_message | text | Admin's message to the family explaining the match |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `announcements` (Board — long-term)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| title | text | |
| body | text | |
| audience | enum | `caregivers`, `families`, `all`, `specific` |
| specific_user_ids | uuid[] | Only when audience = `specific` |
| created_by | uuid | References profiles.id (admin) |
| created_at | timestamptz | |

### `announcement_reads`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| announcement_id | uuid | References announcements.id |
| user_id | uuid | References profiles.id |
| read_at | timestamptz | |

### `popup_notices` (Short-term — PIN required)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| title | text | |
| message | text | |
| priority | enum | `urgent`, `normal`, `low` |
| audience | enum | `caregivers`, `families`, `all`, `specific` |
| specific_user_ids | uuid[] | Only when audience = `specific` |
| expires_at | timestamptz | Pop-up stops showing after this time |
| created_by | uuid | References profiles.id (admin) |
| created_at | timestamptz | |

### `popup_acks` (Acknowledgment log)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| popup_id | uuid | References popup_notices.id |
| user_id | uuid | References profiles.id |
| acknowledged_at | timestamptz | |

### `conversations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| participant_id | uuid | The caregiver or family member |
| participant_role | enum | `caregiver` or `family` |
| created_at | timestamptz | |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| conversation_id | uuid | References conversations.id |
| sender_id | uuid | References profiles.id |
| body | text | Message text |
| is_read | boolean | |
| created_at | timestamptz | |

### `audit_log`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | References profiles.id |
| action | text | Description of the action |
| entity_type | text | `profile`, `shift`, `match`, `announcement`, `popup`, etc. |
| entity_id | uuid | ID of the affected entity |
| metadata | jsonb | Additional context |
| created_at | timestamptz | |

---

## 5. Pages & Features by Role

### 5.1 Admin Portal

#### Dashboard
- Stats cards: active caregivers, active families, open shifts, pending matches
- Recent activity feed (last 10 audit log entries)
- Pending approvals summary

#### Caregivers Management
- Table: name, status (Active/Inactive), skills, location, visibility toggle
- Click to view full profile
- Toggle caregiver visibility (hidden from family browsing)

#### Families Management
- Table: family name, email, status, created date
- Onboard new family modal: set email, temporary password, care needs
- Triggers welcome email with password reset link

#### Open Shifts
- Table: shift code, city, county, schedule, care type, interest count, status
- Create new shift form
- View interest list per shift with caregiver notes

#### Match Requests
- Incoming requests show family name and their 3 ranked picks
- Per pick: admin marks Available/Unavailable with internal notes (admin-only)
- Family-facing message textarea (explains the match decision)
- Approve match button
- Status: Pending → Reviewing → Matched

#### Announcements (Board)
- Create/edit announcements with title, body, audience selector (All Caregivers / All Families / Both / Specific People)
- **Specific People picker:** searchable checkbox list grouped by Caregivers and Families (same as pop-up notices)
- Published list with read receipt counters (X of Y have read)

#### Pop-Up Notices
- **Create form:** title, message, recipients (All Caregivers / All Families / Both / Specific People), expiry duration (4h / 8h / 12h / 24h / 48h / 1 week / custom), priority (Urgent / Normal / Low), Send Now or Schedule for Later
- **Specific People picker:** searchable checkbox list grouped by Caregivers and Families
- **Active notices list:** each shows title, message preview, priority badge, sent time, expiry time, audience, acknowledgment progress bar with names of pending people
- **How it works:** pop-up shows once on app open; user enters 4-digit PIN to dismiss; once acknowledged it never shows again; unacknowledged after expiry are logged
- **Audit log:** filterable by notice and acknowledgment status, shows who acknowledged with timestamp + "PIN verified", who didn't acknowledge (expired), exportable to CSV

#### Messages (Chat Inbox)
- Full inbox: list of all conversation threads (caregivers + families)
- Thread view: message history, send reply
- Click-to-call button opens Google Voice (`tel:` with Google Voice number)
- Unread badge count

#### Audit Log
- Filterable by action type and user type
- Entries: logins, profile changes, shift interest, admin actions, popup acknowledgments
- Export to CSV

### 5.2 Caregiver Portal

#### Open Shifts
- Grouped by county (Alameda, Contra Costa)
- City filter tabs within each county
- Expandable shift cards: shift code, schedule, care type, admin notes
- "I'm Interested" button with optional notes textarea (negotiate schedule)
- Submitted interest is locked (can't re-submit)
- Real-time updates via Supabase Realtime (new shifts appear instantly)

#### Announcements
- Feed of published announcements (newest first)
- "New" badge on unread ones

#### Messages
- Single thread with Together Homecare (admin)
- Chat bubbles (sent/received), timestamps
- Click-to-call button opens native phone dialer (`tel:` link, NOT Google Voice)

#### My Profile
- **Photo upload** (stored in Supabase Storage)
- **First Name** + **Last Initial** (display name format: "Maria C.")
- **Location** (city dropdown from service area)
- **About Me** (textarea)
- **Skills** (tag chips with add/remove)
- **Certifications** (tag chips with add/remove, separate from skills)
- **Hobbies** (tag chips with add/remove)
- **Languages Spoken** (tag chips with add/remove)
- **Availability / Schedule** (free text input per day of the week — Mon through Sun)
- Save button

#### Pop-Up Notices (on app open)
- Modal overlay, cannot be dismissed without PIN
- Shows title, priority badge, date sent, time until expiry
- Message displayed prominently in highlighted card
- PIN keypad (phone lock-screen style): 4 dots fill as typed, green on correct, shake + red on wrong
- Multiple notices queue: "1 of 3" counter, steps through each after PIN entry
- Once acknowledged, never shows again for that notice
- Unacknowledged after expiry stops showing

### 5.3 Family Portal

#### Browse Caregivers
- Shopping-style grid of caregiver cards (photo, name, languages, bio, skill tags)
- Filter bar: skills dropdown, languages dropdown
- Star button on each card (max 3 starred)
- Star limit: tapping a 4th triggers shake animation; must unstar one first
- Bottom star bar: shows selected names with remove buttons, "Submit Selection" button
- Only caregivers with `is_visible = true` are shown

#### My Request
- Status tracker: Selection Submitted → Under Review → Matched
- Match result card: shows matched caregiver name, photo, skills
- Admin's message explaining the match decision
- Original 3 picks shown with availability status (unavailable ones crossed out)

#### Messages
- Single thread with Together Homecare (admin)
- Chat bubbles, timestamps
- Click-to-call button opens native phone dialer (`tel:` link, NOT Google Voice)

#### My Profile
- Family name, email, phone, care needs description
- Save button

#### Pop-Up Notices
- Same system as caregiver (modal, PIN to dismiss, queue)

---

## 6. Communication Architecture

### Chat (In-App)
- **Engine:** Supabase Realtime subscriptions on `messages` table
- **Structure:** One conversation per caregiver/family ↔ admin. No direct caregiver ↔ family chat.
- **Admin sees:** Full inbox of all threads
- **Caregiver/Family sees:** Single thread with admin

### Phone Calls
- **Admin:** Click-to-call opens Google Voice (admin's Google Voice number)
- **Caregivers & Families:** Click-to-call opens native phone dialer (`tel:` URI)
- No in-app calling — prompts to external dialer

### Notifications
- **Supabase Realtime:** New messages appear instantly in chat
- **Shift interest:** Admin notified when caregiver expresses interest
- **Match updates:** Family notified when match status changes
- **PWA push notifications:** Future enhancement (via web push API)

---

## 7. Google Sheets Integration (Open Shift Sync)

### Source Spreadsheet

- **Name:** "New Hires 2025" (Google Sheets)
- **Tab 1:** "Client Schedule RCEB" (Regional Center of the East Bay — primarily Alameda County)
- **Tab 2:** "Client Schedule GGRC" (Golden Gate Regional Center — primarily Contra Costa / SF / San Mateo)

### Spreadsheet Columns Used

| Column | Maps To | Notes |
|--------|---------|-------|
| Client Name | `shifts.source_client_name` (admin-only), `shifts.shift_code` (CITY + initials) | Never exposed to caregivers |
| Current Status | `shifts.is_open`, `shifts.source_status` | "Recruitment/Need to Hire CG" = open; "Active" = filled |
| Address | `shifts.city`, `shifts.county` | Parsed through county → city map |
| Posting Schedule | `shifts.schedule` | Free-text schedule description |

### County → City Map

The system uses an address-matching map to determine county and city from the address field:

- **ALAMEDA:** Oakland, Fremont, Hayward, Berkeley, San Leandro, Alameda, Livermore, Pleasanton, Union City, Dublin, Newark, Emeryville, Albany, Piedmont, Castro Valley, San Lorenzo, Sunol, Ashland, Cherryland
- **CONTRA COSTA:** Concord, Richmond, Antioch, San Ramon, Walnut Creek, Pittsburg, Brentwood, Danville, Martinez, Oakley, Pleasant Hill, San Pablo, Hercules, Lafayette, Pinole, Orinda, Moraga, El Cerrito, Clayton, Discovery Bay, Alamo, Crockett, El Sobrante, Kensington, Rodeo, Pacheco
- **SAN MATEO:** Redwood City, San Mateo, Daly City, South San Francisco, San Bruno, Pacifica, Menlo Park, Foster City, Burlingame, San Carlos, East Palo Alto, Belmont, Millbrae, Half Moon Bay, Hillsborough, Atherton, Woodside, Portola Valley, Brisbane, Colma
- **SAN FRANCISCO:** San Francisco

### Shift Code Generation

Format: `CITY_INITIALS` — derived from client name, same logic as existing Apps Script bot.

```
Client Name: "Elena Whitfield" + City: "Fremont"
→ Shift Code: FREMONT_EW

Client Name: "Maria Jane Cruz" + City: "Oakland"
→ Shift Code: OAKLAND_MJC
```

### Sync Architecture

```
Google Sheets ("New Hires 2025")
       │
       │  Google Sheets API (read-only, via Service Account)
       ▼
Vercel Cron Job (runs every 30 minutes, weekdays only)
       │
       │  Calls: /api/cron/sync-shifts
       ▼
Next.js API Route
       │
       │  1. Reads both tabs via Google Sheets API
       │  2. Filters rows where status includes "recruitment/need to hire cg"
       │  3. Parses address → county + city
       │  4. Generates shift_code from city + name initials
       │  5. Compares with existing shifts in Supabase
       ▼
Supabase `shifts` table
       │
       │  UPSERT: new rows → insert, changed rows → update
       │  Status "Active" → set is_open = false
       │  Removed from recruitment → set is_open = false
       ▼
Portal shows updated shifts in real-time (Supabase Realtime)
```

### Sync Rules

1. **New shift detected:** Row has recruitment status but no matching `source_client_name` + `source_tab` in DB → INSERT with `is_open = true`
2. **Shift updated:** Row exists, but schedule or address changed → UPDATE fields, keep `is_open = true`
3. **Shift filled:** Row status changes to "Active" (no longer includes recruitment tag) → UPDATE `is_open = false`
4. **Shift removed:** Row no longer in spreadsheet at all → UPDATE `is_open = false` (soft close, never hard delete)
5. **Conflict:** `shift_code` collision (two clients with same initials in same city) → append number (e.g., `FREMONT_EW2`)
6. **Sync frequency:** Every 30 minutes, weekdays (Mon–Fri), 6 AM – 8 PM Pacific
7. **Manual sync:** Admin can trigger immediate sync from the portal (button in Open Shifts page)

### Google Service Account Setup

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a Service Account → download JSON key
4. Share the spreadsheet with the service account email (read-only)
5. Store the service account credentials as Vercel environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID`)

### Admin Sync Dashboard (within Open Shifts page)

- **Last Synced:** timestamp of most recent successful sync
- **Sync Status:** badge (In Sync / Syncing / Error)
- **Sync Now** button for manual trigger
- **Sync Log:** last 10 sync events (rows added, updated, closed) — collapsible

---

## 8. Privacy & Security

- **Caregiver names:** First name + last initial only (e.g., "Maria C.")
- **Shift codes:** `CITY_[FirstInitial][LastInitial]` of client (e.g., `FREMONT_EW`) — hides client full name from caregivers
- **PIN:** Hashed (bcrypt) in database, never stored in plaintext
- **RLS:** All tables protected by Row Level Security policies per role
- **Password:** Supabase Auth handles hashing, reset flows, session management
- **Audit log:** All significant actions are logged with user, timestamp, and entity

---

## 9. PWA Configuration

- **manifest.json:** App name "Together Homecare", short name "Together", theme color `#ac6b75`, background color `#ac6b75`
- **Icons:** 192x192 and 512x512 from provided logo (rose background, house + heartbeat + heart)
- **Service worker:** Cache-first for static assets, network-first for API calls
- **Install prompt:** "Add to Home Screen" banner on mobile browsers
- **Display:** `standalone` (no browser bar, feels like native app)
- **Orientation:** `portrait`

---

## 10. Tech Stack Details

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS (with brand tokens) |
| Hosting | Vercel |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password, role-based) |
| Realtime | Supabase Realtime (chat, shift updates) |
| Storage | Supabase Storage (profile photos, certifications) |
| PWA | next-pwa or @serwist/next |
| Data Sync | Google Sheets API (free tier, Service Account) |
| Cron | Vercel Cron Jobs (free on Hobby plan) |
| Icons | Provided logo (512x512 PNG) |

---

## 11. Deployment Plan

### Phase 1: Foundation
1. Create Supabase project
2. Run database migrations (all tables above)
3. Configure RLS policies
4. Seed super admin account
5. Create Supabase Storage buckets (avatars, documents)

### Phase 2: Frontend
6. Scaffold Next.js project with Tailwind
7. Set up Supabase client + auth context
8. Build login page with role-based redirect
9. Build shared layout (sidebar, mobile header, role switching)
10. Build admin pages (dashboard, caregivers, families, shifts, matches, announcements, pop-ups, messages, audit log)
11. Build caregiver pages (shifts, announcements, messages, profile)
12. Build family pages (browse, request, messages, profile)

### Phase 3: Features
13. Implement chat with Supabase Realtime
14. Implement pop-up notice system with PIN
15. Implement star selection (max 3) + match request flow
16. Implement shift interest + admin notification
17. Implement announcement read receipts (with specific people selector)

### Phase 4: Google Sheets Integration
18. Create Google Cloud project + enable Sheets API (free)
19. Create Service Account + share spreadsheet with it (read-only)
20. Store credentials in Vercel environment variables
21. Build `/api/cron/sync-shifts` API route (reads both tabs, upserts to Supabase)
22. Configure Vercel Cron Job (every 30 min, weekdays)
23. Build admin sync dashboard (last synced, status, manual trigger, log)

### Phase 5: PWA & Launch
24. Configure PWA (manifest, service worker, icons)
25. Deploy to Vercel
26. Test on mobile devices (iOS Safari, Android Chrome)
27. Super admin seeds initial data (admins, caregivers, families)
28. Verify Google Sheets sync is working (shifts auto-populate)
29. Go live

---

## 12. File Structure

```
together-portal/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, auth provider
│   │   ├── page.tsx                # Login page
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin sidebar layout
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── caregivers/
│   │   │   ├── families/
│   │   │   ├── shifts/
│   │   │   ├── matches/
│   │   │   ├── announcements/
│   │   │   ├── popups/
│   │   │   ├── messages/
│   │   │   └── audit/
│   │   ├── caregiver/
│   │   │   ├── layout.tsx          # Caregiver sidebar layout
│   │   │   ├── shifts/
│   │   │   ├── announcements/
│   │   │   ├── messages/
│   │   │   └── profile/
│   │   └── family/
│   │       ├── layout.tsx          # Family sidebar layout
│   │       ├── browse/
│   │       ├── request/
│   │       ├── messages/
│   │       └── profile/
│   ├── components/
│   │   ├── ui/                     # Buttons, cards, badges, inputs
│   │   ├── layout/                 # Sidebar, mobile header, role switcher
│   │   ├── chat/                   # Chat inbox, thread, bubbles
│   │   ├── popup/                  # Pop-up modal, PIN pad
│   │   └── caregiver/              # CaregiverCard, StarButton, StarBar
│   ├── app/
│   │   └── api/
│   │       └── cron/
│   │           └── sync-shifts/
│   │               └── route.ts    # Google Sheets → Supabase sync
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client
│   │   │   └── middleware.ts       # Auth middleware
│   │   ├── google-sheets.ts        # Google Sheets API client + county map
│   │   ├── auth.ts                 # Auth helpers, role checks
│   │   └── utils.ts                # Shared utilities
│   └── types/
│       └── database.ts             # Generated Supabase types
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_caregiver_profiles.sql
│   │   ├── 003_shifts.sql
│   │   ├── 004_match_requests.sql
│   │   ├── 005_announcements.sql
│   │   ├── 006_popup_notices.sql
│   │   ├── 007_messages.sql
│   │   ├── 008_audit_log.sql
│   │   └── 009_rls_policies.sql
│   └── seed.sql                    # Super admin account
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## 13. UI/UX Layout Guide

### Global Layout

#### Desktop (≥ 768px)
- **Sidebar:** 260px fixed left, rose gradient background (`#ac6b75` → `#a76d83`), white text
- **Sidebar logo:** Together Homecare name + tagline at top, 20px padding
- **Nav items:** Icon + label, 48px height, hover highlight with `rgba(255,255,255,0.15)`, active item gets `rgba(255,255,255,0.25)` background + left 3px white border
- **Nav badges:** Small pill (e.g., unread count) right-aligned in nav item, rose-light background
- **Main content:** Fills remaining width, 32px padding, white background, max-width 1200px
- **Page header:** Page title (Playfair Display, 28px, `#ac6b75`) + optional subtitle/description

#### Mobile (< 768px)
- **Sidebar collapses** to a hamburger menu (top-left)
- **Mobile header:** 56px sticky bar, rose background, hamburger + page title + avatar
- **Menu overlay:** Full-screen slide-in from left, same nav items
- **Content padding:** 16px side gutters, no horizontal scroll
- **Cards stack vertically** (single column)

#### Dark Mode
- **Background:** `#1a1a2e` (body), `#16213e` (cards)
- **Text:** `#e0e0e0` (body), `#ffffff` (headings)
- **Sidebar:** Darker gradient, same nav structure
- **Cards:** Dark card background with subtle border `rgba(255,255,255,0.1)`
- **Inputs:** Dark background `#1e2a3a`, light text, subtle border
- **Tables:** Alternating rows `#1e2a3a` / `#16213e`
- **System preference:** `prefers-color-scheme: dark` on `:root:not([data-theme="light"])`

### Component Patterns

#### Cards
- Border-radius: 12px
- Padding: 20px
- Box-shadow: `0 2px 8px rgba(0,0,0,0.08)`
- White background (light) / `#16213e` (dark)

#### Stat Cards (Admin Dashboard)
- 4-column grid (desktop), 2-column (tablet), single stack (mobile)
- Each: icon (left), value (32px bold), label (14px muted), colored left border accent
- Colors cycle: rose, rose-deep, rose-mid, rose-light

#### Buttons
- **Primary:** Rose background (`#ac6b75`), white text, 12px 24px padding, 8px radius, hover darkens 10%
- **Secondary:** White background, rose border, rose text
- **Danger:** Red background for destructive actions
- **Disabled:** 50% opacity, no pointer events

#### Tables (Admin)
- Full-width, border-collapse
- Header row: Rose background, white text, 12px padding
- Body rows: Alternating `#f5f0f2` / white (light), `#1e2a3a` / `#16213e` (dark)
- Row hover: subtle highlight
- Mobile: horizontal scroll wrapper or card-based layout

#### Form Inputs
- Full-width, 12px padding, 1px border `#ddd`, 8px radius
- Focus: rose border + subtle rose glow shadow
- Labels: 14px, bold, 4px margin-bottom
- Error state: red border + red text below

#### Tag Chips (Skills, Certifications, Hobbies, Languages)
- Inline pills: rose-light background, rose-deep text, 6px 12px padding, 20px radius
- Remove "×" button on right edge
- Add button: dashed border pill "+" icon

#### Badges
- **Priority badges:** Urgent = red, Normal = blue, Low = gray
- **Status badges:** Active = green, Inactive = gray, Pending = amber
- Pill shape, 10px font, uppercase, 4px 8px padding

### 13.1 Admin Portal Layouts

#### Dashboard
```
┌─────────────────────────────────────────────┐
│  Dashboard                                  │
├────────┬────────┬────────┬────────┤
│ Active │ Active │ Open   │ Pending│
│Caregivrs│Families│ Shifts │Matches │
│  12    │  8     │  5     │  3     │
├────────┴────────┴────────┴────────┤
│  Recent Activity                            │
│  ┌─────────────────────────────────┐        │
│  │ 🕐 Maria C. updated profile    │        │
│  │ 🕐 New shift interest: OAK_JD  │        │
│  │ 🕐 Family Kim submitted picks   │        │
│  │ ...last 10 entries              │        │
│  └─────────────────────────────────┘        │
└─────────────────────────────────────────────┘
```

#### Caregivers Management
```
┌──────────────────────────────────────────────────┐
│  Caregivers            [+ Onboard Caregiver]     │
├──────────────────────────────────────────────────┤
│  Search: [________________]  Filter: [All ▾]     │
├─────────┬────────┬─────────┬──────────┬─────────┤
│ Name    │ Status │ Skills  │ Location │ Visible │
├─────────┼────────┼─────────┼──────────┼─────────┤
│Maria C. │🟢Active│ CPR,CNA │ Fremont  │ [✓]     │
│Elena W. │🟢Active│ Dementia│ Oakland  │ [✓]     │
│James T. │⚫Inact │ Mobility│ Hayward  │ [ ]     │
└─────────┴────────┴─────────┴──────────┴─────────┘
→ Click row to expand full profile
→ Visibility toggle hides/shows caregiver from family browsing
```

#### Open Shifts (Admin View)
```
┌──────────────────────────────────────────────────────┐
│  Open Shifts     [+ Create Shift]  [🔄 Sync Now]    │
│  Last synced: 2 min ago  ● In Sync                   │
├──────────────────────────────────────────────────────┤
│  Search: [________________]                          │
├──────────┬────────┬─────────┬──────────┬────────────┤
│ Code     │ City   │Schedule │ Interest │ Status     │
├──────────┼────────┼─────────┼──────────┼────────────┤
│FREMONT_EW│Fremont │M-F 8-3  │ 3 ▶      │ 🟢 Open   │
│OAKLAND_MJ│Oakland │M-W 9-5  │ 1 ▶      │ 🟢 Open   │
│HAYWARD_KL│Hayward │T-Th 7-2 │ 0        │ 🟢 Open   │
└──────────┴────────┴─────────┴──────────┴────────────┘
→ Click interest count to see caregiver list + notes
→ Sync controls: last synced timestamp, status badge, manual trigger
→ Collapsible sync log below table
```

#### Match Requests
```
┌──────────────────────────────────────────────────┐
│  Match Requests                                  │
├──────────────────────────────────────────────────┤
│  ┌─── Request from: Kim Family ── Pending ─────┐ │
│  │                                              │ │
│  │  Pick 1: Maria C.  [Available ▾] Notes:[__] │ │
│  │  Pick 2: Elena W.  [Unavailable▾] Notes:[__]│ │
│  │  Pick 3: James T.  [Available ▾] Notes:[__] │ │
│  │                                              │ │
│  │  Message to Family:                          │ │
│  │  [________________________________]          │ │
│  │  [________________________________]          │ │
│  │                                              │ │
│  │  [Approve Match]                             │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
→ Each pick shows caregiver photo + name + skills
→ Admin marks availability per pick with dropdown + internal notes
→ Family message textarea explains the decision
→ Status flow: Pending → Reviewing → Matched
```

#### Pop-Up Notices (Admin Create)
```
┌────────────────────────────────────────────────────┐
│  Pop-Up Notices            [Audit Log]             │
├────────────────────────────────────────────────────┤
│  CREATE NEW NOTICE                                 │
│                                                    │
│  Title: [________________________________]         │
│  Message:                                          │
│  [____________________________________________]    │
│  [____________________________________________]    │
│                                                    │
│  Recipients: [All Caregivers ▾]                    │
│    ○ All Caregivers  ○ All Families  ○ Both        │
│    ○ Specific People...                            │
│    ┌──────────────────────────┐ (when specific)    │
│    │ Search: [___________]    │                     │
│    │ ▸ Caregivers             │                     │
│    │   ☑ Maria C.             │                     │
│    │   ☐ Elena W.             │                     │
│    │ ▸ Families               │                     │
│    │   ☑ Kim Family           │                     │
│    └──────────────────────────┘                     │
│                                                    │
│  Expires: [24 hours ▾]                             │
│  Priority: (Urgent) (Normal) (Low)                 │
│                                                    │
│  [Send Now]  [Schedule for Later]                  │
├────────────────────────────────────────────────────┤
│  ACTIVE NOTICES                                    │
│  ┌────────────────────────────────────┐            │
│  │ 🔴 Complete Uniform Today          │            │
│  │ Sent 2h ago · Expires in 22h       │            │
│  │ ████████░░░░ 8/12 acknowledged     │            │
│  │ Pending: James T., Elena W., ...   │            │
│  └────────────────────────────────────┘            │
└────────────────────────────────────────────────────┘
```

#### Messages (Admin Inbox)
```
┌──────────────────────────────────────────────────┐
│  Messages                                        │
├───────────────┬──────────────────────────────────┤
│ Threads       │  Thread: Maria C.                │
│               │                                  │
│ Maria C.  (2) │  ┌──────────────┐               │
│ Kim Family    │  │ Hi, about the│  ← received   │
│ Elena W.      │  │ Fremont shift│               │
│ Park Family   │  └──────────────┘               │
│               │         ┌──────────────┐        │
│               │         │Yes, it's M-F │ → sent  │
│               │         │8am to 3pm    │        │
│               │         └──────────────┘        │
│               │                                  │
│               │  [Type message...    ] [Send]    │
│               │  [📞 Call via Google Voice]      │
└───────────────┴──────────────────────────────────┘
→ Left panel: thread list with unread badges
→ Right panel: chat bubbles + input
→ Admin call button = Google Voice
→ Mobile: thread list → tap → full-screen chat
```

### 13.2 Caregiver Portal Layouts

#### Open Shifts
```
┌──────────────────────────────────────────────────┐
│  Open Shifts                                     │
├──────────────────────────────────────────────────┤
│  ┌─ ALAMEDA COUNTY ──────────────────────────┐   │
│  │ [Fremont] [Oakland] [Hayward] [All]       │   │
│  │                                            │   │
│  │ ┌─ FREMONT_EW ─────────────────────────┐  │   │
│  │ │ Schedule: Mon-Fri 8:00am - 3:00pm    │  │   │
│  │ │ Care Type: Companion Care            │  │   │
│  │ │ Notes: Light housekeeping included   │  │   │
│  │ │                                      │  │   │
│  │ │ ▸ I'm Interested                     │  │   │
│  │ │   Notes: [I'm available M-W only___] │  │   │
│  │ │   [Submit Interest]                  │  │   │
│  │ └─────────────────────────────────────-┘  │   │
│  │                                            │   │
│  │ ┌─ FREMONT_KL ─────────────── (collapsed) │   │
│  └────────────────────────────────────────────┘   │
│                                                   │
│  ┌─ CONTRA COSTA COUNTY ─────────────────────┐   │
│  │ [Concord] [San Ramon] [Walnut Creek] [All]│   │
│  │ ...                                        │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
→ Grouped by county with collapsible sections
→ City filter tabs within each county
→ Shift cards expand on tap to show details + interest form
→ "I'm Interested" expands notes textarea + submit button
→ After submit: locked with "Interest Submitted ✓"
```

#### My Profile (Caregiver)
```
┌──────────────────────────────────────────────────┐
│  My Profile                                      │
├──────────────────────────────────────────────────┤
│  ┌──────┐                                        │
│  │      │  [Upload Photo]                        │
│  │ 📷   │                                        │
│  └──────┘                                        │
│                                                  │
│  First Name: [Maria_________]                    │
│  Last Initial: [C]                               │
│  Location: [Fremont ▾]                           │
│                                                  │
│  About Me:                                       │
│  [I love helping seniors stay active and_______] │
│  [independent. 5 years experience.______________]│
│                                                  │
│  Skills: [CPR ×] [First Aid ×] [+ Add]          │
│  Certifications: [CNA ×] [HHA ×] [+ Add]       │
│  Hobbies: [Cooking ×] [Gardening ×] [+ Add]     │
│  Languages: [English ×] [Tagalog ×] [+ Add]     │
│                                                  │
│  Availability / Schedule:                        │
│  Mon: [8am - 3pm________________]               │
│  Tue: [8am - 5pm________________]               │
│  Wed: [9am - 3pm________________]               │
│  Thu: [Off_____________________]                │
│  Fri: [8am - 12pm_______________]               │
│  Sat: [Available on request______]               │
│  Sun: [Off_____________________]                │
│                                                  │
│  [Save Changes]                                  │
└──────────────────────────────────────────────────┘
→ Photo: circular preview, click to upload (Supabase Storage)
→ Tags: inline pill chips with × to remove, + to add
→ Availability: plain text input per day (free-form, not time blocks)
```

#### Messages (Caregiver)
```
┌──────────────────────────────────────────────────┐
│  Messages                                        │
├──────────────────────────────────────────────────┤
│  Together Homecare                               │
│                                                  │
│  ┌──────────────────┐                            │
│  │ Welcome Maria!   │  ← from admin              │
│  │ Your account is  │                            │
│  │ all set up.      │                            │
│  └──────────────────┘                            │
│              ┌──────────────────┐                │
│              │ Thank you! I'm   │  → from me     │
│              │ excited to start.│                │
│              └──────────────────┘                │
│                                                  │
│  [Type message...           ] [Send]             │
│  [📞 Call Together Homecare]                     │
└──────────────────────────────────────────────────┘
→ Single thread with admin (Together Homecare)
→ Call button → native phone dialer (tel: link), NOT Google Voice
→ Chat bubbles: sent = right-aligned rose, received = left-aligned gray
```

### 13.3 Family Portal Layouts

#### Browse Caregivers
```
┌──────────────────────────────────────────────────┐
│  Browse Caregivers              ★ 2 of 3 selected│
├──────────────────────────────────────────────────┤
│  Filter: Skills [All ▾]  Languages [All ▾]       │
├──────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐│
│  │ ┌───┐       │  │ ┌───┐       │  │ ┌───┐     ││
│  │ │📷 │Maria C│  │ │📷 │Elena W│  │ │📷 │JamesT││
│  │ └───┘       │  │ └───┘       │  │ └───┘     ││
│  │ English,    │  │ English,    │  │ English   ││
│  │ Tagalog     │  │ Spanish     │  │           ││
│  │             │  │             │  │           ││
│  │ Caring and  │  │ Specialist  │  │ Strong &  ││
│  │ experienced │  │ in dementia │  │ reliable  ││
│  │             │  │             │  │           ││
│  │ CPR CNA     │  │ CNA HHA    │  │ Mobility  ││
│  │      ★      │  │      ★      │  │      ☆    ││
│  └─────────────┘  └─────────────┘  └───────────┘│
├──────────────────────────────────────────────────┤
│  ★ Maria C.  [×]   ★ Elena W.  [×]              │
│                         [Submit Selection]        │
└──────────────────────────────────────────────────┘
→ Grid: 3 columns desktop, 2 tablet, 1 mobile
→ Star button bottom-center of each card
→ Max 3 stars: 4th tap → card shakes, toast "Unstar one first"
→ Bottom bar: sticky, shows selected names with × remove, Submit button
→ Only is_visible = true caregivers shown
```

#### My Request
```
┌──────────────────────────────────────────────────┐
│  My Request                                      │
├──────────────────────────────────────────────────┤
│  Status: ● Submitted  ● Under Review  ○ Matched │
│          ═══════════════════●══════════──────────│
│                                                  │
│  Your 3 Picks:                                   │
│  1. Maria C.     ✓ Available                     │
│  2. Elena W.     ✗ Unavailable                   │
│  3. James T.     ✓ Available                     │
│                                                  │
│  ┌─── Match Result ──────────────────────────┐   │
│  │  (appears when status = Matched)          │   │
│  │  ┌───┐                                    │   │
│  │  │📷 │ Maria C.                           │   │
│  │  └───┘ CPR, CNA, First Aid                │   │
│  │                                           │   │
│  │  Message from Together Homecare:          │   │
│  │  "We've matched you with Maria C. who    │   │
│  │   has 5 years of companion care           │   │
│  │   experience and is available M-F."       │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
→ Status tracker: horizontal stepper with dots and progress bar
→ Picks list: numbered, shows availability badge (green check / red ✗)
→ Match result card: caregiver photo, name, skills, admin message
```

### 13.4 Pop-Up Notice Modal (All Roles)

```
┌──────────────────────────────────────────────────┐
│  ░░░░░░░░░░ BLURRED BACKDROP ░░░░░░░░░░░░░░░░░  │
│  ░░░░┌──────────────────────────────────┐░░░░░░  │
│  ░░░░│  ⚠️  Together Homecare    1 of 3 │░░░░░░  │
│  ░░░░├──────────────────────────────────┤░░░░░░  │
│  ░░░░│                                  │░░░░░░  │
│  ░░░░│  Complete Uniform Today          │░░░░░░  │
│  ░░░░│  🔴 URGENT · Sep 24 · 22h left  │░░░░░░  │
│  ░░░░│                                  │░░░░░░  │
│  ░░░░│  ┌──────────────────────────┐    │░░░░░░  │
│  ░░░░│  │ Please ensure your       │    │░░░░░░  │
│  ░░░░│  │ complete uniform is ready │    │░░░░░░  │
│  ░░░░│  │ for your shift tomorrow. │    │░░░░░░  │
│  ░░░░│  │ Polo shirt, ID badge,    │    │░░░░░░  │
│  ░░░░│  │ and closed-toe shoes.    │    │░░░░░░  │
│  ░░░░│  └──────────────────────────┘    │░░░░░░  │
│  ░░░░│  (highlighted message card:       │░░░░░░  │
│  ░░░░│   warm bg, orange left border,    │░░░░░░  │
│  ░░░░│   bold 16px text)                │░░░░░░  │
│  ░░░░│                                  │░░░░░░  │
│  ░░░░│  Enter PIN to acknowledge:       │░░░░░░  │
│  ░░░░│       ● ● ○ ○                    │░░░░░░  │
│  ░░░░│                                  │░░░░░░  │
│  ░░░░│    [ 1 ] [ 2 ] [ 3 ]            │░░░░░░  │
│  ░░░░│    [ 4 ] [ 5 ] [ 6 ]            │░░░░░░  │
│  ░░░░│    [ 7 ] [ 8 ] [ 9 ]            │░░░░░░  │
│  ░░░░│    [   ] [ 0 ] [ ⌫ ]            │░░░░░░  │
│  ░░░░│                                  │░░░░░░  │
│  ░░░░└──────────────────────────────────┘░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────────┘
→ Cannot be dismissed without correct PIN
→ Backdrop: blur + dark overlay, no click-to-close
→ Queue counter: "1 of 3" at top-right
→ Message card: warm yellow bg (#fff8e1), orange left border (#e65100)
→ Dark mode: dark brown bg (#3e2723), light text (#ffe0b2), orange border (#ff8a50)
→ PIN dots: fill as typed, green flash on correct, red shake on wrong
→ After correct PIN: advances to next notice or closes overlay
```

### 13.5 Login Page

```
┌──────────────────────────────────────────────────┐
│                                                  │
│           ┌──────┐                               │
│           │ LOGO │  Together Homecare             │
│           └──────┘  Care Portal                  │
│                                                  │
│           ┌──────────────────────────┐           │
│           │                          │           │
│           │  Email:                  │           │
│           │  [________________________]│          │
│           │                          │           │
│           │  Password:               │           │
│           │  [________________________]│          │
│           │                          │           │
│           │  [       Sign In        ] │           │
│           │                          │           │
│           │  Forgot password?        │           │
│           │                          │           │
│           └──────────────────────────┘           │
│                                                  │
│           Fremont, CA · togetherhomecare.org      │
└──────────────────────────────────────────────────┘
→ Centered card, max-width 400px
→ Rose logo + brand name at top
→ After login: redirect based on role (admin/caregiver/family)
→ First login (caregiver/family): forced password reset + PIN setup
```

---

## 14. Mockup Reference

Interactive mockup: https://claude.ai/artifact/SHZEVkaCv34KUFpgfHGac3

All UI patterns, interactions, and copy in this spec are based on the approved mockup (Version 11).
