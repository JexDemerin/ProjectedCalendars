# Message for the portal chat: schedules connected to the CRM

The CRM now controls each child's schedule. Managers edit it in the CRM, and it arrives in the `client-caregivers` push you already get. Please build the following.

## 1. New fields on each client in the client-caregivers push
```json
"recurring_schedule": { "Monday": [{ "start": "15:00", "end": "18:00" }], "Saturday": [{ "start": "09:00", "end": "13:00" }] },
"specific_shifts": [{ "date": "2026-11-26", "start": "10:00", "end": "14:00" }],
"schedule_other": ["every other weekend, ask mom"],
"care_type": "",
"notes_for_caregivers": "Calm, patient caregiver preferred."
```
- Times are 24-hour "HH:MM" and dates are YYYY-MM-DD.
- `schedule_other` holds old free-text lines the CRM couldn't read. Show them as notes, or ignore them.
- `care_type` is "" when it's Not specified.

## 2. Post open shift popup
- Show the child's **Recurring Schedule**, **Specific Shifts**, **Care type** and **Notes for caregivers** from the CRM fields above.
- The CRM is the source. Edits made there show up here.

## 3. Specific shifts are date + start time + end time
- Use the same input as the CRM: a date picker, a start time and an end time, with + to add rows.
- Use it everywhere the portal asks for a one-time shift.

## 4. Public and exclusive open shifts at the same time
- A child can have a **public** open shift (posted to the website) and an **exclusive** one (offered only to chosen caregivers) at once.
- "Open a shift" must still list children who already have an open shift, so more of their schedule can be added.
- In that form, days already covered show as filled boxes in **mint green at 25% opacity**.
- Shifts posted from the portal itself are **exclusive** (purple tag).
- Example: weekdays covered by caregivers, Saturday posted publicly, Sunday offered exclusively.

## 5. Emergency Shift (portal only)
- For a sudden absence on a recurring shift. It's a one-time offer.
- Steps: pick the child, then pick the date and the start and end time.
- It's posted in the portal only, with a **pastel orange "Urgent" tag** (like the purple exclusive tag).

## 6. "Hide from" on each open shift
- Add **Hide from** on the row with On hold / Close shift. It picks caregivers who shouldn't see **that** shift.
- The existing "Hide from caregivers" still hides all open shifts from someone.

## 7. Send us coverage and your care types list (new CRM endpoint)
`POST https://togetherhomecare-crm.vercel.app/api/portal/coverage`, with the same `x-crm-secret` header as client-status.
```json
{
  "care_types": ["…your Care type options, in order…"],
  "clients": [{
    "uci": "1234567",
    "coverage": {
      "shifts": [
        { "label": "Mon 3–6pm", "covered_by": 0 },
        { "label": "Sat 9am–1pm", "covered_by": null },
        { "label": "Thu Nov 26, 10am–2pm (Thanksgiving)", "specific": true, "covered_by": 0 }
      ],
      "caregivers": [
        { "name": "Caregiver Two", "email": "cg2@example.com", "status": "Matched", "summary": "Mon 3–6pm · Thu Nov 26, 10am–2pm · 3 h/week" },
        { "name": "Caregiver Four", "status": "Matched" }
      ],
      "open_shift": "Saturday: 9:00 AM – 1:00 PM"
    }
  }]
}
```
- `covered_by` is the index into `caregivers`, or `null` for "Still needed". This mirrors your "Who covers what?" grid.
- A caregiver who covers nothing shows as "No days · backup".
- `open_shift` is what the open shift contains: the schedule minus what's covered.
- Send coverage whenever "Who covers what?" changes. `coverage: null` clears a child.
- Send `care_types` once, and again whenever the list changes. The CRM's Care type box uses it.
- The CRM shows coverage read-only, under "See coverage". Coverage is only changed in the portal.

## 8. Trials
- Keep sending `trial_caregivers` / the "trial booked" event as you do now.
- When staff set a trial by hand in the CRM and the child has an open shift, the CRM tells the office to put that child's open shifts on hold in the portal. Nothing for you to build for that.
- **Please reply with the web address of the portal's Open shifts page.** The CRM card's button links to it.
