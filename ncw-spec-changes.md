# New Client Welcome: changes to the spec from the mockup review (Nov 4–5, 2026)

Prototype: https://claude.ai/artifact/BV3qYkRAYWn5JANRYSwGuZ

1. **No automatic enrollment** (replaces §9, §13 and the §15 exception "ENROLLMENT_SUGGESTION auto-confirms after 7 days").
   The tool lists **Qualifiers** (Highly qualified / Qualified / Check first, with the qualifications it checked).
   A person clicks Accept (popup + PIN) or Decline (reason required). A decision can be undone; the undo is logged.
   "Add someone" covers manual enrollment (same HR approval rule when a check fails).
2. **Tasks are only decisions made in the tool** (changes §14). Fixes done elsewhere are not tasks. They show as
   **"On hold until fixed"** with where to fix them, and clear on the next scan:
   - WellSky: missed clock-in/out (UPDATE_SHIFT), missing reason tag (MISSED_SHIFT_REASON), unknown tag (INVALID_TAG), Needs a look.
   - Service calendar: verification (VERIFY_SHIFT).
   They still block payment and still follow the §15 reminders/escalation.
3. **Every decision needs a PIN** in one confirmation popup: accept a qualifier, every task action, approve an amount,
   mark as released. Deny / hold also need a reason. Saved with name and time (§16).
4. **"Ask someone"** (§20): pick a person + short note. The task moves to them and they get a card on the CRM
   **Notifications page** (no email). The asker sees "Asked <name> · waiting" and can take it back. No PIN.
5. **Roles** (§19): schedulers = Hana, Ira; admin = Angelle (admin assistant); HR = Angelica; management = super admins
   Jex, Raff, Liz. **Only Angelica and super admins can approve amounts and mark bonuses released**, in Payroll and in Tasks.
6. **Six steps per match** (replaces the §13 payment states): 1 Qualified · 2 Accepted · 3 Day 1 · 4 90 days ·
   5 **Approved** (when they finish the 90 days with nothing on hold; early ends still need Angelica or a super admin to approve) ·
   6 **Released**. Payroll is paid outside the CRM: after it is paid, HR clicks "Mark as released" + PIN to confirm
   the caregiver received it. Steps show on each match and in the Matches list.
7. **Repeating promos** (changes §4 config): each promo has its own dates; "New promo" copies the rules from an earlier one.
   Promo buttons on every page with a red count of what's waiting; older promos keep running until released.
8. **Screens**: sidebar Programs › Incentives → program tiles. Program tabs: Qualifiers · Matches · Tasks · Payroll ·
   Reports (Reports includes the §26 program health). "Pairing" is called **match** everywhere.
9. **Guide** inside the program: basics + step-by-step scenarios for admins.

Still open:
- How to mark a **no-show** (a caregiver cancellation with no good reason): a tag like #noshow, or untagged after X days.
- The real **payroll schedule** (the mockup assumes every 2 weeks: Jan 31, Feb 14, Feb 28).
- Can a caregiver qualify in a new promo while still in another promo's 90 days? (Mockup: "Check first".)
- The CRM must start recording **when Primary changes** before the tool can find matches; staff must set Primary
  on the client record for every new match since Nov 1.
- Confirm the WellSky scan captures the notes field (for #tags).
