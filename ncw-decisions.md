# New Client Welcome: decisions on the build questions (Nov 5, 2026)

## Payroll schedule (from the 2026 Biweekly Pay Periods chart; 2027 continues every 14 days)
Pay periods run Monday to Sunday (2 weeks); pay day is the Friday after.
Note: the chart's period 1 shows 01/04/2025 and 01/09/2025; read as 2026 (typo).

2026 pay days: 01-09, 01-23, 02-06, 02-20, 03-06, 03-20, 04-03, 04-17, 05-01, 05-15, 05-29, 06-12, 06-26,
07-10, 07-24, 08-07, 08-21, 09-04, 09-18, 10-02, 10-16, 10-30, 11-13, 11-27, 12-11, 12-25.
2027 pay days (continued): 01-08, 01-22, 02-05, 02-19, 03-05, 03-19, 04-02, 04-16, 04-30, 05-14, 05-28,
06-11, 06-25, 07-09, 07-23, 08-06, 08-20, 09-03, 09-17, 10-01, 10-15, 10-29, 11-12, 11-26, 12-10, 12-24.
(2027 period for a pay day = the 14 days ending the Sunday before it.)

Example: Nov promo, Day 1 Nov 10, 2026 → Day 90 Feb 7, 2027 → Day 90 + 7 = Feb 14 → first pay day Feb 19, 2027.

## Decisions
- No-show: add the #noshow tag. Cancelled by caregiver + #noshow = unexcused: the hours stay in scheduled
  hours (count against the caregiver) and the MISSING_REASON hold clears. Untagged cancellations stay On hold.
- Two promos at once: allowed when they meet the qualifications. No "In another promo" warning; each is its own match.
- Tags: in the WellSky Activity Note on the shift.
- No automatic approval: every bonus, including full 90 days, is approved by Angelica or a super admin (PIN).
- Assigned scheduler by region: Hana = RCEB clients, Ira = GGRC clients.
- Memos: none yet; written memos will be portal forms. Until those exist, the approval popup asks the approver
  to confirm "No memo, warning or incident on file for this match" (nothing is denied automatically).
- Reminders about tags: holds show "Add #sick / #leave / #pto / #noshow in the WellSky Activity Note";
  a weekly reminder card to schedulers lists untagged caregiver cancellations; the Guide has a tags page.
- Client date of birth: matched from the Birthdays tab by name (content coming).

- Verification: schedulers will start using it soon. Until a match's shifts are verified it stays before Day 1 / On hold
  (never approve unverified).
- WellSky scans: Jexter runs them; none since Oct 27 yet.
- Primary / Secondary: any internal team member can set them on the client record (changes §3). REMOVAL_REASON goes to
  whoever removed the Primary; Angelica approves.
- Caregiver names: no separate mapping table. Match WellSky names to Hired Caregivers by name (as the work record does)
  and list names that don't match under Reports > Data to fix, while the team aligns CRM data with WellSky.
- PIN: one global PIN per person (the existing "Verify as admin" PIN). Jex asked for no lockout; flagged (see reply).

- Backfill: matches made Nov 1 to go-live use the first scheduled shift with that client on or after Nov 1 as the
  Primary date, shown "date estimated" so a person can correct it (source = backfill).
- Day-5 escalation: Angelica.
- Conflict check (family list): skipped. EOR caregivers (Hired Caregivers status "EOR") never qualify:
  Not qualified, reason "EOR caregiver".

- Bulk entry of Primary/Secondary (Nov 2026): the "became Primary" date the program uses = the earlier of the day it was
  entered in the CRM and the caregiver's first scheduled WellSky shift with that client. Existing pairings (shifts with
  the client before the promo window) are not new and never qualify. A date taken from a shift shows "date estimated".
  WellSky history in the CRM starts Aug 1, 2026.

## Added to Phase 2
- Client record, Primary / Secondary: show a "Since" date next to each caregiver (today for a new pick, the recorded
  date for existing ones). Anyone who can edit the record can change it; the change is saved to primary_history and
  the audit log, and that date is used instead of the estimate.

## Still waiting
- PIN lockout: keep 5 tries / 10 minutes (recommended) or remove.
- Liz as super admin; rename the "Angel" account to Angelle.
