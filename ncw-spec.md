# spec.md: New Client Welcome (NCW) Incentive Monitoring

(Jex's spec, received Nov 4, 2026. Mockup: https://claude.ai/artifact/CxZGFu63ENQjM7vrXiJDYD)

## 1. Goal
Automate the monitoring, calculation, task creation, and payment readiness of the New Client Welcome bonus at Together Homecare. All data comes from the WellSky scan and the CRM. People only act on tasks the system creates. Policy source of truth: the "New Client Welcome" tab in the "Caregiver Incentives Oct 2026" doc. If this spec and the policy disagree, the policy wins.

## 2. Program summary
- Promotion window: 2026-11-01 to 2026-11-20, inclusive, America/Los_Angeles.
- Reward: up to $100 per qualifying new primary pairing (caregiver + client).
- Measurement period: 90 days from Day 1 (the caregiver's first completed, verified shift with the client).
- Paid as a separate pay stub line labeled "New Client Welcome".

## 3. Data sources
| Source | Fields used |
|---|---|
| WellSky scan -> CRM Service calendar | shift_id (WellSky visit ID), client_id, caregiver_id, start, end, scheduled_hours, status, verification, tags (parsed from the agreed notes field), last_modified |
| CRM Client | client_id, name, date_of_birth, uci_number, primary_caregiver_id, secondary_caregiver_id |
| CRM Caregiver | caregiver_id, hire_date, employment_status |
| Portal | memos and warnings (caregiver_id, incident_date, issued_date), client complaints, incident reports (id, caregiver_id, client_id, date) |
| HR leave records | caregiver_id, date, leave_type |

## 4. Config
```yaml
ncw:
  window_start: 2026-11-01
  window_end: 2026-11-20
  timezone: America/Los_Angeles
  reward_max: 100
  period_days: 90
  start_deadline_days: 30
  pto_shift_cap: 5
  pause_threshold_days: 14
  pause_return_days: 30
  replacement_check_min_days: 30
  replacement_threshold: 0.50
  cancellation_review_threshold: 0.25
  rotation_window_days: 14
  verification_pending_days: 3
  auto_enroll_days: 7
  payment_hold_days: 7
  escalation_days: {remind: 3, scheduling_manager: 5, management: 7}
  rounding: half_up
```

## 5. Shift status mapping
| Status | Scheduled hours | Hours worked | Action |
|---|---|---|---|
| Completed | counted | counted only if verification = Verified | none |
| Missed clock-in/out | held | held | task UPDATE_SHIFT |
| In progress | ignored until final | ignored | none |
| Scheduled | counted | no | if end < now: task UPDATE_SHIFT |
| Open shift | not the caregiver's | no | counts as hours picked up in the replacement check |
| Cancelled by client | removed | no | counts toward cancellation review |
| Cancelled by office | removed | no | none |
| Cancelled by caregiver | depends on tag (section 6) | no | no tag: task MISSED_SHIFT_REASON, hold |
| Needs a look | held | held | task NEEDS_LOOK |
| Tentative/Not scheduled, Pending confirmation | excluded | excluded | none |

Verification: Verified = counts. Not verified = task VERIFY_SHIFT. Pending (with the parent) longer than 3 days = task VERIFY_SHIFT. Parent messaged the office = task PARENT_MESSAGE. Held shifts block payment until resolved.

## 6. Tags
- Parsed from the agreed WellSky notes field. Exact lowercase match.
- Valid: #sub #trial #sick #leave #pto #reassign #pause #urgent
- Any token starting with "#" that is not valid: task INVALID_TAG.
- #sub: substitute shift. Never counts as primary hours. Counts as hours picked up.
- #trial: trial shift. Used in end resolution.
- #sick, #leave: on Cancelled by caregiver. Always removed from scheduled hours.
- #pto: on Cancelled by caregiver. Removed for the first 5 #pto shifts in the period (by date). Later ones stay in.
- #reassign: on the caregiver's last shift. Needs HR approval. Safety reason needs an incident report.
- #pause: on the caregiver's last shift before a client pause.
- #urgent: not used by NCW (Emergency Shift Hero).

## 7. Data model
```
primary_history(client_id, caregiver_id, role[primary|secondary], set_date, removed_date, removal_reason[performance|not_performance|null], evidence_id)
client_identity(canonical_client_id, client_ids[], match_basis[uci|name_dob], confirmed_by)
ncw_pairing(pairing_id, caregiver_id, canonical_client_id, primary_set_date, day1, day90, last_day,
            paused_days, days_with_client, sched_hours, removed_hours, adj_sched_hours, worked_hours,
            formula[A|B|null], amount, status, end_reason, flags[], payroll_date, approved_by)
ncw_task(task_id, pairing_id, shift_id, type, assignee_role, recommended_action, created_at,
         escalation_stage, status, resolved_by, resolution, reason, evidence_id)
ncw_audit_log(id, pairing_id, action, actor, reason, evidence_id, timestamp)
```

## 8. Daily job
1. Ingest the latest WellSky scan into the CRM Service calendar.
2. Snapshot CRM Primary and Secondary fields. Diff against primary_history and record every change with today's date.
3. Detect new pairings (section 9).
4. Recalculate every active pairing (sections 10 and 12).
5. Detect early ends and run end resolution (section 11).
6. Create, remind, and escalate tasks (sections 14 and 15).
7. Move pairings to READY_TO_PAY when conditions are met (section 13).
8. Send notifications and refresh reports (section 17).

## 9. New pairing detection and eligibility
```
on primary_set(caregiver, client, set_date):          # from primary_history diff
  if not (window_start <= set_date <= window_end): return
  cid = canonical(client)                              # match by uci_number, else name + date_of_birth
  if possible_match(client) and not confirmed: task POSSIBLE_DUPLICATE (hold)
  if any shift (any status except Tentative/Pending confirmation) for caregiver + cid before set_date: return   # not new
  if caregiver ever in primary_history or secondary for cid before set_date: return                          # not new
  create ncw_pairing(status = SUGGESTED); task ENROLLMENT_SUGGESTION
  prev = previous primary of cid
  if prev.employed and prev became primary for another client within 14 days of set_date:
      flag ROTATION; task ROTATION_REVIEW (hold)
  if caregiver has another ncw_pairing in SUGGESTED/ENROLLED/ACTIVE: task SECOND_CLIENT_APPROVAL (hold)

day1 = date of first Completed + Verified shift for caregiver + cid on or after set_date
if day1 is null and today > set_date + 30: DENIED(reason = NO_START)
if day1 > set_date + 30: DENIED(reason = LATE_START)
day90 = day1 + 89
```
Manual enrollment: actor + reason required. Run every check. If any check fails, task HR_APPROVAL_MANUAL (hold). Rejecting a suggestion: actor + reason required, task HR_APPROVAL_REJECTION. Actor cannot approve.

## 10. Calculation
```
removed_date = primary_history.removed_date for caregiver + cid (if any)
last_day = min(last Completed + Verified shift date, removed_date, day90)
paused_days = sum of pause intervals in [day1, last_day]
    pause interval = days from the #pause shift to the next completed shift with cid
days_with_client = (last_day - day1).days + 1 - (paused_days if paused_days > 14 else 0)

shifts = caregiver's shifts with cid where day1 <= shift_date <= last_day
sched_hours = sum(hours of shifts with status in [Completed, Scheduled, Missed clock-in/out,
                  Cancelled by client, Cancelled by office, Cancelled by caregiver])
removed = Cancelled by client + Cancelled by office
        + Cancelled by caregiver tagged #sick or #leave
        + first 5 (by date) Cancelled by caregiver tagged #pto
adj_sched = sched_hours - removed
worked = sum(hours of Completed + Verified shifts)

if adj_sched == 0: amount = 0; flag ZERO_SCHEDULE (management review)
ratio = min(worked / adj_sched, 1)
Formula A: amount = round_half_up(100 * ratio)
Formula B: amount = round_half_up(100 * (days_with_client / 90) * ratio)
amount = min(amount, 100)
Formula B is used when the pairing ends early (section 11) or paused_days > 14.

cancellation review: if Cancelled by client hours / sched_hours > 0.25: flag; task CANCELLATION_REVIEW (hold)
```

## 11. End resolution
Trigger: no Completed shift for caregiver + cid for 7 days before day90, or caregiver removed from the Primary field before day90. Apply the first rule that matches:
```
1. memo or warning with incident_date in [day1, day90]          -> $0 (MEMO)
2. last completed shift tagged #trial and no later completed shift -> $0 (TRIAL)
3. removed from Primary field:
     task REMOVAL_REASON (hold) for management
     if reason == performance and portal record (memo, complaint, incident) dated < removed_date -> $0 (PERFORMANCE)
     else -> Formula B, task HR_APPROVAL (NOT_PERFORMANCE)
     performance without a record is treated as not_performance
4. last shift tagged #reassign -> task HR_APPROVAL (safety needs incident report) -> Formula B (REASSIGN)
5. #pause on last shift and client returns within 30 days with same caregiver -> continue counting
   #pause and no return within 30 days -> continue to rule 6
6. replacement check on check_date = max(last_completed + 30, day90):
     if caregiver resumed Completed shifts with cid before check_date -> continue counting
     baseline_others = avg weekly hours of cid's shifts with other caregivers in [day1, last_day]
     cg_avg = caregiver's avg weekly scheduled hours with cid in [day1, last_day]
     for each full week w in (last_day, check_date]:
         others_w = hours of cid's shifts with other caregivers (any status except cancelled, incl. #sub)
                    + hours of cid's Open shift shifts
         if others_w - baseline_others >= 0.50 * cg_avg: -> $0 (REPLACED)
     else -> Formula B (CLIENT_ENDED), task MANAGEMENT_APPROVAL
```
At day90 with no early end: also apply rule 1 at payment time (memo issued after day90 for an incident in the period still denies).

## 12. Pauses
- Pause starts at a shift tagged #pause and ends at the next completed shift with the same client.
- Total paused days <= 14: no effect.
- Total paused days > 14: subtract all paused days from days_with_client and use Formula B.
- No return within 30 days: treat as an early end at the #pause shift (section 11).

## 13. States
```
SUGGESTED -> ENROLLED (admin confirms, or 7 days with no rejection)
SUGGESTED -> REJECTION_PENDING_HR -> REJECTED (HR approves) | ENROLLED (HR denies)
ENROLLED -> ACTIVE (day1 set) | DENIED (NO_START, LATE_START)
ACTIVE <-> PENDING (any open blocking task)
ACTIVE -> COMPLETE_90 (day90 passed) -> READY_TO_PAY (after day90 + 7, all verified, no open tasks)
ACTIVE -> ENDED_EARLY -> AWAITING_CHECK -> READY_TO_PAY (Formula B, approved) | DENIED (reason)
READY_TO_PAY -> APPROVED (HR, approver != actor) -> PAID (payroll_date)
```
Payroll date: COMPLETE_90 = first regular payroll on or after day90 + 7. Formula B = next regular payroll after approval.

## 14. Tasks
| Type | Trigger | Assignee | Recommended action (pre-filled) | Blocks payment |
|---|---|---|---|---|
| SET_PRIMARY | new pairing, Primary field empty | management | suggest caregiver with most hours | yes |
| MISSED_SHIFT_REASON | Cancelled by caregiver, no tag | scheduler | suggest #sick/#leave/#pto from HR leave records, else unexcused | yes |
| UPDATE_SHIFT | past Scheduled, or Missed clock-in/out | scheduler | fix punch or mark no-show | yes |
| VERIFY_SHIFT | Not verified, or pending with parent > 3 days | admin | verify or reject | yes |
| PARENT_MESSAGE | Parent messaged the office | scheduler | read and resolve | yes |
| NEEDS_LOOK | status Needs a look | scheduler | resolve | yes |
| INVALID_TAG | unknown #tag | scheduler | suggest closest valid tag | yes |
| POSSIBLE_DUPLICATE | UCI or name + DOB match | scheduling manager | confirm same client or not | yes |
| ENROLLMENT_SUGGESTION | new pairing passes checks | admin | confirm (auto after 7 days) | no |
| HR_APPROVAL_MANUAL | manual enrollment fails a check | HR | approve or deny with reason | yes |
| HR_APPROVAL_REJECTION | admin rejected a suggestion | HR | approve or deny | yes |
| ROTATION_REVIEW | rotation detected | management | approve or reject with reason | yes |
| SECOND_CLIENT_APPROVAL | second or later new pairing | management | approve or reject with reason | yes |
| REMOVAL_REASON | removed from Primary field | management | choose reason; performance needs evidence_id | yes |
| CANCELLATION_REVIEW | client cancellations > 25% | management | confirm with family | yes |
| HR_APPROVAL | #reassign, not-performance removal | HR | approve with reason or evidence | yes |
| MANAGEMENT_APPROVAL | Formula B result | management | approve amount | yes |
| READY_TO_PAY | all conditions met | HR | approve amount | n/a |

## 15. Escalation
- Day 0: task created and shown on the shift in the CRM Service calendar, with an "NCW" tag and the recommended action.
- Day 3: reminder to assignee.
- Day 5: escalate to scheduling manager.
- Day 7: escalate to management; pairing flagged OVERDUE in reports.
- Pending more than two payroll cycles after the qualifying period: alert management (Shared rules).
- Defaults when no one acts: never pay an unverified bonus, never reduce a bonus on a guess. Hold and escalate. Exceptions: ENROLLMENT_SUGGESTION auto-confirms after 7 days; the replacement check result stands if no #reassign or removal reason is set.

## 16. Safeguards for human input
- Every manual action requires actor and reason, and is written to ncw_audit_log.
- Maker-checker: the approver cannot be the actor. No one approves a decision about themselves or a family member (needs a relationship list; open item).
- Removal for performance requires evidence_id pointing to a portal record dated before removed_date.
- #reassign for safety requires an incident report evidence_id.
- Notify the caregiver in writing of any decision that lowers or removes their bonus, with a link to dispute (HR answers within 10 business days).

## 17. Outputs and reports
- CRM Service calendar: "NCW" tag and task badge on affected shifts.
- Pairing dashboard: caregiver, client, set date, day1, day90, days with client, hours, projected amount, status, open tasks.
- Payroll export: caregiver_id, amount, label "New Client Welcome", payroll_date, approved_by.
- Monthly manual decisions report: every manual action grouped by actor.
- Exceptions report: OVERDUE, cancellation review, rotation, duplicates, pending > 2 payroll cycles.

## 18. Test cases (Day 1 = 2026-11-10 unless noted)
| Case | Setup | Expected |
|---|---|---|
| Sam | 90 days, worked 90 of 96 adjusted hours | Formula A, $94 |
| Lee | 90 days, 8 hours #sick removed, worked 100 of 100 | $100 |
| Jo | 90 days, 8 #pto shifts of 4 hours, first 5 removed, worked 68 of 80 | $85 |
| Ana | client ends, last shift day 50, no pickup, worked 36 of 48 | Formula B, $42 |
| Mia | 90 days, pauses total 20 days, worked 80 of 80 | Formula B, 70 days, $78 |
| Kai | removed from Primary day 45, not performance, worked 40 of 40 | Formula B, $50 |
| Rosa | family stops after #trial shift on day 2 | $0 TRIAL |
| Ben | leaves day 60, new caregiver takes same hours | $0 REPLACED |
| Tom | incident day 88, memo issued day 93 | $0 MEMO |
| Late start | primary set 2026-11-05, first completed shift 2026-12-08 | DENIED LATE_START |
| Prior #sub | caregiver had a #sub shift with client in 2025 | not a new pairing |
| Duplicate | new client record shares UCI with an old client the caregiver served | not a new pairing |
| Rotation | two caregivers trade clients within 14 days | ROTATION_REVIEW, hold |
| Performance, no record | removed for performance, no portal record | treated as not performance, Formula B |
| Unknown cancel | Cancelled by caregiver, no tag | MISSED_SHIFT_REASON task, PENDING |

## 19. Ownership: who does what
Every task is assigned to a named person, not just a role. The tool always shows one owner and one next action per pending bonus.

Routing rules (first match wins):
1. Conflict check: never route to the actor who created the item, the caregiver themselves, or anyone on the caregiver's family relationship list. Skip to the next eligible person.
2. Owner of the client: if the task is about a shift or client, route to client.assigned_scheduler (CRM).
3. Owner of the action: if a person caused the item (removed a Primary, rejected a suggestion, added #reassign), route the approval to the approver role, never back to that person.
4. Out of office: if the person is marked out of office or inactive, route to their named backup.
5. Fallback: round-robin among active users with the role, lowest open-task count first.

RACI per task type:
| Task | Responsible (does it) | Approver | Informed |
|---|---|---|---|
| SET_PRIMARY | management | none | client's scheduler |
| MISSED_SHIFT_REASON | client's scheduler | none | HR if #sick/#leave |
| UPDATE_SHIFT | client's scheduler | none | scheduling manager at Day 5 |
| VERIFY_SHIFT | admin | none | client's scheduler |
| PARENT_MESSAGE | client's scheduler | none | scheduling manager |
| NEEDS_LOOK | client's scheduler | none | scheduling manager |
| INVALID_TAG | person who typed the tag (from WellSky edit log), else client's scheduler | none | none |
| POSSIBLE_DUPLICATE | scheduling manager | none | admin |
| ENROLLMENT_SUGGESTION | admin | HR (only if rejected) | caregiver (on enrollment) |
| HR_APPROVAL_MANUAL | HR | none | admin who enrolled |
| ROTATION_REVIEW | management | none | both schedulers involved |
| SECOND_CLIENT_APPROVAL | management | none | client's scheduler, caregiver |
| REMOVAL_REASON | management (person who removed the Primary) | HR | caregiver if bonus lowered |
| CANCELLATION_REVIEW | client's scheduler (calls family) | management | none |
| HR_APPROVAL | HR | none | management |
| MANAGEMENT_APPROVAL | management | HR | caregiver |
| READY_TO_PAY | HR | none | payroll |

"Next action" field: every pairing that is not PAID or DENIED shows
  next_action: "<verb> <object>" (for example "Tag shift #48213 with a reason")
  owner: <person name>
  due: <date>
  blocking: yes/no (does it delay payment?)
  waiting_since: <date>

## 20. Smart recommendations
Every task card shows, in plain language:
- What happened (one sentence).
- Why it matters: the dollar impact on the bonus and the payroll it could miss.
- Recommended action, with a confidence level (High, Medium, Low) and the evidence behind it.
- One-click buttons: Accept recommendation, Choose another option, Ask someone (reassign with a note).
- What happens if no one acts (from section 15).
Recommendations are never applied automatically. A person always clicks. Accepting or overriding is logged.

How each recommendation is made:
| Task | Evidence checked | Recommendation logic |
|---|---|---|
| MISSED_SHIFT_REASON | HR leave records, caregiver call-out notes in the portal, sick leave balance, how much notice was given | Leave record for that date: High, suggest #sick/#leave/#pto to match. Call-out note mentioning illness and sick balance available: Medium, suggest #sick. No record and no call-out: Medium, suggest unexcused (no-call/no-show). |
| UPDATE_SHIFT (missed punch) | partial EVV punch, parent verification, notes, caregiver's next shift | Parent verified or one punch exists: High, "Worked, fix the punch". No punch, no verification, no contact: Medium, "Mark as no-show". |
| VERIFY_SHIFT | EVV complete, punch location, open complaints | Complete EVV and no complaint: High, "Verify". Anything missing: Low, "Call the family". |
| POSSIBLE_DUPLICATE | UCI, name, date of birth, address | Same UCI: High, "Same client". Same name and DOB only: Medium. |
| REMOVAL_REASON | portal records before the removal date | Record exists: show it, suggest "Performance". No record: High, suggest "Not performance" and explain that performance cannot be selected without a record. |
| ROTATION_REVIEW | both pairings, who assigned them, dates, client requests | Same scheduler assigned both within 3 days and no client request on file: suggest Reject. Client requested a change: suggest Approve. |
| SECOND_CLIENT_APPROVAL | caregiver's weekly hours, overtime risk, attendance on first pairing | Combined hours would go into overtime, or first pairing below 90%: suggest Reject or delay. Otherwise suggest Approve. |
| CANCELLATION_REVIEW | the client's cancellation history before the pairing | Client cancelled at a similar rate before this caregiver: suggest Approve. Rate jumped after this caregiver started: suggest "Call the family". |
| SET_PRIMARY | hours worked with the client in the last 4 weeks | Suggest the caregiver with the most non-#sub hours. |
| INVALID_TAG | closest valid tag by spelling | "#Sub" or "#sicc": High, suggest the valid tag. |
| Replacement result | the weekly numbers used in the check | Show the calculation so the approver can see why it says replaced or ended. |

## 21. Proactive alerts (warn before it becomes a problem)
The daily job also runs these checks on every active pairing and sends a heads-up to the owner:
| Alert | When | Owner | Suggested action |
|---|---|---|---|
| First shift not scheduled | 20 days after set_date, no completed shift and none scheduled in the next 10 days | client's scheduler | Schedule the first shift before day 30 |
| Bonus dropping | hours ratio falls below 85% | client's scheduler | Check in with the caregiver about missed shifts |
| Attendance pattern | 2 or more unexcused missed shifts in 14 days | client's scheduler, informed: scheduling manager | Talk to the caregiver before it becomes a memo |
| Verification backlog | 3 or more shifts waiting verification for one pairing | admin | Verify or call the family |
| Day 90 coming with open tasks | 7 days before day90 and any blocking task open | each task owner | Close tasks now so payment is not delayed |
| Cancellations rising | client cancellations reach 20% of scheduled hours | client's scheduler | Call the family before the 25% review triggers |
| Pause running long | a pause reaches 21 days with no return scheduled | client's scheduler | Confirm with the family whether the client is returning |
| Primary field mismatch | the CRM Primary has worked under 25% of the client's hours for 4 weeks | management | Confirm who is the primary |
| Missed enrollment | a pairing looks eligible but no suggestion exists (for example, data arrived late) | admin | Review and enroll manually |
| Payroll cutoff | 3 business days before each payroll cutoff | HR, payroll | Review the list of bonuses that will be paid and the ones that will miss, with the owner of each blocker |
| Pending too long | a bonus has been PENDING for one payroll cycle | management | Clear it before it hits the two-cycle rule |
| Stale data | no new WellSky scan in 24 hours | admin | Check the scanner; all alerts are paused until data is fresh |

## 22. Daily briefings
Each user gets one message a day (portal and email), not one notification per task:
- Scheduler: "Your NCW tasks today", sorted by priority, with the one-click actions inline, and any heads-up alerts for their clients.
- Scheduling manager: team view of overdue tasks by person, and escalations that reached them.
- Admin: verifications, duplicates, enrollment suggestions.
- HR: approvals waiting, and bonuses ready to pay before the next cutoff.
- Management (weekly): enrolled, active, at risk, ended, paid to date, projected total payout, overdue tasks by person, overrides of recommendations by person.
- Payroll (before each cutoff): approved bonuses with amounts, in the payroll export format.

## 23. Priority score
Tasks and alerts are sorted by:
  priority = 40 * blocks_next_payroll + 25 * (amount_at_stake / 100) + 20 * escalation_stage / 3 + 15 * min(age_days / 7, 1)
Ties go to the oldest. The score is shown so people can see why something is on top.

## 24. Explainability
- Every amount has a "Why this amount" panel: days, scheduled hours, each removed shift with its reason, worked hours, formula used, and the result.
- Every PENDING status shows "Waiting on <person> to <action> since <date>".
- Every $0 result shows the rule from section 11 that caused it and the evidence.

## 25. Learning from decisions
- Track how often each recommendation type is accepted or overridden, by person.
- If a recommendation type is overridden more than 30% of the time over a month, flag it to management for review (the rule or threshold may need changing).
- If one person overrides much more often than others for the same task type, show it in the monthly manual decisions report.
- Thresholds stay in config (section 4) so management can adjust them without code changes.

## 26. Program health dashboard
- Pairings by status, at-risk pairings, projected payout versus budget.
- Average time to resolve each task type, by person.
- Number of escalations reaching management per week.
- Data quality: shifts with missing status, untagged caregiver cancellations, empty Primary fields, clients without UCI or DOB.

## 27. Open items
- Confirm the WellSky field that holds tags, and that the scanner captures cancelled shifts and verification status.
- Add uci_number or date_of_birth to every CRM client record.
- Family relationship list for the conflict-of-interest check.
- Notification channel for caregivers (portal, SMS, or both).
- A user roster in the CRM with each person's role, named backup, and out-of-office status (needed for routing in section 19).
- client.assigned_scheduler on every CRM client record.
- Access to the WellSky edit log, so INVALID_TAG can be routed to the person who typed the tag.
- Thresholds in sections 21 and 23 (85%, 20%, 21 days, priority weights) to be confirmed by management.
