# CRM steps for the Incentive Program Testing Guide (New Client Welcome, 60 days)

**Roles**
- **Jexter:** CRM super admin. Turns Testing mode on in the Admin Portal and uses the test controls.
- **Ira:** scheduler for GGRC.
- **Angelica:** HR.
- **Caregiver One** (exampleinitial@gmail.com): the test caregiver.
- **Elysse Demerin (Dummy)** (UCI TEST-ELYSSE): the test client, GGRC.

**Before you start (one time)**
- **CRM PR #50 must be merged.** It adds the test controls and the 60-day wording.
- **PINs:** every CRM decision asks for the person's PIN.
  - Ira and Jexter already have one. **Angelica doesn't yet.**
  - To set it: CRM sidebar › click your name at the bottom (Account & password) › **Verification PIN** › set a PIN.
- **"Data is not fresh" banner:** the CRM shows this at the top of New Client Welcome while the last WellSky scan is older than 24 hours.
  - It's expected during testing, and it pauses the "Heads-up" cards (see section 6).
  - The test shifts in step 3 still count.

---

## 1. Testing mode and Reset

Testing mode and Reset are switched in the **Admin Portal**. The CRM follows them automatically, and there's no switch in the CRM.

- **Turn Testing on (Jexter, Admin Portal):** within a few seconds:
  - Every CRM page shows a yellow banner: **"Testing mode is on."**
  - CRM › **Clients › GGRC clients** lists **Elysse Demerin (Dummy)**, with "Test" in the Row column.
  - CRM › **Recruitment › Hired caregivers** lists **Caregiver One** to **Caregiver Six**.
- **Reset (Jexter, Admin Portal):** puts the test records back to their starting point, with no caregivers picked. It also clears all the **Incentives test data** for Elysse and Yassi:
  - qualifiers
  - matches, with their tasks and holds
  - Primary history
  - test shifts
- **Turn Testing off:** the test records disappear from the CRM lists. Their Incentives data is kept and comes back when Testing is turned on again.
  - Turning Testing off is **not** treated as Caregiver One being removed as Primary.
- **Starting a fresh test run:** press **Reset** first.
- **Kept after Reset:** the decision log and Notifications cards (by design).

## 2. Make Caregiver One the Primary, and accept her into New Client Welcome

**Ira** makes Caregiver One the Primary:
1. CRM › **Clients › GGRC clients** › click the row **Elysse Demerin (Dummy)**. A side panel opens, subtitled "Test record (Testing mode)…".
2. In **Assigned caregiver**, set **Primary caregiver** to **Caregiver One · exampleinitial@gmail.com**.
3. **Since** appears under the dropdown with today's date.
   - Optional: change it to an earlier date in Nov 1–20 (e.g. **Nov 2**). That lets the test add shifts from that date on and gives a bigger test bonus.
4. Click **Save changes**.

The CRM records the Primary and runs the daily check in the background, within a few seconds.

**Angelica (or Jexter)** checks the qualifier:
1. CRM › **Programs › Incentives** › **New Client Welcome** › promo button **Nov 1 – 20, 2026** (red count) › tab **Qualifiers**.
2. The row shows:
   - **Caregiver One · Elysse Demerin (Dummy)**
   - Primary since: the date from step 3
   - First shift: —
   - Qualifications: **✓ New to client**, **✓ Matched Nov 1–20**, **Not started yet**
   - Fit: **Qualified**

**Ira's view of the same row:** a pill, "Angelle, Angelica or a super admin decides". Schedulers can't accept.

**Angelica** accepts:
1. Click **Accept**.
2. A popup appears: "Accept Caregiver One?". It shows the caregiver, the client, Primary since, First shift "Not yet", the qualifications, and "Their 60 days start at the first verified shift."
3. Enter her PIN and click **Accept**.

The row then shows **Accepted · Angelica**, with an **Undo** button. On the **Matches** tab, Caregiver One appears at **2 · Accepted**, with Next: "First verified shift".

The CRM sends the portal her enrollment with status **`starting`**. The portal shows "You're in" and My incentives.

**Decline and Undo** need the PIN too. Decline also asks for a reason. Undo removes the match, and a new acceptance creates a **new match_id**.

## 3. Moving through each status without waiting 60 days

- **"Check now"** exists: New Client Welcome › top right › **Check now** (super admins, Jexter). It reruns the daily check at once. The test controls below do it on every change, so you rarely need it.
- **There's no "move the clock".** Instead, the **Test controls** let Jexter add made-up shifts that count like WellSky shifts.
- **Where the Test controls are:** Matches › click **Caregiver One** › match page › a yellow dashed box, **"Test controls"**. It's shown only to super admins, only in Testing mode, and only on Elysse and Yassi matches.
  - Each row has: Date (from Primary since to today), What happened, Hours, Tag, Verified, and **Add test shift**.
  - Each change updates the match page right away and is sent to the portal.

**Path A: starting → on_track → needs_fix → waiting → approved → paid**

| Portal status | Who | Steps in the CRM | What you see in the CRM |
|---|---|---|---|
| `starting` | (after section 2) | — | Match at **2 · Accepted**. Status **Active**. Next: "First verified shift". |
| `on_track` | Jexter | Test controls › Date = Primary since (or today) › **Completed** › Hours 3 › **Verified** ticked › **Add test shift**. Add a few more completed, verified shifts on later dates if you like. | The steps show **Day 1** done and **4 · 60 days** (Day 1 of 60). Status **Active**. "Why this amount" shows the hours and $. |
| `needs_fix` | Jexter | Test controls › **Cancelled by caregiver** › no tag › **Add test shift**. | Status **On hold**. "On hold until fixed" shows "Reason tag missing: add #sick, #leave, #pto or #noshow in the Activity Note", with a how-to line. Tasks › "On hold until fixed" lists it for **Ira**. |
| back to `on_track` | Jexter | On that shift, change the tag from "No tag" to **#sick** (or delete it). | Hold gone, status **Active**. |
| `waiting` | Ira | Clients › GGRC clients › Elysse › **Primary caregiver** = "Choose a caregiver" (empty) › **Save changes**. | Match status **Waiting · Task**. Tasks has **"Give the reason for removing the Primary"**, owned by **Ira**, with a Suggested box: "Not performance". |
|  | Ira | Tasks › that card › **Not performance** › PIN › confirm. | The task closes. A new task appears: **"Approve the bonus"** (Angelica). Status is still **Waiting**, with Next "Ready to approve". |
| `approved` | Angelica | Tab **Payroll** › "Waiting for approval" › **Approve $X** › tick **"No memo, warning or incident is on file"** › PIN › **Approve $X**. (The same button is on her Tasks card.) | Match **Approved**, step 5. Payroll lists it under the next pay day (e.g. **"Nov 13 payroll"**, or Nov 27 if you test after Nov 13), with **Export for payroll** and **Mark as released**. |
| `paid` | Angelica | Payroll › **Mark as released** › "Paid on the payroll of" = that pay day › PIN › **Mark as released**. (Also on the match page.) | Match **Released**, all 6 steps done. Payroll › **Released** table shows the amount, the payroll date and "Angelica". |

The amount in Path A is small, because the match ends early when Ira removes the Primary. It's Formula B: $100 × days with the client ÷ 60 × share of hours worked. That's expected.

**Path B: ended** (press **Reset**, then repeat section 2 and the on_track step). Use either of these:
- **Denied at approval:** at the `approved` step, Angelica clicks **Deny** instead, types a reason and enters her PIN. The match becomes **Denied**, the portal shows `ended` ("This bonus wasn't approved…"), and the amount is $0.
- **Removed for performance:** at the `waiting` step, Ira picks **Performance**, ticks "A memo, complaint or incident was on file", and enters her PIN. The match is **Denied** (`ended`, "removed for performance").

**Other things worth testing with the Test controls**
- **Misspelled tag:** add a "Cancelled by caregiver" shift with tag **#sicc** → hold **Tag "#sicc" not recognized: did you mean #sick?**.
- **Client cancellations:** add 2 or more **Cancelled by client** shifts with enough hours (over 25% of scheduled hours) → task **"Check the client's cancellations"** for Ira, with buttons **Mark as checked** / **Keep on hold**.
- **Unverified shift:** a **Completed** shift with Verified **unticked** doesn't count, and the match goes **On hold** ("Not verified yet", fix in the Service calendar). This is another way to get `needs_fix`. Tick **Verified** on that row to clear it.

## 4. Where Ira and Angelica monitor the program

Everything is under CRM › **Programs › Incentives › New Client Welcome**:
- **Promo buttons:** the red count is the qualifiers and tasks waiting.
- **Qualifiers:**
  - Who could join, with the qualifications and fit, plus the **Not qualified** list with reasons.
  - Angelica: **Accept** / **Decline** / **Undo**, and **Add someone** (also Angelle and super admins).
- **Matches:**
  - Tiles: Matches, Active, On hold, Waiting, Denied, Projected $.
  - Search box and status chips.
  - The table has: step bars, **Hours** (worked of scheduled), **Bonus**, **Status**, **Next** ("Waiting on <person> since <date>").
  - Click a name to open the **match page**:
    - the 6 steps
    - **Why this amount** (days, scheduled hours, removed shifts with reasons, worked, formula)
    - **On hold until fixed**, with where and how to fix
    - Open tasks
    - History (every decision with name and time)
    - Shifts (status colors, verified mark, tags, "Counts as")
- **Tasks:** cards sorted by priority.
  - Each card has: what happened, why it matters ($ and the next payroll), a **Suggested** box (confidence and evidence), and what happens if no one acts.
  - Buttons per task: Ira answers cancellation and removal tasks; Angelica answers everything. Every answer needs a PIN.
  - **Ask someone** (no PIN) and the "On hold until fixed" list.
- **Payroll** (Angelica and super admins only; Ira sees "Waiting for Angelica"):
  - **Approve $X** / **Deny** (PIN; approving needs the no-memo box).
  - Bonuses grouped by pay day, with **Export for payroll** (CSV) and **Mark as released** (PIN, pay day).
  - The Released list and the Not paid list.
- **Reports:**
  - Matches by outcome and $.
  - **Needs attention** (escalated or overdue tasks, approved but not released, old holds).
  - **Data to fix** (missing tags, unverified shifts, missing UCI, DOB or Primary, unmatched WellSky names).
  - Decisions by person.
  - Time to answer tasks.
- **Rules:** everyone can read the 60 days and every threshold; only super admins change them (PIN).
- **Guide:** step-by-step help.

**Fixing holds:** a hold is fixed where it happened: in WellSky (tags, punches) or the Service calendar (verification). In the test, use the Test controls instead.

**Approving and marking paid:** Angelica's buttons are **Approve $X** and **Mark as released**, on Payroll or the match page. There's no automatic approval.

## 5. When the CRM sends to `crm-incentives`

- **`incentives` is ON** in `portal_features` (switched on Nov 5).
- **The CRM sends after every daily check:**
  - the morning run, 5:30 am Pacific
  - **every decision** in New Client Welcome (accept, decline, undo, every task answer, approve, deny, release, Ask someone / reply)
  - every **client record save** (for example setting or removing a Primary)
  - **Check now**
  - every **Test controls** change
- **Only when something changed:** a full snapshot (`snapshot: true`), plus at least once a day.
- **match_id** stays the same for the life of a match. It only changes when an acceptance is undone and redone, or after **Reset**.
- **Which caregivers are sent:** only those with an email on Hired Caregivers. Caregiver One is sent as **exampleinitial@gmail.com**.

## 6. CRM notifications along the way (CRM sidebar › **Notifications**, Incentives cards)

**Cards you can trigger during the test**
- **Ask someone:** on any task, the owner clicks **Ask someone**, picks Angelica (or Ira), writes a note and clicks **Send**.
  - The other person gets the card **"Ira asked you · New Client Welcome"**, with an **Open ›** link.
  - They reply from the task, and the asker gets **"… replied"**.
  - **Take back** undoes the ask.
- **"Data is not fresh"** (Jexter and the other super admins): appears while the WellSky scan is old.

**Cards that need real time to pass, so they won't appear in a quick test**
- **Reminder (day 3):** goes to the task owner. For GGRC that's Ira; for RCEB it's Hana and Kim.
- **Escalated (day 5) and Overdue (day 7):** go to Angelica and the super admins.
- **"Payroll <date>":** goes to Angelica and the super admins, 3 business days before each pay day (e.g. Tue Nov 10 for Nov 13).
- **"Not released yet":** goes to Angelica and the super admins, after a pay day passes with an approved bonus not marked released.
- **Heads-up cards** (to Ira for GGRC): no first shift after 20 days, hours dropping, no-shows, verification backlog, client cancellations rising, pause running long. They're **paused while "Data is not fresh"**.
- **Monday "Tags to add this week":** goes to the region's schedulers.

**On the program screens instead of a card**
- The red counts on the promo and tabs.
- Tasks show **Escalated** or **Overdue** next to the due date.
