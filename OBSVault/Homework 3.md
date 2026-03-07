*Authors: Galileo Pellizer (89231430), Patrick Peroša (89231291), Amar Ustavdić (89191041)*
*Repo:* https://github.com/Pa3ckP7/WorkTimeTracker

## Persona 1 - John Falk

### User Story 1

As a student, I want to start and stop shift tracking with one tap, so that I can log work hours without forgetting.

**Test cases**

- John can start a shift from the home screen in one action.
- The system stores the exact shift start timestamp.
- John can stop the active shift in one action.
- The system stores the exact shift end timestamp.
- The system calculates total worked duration automatically.
- If John forgets to stop a shift, he can edit the end time manually later.

### User Story 2

As a student, I want to save a work location with GPS and get a reminder when I arrive there, so that I do not forget to start tracking my shift.

**Test cases**

- John can save a location for an employer using his current GPS position.
- The system stores the GPS coordinates together with the employer/location name.
- John is asked to allow location permission before using this feature.
- When John enters the saved geofence area, the app sends a notification.
- The notification text shows the saved location name, for example: “I see you're at the Swimming Pool, want to start tracking hours?”
- The notification includes two actions: **Yes** and **No**.
- Pressing **Yes** starts time tracking immediately for the linked employer.
- Pressing **No** dismisses the notification and does not start tracking.
- The same arrival should not trigger repeated notifications within a short cooldown period.
- If GPS is disabled, the app does not send the reminder and shows that location services are required.
- John can edit or delete a saved work location.
- If multiple saved work locations are nearby, the app links the reminder to the closest matching saved location.

>[!note]
 This applies, when leaving work aswell.

### User Story 3

As a student, I want to generate a monthly PDF report per employer, so that I can send accurate hour summaries quickly.

**Test cases**

- John can select a month range for the report.
- John can select one employer as report scope.
- The PDF includes all shifts in the selected month for that employer.
- The PDF shows date, start time, end time, break time, and total hours per shift.
- The PDF shows total monthly hours at the end.
- The PDF excludes shifts from other employers.
- The PDF can be downloaded without altering stored shift data.

---

## Persona 2 - Joe Wattson

### User Story 1

As a vocal coach, I want to record coaching sessions per client, so that I always know how many prepaid hours have been used.

**Test cases**

- Joe can create a session entry for a selected client.
- Each session stores date, start time, end time, and duration.
- Joe can edit session duration if it was entered incorrectly.
- Joe cannot save a session without assigning a client.
- The client overview updates total hours immediately after saving a session.

### User Story 2

As a vocal coach, I want to view all logged session times for a selected client, so that I can manually check how many prepaid hours have already been used before scheduling the next session.

**Test cases**

- Joe can select a client from a client list.
- The system shows all session entries linked to that client.
- Each session entry shows date, start time, end time, and duration.
- The session list is ordered by date.
- Joe can filter session entries by timeframe.
- The system shows the total logged time for the selected client in the chosen timeframe.
- Changes to session logs are reflected immediately in the client’s session overview.

### User Story 3

As a vocal coach, I want to export a PDF report for one client, so that I can show the client how many hours were used and when.

**Test cases**

- Joe can select a single client for report generation.
- The report includes all sessions for that client in the selected timeframe.
- The PDF lists session dates and durations.
- The PDF shows total hours used.
- The report excludes sessions from other clients.
- The generated PDF matches the stored session records exactly.

---

## Persona 3 - Diana Johnston

### User Story 1

As a lawyer, I want to track time separately for each case, so that billable work is never mixed between clients.

**Test cases**

- Diana can start a timer only after selecting a case.
- The selected case is attached to the time entry.
- Diana can stop one case timer and start another without overlap.
- Diana can manually reassign an entry if it was attached to the wrong case.
- The case name is visible in the timesheet overview for every entry.

### User Story 2

As a lawyer, I want to categorize work by activity type, so that reports clearly justify billed time.

**Test cases**

- Diana can assign categories / tags like research, client meeting, drafting, and administration.
- Every time entry stores both case and activity category.
- Diana can filter entries by category within one case.
- Diana can edit the category after saving an entry.
- Reports show grouped totals by category.

### User Story 3

As a lawyer, I want to generate a detailed case report, so that I can justify billed hours during review or dispute.

**Test cases**

- Diana can generate a report for one selected case.
- The report includes all time entries linked to that case only.
- Each entry shows date, duration, and activity category.
- The report shows total billable time for the case.
- The report can be limited to a selected date range.
- The report excludes non-billable or unrelated case entries when filtered out.
- The exported PDF reflects the same totals shown in the system dashboard.