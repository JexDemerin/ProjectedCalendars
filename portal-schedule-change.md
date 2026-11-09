# Message for the portal chat: Schedule change in the CRM

The CRM now has **Schedule change**. Staff change a child's schedule there, either for today or for a later date, and pick who covers each shift. The changes reach you in the `client-caregivers` push. Please handle them as described below.

## 1. What changes in the push
- **`recurring_schedule` / `specific_shifts`**
  - Still the schedule in effect now.
  - When a planned change's date comes, the CRM switches them over and pushes again.
- **`covered_shifts`**
  - The same format as before.
  - Now comes from Schedule change when staff set it there, otherwise from the Service Calendar.
- **Primary / Secondary**
  - Staff can add a caregiver to a child in Schedule change, for example one who already agreed to work the new schedule.
  - On save, that caregiver goes into Primary or Secondary, so they arrive in the push like any other match.
  - Please treat them as matched: no portal matching needed, and they show in the parents' My caregivers.
  - A caregiver staff take off comes off Primary / Secondary.
- **New: `upcoming_schedules`**, a list of schedule changes planned for later dates:
```json
"upcoming_schedules": [{
  "from": "2026-12-01",
  "recurring_schedule": { "Monday": [{ "start": "14:30", "end": "18:00" }] },
  "specific_shifts": [{ "date": "2026-12-24", "start": "10:00", "end": "14:00" }],
  "covered_shifts": [{ "day": "Monday", "start": "14:30", "end": "18:00", "caregiver_name": "Caregiver Two", "caregiver_email": "cg2@example.com" }],
  "caregivers": [{ "name": "Caregiver Two", "email": "cg2@example.com" }]
}]
```

## 2. Open shifts should follow the schedule
"Still needed" means every shift in the schedule that isn't in `covered_shifts`. When a push changes what's still needed for a child that has an open shift:
- **Nothing is still needed:** close the open shift as filled, and tell the caregivers in line that it's been filled.
- **Still-needed shifts changed:** update the open shift's days and times to match, and tell the caregivers in line about the new times. They keep their place.
- **Emergency (Urgent) shifts:** leave them alone.

For `upcoming_schedules`:
- If you can, show staff the upcoming still-needed shifts with their start date.
- Optionally, let staff post them early as an open shift that starts on `from`.

## 3. Please reply with
- When the open-shift updates in section 2 are live.
- Whether caregivers added through Schedule change show up as matched, with no portal matching needed.
