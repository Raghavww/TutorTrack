# Overview

The ZHK Tuition Ltd Management System is a comprehensive application designed to streamline the operations of ZHK Tuition Ltd. It facilitates student information management, tracks tutoring sessions, handles timesheet entries, and implements a dual-rate payment system for students and tutors. The system includes role-based access control (admin, tutor, parent), session-based authentication, and real-time data management. The business vision is to provide a robust, scalable solution for tuition management, enhancing efficiency and improving financial tracking within the education sector.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX and Frontend
The frontend is built with React 18 and TypeScript, utilizing Vite for fast development. It employs Shadcn/ui, based on Radix UI primitives, for a consistent and accessible user interface, styled with Tailwind CSS and custom theming. State management is handled by TanStack Query, routing by Wouter, and forms use React Hook Form with Zod for validation.

## Backend and API
The backend is developed with Express.js and TypeScript, exposing a RESTful API with role-based protection. Replit Auth with OpenID Connect provides secure authentication, and sessions are managed using Express sessions with a PostgreSQL store.

## Database Design
A PostgreSQL database, accessed via Drizzle ORM, stores all application data. Key tables include:
- **Users**: Authentication and role information.
- **Students**: Student profiles and tutor assignments.
- **Student-Tutor Allocations (studentTutors)**: Junction table linking students to tutors with per-allocation rates (parentRate, tutorRate), subject, isPrimary flag, and isActive status. Supports multi-tutor assignments per student.
- **Weekly Timesheets & Timesheet Entries**: Session tracking and tutor payment processing.
- **Tutor Rates & Parent Rates**: Independent rate structures for tutors and parents. Tutor rates support multi-tutor assignment via `tutorRateTutors` junction table and tutor group assignment via `tutorRateTutorGroups` table.
- **Tutor Groups**: Groups of tutors for collective rate assignment. Tables: `tutorGroups`, `tutorGroupMembers`.
- **Curriculum Topics**: Hierarchical tracking of topics covered in sessions.
- **Alert Systems**: Tables for session logging alerts, invoice payment alerts, invoice reminders, and parent session flagging.
- **Calendar & Scheduling**: Recurring session templates, session occurrences, and tutor availability slots.

## Core Features
- **Dual-Rate Payment System**: Distinct hourly rates for parents and tutors, based on tutor experience.
- **Tutor/Student Allocation System**: Centralizes rate management with per-allocation parent and tutor rates, subject tracking, profit calculations (revenue - cost), and profit margin visibility per tutor. Supports multi-tutor assignments per student.
- **Curriculum Tracking**: Monitors curriculum topics covered per session for progress.
- **Weekly Timesheet Workflow**: Automates session grouping, submission, and admin approval.
- **Session Logging Alert System**: Notifies admins and tutors of overdue session logging.
- **Invoice Payment Alert System**: Tracks and alerts for overdue invoice payments, including parent payment claims.
- **Invoice Reminder System**: Sends automated payment reminders to parents.
- **Parent Session Flagging**: Allows parents to flag sessions for admin review.
- **Calendar & Scheduling**: Manages recurring lessons, session occurrences, and tutor availability with FullCalendar integration.
- **Multiple Session Scheduling**: Students can have multiple recurring weekly sessions with different days/times. Each session can be assigned to a different tutor, supporting multi-tutor arrangements where different tutors teach different sessions for the same student.
- **Calendar-Timesheet Integration**: Bidirectional link between calendar sessions and timesheets:
  - When tutors log a timesheet entry with a sessionOccurrenceId, the calendar session is automatically marked as "completed"
  - When tutors change a calendar session status to "completed", a timesheet entry is automatically created
  - Session statuses: scheduled, confirmed, completed, cancelled, no_show
  - Color-coded display: Blue (scheduled), Purple (confirmed), Green (completed/logged), Yellow (past needing action), Orange (no-show), Red (cancelled)
  - Alert section shows past sessions requiring tutor action (either log timesheet or update status)
- **Session Change Request Approval Workflow**:
  - Tutors can request reschedule or cancellation of sessions (cannot directly cancel)
  - Requests show as "pending" with distinct colors: Light red (pending cancel), Light purple (pending reschedule)
  - All calendars (tutor, parent, admin) display sessions with pending requests visually with ⏳ indicator
  - Admin calendar shows pending change requests panel with approve/reject buttons
  - When admin approves, the session is updated (cancelled or rescheduled to proposed date/time)
  - Notifications are sent to requesters when approved/rejected
  - Uses sessionChangeRequests table with proposed dates stored on the request
- **Advanced Availability Management**: Enables detailed tutor availability entry (weekly/seasonal) and matching with waitlist student preferences.
- **Recurring Invoice System**: When creating a student, admins can:
  - Send an initial invoice for the session pack
  - Enable recurring invoices that auto-generate when sessions reach 0
  - Configure the default session pack size (1, 4, 6, or 12 sessions)
  - Student fields: `autoInvoiceEnabled` (boolean), `defaultSessionPack` (integer)
- **Mock Exam Results System**: Supports dual-paper result tracking:
  - Admin can create configurable exam papers (e.g., Verbal Reasoning, Maths) with custom max scores
  - Papers can optionally have a year assigned (e.g., 2023, 2024) for tracking previous year papers
  - Score entry grid allows batch entry of student results per paper
  - Percentage scores calculated and displayed alongside raw scores (score/maxScore × 100)
  - Percentage shown in: score input fields, chart tooltips, average reference lines, and Trend Analytics stats
  - Participant confirmation checkbox to finalize results
  - Parent view shows anonymized rankings with statistics (median, average, highest)
  - Bar chart visualization comparing child's score vs cohort statistics
  - Tables: `mockExamPapers` (with `paperYear` field) and `mockExamResults` with cascade deletion
- **Historical Mock Exam Entry & Trend Analytics**:
  - Admin can create "historical" mock exams for past exam data entry without registration workflow
  - `isHistorical` flag on mockExamEvents distinguishes historical from registration-based exams
  - `studentId` field on mockExamResults allows direct student linking (alternative to serviceBookingId)
  - Historical result entry: select students with tutor/year group filtering, enter scores directly
  - Trend Analytics tab shows statistics across all exams: highest, lowest, average, median scores per paper
  - Bar chart visualization comparing performance metrics across exam papers
  - Supports tracking performance trends over time across historical and current exams
- **Document Sharing System**: 
  - Admin can upload and share documents with parents
  - Share modal displays parent and student names together
  - Filter recipients by tutor and year group (calculated from student's startYear)
  - API endpoint: `/api/documents/shareable-recipients` returns enriched parent-student pairs with tutor assignments and year group info
- **"Other" Timesheet Type for Non-Tutoring Work**:
  - Three session types available: 1-to-1 (individual), Group, and Other
  - "Other" type is for non-tutoring work (admin tasks, preparation, etc.)
  - Admin configures work types via Work Types Manager (name, sortOrder, isActive)
  - Tutors select: Work Type dropdown, Week Period (Monday-Sunday), Hours Worked, Notes (mandatory)
  - For "Other" type, studentId is nullable
  - Week period selector shows last 8 weeks of Monday-Sunday periods
  - Table: `workTypes` stores admin-configured work type options
- **Staff Timesheet System**:
  - Supports non-tutor staff members (role: "additional_staff") for admin assistants, office support, etc.
  - Admin sets staff hourly rates via "Staff Rates" tab → "Additional Staff Hourly Rates" section
  - Staff access tutor dashboard (redirected from /additional_staff to /tutor) but only see "Other" session type
  - Staff submit timesheets using Work Type, Week Period, Hours, and Description (notes)
  - Earnings automatically calculated: staffHourlyRate × hours worked
  - Staff create invoices same as tutors; admin approves and marks as paid
  - Uses `staffHourlyRate` field on users table (decimal, nullable)
  - Reuses existing `timesheetEntries` table with sessionType="other"
- **Mock Exam Registration System**:
  - Public registration page at /register for guests and existing parents
  - Multi-step workflow: Select exam → Fill registration form → Accept T&C → Complete
  - Registration form captures: parent info (name, email, phone), child info (name, DOB, medical conditions), emergency contact details, photo rights consent
  - Terms & Conditions management in admin panel (Mock Exams → Terms & Conditions tab)
  - T&C versioning with only one active version at a time
  - Digital signature with IP address and timestamp tracking for compliance
  - Registration statuses: pending_tc, awaiting_payment, confirmed, cancelled, refunded
  - Admin Registrations tab shows all registrations with status filters and management
  - Admin can update registration status manually
  - Registration details view shows all captured information including T&C acceptance
  - Tables: `mockExamRegistrations`, `registrationExamSelections`, `termsAndConditions`, `termsAcceptances`
  - Public API endpoints: GET /api/public/mock-exams-available (exams open for registration)
  - Automatic enrollment count tracking on mock exam events

## Authentication & Authorization
Replit Auth with OIDC is used for secure authentication. Role-based access control is implemented, restricting data visibility based on user roles (admin, tutor, parent). Middleware protects API routes.

## Data Storage & Management
Neon Database provides serverless PostgreSQL hosting with connection pooling. Drizzle ORM and Drizzle Kit are used for type-safe database interactions and schema migrations. Zod schemas enforce runtime validation.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL.
- **@neondatabase/serverless**: Connection pooling for database interactions.

## Authentication Services
- **Replit Auth**: OpenID Connect provider.
- **connect-pg-simple**: PostgreSQL-backed session storage.

## UI & Styling Libraries
- **Radix UI**: Headless component primitives.
- **Shadcn/ui**: Component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

## Development & Build Tools
- **Vite**: Build tool and development server.
- **TypeScript**: Static type checking.
- **ESBuild**: JavaScript bundler.
- **Drizzle Kit**: Database migration and schema management.

# Future Features (To-Do)

## Automatic Invoice Generation for Mock Exam Registrations
- When registration is complete, automatically create invoice
- Calculate fees based on exam price
- Send invoice to parent email
- Track payment status per registration
- Currently available through admin manual invoice creation

