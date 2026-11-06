# For the portal chat: "My incentives" for caregivers

The CRM now runs the caregiver Incentives programs. The first one is **New Client Welcome**: a caregiver earns up to $100 for becoming a new client's Primary caregiver and keeping it up for 60 days. Please add a caregiver-side **"My incentives"** menu to the portal. The CRM sends all the data; the portal only stores it and shows it.

## What to build
1. **A sidebar item, "My incentives",** on the caregiver side only. Show it only to caregivers who have at least one enrollment in the latest data from the CRM.
2. **The "My incentives" page** lists the programs the caregiver is in, each with its **name and icon** (New Client Welcome, icon `home`, a house). Show the number of active matches and the amount earned so far.
3. **Clicking a program opens the program page:**
   - **Each enrollment (match) as a card:**
     - The client name, which the CRM already sends as first name and last initial.
     - The promo, and a status badge from `status_text`.
     - A progress bar of the steps (`steps`, current = `step`), and "Day `day` of `days_total`".
     - Earnings: "$`earned_so_far` of $`max` so far". Once `amount_final` is true, show "$X approved". Once `paid_amount` is set, show "Paid $X on `paid_on`".
     - Hours: `hours_worked` of `hours_scheduled` scheduled hours worked.
     - The **"What's next"** line from `next`, highlighted when `status` is `needs_fix`.
     - "Expected pay day: `expected_pay_day`" when it's set.
     - A small note while the amount isn't final: "This is an estimate until HR approves it."
   - **"How it works":** the `how_it_works` list, numbered.
   - **"How to stay in the program":** the `rules` list, as reminders.
4. **Show the texts exactly as sent.** The CRM builds them from the promo's rules (amount, number of days, limits), so they stay correct when management changes a rule.
5. **Design:** match the portal's style, mobile first. Status colors:
   - `on_track` and `approved`: green.
   - `paid`: neutral/done.
   - `needs_fix`: amber.
   - `starting` and `waiting`: blue or neutral.
   - `ended`: grey. The bonus is $0 and the reason is in `next`.

## The endpoint (CRM → portal)
- Please create the edge function **`crm-incentives`**, the same pattern as `crm-client-status` and `crm-work-record`:
  - `POST`, JSON body, header **`x-crm-secret`** = the shared `CRM_VERIFY_SECRET`.
  - Reject the call if the secret doesn't match.
  - Reply `{ "ok": true }`, or `{ "ok": false, "error": "…" }`.
- **It's a full snapshot every time** (`snapshot: true`). Replace everything you have with what's sent:
  - A caregiver who isn't in the list has no enrollments (hide the menu for them).
  - The CRM sends after every daily run and after decisions, but only when something changed.
- **Match caregivers by `email`** (lowercase) to their portal account. Ignore an email with no portal account, and say how many were ignored in the reply, for example `{ "ok": true, "unknown_emails": 2 }`.
- **Privacy:** a caregiver must only ever see their own enrollments. Store them per caregiver and protect them with RLS.

### Body
```json
{
  "snapshot": true,
  "as_of": "2026-12-09",
  "programs": [
    {
      "program_id": "ncw",
      "name": "New Client Welcome",
      "icon": "home",
      "summary": "Earn up to $100 when you become a new client's Primary caregiver and keep it up for 60 days.",
      "how_it_works": ["You become a new client's Primary caregiver during the promo dates, and the office accepts you into the program.", "…"],
      "rules": ["Do your first shift with the client within 30 days of becoming their Primary.", "…"]
    }
  ],
  "caregivers": [
    {
      "email": "two.test@example.com",
      "name": "Caregiver Two",
      "enrollments": [
        {
          "program_id": "ncw",
          "match_id": 12,
          "promo": "Nov 1 – 20, 2026",
          "client_name": "Elysse D.",
          "steps": ["Accepted", "Day 1", "60 days", "Approved", "Paid"],
          "step": 3,
          "status": "on_track",
          "status_text": "On track",
          "next": "Keep working your scheduled shifts. Day 60 is Jan 8.",
          "day": 30,
          "days_total": 60,
          "day1": "2026-11-10",
          "day90": "2027-01-08",
          "earned_so_far": 92,
          "amount_final": false,
          "max": 100,
          "hours_worked": 46,
          "hours_scheduled": 50,
          "expected_pay_day": "2027-01-22",
          "paid_amount": null,
          "paid_on": null
        }
      ]
    }
  ]
}
```

### Field notes
- **`status`** is one of:
  - `starting`: accepted, waiting for the first verified shift
  - `on_track`
  - `needs_fix`: a shift needs attention, and `next` says what to do
  - `waiting`: the office is checking
  - `approved`
  - `paid`
  - `ended`: no bonus, and `next` says why
- **`step`** is 1-based into `steps`.
- **`day`** is `null` before Day 1.
- **Amounts** are whole dollars.
- **Dates** are `YYYY-MM-DD`.
- **`program_id`** links an enrollment to its entry in `programs`. More programs will come later with their own `program_id`, name and icon, so don't hard-code New Client Welcome.

## When it's ready
Tell us when `crm-incentives` is deployed. The CRM switches it on by adding `incentives` to the `portal_features` table, the same switch as the other CRM features. Until then the CRM sends nothing.

To test, turn on Testing mode: the test caregivers (Caregiver One, exampleinitial@gmail.com; Caregiver Two, two.test@example.com) will show up once they're accepted into New Client Welcome in the CRM.
