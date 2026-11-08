# Plan: CRM and portal schedules connected (saved Nov 7, 2026 — CRM side built Nov 8: Raffmorales/Togetherhomecare-CRM#56; portal message: portal-schedule-sync.md)

Screenshots: `schedule-sync-images/`.

## Goal
The CRM's schedule and the portal's schedule are the **same thing**, and both use the **same layout**. Managers control the schedule in the CRM. Whatever is in the CRM shows on the child's schedule in the portal, so open shifts are always built from one schedule.

## CRM client record, top to bottom (Schedule section)
1. **Service Hours.** This replaces the free-text "Hours" box (screenshot 1).
   - Raff's service-hours profile (monthly or quarterly, commit 3f6d4b6) is likely the base for this. Check it first.
2. **Recurring Schedule.** The current "Schedule" (screenshot 2), renamed. Same weekly grid: per day, start–end, + to add more.
3. **Specific Shifts.** The current "Specific schedule", renamed. Instead of free text, each shift is a **date picker + start time + end time**, with + to add rows. The same input goes in the portal.
4. **Notes for caregivers** (screenshot 3, copied from the portal): "Shown on the shift card. Don't include names or addresses."
5. **Open shift details.** This replaces "Posting Schedule".
   - It shows what the open shift contains, **worked out by the system**: the schedule minus what caregivers already cover.
   - **See coverage** button: opens a read-only popup that copies the portal's "Who covers what?" exactly (screenshot 4). It shows a grid of shifts × caregivers plus "Still needed", and a card per caregiver with their days and hours per week.
   - No editing in the CRM; coverage is controlled in the portal.
   - After it, **Care type** and **Notes for caregivers**, as in the portal (screenshot 5).
6. **The only parts edited in the CRM** are Recurring Schedule and Specific Shifts (plus Care type and Notes). They're sent to the portal.

## CRM: "Since" date on Primary / Secondary
- Add a **Clear** button next to the Since date. It's for caregivers added before the system existed, when the real date is unknown.
- Picking a caregiver still fills today's date automatically.
- **Blank is allowed**, but it sends a CRM notification to the right staff that the date needs checking. To decide: Angelle + the region's people, like the trial question?
- Incentives: a blank Since date falls back to the first WellSky shift (the "estimated" date it already uses).

## For the portal chat (to send when we build it)
1. **Post open shift popup:** show **Recurring Schedule**, **Specific Shifts**, **Care type** and **Notes for caregivers** from the CRM, so what's typed in the CRM appears there.
2. **Specific shifts** are entered as date + start time + end time, the same in both systems.
3. **Public and exclusive open shifts at the same time:**
   - A child can have a public open shift (posted to the website) **and** an exclusive one (offered only to chosen caregivers) at once.
   - "Open a shift" must still list children who already have an open shift, so more schedule can be added.
   - In that form, already-covered days show as filled boxes in **mint green at 25% opacity**, so it's clear what's still open.
   - Shifts posted from the portal itself are **exclusive** (purple tag).
   - Example: weekdays covered by caregivers, Saturday posted publicly, Sunday offered exclusively.
4. **Emergency Shift** (portal only):
   - For a sudden absence on a recurring shift. A one-time offer.
   - Steps: pick the child, then the date and the start and end time (like a specific shift).
   - Posted in the portal only, with a **pastel orange "Urgent" tag** (like the purple exclusive tag).
5. **"Hide from" per open shift:**
   - On the row with On hold / Close shift, add **Hide from**, to pick caregivers who shouldn't see **that** shift.
   - The existing "Hide from caregivers" hides **all** open shifts from someone; this is per shift.

## Questions to settle before building
- Service Hours: reuse Raff's monthly/quarterly profile as is, or change it?
- Who gets the "Since date is blank" notification?
- How do existing free-text "Specific schedule" entries move into the new date/time rows? Convert what can be read, and list the rest for staff to re-enter.
- Is "Open shift details" stored (and written to the sheet's Posting Schedule column for the Apps Scripts), or only shown?
