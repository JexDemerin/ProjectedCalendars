# For the portal chat: "Kindly Update Assigned Caregiver" when a trial shift is booked

**When:** a trial shift is booked or confirmed in the portal for a child, with a caregiver.

**What to show:** in the Admin Portal, show the admin who booked it, and every admin who opens that child, this popup:

> **Trial shift booked**
> {Caregiver name} · {Child name} · {MM/DD/YYYY} at {time}
> Please add this caregiver to the client in the CRM and tick **Trial shift**, so the office is asked afterwards whether the trial was successful.
> **[ Kindly Update Assigned Caregiver ]**   [ Later ]

- **The button** opens the CRM in a new tab, straight at the child's record, scrolled to **Assigned caregiver**:
  ```
  <CRM address>/clients/open?uci=<UCI>&focus=caregivers&note=<text>
  ```
  - `<CRM address>`: the CRM's web address, the same one you call for `/api/portal/…`.
  - `uci`: the child's UCI, for example `uci=2938471`.
  - `focus=caregivers`: always this value.
  - `note`: optional and URL-encoded. The CRM shows it at the top of the Assigned caregiver section. Example: `Portal: trial shift booked with Ana Lopez on 11/12/2026 at 3:00 PM. Add her as Primary or Secondary and tick Trial shift.`
  - The admin must be signed in to the CRM. If not, the CRM asks them to sign in first.
- **Keep reminding until it's done:** keep the popup or a badge on that child until the CRM's `crm-client-caregivers` push shows the caregiver in that child's `trial_caregivers`. That's how you know the admin did it.
- **[ Later]:** hides the popup for now. Show it again the next time an admin opens the child, or the next day.

**What the CRM does after the admin saves**
- The child gets **Trial Shift Scheduled**.
- The caregiver appears in `trial_caregivers` in the next `crm-client-caregivers` push, with email, name, role, date and time.
- The day after the trial, the CRM asks the office **"Was the trial successful?"**:
  - **Yes:** the caregiver drops out of `trial_caregivers` and stays on the child.
  - **No:** the caregiver is removed from the child. The child gets **Recruitment/need to hire cg**. **Please re-check the schedule and post only the uncovered days and times**, sent back as `posting_schedule`.
- **While a trial is waiting:** don't treat the child as matched or Active. The CRM ignores "matched" / "shift started" → Active for these children until the answer is Yes.

**Test:**
1. Turn Testing on and book a trial for Elysse (UCI `TEST-ELYSSE`) with Caregiver One.
2. The button should open `<CRM address>/clients/open?uci=TEST-ELYSSE&focus=caregivers`.
3. Add Caregiver One, tick **Trial shift**, set the date and save.
4. The next push has her in Elysse's `trial_caregivers`.
