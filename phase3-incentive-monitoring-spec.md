# Phase 3: Incentive program monitoring tool (CRM)

Status: mockup stage. No code yet.
First program: New Client Welcome. Full spec in ncw-spec.md; mockup: https://claude.ai/artifact/CxZGFu63ENQjM7vrXiJDYD

Phase 3 covers both the portal and the CRM, and is split in two:
1. **Monitoring tool for the incentive programs** (this document, first).
2. Gamification (later).

## Name
No name yet. Placeholder: "Incentives". It will be renamed when one is chosen.

## Where it lives
- A new item in the CRM sidebar.
- Who sees it: still to be decided (likely the people who run each program, plus super admins Jex and Raff).

## Structure
1. **Programs menu (the landing page).** One tile per incentive program, each with an icon that fits what the
   program is about. A tile shows the program's name and, optionally, a one-line status.
2. **Program page.** Opens from a tile. Each program can monitor different things, so its content can differ.

## Keep the program pages uniform
Programs may need different content, but every program page keeps the same frame, so staff learn it once:
- **Header:** icon, program name, short description, period (e.g. this month), and Back to programs.
- **Summary row:** a few number tiles in the same style on every program (e.g. eligible, on track, earned).
- **Main area:** the program-specific part (a table, progress list, calendar, etc.), using the CRM's existing
  table, chip and card styles.
- **Same controls in the same places:** search, period picker, filters as chips, export (if needed).
- **Same visual language:** the same status colors and icons as the rest of the CRM (e.g. the verification
  marks ✓ ✕ clock).

## Steps
1. Mockup of the sidebar item, the programs menu and the shared program-page frame, filled in with the
   first program.
2. Review with Jex.
3. Build the first program.
4. Add the other programs on the same frame.

## Open questions (to answer when the first program arrives)
- What does the program reward, and who takes part (caregivers, staff, families)?
- What data does it monitor (WellSky visits, verified shifts, CRM records, the portal)? Over what period?
- Who looks after it, and who should see it?
- Does anything need to go to the portal (e.g. caregivers seeing their progress), or is it CRM-only for now?
- Does it link to the Incentives Google Doc from earlier?

## Decisions (Nov 4, 2026, from mockup review)
- Tasks live inside each program (Tasks tab); no "My tasks" in the sidebar. Sidebar: Programs › Incentives.
- Tasks are only decisions made in the tool. Fixes done in WellSky (clock-ins/outs, reason tags) or the
  Service calendar (verification) are shown as "On hold until fixed" with where to fix them; they clear on the next scan.
- Program tabs: Pairings · Tasks · Payroll · Reports (Reports includes program health).
- "Ask someone": pick a person + a short note; the task moves to them, they get a card on the CRM Notifications
  page (no email), the asker sees "Asked <name> · waiting". Note and reply are kept in the pairing's history.
- Roles: Hana and Ira = schedulers; Angelle = admin assistant (the spec's "admin"); Angelica = HR (most approvals);
  Jex, Raff, Liz = super admins (the spec's "management").
- Keep screens light: little helper text.
- No automatic enrollment (replaces spec section 9/13's "auto after 7 days"): the tool lists Qualifiers
  (Highly qualified / Qualified / Check first, with the checks it ran) and a person Accepts or Declines.
  "Add someone" covers manual enrollment.
- Promos repeat: "New promo" sets new dates (rules copied from an earlier promo). Every program page has a Promo
  picker; older promos stay visible and keep running until paid. Tabs: Qualifiers · Pairings · Tasks · Payroll · Reports.
- "Pairings" are called Matches. Every match follows 6 steps: 1 Qualified · 2 Accepted · 3 Day 1 · 4 90 days ·
  5 Approved (when they finish the program; early ends still need super admin approval) · 6 Released (HR clicks
  Release and enters their PIN to confirm the bonus is on the payroll and the caregiver received it).
  Shown as a step tracker on each match and a step bar in the Matches list.
