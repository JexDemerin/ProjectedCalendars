# For the portal chat: Training (course maker, courses, quizzes)

A training area **in the portal**, for office staff and caregivers. Super admins (and staff they allow) make courses; staff and caregivers take them. Families never see it.

## 1. Who sees what

| Who | Make a course | Take a course |
|---|---|---|
| **Super admins** | Always | Always (every course) |
| **Staff** (portal admin accounts) | Only with **Can make a course** | Only with **Can take a course**, and only the courses picked for them |
| **Caregivers** | Never | Caregiver courses (see 3) |
| **Parents / guardians** | Never | Never |

- **Training** is a menu item for super admins, staff with either permission, and caregivers.
- Opening it shows two big choices: **Make a course** and **Take a course**. Anyone without Make a course goes straight to Take a course.

## 2. Staff account settings

On each staff account, next to the existing permissions:

- **Can make a course**: on or off.
- **Can take a course**: on or off. When on:
  - **All staff courses** (default), or
  - **Only these courses**: a checklist of the published staff courses (search, grouped by folder).
- Super admins: both are always on, and the switches are greyed out.
- Changes are logged (who changed it, when).

## 3. Who a course is for

Every course has **Course is for**: **Staff**, **Caregivers**, or **Both**.

- **Staff courses** reach staff through Can take a course (section 2).
- **Caregiver courses** go to **all caregivers** by default. A course maker can narrow one to **chosen caregivers** (search and pick, or "caregivers matched with a client", "new hires in the last 30 days").
- **Both** follows both rules.
- Caregivers can only take courses. They never see Make a course, drafts or other people's results.

## 4. Take a course (the course menu)

A catalog where people pick which course to take:

- **Tabs:** Assigned to me · In progress · Completed · All courses.
- **Course cards:** cover photo, title, short description, folder, estimated time, number of pages, and a "Required" or "Due Nov 30" tag. A progress bar once started.
- **Folders** down the side (e.g. Onboarding, Client care, Safety, Incentives), a **search** box and a **sort** (newest, A–Z, due date).
- **Opening a course:** the cover page (title, description, time, what's inside), then **Start** / **Continue where you left off**.
- **Taking it:** one page at a time, with **Back / Next** and a page list on the side showing done pages ✓. On a phone, the page list is a menu at the top. Progress is saved after every page.
- **If the course says "in order":** a page unlocks only after the previous one (and its quiz) is done. Otherwise people can jump around.
- **At the end:** "Course complete", the score if there was a quiz, and **Print certificate**.

## 5. Make a course

### The list of courses
- Folders (add, rename, reorder, move a course between folders).
- Each course shows: Draft / Published, Course is for (Staff / Caregivers / Both), last edited by and when, and how many people finished.
- **+ New course**, **Duplicate**, **Archive**.

### Course settings
- Title, short description, **cover photo**, folder, estimated time (minutes).
- **Course is for:** Staff / Caregivers / Both (and chosen caregivers, see 3).
- **Required** (shows on "Assigned to me") with an optional **due date**, or a "due N days after they start working".
- **Pages in order** or free to move around.
- **Draft / Published.** Editing a published course saves a new draft; people keep seeing the published version until **Publish changes**.
- **Preview as staff / Preview as caregiver.**

### Pages
- **+ Add page**; rename, reorder (drag), duplicate, delete.
- Each page is a list of **blocks**: **+** between blocks to add one, a drag handle to reorder, and ⋯ to duplicate, move to another page, or delete.
- Autosave while editing, with Undo / Redo.

### Blocks

**Text**
- **Title, Subtitle, Heading, Paragraph**: fixed styles (font, sizes, spacing, colors), so every course looks the same.
- **Rich text** inside any text: **bold**, *italic*, underline, ~~strikethrough~~, font color (a set palette plus custom), highlight, links, left / center / right.
- **Bulleted list, numbered list.**
- **Quote.**
- **Callout box**: Tip / Important / Warning, in the portal's colors, with an icon.

**Media**
- **Photo banner**: full width, with optional title text over it.
- **Photo**: with a **caption** and alt text; size (small / medium / full).
- **Photo gallery**: several photos, swipe or click through, each with a caption.
- **Video**: upload, or paste a YouTube, Vimeo or Google Drive link. Shows a **caption** under it; uploaded videos can have a subtitles file (.vtt). Option: "must watch to the end before Next".
- **File download**: a PDF or form to download.
- **Embed**: Google Docs, Slides or Forms.

**Layout**
- **Two columns** (e.g. photo next to text).
- **Accordion** (click to open) and **Tabs**, for long details.
- **Table.**
- **Divider** and **Spacer.**

**Interactive**
- **Button**: label, color (primary / secondary), and where it goes: next page, a page of this course, another course, a portal page, or a web link.
- **Checklist**: the learner ticks each item ("I've read the handbook"). Option: all items must be ticked before Next.
- **Acknowledgement**: "I have read and understand this" with their name and the time saved (for policies).
- **Quiz**: a quiz inside the page, or a whole quiz page (section 6).

## 6. Quiz maker

### Question types
| Type | How it's answered | Scoring |
|---|---|---|
| Multiple choice | Pick one | Right or wrong |
| Multiple select | Pick all that apply | All-or-nothing, or partial credit |
| True / False | Pick one | Right or wrong |
| Short answer | Type a word or phrase | Matches any accepted answer (ignores case and extra spaces) |
| Fill in the blanks | Type into blanks in a sentence | Points per blank |
| Dropdown | Pick from a list inside a sentence | Points per dropdown |
| Matching | Pair items from two lists | Points per correct pair |
| Put in order | Drag the steps into order | All-or-nothing, or per position |
| Image choice | Pick the right photo | Right or wrong |
| Long answer | Write a paragraph | Graded by hand (see Grading) |
| Rating scale | 1–5 or Agree / Disagree | No points (survey) |

### Each question
- The question text (rich text), with an optional photo or video.
- **Points** (default 1).
- **Required** or optional.
- **Hint** (optional, shown on request).
- **Feedback:** for a right answer, for a wrong answer, and per choice where it applies.
- Duplicate, reorder (drag), delete.

### Each quiz
- **Passing score** (%; default 80%).
- **Attempts allowed** (1, 2, 3 or unlimited) and which counts (best or latest).
- **Time limit** (optional).
- **Shuffle** the questions, and the answer choices.
- **Question bank:** show N random questions out of the ones written.
- **Show correct answers:** never / after each question / after submitting / only after passing.
- **Must pass to continue** (blocks the next pages) or not.

### Grading
- Everything except long answers is graded at once.
- Long answers wait for a grader: the course's maker, or any super admin. They see the answer, give points and an optional comment. The learner sees "Waiting for grading" until then and gets a notification when it's graded.
- A grader can **change a score** (with a reason; logged).

## 7. Assigning and reminders
- Course makers can **assign** a course to chosen staff, chosen caregivers, or everyone it's for, with an optional due date.
- New assignment → notification (in-app; caregivers also get the usual push / email the portal already sends).
- Reminder 3 days before the due date and on the day; **Overdue** after that. A daily summary of overdue people goes to the course's maker and super admins.

## 8. Results (for course makers and super admins)
- Per course: who's **assigned / started / finished / overdue**, each person's progress, score, attempts and time spent. Filter by staff or caregiver, export CSV.
- Per person (on the staff account or caregiver profile): every course taken, scores, dates and certificates.
- Per quiz: how many got each question wrong (to spot confusing questions).
- **Waiting for grading** list.
- **Reset** a person's progress or give an extra attempt (logged).

## 9. Certificates
- On completion (and passing, if there's a quiz): a certificate with the person's name, course title, date, score, and Together Homecare's logo. **Print / Save as PDF.**
- Kept on the person's record.

## 10. Storage and limits
- Photos and uploaded videos stored privately; only signed-in people who can see the course can load them.
- Upload limits: photos 10 MB, files 25 MB, videos 500 MB (long videos are easiest as YouTube or Drive links).
- Courses, pages and blocks saved as structured data (each block = its type + settings + content), so the same course renders the same everywhere.

## 11. The CRM side (later)
- CRM staff open Training through a link to the portal (no second sign-in if possible).
- Optional: show a caregiver's completed courses on their Hired Caregivers record in the CRM. Tell us the endpoint or webhook and we'll add it.

## 12. Build order (suggested)
1. Training menu, permissions (Can make / Can take + course picker), Course is for, folders, course and page editor with all blocks.
2. Take a course: catalog, course player, progress.
3. Quiz maker and grading.
4. Assigning, due dates, reminders, results, certificates.
