# Phase 3: Incentive program monitoring tool (CRM)

Status: spec only. No code yet. The first program's details are still to come from Jex.

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
