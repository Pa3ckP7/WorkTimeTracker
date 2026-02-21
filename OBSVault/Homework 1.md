*Authors: Galileo Pellizer (89231430), Patrick Peroša (89231291)*

# Project Description
The project consists of developing a mobile application for manual work-hour tracking, primarily targeted at students and individuals who need a simple and flexible way to log their working hours. The application will allow users to track time spent on different activities or jobs by creating multiple profiles (e.g., part-time job, internship, volunteering).

Users will be able to manually track working hours using a timer, review historical entries, and manage payment-related information. Each time entry can be categorized using tags (such as paid, unpaid, or other custom labels). The application will also support PDF exports of logged hours and payment summaries, enabling users to easily share or archive their records.

The app is intended to be lightweight, intuitive, and focused on essential functionality rather than complex automation. It will be implemented as a cross-platform mobile application using modern web technologies.

## Deadline
The final implementation of the project must be completed by 15 May.

# Detailed Specification


The application will consist of four main screens, each serving a distinct purpose:

### 1. Main Timer Screen
This is the primary screen of the application.
- The user selects an existing profile (e.g., a specific job or activity).
- The user can start a timer to begin tracking work time.
- When the timer is stopped, the worked hours are automatically logged for the selected profile and assigned to the current day.
- The logged entry includes start time, end time, total duration, and an optional tag (e.g., paid or unpaid).

![[Pasted image 20260221122814.png|500]]



### 2. History Screen
The history screen provides an overview of all recorded time entries.
- Users can view entries filtered by profile.
- Each time entry displays:
    - Date  
    - Start and end time
    - Total hours worked
    - Optional calculated payment amount (if enabled)
- Basic filtering and browsing functionality will be available to help users review past work.
- Users can select to mass tag time entries:
	- Option to select start and end date.
	- Select a tag (from a drop down), option to create a new tag aswell.


![[Pasted image 20260221122827.png|300]]


### 3. Overview Screen

This screen is dedicated to payment tracking, large overview showing all kinds of statistics for a certain profile, from here PDF exports are avaiable aswell.

- Group tagged entries, see the ammount of hours for each tag.
- Users can generate PDF exports for:
    - Detailed time entry reports (including start and end times) 
    - Filtering time entries by profiles and tags, and based on that create a PDF export.

### 4. Settings Screen

The settings screen allows users to customize application behavior.
- Options include enabling or disabling features such as:
    - Currency display
    - Payment-related calculations
    - Other general preferences
- This screen provides flexibility without affecting the core tracking functionality.

---

### Technical Overview (Implementation Constraints)

- The application will be built using Vue.js for the frontend.
- Capacitor.js will be used to deploy the app as a cross-platform mobile application.
- SQLite will serve as the local database for storing profiles, time entries, and payment data.









