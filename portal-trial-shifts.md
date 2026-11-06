# For the portal chat: trial shifts (from the CRM, live once CRM PR #53 is merged)

**What the CRM does now**
- Staff can tick **"Trial shift"** on a caregiver they add to a client (Primary or Secondary). It comes with a trial date and time.
- The client gets the status **"Trial Shift Scheduled"**.
- From the day after the trial, the office is asked **"Was the trial successful?"** in the CRM:
  - **Yes:** the caregiver stays on the client.
  - **No:** the CRM takes the caregiver off the client, sets **"Recruitment/need to hire cg"**, and copies the Schedule into Posting Schedule if nothing is posted yet.

**What the portal receives**
- `crm-client-caregivers`: each client now has `trial_caregivers`, a list of caregivers on a trial waiting for its result:
  ```json
  "trial_caregivers": [{ "email": "ana@example.com", "name": "Ana Lopez", "role": "primary", "date": "2026-11-12", "time": "3:00 PM" }]
  ```
  An empty list means no trial is waiting.
- That caregiver is also in `primary_email` or `secondary_emails`, as before.

**Please change on the portal side**
1. **A caregiver in `trial_caregivers` isn't a placement yet.**
   - Show them to the family and the caregiver as a **trial**: the trial date and time.
   - Don't treat the client as matched or Active because of them.
   - The CRM already ignores "matched" / "shift started" → Active, and ignores closing the open shift, for these clients. Sending them is harmless, but please don't rely on them during a trial.
2. **When a trial is answered:**
   - **Yes:** the caregiver drops out of `trial_caregivers` and stays in `primary_email` / `secondary_emails`. Treat them as a normal match from then on. Send "shift started" when their regular shifts begin; that's what makes the client **Active**.
   - **No:** the caregiver disappears from the client completely, and the client has **"Recruitment/need to hire cg"**.
     - **Please re-check that client's schedule against the caregivers still on it, and post only the uncovered days and times.**
     - Send them back as `posting_schedule` (with the "unmatched" or "post on website" event), as you already do for partial matches.
3. **Trial shifts in the app:** if the portal books trial shifts itself, tell us and we'll accept a "trial booked" event too. The CRM would then tick "Trial shift" automatically.

The CRM's Testing mode works for this too. Tick "Trial shift" on Caregiver One for Elysse with yesterday's date; the question appears on CRM Notifications.
