# Message for the portal chat: enroll families from the CRM (pre-approved profiles)

The CRM now has **Enroll to portal** on each client record, like the one on caregivers. Please add the endpoint it calls. Until you tell us it's live, the button says it isn't on yet.

## 1. New endpoint: `POST crm-enroll-parent`
- Use the same `x-crm-secret` header as `crm-enroll-caregiver`.
- Reply `{ "ok": true, "status": "created" | "already_enrolled", "accounts": [{ "email", "status", "user_id" }] }`.

```json
{
  "uci": "1234567",
  "region": "RCEB",
  "child": { "name": "Ana Lopez", "first_name": "Ana", "dob": "2018-04-02", "address": "1 Main St, Fremont, CA 94536" },
  "parents": [
    { "role": "mom", "name": "Maria Lopez", "first_name": "Maria", "email": "maria@example.com", "phone": "5105550100" },
    { "role": "dad", "name": "Jose Lopez", "first_name": "Jose", "email": "jose@example.com", "phone": "5105550101" }
  ],
  "other_contacts": [],
  "schedule": {
    "recurring_schedule": { "Monday": [{ "start": "15:00", "end": "18:00" }] },
    "specific_shifts": [{ "date": "2026-11-26", "start": "10:00", "end": "14:00" }],
    "schedule_other": []
  },
  "care_type": "",
  "notes_for_caregivers": "",
  "pre_approved": true
}
```

**Accounts**
- Make a parent account for each entry in `parents` (each has an email). Link both parents to the same child.
- The temporary password is the parent's 10-digit `phone`. They choose their own password and PIN at first sign-in, the same as caregivers.
- If an email already has an account, link the child to it and reply `already_enrolled` for that account.

**The child's profile**
- Fill it in from the payload: name, date of birth, UCI, address, parents (names, phones, emails) and schedule. `other_contacts` are contacts with no email, such as a parent with only a phone number. Add them to the profile, but don't make accounts for them.
- `dob` can be null when the CRM doesn't have it yet.

**Approval**
- `pre_approved: true` means staff entered everything, so the profile starts **approved**. No admin review is needed at enrollment.
- If the parent later changes anything, only those changes go to admins for approval, the way approvals work now.

**Welcome email**
- Don't send it from the portal. Staff send it themselves from the CRM, as an email or a text, with the app link, how to add it to the home screen, and the log in details.
- If the portal sends its own email for caregivers, it can keep doing that.

## 2. Please reply with
- When `crm-enroll-parent` is live, so we can switch it on in the CRM.
- Whether a parent who already has a portal account (for example, with another child) is handled the way described above.
