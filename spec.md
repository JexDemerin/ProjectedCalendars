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
| shift_code | text | Format: `CITY_XX` (e.g., `FREMONT_EW`) |
| county | text | `ALAMEDA` or `CONTRA COSTA` |
| city | text | City name |
| schedule | text | Human-readable schedule |
| care_type | text | Companion, Personal, Dementia, Mobility, etc. |
| admin_notes | text | Notes visible to caregivers |
| is_open | boolean | Whether shift is still available |
| created_by | uuid | References profiles.id (admin) |
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
| audience | enum | `caregivers`, `families`, `all` |
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
- Create/edit announcements with title, body, audience selector
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

## 7. Privacy & Security

- **Caregiver names:** First name + last initial only (e.g., "Maria C.")
- **Shift codes:** `CITY_[FirstInitial][LastInitial]` of client (e.g., `FREMONT_EW`) — hides client full name from caregivers
- **PIN:** Hashed (bcrypt) in database, never stored in plaintext
- **RLS:** All tables protected by Row Level Security policies per role
- **Password:** Supabase Auth handles hashing, reset flows, session management
- **Audit log:** All significant actions are logged with user, timestamp, and entity

---

## 8. PWA Configuration

- **manifest.json:** App name "Together Homecare", short name "Together", theme color `#ac6b75`, background color `#ac6b75`
- **Icons:** 192x192 and 512x512 from provided logo (rose background, house + heartbeat + heart)
- **Service worker:** Cache-first for static assets, network-first for API calls
- **Install prompt:** "Add to Home Screen" banner on mobile browsers
- **Display:** `standalone` (no browser bar, feels like native app)
- **Orientation:** `portrait`

---

## 9. Tech Stack Details

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
| Icons | Provided logo (512x512 PNG) |

---

## 10. Deployment Plan

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
17. Implement announcement read receipts

### Phase 4: PWA & Launch
18. Configure PWA (manifest, service worker, icons)
19. Deploy to Vercel
20. Test on mobile devices (iOS Safari, Android Chrome)
21. Super admin seeds initial data (caregivers, families, shifts)
22. Go live

---

## 11. File Structure

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
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client
│   │   │   └── middleware.ts       # Auth middleware
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

## 12. Mockup Reference

Interactive mockup: https://claude.ai/artifact/SHZEVkaCv34KUFpgfHGac3

All UI patterns, interactions, and copy in this spec are based on the approved mockup (Version 11).
