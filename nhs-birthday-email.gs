/**
 * CLIENT BIRTHDAY EMAIL (New Hires spreadsheet)
 * ---------------------------------------------
 * Paste this as a NEW file (e.g. BirthdayEmail.gs) in the Apps Script project of the New Hires spreadsheet.
 * It replaces the separate "Client Birthday Notifier" spreadsheet.
 *
 * Reads the "Client Birthdays" tab, which the CRM keeps up to date (Active clients only):
 *   A Name · B Date of birth · C Address · D Guardian name · E Family Contact Number · F Family email
 *
 * On the 20th of each month it emails Liz and Lizzie next month's celebrants, in the same format as before.
 *
 * SET UP (once):
 * 1. Run bdaySetUpTrigger once from the editor (pick it in the function list, click Run, allow access).
 *    It makes a daily trigger for bdaySendMonthly (between 8 and 9 AM); the email only goes out on the 20th.
 *    Or by hand: Triggers (clock icon) > Add Trigger > bdaySendMonthly > Time-driven > Day timer > 8am to 9am.
 * 2. To send it now to check: run bdaySendNow from the editor, or add the menu item (below) and use it.
 * 3. Turn off the old trigger in the Client Birthday Notifier spreadsheet, so the email isn't sent twice.
 *
 * MENU (optional): a project can only have one onOpen. If the New Hires project already has one, add this line
 * inside it instead of creating a second onOpen:
 *     bdayAddMenu();
 */

const BDAY_TAB = "Client Birthdays";
const BDAY_TO = "liz@togetherhomecare.org, lizzie@togetherhomecare.org";
const BDAY_TZ = "America/Los_Angeles";

// ===== MENU =====
function bdayAddMenu() {
  SpreadsheetApp.getUi()
    .createMenu("🎂 Birthday Tools")
    .addItem("Send Next Month's Birthday Preview Now", "bdaySendNow")
    .addToUi();
}

// ===== ONE-TIME SET UP: a daily trigger (the email only goes out on the 20th) =====
function bdaySetUpTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "bdaySendMonthly")
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("bdaySendMonthly").timeBased().everyDays(1).atHour(8).inTimezone(BDAY_TZ).create();
}

// ===== SCHEDULED: runs daily, sends on the 20th =====
function bdaySendMonthly() {
  const today = bdayToday();
  if (today.getDate() !== 20) return; // Only send on the 20th of each month
  bdayBuildAndSend(false);
}

// ===== MANUAL: run anytime (editor or menu) =====
function bdaySendNow() {
  bdayBuildAndSend(true);
}

// ===== CORE LOGIC =====
function bdayBuildAndSend(isManual) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(BDAY_TAB);
  if (!sheet) throw new Error(`No tab named "${BDAY_TAB}".`);
  const data = sheet.getDataRange().getValues();

  const today = bdayToday();
  const nextMonth = (today.getMonth() + 1) % 12;
  const nextMonthName = Utilities.formatDate(new Date(today.getFullYear(), nextMonth, 1), BDAY_TZ, "MMMM");

  const celebrants = [];
  for (let i = 1; i < data.length; i++) {
    const clientName = String(data[i][0] || "").trim(); // A - Name
    const dob = bdayDate(data[i][1]);                    // B - Date of birth
    const address = data[i][2];                          // C - Address
    const guardian = data[i][3];                         // D - Guardian name
    const contact = data[i][4];                          // E - Family Contact Number
    const familyEmail = data[i][5];                      // F - Family email
    if (!clientName || !dob || dob.getMonth() !== nextMonth) continue;
    celebrants.push({
      name: clientName,
      address: address,
      guardian: guardian,
      contact: contact,
      email: familyEmail,
      age: bdayUpcomingAge(dob, today),
      birthday: Utilities.formatDate(dob, BDAY_TZ, "MMMM d"),
      day: dob.getDate(),
    });
  }
  celebrants.sort((a, b) => a.day - b.day);

  if (celebrants.length === 0) {
    if (isManual) ss.toast(`No birthdays found for ${nextMonthName}. No email sent.`, "Birthday Notifier", 6);
    return;
  }

  let message = `Hi Liz and Lizzie!<br><br>`;
  message += `Here are the <b>birthday celebrants for ${nextMonthName}</b>:<br><br>`;
  celebrants.forEach(c => {
    message += `
<b>Name:</b> ${c.name}<br>
<b>Birthday:</b> ${c.birthday}<br>
<b>Age:</b> ${c.age}${bdayOrdinal(c.age)}<br>
<b>Address:</b> ${c.address}<br>
<b>Guardian:</b> ${c.guardian}<br>
<b>Family Contact:</b> ${c.contact}<br>
<b>Family Email:</b> ${c.email}<br><br>
`;
  });
  message += `Kind regards,<br>Birthday Notifier Bot`;

  MailApp.sendEmail({
    to: BDAY_TO,
    subject: `Upcoming ${nextMonthName} Birthday Celebrants`,
    body: message.replace(/<br>/g, "\n").replace(/<\/?b>/g, ""),
    htmlBody: message,
  });

  if (isManual) ss.toast(`Sent ${celebrants.length} ${nextMonthName} celebrant(s) to Liz and Lizzie.`, "Birthday Notifier", 6);
}

// ===== HELPERS =====
function bdayToday() {
  return new Date(Utilities.formatDate(new Date(), BDAY_TZ, "yyyy-MM-dd") + "T00:00:00");
}

/** A date cell, or text like "11/26/2021" (some rows may be typed as text). Null if it isn't a date. */
function bdayDate(v) {
  if (Object.prototype.toString.call(v) === "[object Date]" && !isNaN(v)) return v;
  const m = String(v || "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return d.getMonth() === Number(m[1]) - 1 ? d : null;
}

/** The age they will turn on their next birthday. */
function bdayUpcomingAge(dob, today) {
  let age = today.getFullYear() - dob.getFullYear();
  const thisYearsBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (thisYearsBirthday <= today) age++;
  return age;
}

/** 21st, 22nd, 23rd, 11th… */
function bdayOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
