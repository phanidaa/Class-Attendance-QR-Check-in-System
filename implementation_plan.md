# Class Attendance System Implementation Plans

This document records the design and implementation details for the premium feature additions: Mobile Camera QR Scanning, GPS Geolocation Tracking, and Course Student Capacity Limits.

---

## 1. Camera QR Scanner & GPS Location Tracking (Phase 1)

Enable students to scan the session QR code using their mobile camera and record their exact GPS location coordinates during check-in, allowing teachers to see their location on a map and in exported reports.

### Proposed Changes

#### A. Camera QR Scanner Integration
- **Library**: Add `html5-qrcode` via unpkg CDN to `index.html`.
- **UI Tab Selection**: Add tab controls to switch between **Real Camera** (default on mobile) and **Mock Simulator** (for PC testing).
- **Scanner View**: Implement the camera feed container (`#qr-reader`). When a QR code is detected, parse the URL (extracting the session code if it links to the checkin URL), stop the camera feed, and auto-populate the inputs.

#### B. GPS Location Capture
- **API**: Use browser standard `navigator.geolocation.getCurrentPosition` to retrieve high-accuracy coordinate points.
- **Workflow**: Trigger GPS retrieval when the student submits the check-in form. Provide loading states so students know the system is waiting for their GPS location.

#### C. Database & Reporting
- **Data Model**: Update records stored in LocalStorage to hold a `gps_coords` object `{ latitude, longitude }`.
- **Reports Console**:
  - Add a **พิกัด GPS** (GPS Coordinates) column in the teacher's reports table.
  - Link coordinates to **Google Maps** (opens in a new tab) so teachers can visually verify coordinates.
  - Include coordinates in the exported CSV sheet.

---

## 2. Course Student Capacity Limits (Phase 2)

Enable instructors to specify a student capacity limit (maximum number of students) for each course. Display the current enrollment ratio (e.g. `8 / 40 คน`) on the Course and Student Management pages, and enforce capacity checks to prevent student overallocation.

### Proposed Changes

#### A. Database Schema Update
- **Course Object**: Add a `max_students` integer property (defaults to `40`).
- **Enforcement**: In `AttendanceStorage.saveStudent()`, if a new student is being registered, verify that the current number of enrolled students does not exceed `max_students`. If it does, block registration and throw a descriptive capacity error.

#### B. Course Management UI
- **Modal Form**: Insert a new **จำนวนนักเรียนสูงสุด (Capacity)** numeric input field in the course addition/edition dialog.
- **Card Display**: Update the course card subtitle to display the ratio of currently enrolled students against the course limit (e.g. `8 / 40 คน (ความจุ)`).

#### C. Student Management UI
- **Header Info**: Display a capacity summary label next to the course filter select (e.g., `ลงทะเบียนแล้ว: 8 / 40 คน`).
