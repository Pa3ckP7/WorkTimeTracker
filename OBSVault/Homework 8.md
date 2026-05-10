# Homework 8, Engineering Management: Leadership (Patterns)

*Authors: Galileo Pellizer (89231430), Patrick Peroša (89231291), Amar Ustavdić (89191041)*
*Project: WorkTimeTracker, [github.com/Pa3ckP7/WorkTimeTracker](https://github.com/Pa3ckP7/WorkTimeTracker)*

---

### 1. Treating Your Team Like Children

A small team of three people with overlapping technical skills is especially vulnerable to one person becoming the de facto gatekeeper, approving every architectural decision, redirecting others' work, or silently redoing what someone else did. This undermines ownership and creates a bottleneck.

**How we address this in WorkTimeTracker:**
Our split is horizontal by discipline: Galileo owns the frontend, Patrick owns the backend and hosts the repository, and Amar covers whatever is left, integration glue, tooling, testing, and any tasks that fall between the two. All three are equal owners of the project; Patrick hosting the repo is a practical convenience, not a rank. The antipattern would be Patrick using repo access as a control lever, or Galileo's frontend decisions being second-guessed at every turn, or Amar's cross-cutting work being treated as less important because it is less visible. In practice, each person makes decisions in their area and brings them up at our weekly Discord meeting if alignment is needed. If a design choice is suboptimal, it is raised there with a reason and discussed, not silently fixed by someone else. The person who wrote it decides whether to change it.

---

### 2. Ignoring Human Issues

Our team members are students simultaneously managing coursework, exams, and in some cases part-time jobs, the exact same situation as our target persona John Falk. Pretending that none of that affects availability or motivation leads to silent burnout and last-minute surprises.

**How we address this in WorkTimeTracker:**
We treat capacity as a real planning input. Before each sprint, each person states their realistic availability for the coming two weeks, not "I'll try to find time" but a concrete number of hours. Sprint scope is set based on that, not on what theoretically fits. If someone has exams coming up (late April is a likely crunch period given the May 15 deadline), that sprint's scope is cut before it becomes a problem, not after. This also means the person under pressure does not have to ask for help, load is adjusted proactively.

---

## Positive Patterns

### 1. Set Clear Goals

Vague sprint items create invisible blockers. "Replace mock export flow with real PDF generation" (currently in our Sprint 1 Kanban) is too large and too ambiguous on its own, it does not define what "done" looks like, which makes it impossible to review, hand off, or schedule confidently.

**How we implement this in WorkTimeTracker:**
Every sprint item gets an explicit done-condition written into the Kanban card or linked issue before the sprint starts, not after. For the PDF export task, that means: *"A `PdfExportService` interface is defined in `src/core/services`, backed by a stub that returns a hardcoded PDF blob; the Overview screen calls it and triggers a share dialog on mobile."* That is reviewable, demonstrable, and handable-off. The Kanban board in Obsidian already exists, we use the card description field to hold the done-condition rather than leaving it blank. This also makes our sprint demo honest: we show only things that meet their done-condition, not things that are "mostly done."

---

### 2. Remove Roadblocks

The web-only data-wipe bug discovered during HW5 user testing is a direct example of a blocker that sat implicit for too long, users discovered it, not the team. Technical blockers on a three-person project tend to go unraised because everyone assumes someone else will pick it up or that it is not their problem.
