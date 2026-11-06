# New Client Welcome: what was built, and where it differs from the spec (Nov 5, 2026)

> **Nov 6, 2026: the program is now 60 days, not 90.** Wherever these notes say 90 days or day 90, read 60 / day 60.

Built in the CRM in 5 phases (PRs #40–#45), live on main. Section numbers are from spec.md.

## Decided (closes the earlier open items)
- **No-show:** the #noshow tag in the WellSky Activity Note. A caregiver cancellation tagged #noshow counts against the caregiver and clears the "reason tag missing" hold.
- **Payroll:** biweekly Friday pay days from the 2026 chart, continued every 14 days through 2027. The first possible NCW pay day for the Nov promo is Feb 19, 2027.
- **Two promos at once:** allowed if the caregiver meets the qualifications in each. There's no "in another promo" warning.
- **No automatic approval at all.** This replaces the spec's auto-approval of full 90-day matches. Every amount, including a full 90 days, is approved by Angelica or a super admin with a PIN.
- **PIN:** one global PIN per person (the existing Verify-as-admin PIN), with **no lockout**.
- **Escalation:** day 3, a reminder to the owner. Day 5, Angelica and the super admins. Day 7, Overdue. These are cards on the CRM Notifications page, with no email.
- **Primary / Secondary:** anyone on the internal team can set them on the client record. Each one has an editable "Since" date. Changes are recorded from now on (primary_history).
- **Tags** live in the WellSky Activity Note. The scan reads it.

## How qualifying works (changes §9)
- **"Became Primary" date:** the earlier of the date it was entered in the CRM and the first WellSky shift in the promo window. A date taken from a shift shows "estimated". The Since date on the client record overrides it.
- **Existing pairings are not listed at all:** a caregiver with regular shifts with that client in the 4 weeks before the window isn't a new match.
- **Not qualified:** worked with or was assigned to the client before, the caregiver is EOR on Hired Caregivers, or the first shift came after the 30-day limit.
- **Qualifications:**
  - Shown on every qualifier: New to client, Matched in the promo dates, and one of Started / Started, not verified yet / Not started yet.
  - Possible duplicate shows as a warning check (no task).
  - Possible swap, 2nd new client and **Added by hand** are warning checks that **only Angelica or a super admin** can accept.
  - Angelle accepts or declines all the others.
- **Add someone** (Angelle, Angelica, super admins) is the manual enrollment. The morning run keeps the person until someone decides.

## Matches, tasks and holds
- **Six steps** replace the §13 payment states: Qualified, Accepted, Day 1 (first completed, verified shift), 90 days, Approved, Released.
  - "Ready to approve" comes 7 days after day 90 (payment_hold_days).
  - Released is marked by Angelica or a super admin, with a PIN and the pay day it was paid on.
- **Tasks the tool creates** (decisions made in the tool):
  - Cancellation review
  - Removal reason
  - Reassign approval
  - Early-end approval
  - No scheduled hours ($0)
  - Approval
- **Not tasks:** Possible duplicate, Possible swap and 2nd new client are checks on the qualifier. A missed enrollment is handled by Add someone. Setting the Primary is done on the client record.
- **Holds, not tasks:** fixes made elsewhere are shown as "On hold until fixed", with where and how to fix them. They clear after the next scan:
  - WellSky: missed punch, missing reason tag, unknown tag, still Scheduled after the date, needs a look.
  - Service calendar: not verified.
  - Holds still block approval.
- **Memos:** there are no memo records yet (they'll be portal forms). Approving requires ticking "No memo, warning or incident on file".
- **Removal reason:** Performance only counts with a record on file **before** the removal. Without one, it counts as not performance.
- **Ask someone, Take back and Reply** need no PIN. Every decision needs a PIN and goes to decision_log with the name, time and reason.

## Rules and promos (changes §4)
- Every threshold, the alert thresholds and the pay days are per promo, under **Rules**. Super admins change them with a PIN, and each change is logged. Out-of-range values are refused.
- **+ New promo** (super admins, PIN) copies the rules from an earlier promo. Promo dates can't overlap.
- A promo's status (upcoming, running, closed) follows its dates. Closed promos keep their matches going.

## Screens
- Programs › Incentives › New Client Welcome, with promo buttons and red counts.
- Tabs: Qualifiers, Matches, Tasks, Payroll, Reports.
- A match page shows the 6 steps, Why this amount, the holds, the history and the shifts.
- The **Guide** (basics and step-by-step help) is editable by super admins.

## Outputs and reports (§17, §26)
- **Payroll:**
  - Approve or Deny.
  - Approved bonuses grouped by the next pay day.
  - **Export for payroll** (CSV: caregiver, email, client, amount, "New Client Welcome", pay day, approved by, approved on).
  - Mark as released.
  - The Released list and the Not paid list.
- **Reports:**
  - Matches by outcome, with amounts.
  - **Needs attention:** escalated or overdue tasks, approved bonuses not released after their pay day, holds older than a week, and escalations in the last 7 days.
  - **Data to fix:** untagged call-outs, unknown tags, missed punches, unverified shifts, clients without a UCI #, a date of birth or a Primary, and WellSky names not on Hired Caregivers.
  - Decisions by person this month, including "Took the suggestion" and "Chose something else".
  - Average days to answer each task type.
- **Not built:** the NCW tag or task badge on the Service calendar, and projected payout vs. budget (there's no budget figure). Reports shows the "possible" total instead.

## Suggestions and alerts (§20–§24)
- **Suggestions** cover the 6 task types above. Each shows the choice, the confidence, why, and the evidence.
  - When the evidence isn't in the CRM (for example memo records), the suggestion says so and is never High.
  - A suggestion is never applied. Whether the person took it is logged.
- **Not built:** the §25 rule that flags a suggestion type overridden more than 30% of the time in a month. The counts are in Reports.
- **Heads-up cards** go to the owner once, or once a week while the problem lasts. They're paused while the data is stale:
  - no first shift after 20 days
  - hours worked below 85%
  - 2 or more no-shows or untagged call-outs in 14 days
  - 3 or more shifts waiting for verification
  - day 90 within 7 days with a task open
  - client cancellations at 20% or more
  - a pause running 21 days or more
- **Program cards:**
  - **Data is not fresh** (no WellSky scan for 24 hours) goes to the super admins, and the program page shows a warning.
  - The payroll list goes to Angelica and the super admins 3 business days before each **pay day**. The pay day is used because no separate payroll cutoff date is known.
  - "Approved, not released after the pay day."
  - A Monday tag reminder to each scheduler for their region (Hana: RCEB, Ira: GGRC).
- **Not built:** the "Primary field mismatch" alert, and the §22 daily briefings. Each item is its own Notifications card instead.
- **Priority score (§23)** is shown on each task, and tasks are sorted by it.
- **Explainability (§24):** Why this amount on every match, "Waiting on <person> since <date>", and the reason for every $0 or denial.

## Still open
- Memo, warning and incident records as portal forms. Once they exist, the tool can read them instead of asking the approver to confirm.
- "HR answers a caregiver's question about the amount within 10 business days" is in the Guide. Please confirm.
- A budget figure, if projected payout vs. budget is wanted.
- Whether to add the daily briefings (§22) or the Service calendar badge (§17).
- Operations: Jexter runs WellSky scans (none since Oct 27), schedulers verify shifts, and staff set the Primary with its Since date on client records.
