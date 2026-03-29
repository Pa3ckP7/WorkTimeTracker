*Authors: Galileo Pellizer (89231430), Patrick Peroša (89231291), Amar Ustavdić (89191041)*
*Repo:* https://github.com/Pa3ckP7/WorkTimeTracker
*Prototype:* https://pa3ckp7.github.io/WorkTimeTracker

## Sprint 0 - Planned Implementation (Sprint 0)

### Scope Summary
The solution is a work time tracker for students and part-time workers. The first usable release focuses on starting and stopping a shift, manual edits, a history of entries, and simple totals. Reminders, project tagging, and export are planned for later sprints.

### Success Criteria
- Users can record a shift with one tap and see it in history.
- Users can correct mistakes by editing start/end times.
- Users can view total hours for a selected period.

### Existing Codebase Baseline
- `src/core/` holds API, data, services, and initialization.
- `src/ui/` holds views, router, Pinia stores, and styles.
- `src/shared/utils.ts` holds shared helpers.

### Current Implementation Snapshot (29 Mar 2026)
- SQLite schema and DI wiring for `Profile` and `Timer` are in place (`src/core/data`, `src/core/init.ts`).
- Timer start/stop per profile works in `ProfilesView` and `ProfileTimerView`; timers stored via `TimerRepository`.
- Global `HistoryView` and per-profile `ProfileHistoryView` list completed sessions with filters and total duration; no edit/delete yet.
- Exports/overview screens are UI-only; PDF generation and tags are not implemented (tag filter is visual).
- Version 0.2.0 was released (tag `v0.2.0`); user testing (Homework 5) found a web-only bug: data wiped after refresh.
- Tags/pay-rate model, manual entry creation, and reminders are not present.
- Tests: only a basic App mount spec; repositories/services lack coverage.

### Gaps vs Homework 1 Specification
- Tagging (paid/unpaid/custom) and mass tagging are missing.
- Payment/overview stats and PDF exports are not wired to data.
- Manual corrections of logged entries are not exposed in UI.
- Settings toggles for currency/payment are not connected to data.

### Planned Architecture
- Time entries stored in a repository layer in `src/core/data`.
- Business logic in `src/core/services` and dependency wiring in `src/core/init.ts`.
- UI flows in `src/ui/views` with Pinia stores in `src/ui/stores`.

### Tools
- Planning and tracking: Obsidian with Kanban plugin (primary).
- Optional team tools: Trello, Jira, or OpenProject if needed.
- Development and QA: Node 20.19+, pnpm, Vite, Vitest, ESLint, TypeScript.

### Risks and Mitigations
- Missed start/stop actions. Mitigation: manual edit flow and clear active timer state.
- Data consistency across edits. Mitigation: repository-level validation and tests.
- UI complexity creep. Mitigation: deliver minimal flow in Sprint 1, expand later.

## Sprint Plan and Priorities

1. Deliver MVP with solid mobile UX (timers, history, basic tags, edits, stability).
1. Complete history flows (manual entries, filters, totals).
1. Add tagging/pay-rate model and overview stats.
1. Build export/PDF pipeline, then reminders.

## Sprint 1 - Done

- Implement time entry model + SQLite repository layer (`src/core/data`)
- Create UI for start/stop timer per profile (`ProfilesView`, `ProfileTimerView`)
- Add history list with profile/date filters and total hours (`HistoryView`, `ProfileHistoryView`)

## Sprint 1 - TO-DO (Planned)

- Manual edit/delete of time entries (API + History UI) (M)
- Manual entry creation for missed timers (M)
- Add basic tags per entry (paid/unpaid/custom) (M)
- Prevent overlapping timers and add resume safety checks (S)
- Finish timer/history unit tests (repositories, services, views) (M)
- Add in-app update check against GitHub releases (S)
- Replace export mock with real PDF generation contract + stub service (L)
- (Stretch) Wire basic settings toggles to persisted config (S)
- Move theme toggle into settings (UX feedback from HW5) (S)

## Sprint 2 - Planned (Internal)

- Improve tagging with automatic triggers (M)
- Overview stats by tag/date/profile (M)
- Define export/report format (PDF schema) (M)

## Sprint 3 - Planned (Internal)

- Implement PDF export (L)
- Add reminders/notifications (L)
- Add pay rate per profile (extensibility) (M)
- UX polish and edge-case handling (M)

## Next Sprint Implementation Plan (No Code Changes Yet)

Next week the goal is to deliver Sprint 1 items: manual edit/delete, manual entry creation, overlap safety, test coverage, and a real PDF export contract (even if backed by a stub). The demo will show editing of completed sessions, creation of a missed entry, stable timers, and a PDF preview using the new contract. After that, Sprint 2 will add tagging/pay-rate data and overview stats, followed by the full export pipeline.

### Kanban Board
![[Kanban_Board.png]]
