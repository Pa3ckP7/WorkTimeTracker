---

kanban-plugin: board

---

## Sprint 0 - Plan (Done)

- [x] Define product scope and success criteria
- [x] Map features to existing code modules (`core`, `ui`, `shared`)
- [x] Select planning tool: Obsidian Kanban (primary)
- [x] Draft Sprint 1 tasks and priorities
- [x] Set up optional burn-down tracking format

## Sprint 1 - To Do

- [ ] Enable manual edit/delete of time entries (API + History UI) (M)
- [ ] Add manual entry creation for missed timers (UI + service) (M)
- [ ] Add basic tags per entry (paid/unpaid/custom) (M)
- [ ] Harden timer state (graceful resume, prevent overlapping timers) (S)
- [ ] Add in-app update check against GitHub releases (S)
- [ ] Replace mock export flow with real PDF generation pipeline (L)
- [ ] Add unit tests for repositories, services, and UI stores (M)
- [ ] Move theme toggle into Settings (UX feedback) (S)
- [ ] Validate mobile UX for MVP flows (timer, history, tags) (M)

## Sprint 1 - Done

- [x] Implement time entry model + SQLite repository layer (in `src/core/data`) (M)
- [x] Create UI for start/stop timer per profile (`ProfilesView`, `ProfileTimerView`) (M)
- [x] Add history list with profile/date filters and total hours (`HistoryView` + `ProfileHistoryView`) (M)

## Sprint 2 - Planned

- [ ] Improve tagging with automatic triggers (M)
- [ ] Overview stats per profile (totals by tag/date) (M)
- [ ] Define export/report formats (PDF schema) (M)
- [ ] Notifications/reminders (start/stop nudges) (L)

## Sprint 3 - Planned

- [ ] Add pay rate per profile (extensibility) (M)
- [ ] PDF export implementation (L)
- [ ] Geofencing reminders (L)
- [ ] Polishing UX, empty states, and edge cases (M)

%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,false,false]}
```
%%
