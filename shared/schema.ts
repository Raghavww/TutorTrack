import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phone: varchar("phone"), // Staff member's own contact number
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "tutor", "additional_staff", "parent"] }).notNull().default("tutor"),
  description: text("description"), // Free text description of staff responsibilities
  experienceLevel: varchar("experience_level", { enum: ["junior", "standard", "senior", "expert"] }).default("standard"), // For tutors: determines pay rate
  staffHourlyRate: varchar("staff_hourly_rate"), // For additional_staff: their hourly rate (stored as string for precision)
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  isActive: boolean("is_active").notNull().default(true),
  emergencyContact: jsonb("emergency_contact"), // For tutors: emergency contact info {name, relationship, phone, email, notes, lastUpdatedAt}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Predefined subject options
export const SUBJECT_OPTIONS = [
  "11+ Maths",
  "Verbal Reasoning",
  "Non-Verbal Reasoning",
  "11+ English",
  "GCSE Maths",
  "GCSE English",
] as const;

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subjects: text("subjects").array().notNull().default(sql`'{}'::text[]`), // Multiple subjects
  examType: varchar("exam_type"), // Type of exam: 11+, 13+, GCSE, A-Level, etc.
  tutorId: varchar("tutor_id").references(() => users.id), // Now optional - tutor assigned via Allocations
  parentUserId: varchar("parent_user_id").references(() => users.id), // Links to parent's login account
  parentName: varchar("parent_name"),
  parentSurname: varchar("parent_surname"),
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  parentContactInfo: text("parent_contact_info"), // Legacy field - can be used for additional notes
  classType: varchar("class_type", { enum: ["individual", "group"] }).notNull().default("individual"),
  sessionsBooked: integer("sessions_booked").notNull().default(0),
  sessionsRemaining: integer("sessions_remaining").notNull().default(0),
  autoInvoiceEnabled: boolean("auto_invoice_enabled").notNull().default(false), // Auto-send invoice when sessions reach 0
  defaultSessionPack: integer("default_session_pack").default(4), // Default sessions to include in auto-invoice
  recurringInvoiceSendDate: timestamp("recurring_invoice_send_date"), // Scheduled date for first recurring invoice block
  sessionDayOfWeek: integer("session_day_of_week"), // 0=Sunday, 1=Monday, etc.
  sessionStartTime: varchar("session_start_time"), // Time in HH:MM format
  sessionDurationMinutes: integer("session_duration_minutes").default(60), // Duration in minutes
  parentRate: decimal("parent_rate", { precision: 10, scale: 2 }).notNull(),
  tutorRate: decimal("tutor_rate", { precision: 10, scale: 2 }).default("0"), // Optional - tutor rate managed via Allocations
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  examMonth: integer("exam_month"), // 1-12
  examYear: integer("exam_year"),
  examBoard: varchar("exam_board"), // Exam board they are applying to
  targetSchools: varchar("target_schools"), // Target schools
  primarySchool: varchar("primary_school"), // Primary school they attend
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student-Tutor allocation table (many-to-many with per-allocation rates)
export const studentTutors = pgTable("student_tutors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").notNull().default(false),
  subject: varchar("subject"),
  parentRate: decimal("parent_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  tutorRate: decimal("tutor_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  sessionsAllocated: integer("sessions_allocated").notNull().default(0),
  sessionsUsed: integer("sessions_used").notNull().default(0),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly timesheets table - groups sessions by week for submission/approval
export const weeklyTimesheets = pgTable("weekly_timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  status: varchar("status", { enum: ["draft", "submitted", "approved", "rejected"] }).notNull().default("draft"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timesheet status history table - tracks the journey of a timesheet
export const timesheetStatusHistory = pgTable("timesheet_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weeklyTimesheetId: varchar("weekly_timesheet_id").notNull().references(() => weeklyTimesheets.id),
  fromStatus: varchar("from_status", { enum: ["draft", "submitted", "approved", "rejected"] }),
  toStatus: varchar("to_status", { enum: ["draft", "submitted", "approved", "rejected"] }).notNull(),
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Timesheet entries table
export const timesheetEntries = pgTable("timesheet_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  studentId: varchar("student_id").references(() => students.id), // Nullable for "other" session type
  weeklyTimesheetId: varchar("weekly_timesheet_id").references(() => weeklyTimesheets.id),
  sessionOccurrenceId: varchar("session_occurrence_id"), // Links to scheduled session if logged from calendar
  date: timestamp("date").notNull(),
  duration: decimal("duration", { precision: 4, scale: 2 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  sessionType: varchar("session_type", { enum: ["individual", "group", "other"] }).notNull().default("individual"),
  groupSessionId: varchar("group_session_id"), // Links multiple entries from the same group session
  sessionSubject: varchar("session_subject"), // Subject covered in this session (Maths, English, etc.)
  otherTopicsText: text("other_topics_text"), // Free text for "Other" subject topics
  workTypeId: varchar("work_type_id"), // For "other" session type - references work type
  workTypeName: varchar("work_type_name"), // Stored work type name for history
  weekPeriodStart: timestamp("week_period_start"), // For "other" type - Monday of the week
  weekPeriodEnd: timestamp("week_period_end"), // For "other" type - Sunday of the week
  tutorEarnings: decimal("tutor_earnings", { precision: 10, scale: 2 }).notNull(),
  parentBilling: decimal("parent_billing", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutor time slots table
export const tutorTimeSlots = pgTable("tutor_time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  capacity: integer("capacity").notNull().default(1),
  isCanceled: boolean("is_canceled").notNull().default(false),
  subject: varchar("subject"),
  classType: varchar("class_type", { enum: ["individual", "group"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Slot bookings table
export const slotBookings = pgTable("slot_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slotId: varchar("slot_id").notNull().references(() => tutorTimeSlots.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  status: varchar("status", { enum: ["booked", "canceled", "attended", "no_show"] }).notNull().default("booked"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recurring session templates - weekly recurring lessons for students
export const recurringSessionTemplates = pgTable("recurring_session_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  studentId: varchar("student_id").references(() => students.id), // Nullable for group sessions
  groupId: varchar("group_id"), // For group sessions - references student_groups.id
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: varchar("start_time").notNull(), // HH:MM format (e.g., "14:30")
  durationMinutes: integer("duration_minutes").notNull().default(60),
  subject: varchar("subject"),
  classType: varchar("class_type", { enum: ["individual", "group"] }).notNull().default("individual"),
  startDate: timestamp("start_date").notNull(), // When this recurring schedule starts
  endDate: timestamp("end_date"), // Optional end date
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session occurrences - individual session instances from templates or manual
export const sessionOccurrences = pgTable("session_occurrences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => recurringSessionTemplates.id), // Null for manually created sessions
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  studentId: varchar("student_id").references(() => students.id), // Null for available slots or group sessions
  groupId: varchar("group_id"), // For group sessions - reference added later due to declaration order
  occurrenceDate: timestamp("occurrence_date").notNull(), // The specific date of this session
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  status: varchar("status", { enum: ["scheduled", "confirmed", "cancelled", "completed", "no_show"] }).notNull().default("scheduled"),
  source: varchar("source", { enum: ["template", "manual", "rescheduled"] }).notNull().default("template"),
  originalDate: timestamp("original_date"), // If rescheduled, stores the original date
  cancellationReason: text("cancellation_reason"),
  notes: text("notes"),
  parentFlagged: boolean("parent_flagged").notNull().default(false),
  parentFlagComment: text("parent_flag_comment"),
  parentFlaggedAt: timestamp("parent_flagged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutor availability slots - green slots where tutors mark themselves available
export const tutorAvailabilitySlots = pgTable("tutor_availability_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week"), // For recurring availability (0-6), null for one-time
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  isRecurring: boolean("is_recurring").notNull().default(true),
  availabilityType: varchar("availability_type", { enum: ["weekly", "seasonal"] }).notNull().default("weekly"),
  timeframeStart: timestamp("timeframe_start"), // For seasonal availability
  timeframeEnd: timestamp("timeframe_end"), // For seasonal availability
  specificDate: timestamp("specific_date"), // For non-recurring, the specific date
  status: varchar("status", { enum: ["available", "held", "booked"] }).notNull().default("available"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { 
    enum: ["low_balance", "booking_confirmed", "booking_canceled", "schedule_changed", "payment_needed", "emergency_contact_updated", "invoice_reminder", "availability_change", "group_session_logged", "session_change_request", "session_change_approved", "session_change_rejected", "new_change_request"] 
  }).notNull(),
  payload: jsonb("payload"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session change requests - parents/tutors request cancellations or rearrangements
export const sessionChangeRequests = pgTable("session_change_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionOccurrenceId: varchar("session_occurrence_id").notNull().references(() => sessionOccurrences.id),
  parentId: varchar("parent_id").references(() => users.id), // Set if parent initiated
  tutorId: varchar("tutor_id").references(() => users.id), // Set if tutor initiated
  studentId: varchar("student_id").references(() => students.id), // Nullable for group sessions
  groupId: varchar("group_id").references(() => studentGroups.id), // For group session changes
  requesterType: varchar("requester_type", { enum: ["parent", "tutor"] }).notNull().default("parent"),
  requestType: varchar("request_type", { enum: ["cancel", "reschedule"] }).notNull(),
  originalDate: timestamp("original_date").notNull(),
  proposedDate: timestamp("proposed_date"), // For reschedule: the new proposed date/time
  proposedStartDateTime: timestamp("proposed_start_date_time"), // For reschedule: exact start time
  proposedEndDateTime: timestamp("proposed_end_date_time"), // For reschedule: exact end time
  proposedDateMessage: text("proposed_date_message"), // Free text for proposed timing
  reason: text("reason"),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "acknowledged"] }).notNull().default("pending"),
  adminNotes: text("admin_notes"), // Optional message sent on approval/rejection
  processedAt: timestamp("processed_at"), // When admin approved/rejected
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed
  acknowledgedAt: timestamp("acknowledged_at"), // Legacy field for backwards compatibility
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session logging alerts - tracks overdue session logging by tutors
export const sessionLoggingAlerts = pgTable("session_logging_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionOccurrenceId: varchar("session_occurrence_id").notNull().references(() => sessionOccurrences.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  studentId: varchar("student_id").references(() => students.id),
  sessionEndTime: timestamp("session_end_time").notNull(), // When the session ended
  alertCreatedAt: timestamp("alert_created_at").defaultNow(), // When alert was created (24h after session)
  resolvedAt: timestamp("resolved_at"), // When tutor logged the session
  resolvedByTimesheetEntryId: varchar("resolved_by_timesheet_entry_id"), // Which timesheet entry resolved this
  hoursLate: decimal("hours_late", { precision: 6, scale: 2 }), // How many hours late the session was logged
  status: varchar("status", { enum: ["pending", "resolved", "dismissed"] }).notNull().default("pending"),
  dismissedBy: varchar("dismissed_by").references(() => users.id), // Admin who dismissed if applicable
  dismissReason: text("dismiss_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices table - tracks billing for students/parents
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  studentId: varchar("student_id").notNull().references(() => students.id),
  invoiceType: varchar("invoice_type", { enum: ["manual", "auto_sessions"] }).notNull().default("manual"),
  sessionsIncluded: integer("sessions_included"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["draft", "sent", "approved", "paid", "partial", "overdue", "cancelled", "scheduled"] }).notNull().default("draft"),
  scheduledSendDate: timestamp("scheduled_send_date"), // Date when invoice should be automatically sent
  sentAt: timestamp("sent_at"), // Date the invoice was sent (date of final lesson)
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  parentClaimedPaid: boolean("parent_claimed_paid").default(false), // Parent marked "I've paid"
  parentClaimedPaidAt: timestamp("parent_claimed_paid_at"), // When parent claimed payment
  reminder2DaysSentAt: timestamp("reminder_2_days_sent_at"), // When 2-day reminder was sent
  reminder4DaysSentAt: timestamp("reminder_4_days_sent_at"), // When 4-day reminder was sent
  reminder5DaysSentAt: timestamp("reminder_5_days_sent_at"), // When 5-day reminder was sent (due date)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice payment alerts - tracks overdue invoice payments by parents
export const invoicePaymentAlerts = pgTable("invoice_payment_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id").references(() => users.id), // Parent user associated with the student
  studentId: varchar("student_id").notNull().references(() => students.id),
  invoiceSentAt: timestamp("invoice_sent_at").notNull(), // When the invoice was sent
  dueDate: timestamp("due_date").notNull(), // When payment is due (5 days after sent)
  alertCreatedAt: timestamp("alert_created_at").defaultNow(), // When alert was created (2 days overdue)
  resolvedAt: timestamp("resolved_at"), // When invoice was paid
  daysOverdue: integer("days_overdue"), // How many days late the payment was
  status: varchar("status", { enum: ["pending", "resolved", "dismissed"] }).notNull().default("pending"),
  dismissedBy: varchar("dismissed_by").references(() => users.id), // Admin who dismissed if applicable
  dismissReason: text("dismiss_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutor invoices table - invoices submitted by tutors to admin for payment
export const tutorInvoices = pgTable("tutor_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  weeklyTimesheetId: varchar("weekly_timesheet_id").references(() => weeklyTimesheets.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  hoursWorked: decimal("hours_worked", { precision: 6, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "approved", "paid", "rejected"] }).notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Adhoc invoices table - manually created invoices, optionally linked to students/parents
export const adhocInvoices = pgTable("adhoc_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  category: varchar("category", { enum: ["lesson", "textbook_maths", "textbook_vr", "textbook_bundle", "mock_exam", "mathz_skillz", "other"] }).notNull().default("other"),
  studentId: varchar("student_id").references(() => students.id), // Optional link to student
  parentUserId: varchar("parent_user_id").references(() => users.id), // Optional link to parent account
  parentFirstName: varchar("parent_first_name").notNull(),
  parentSurname: varchar("parent_surname").notNull(),
  guestEmail: varchar("guest_email"), // Email for guest billing (when no parent account)
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { enum: ["draft", "sent", "paid", "partial", "overdue", "cancelled"] }).notNull().default("draft"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  inventoryDeducted: boolean("inventory_deducted").notNull().default(false), // Track if inventory was deducted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Adhoc invoice items table - links adhoc invoices to products for inventory tracking
export const adhocInvoiceItems = pgTable("adhoc_invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adhocInvoiceId: varchar("adhoc_invoice_id").notNull().references(() => adhocInvoices.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice line items - links invoices to timesheet entries
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  timesheetEntryId: varchar("timesheet_entry_id").references(() => timesheetEntries.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 4, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table - tracks payments received
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { enum: ["cash", "bank_transfer", "card", "other"] }).notNull().default("bank_transfer"),
  reference: varchar("reference"),
  notes: text("notes"),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Waitlist table - tracks prospective students who have contacted about tuition
export const waitlist = pgTable("waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentName: varchar("student_name").notNull(),
  parentName: varchar("parent_name"),
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  subject: varchar("subject"), // Legacy single subject field
  subjects: text("subjects").array(), // Multi-select subjects array
  sessionTypePreference: varchar("session_type_preference", { 
    enum: ["in_person_group", "online_1_1", "no_preference"] 
  }).default("no_preference"),
  notes: text("notes"),
  depositPaid: boolean("deposit_paid").notNull().default(false),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  sessionDurationMinutes: integer("session_duration_minutes"), // How long the parent wants each session to be
  preferredTimings: jsonb("preferred_timings"), // Array of { dayOfWeek, startTime, endTime, notes }
  status: varchar("status", { enum: ["new", "contacted", "scheduled", "converted", "declined"] }).notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parent messages table - feedback/messages from parents to tutors/admin
export const parentMessages = pgTable("parent_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  senderEmail: varchar("sender_email").notNull(),
  senderName: varchar("sender_name"),
  recipientType: varchar("recipient_type", { enum: ["tutor", "admin"] }).notNull(),
  subject: varchar("subject"),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  readByTutorId: varchar("read_by_tutor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student topics table - tracks curriculum topics for each student
export const studentTopics = pgTable("student_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  title: varchar("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  isCovered: boolean("is_covered").notNull().default(false),
  coveredAt: timestamp("covered_at"),
  coveredById: varchar("covered_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate configurations table - DEPRECATED, use tutorRates and parentRates instead
export const rateConfigurations = pgTable("rate_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  classType: varchar("class_type", { enum: ["individual", "group"] }).notNull().default("individual"),
  subject: varchar("subject"),
  rateType: varchar("rate_type", { enum: ["tutor", "parent", "combined"] }).notNull().default("combined"),
  tutorRate: decimal("tutor_rate", { precision: 10, scale: 2 }).notNull(),
  parentRate: decimal("parent_rate", { precision: 10, scale: 2 }).notNull(),
  linkedRateId: varchar("linked_rate_id"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutor rates table - rates paid TO tutors (completely independent)
export const tutorRates = pgTable("tutor_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  tutorId: varchar("tutor_id").references(() => users.id), // Optional: assign rate to specific tutor (null = global rate)
  experienceLevel: varchar("experience_level", { enum: ["junior", "standard", "senior", "expert"] }), // Optional: assign rate to tutors of specific experience level
  classType: varchar("class_type", { enum: ["individual", "group"] }).notNull().default("individual"),
  subject: varchar("subject"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parent rates table - rates charged TO parents (completely independent)
export const parentRates = pgTable("parent_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  classType: varchar("class_type", { enum: ["individual", "group"] }).notNull().default("individual"),
  subject: varchar("subject"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate links table - optional linking for profit margin analysis
export const rateLinks = pgTable("rate_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorRateId: varchar("tutor_rate_id").notNull().references(() => tutorRates.id, { onDelete: "cascade" }),
  parentRateId: varchar("parent_rate_id").notNull().references(() => parentRates.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutor groups table - groups tutors for rate assignment
export const tutorGroups = pgTable("tutor_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tutor group members junction table
export const tutorGroupMembers = pgTable("tutor_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => tutorGroups.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutor rate to tutors junction table - for assigning rates to multiple individual tutors
export const tutorRateTutors = pgTable("tutor_rate_tutors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorRateId: varchar("tutor_rate_id").notNull().references(() => tutorRates.id, { onDelete: "cascade" }),
  tutorId: varchar("tutor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tutor rate to tutor groups junction table - for assigning rates to tutor groups
export const tutorRateTutorGroups = pgTable("tutor_rate_tutor_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tutorRateId: varchar("tutor_rate_id").notNull().references(() => tutorRates.id, { onDelete: "cascade" }),
  tutorGroupId: varchar("tutor_group_id").notNull().references(() => tutorGroups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student groups table - defines groups of students for group sessions
export const studentGroups = pgTable("student_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  subject: varchar("subject"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student group members table - links students to groups
export const studentGroupMembers = pgTable("student_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => studentGroups.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Group sessions table - records group sessions delivered by tutors
export const groupSessions = pgTable("group_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => studentGroups.id),
  tutorId: varchar("tutor_id").notNull().references(() => users.id),
  sessionDate: timestamp("session_date").notNull(),
  duration: decimal("duration", { precision: 4, scale: 2 }).notNull(), // Hours
  notes: text("notes"),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  weeklyTimesheetId: varchar("weekly_timesheet_id").references(() => weeklyTimesheets.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group session attendance table - tracks which students attended and charge/deduct
export const groupSessionAttendance = pgTable("group_session_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupSessionId: varchar("group_session_id").notNull().references(() => groupSessions.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").notNull().references(() => students.id),
  present: boolean("present").notNull().default(true),
  chargeType: varchar("charge_type", { enum: ["charge", "deduct", "no_change"] }).notNull().default("charge"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parent message replies table - replies from tutors/admins to parent messages
export const parentMessageReplies = pgTable("parent_message_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => parentMessages.id),
  replyContent: text("reply_content").notNull(),
  repliedById: varchar("replied_by_id").notNull().references(() => users.id),
  repliedByRole: varchar("replied_by_role", { enum: ["admin", "tutor"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table - for inventory management (textbooks, study materials, etc.)
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category", { enum: ["textbook", "workbook", "study_material", "mock_exam", "other"] }).notNull().default("other"),
  sku: varchar("sku").unique(), // Stock keeping unit
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }), // What we pay for it
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5), // Alert when stock falls below this
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mock exam events table - for organizing mock exams
export const mockExamEvents = pgTable("mock_exam_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  examType: varchar("exam_type", { enum: ["11+", "13+", "GCSE", "A-Level", "other"] }).notNull().default("11+"),
  subject: varchar("subject"), // Maths, English, Verbal Reasoning, etc.
  examDate: timestamp("exam_date").notNull(),
  startTime: varchar("start_time"), // e.g., "09:00"
  endTime: varchar("end_time"), // e.g., "12:00"
  venue: varchar("venue"),
  maxCapacity: integer("max_capacity"),
  currentEnrollments: integer("current_enrollments").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  registrationDeadline: timestamp("registration_deadline"),
  status: varchar("status", { enum: ["upcoming", "registration_open", "registration_closed", "completed", "cancelled"] }).notNull().default("upcoming"),
  isHistorical: boolean("is_historical").notNull().default(false), // Historical exams for trend tracking without registration flow
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mock exam expenses table - tracks costs for running mock exams
export const mockExamExpenses = pgTable("mock_exam_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mockExamEventId: varchar("mock_exam_event_id").notNull().references(() => mockExamEvents.id, { onDelete: "cascade" }),
  category: varchar("category", { enum: ["supplies", "invigilators", "hall_booking", "other"] }).notNull(),
  description: varchar("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mock exam papers table - defines the papers for each mock exam (e.g., VR and Maths)
export const mockExamPapers = pgTable("mock_exam_papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mockExamEventId: varchar("mock_exam_event_id").notNull().references(() => mockExamEvents.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(), // e.g., "Verbal Reasoning", "Maths"
  maxScore: integer("max_score").notNull().default(100), // Maximum possible score
  orderIndex: integer("order_index").notNull().default(0), // Order of paper in the exam
  paperYear: integer("paper_year"), // Year the paper is from (e.g., 2023, 2024)
  createdAt: timestamp("created_at").defaultNow(),
});

// Mock exam results table - stores participant scores for each paper
export const mockExamResults = pgTable("mock_exam_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mockExamPaperId: varchar("mock_exam_paper_id").notNull().references(() => mockExamPapers.id, { onDelete: "cascade" }),
  serviceBookingId: varchar("service_booking_id").references(() => serviceBookings.id, { onDelete: "cascade" }), // For registration-based exams
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }), // For historical exams (direct student link)
  score: integer("score"), // Actual score achieved
  isConfirmed: boolean("is_confirmed").notNull().default(false), // Whether participant attendance is confirmed
  notes: text("notes"),
  enteredBy: varchar("entered_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service bookings table - tracks when parents sign up for mock exams or purchase products
export const serviceBookings = pgTable("service_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentUserId: varchar("parent_user_id").references(() => users.id),
  studentId: varchar("student_id").references(() => students.id),
  guestName: varchar("guest_name"), // For students not in the system
  guestEmail: varchar("guest_email"), // For guest student contact
  bookingType: varchar("booking_type", { enum: ["mock_exam", "product_purchase"] }).notNull(),
  mockExamEventId: varchar("mock_exam_event_id").references(() => mockExamEvents.id),
  productId: varchar("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "confirmed", "paid", "cancelled", "refunded"] }).notNull().default("pending"),
  invoiceId: varchar("invoice_id").references(() => adhocInvoices.id), // Links to adhoc invoice when created
  paymentReceivedAt: timestamp("payment_received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Terms and Conditions table - stores T&C versions for mock exam registration
export const termsAndConditions = pgTable("terms_and_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  version: varchar("version").notNull(), // e.g., "1.0", "2.0"
  title: varchar("title").notNull(),
  content: text("content").notNull(), // Full T&C text (HTML or markdown)
  effectiveDate: timestamp("effective_date").notNull(),
  isActive: boolean("is_active").notNull().default(true), // Only one version should be active at a time
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mock exam registration table - comprehensive registration for mock exams
export const mockExamRegistrations = pgTable("mock_exam_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mockExamEventId: varchar("mock_exam_event_id").notNull().references(() => mockExamEvents.id, { onDelete: "cascade" }),
  // For existing students
  studentId: varchar("student_id").references(() => students.id, { onDelete: "set null" }),
  parentUserId: varchar("parent_user_id").references(() => users.id, { onDelete: "set null" }),
  // Parent details (always captured)
  parentFirstName: varchar("parent_first_name").notNull(),
  parentSurname: varchar("parent_surname").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  parentPhone: varchar("parent_phone").notNull(),
  // Child details
  childFirstName: varchar("child_first_name").notNull(),
  childSurname: varchar("child_surname").notNull(),
  childDateOfBirth: timestamp("child_date_of_birth"),
  childSchool: varchar("child_school"),
  childYearGroup: varchar("child_year_group"),
  // Emergency contact
  emergencyContactName: varchar("emergency_contact_name").notNull(),
  emergencyContactRelationship: varchar("emergency_contact_relationship").notNull(),
  emergencyContactPhone: varchar("emergency_contact_phone").notNull(),
  // Medical conditions
  medicalConditions: text("medical_conditions"),
  // Photo consent
  photoConsent: boolean("photo_consent").notNull().default(false),
  // Guest or existing student flag
  isGuest: boolean("is_guest").notNull().default(false),
  // Registration status
  status: varchar("status", { 
    enum: ["pending_tc", "awaiting_payment", "confirmed", "cancelled", "refunded"] 
  }).notNull().default("pending_tc"),
  // Invoice reference
  invoiceId: varchar("invoice_id").references(() => adhocInvoices.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  // Terms acceptance reference
  termsAcceptanceId: varchar("terms_acceptance_id"),
  // Notes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Registration exam selections - links registrations to selected papers
export const registrationExamSelections = pgTable("registration_exam_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationId: varchar("registration_id").notNull().references(() => mockExamRegistrations.id, { onDelete: "cascade" }),
  mockExamPaperId: varchar("mock_exam_paper_id").notNull().references(() => mockExamPapers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Terms acceptances - records parent signatures with timestamps
export const termsAcceptances = pgTable("terms_acceptances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  termsId: varchar("terms_id").notNull().references(() => termsAndConditions.id),
  registrationId: varchar("registration_id").references(() => mockExamRegistrations.id, { onDelete: "cascade" }),
  parentEmail: varchar("parent_email").notNull(),
  parentName: varchar("parent_name").notNull(),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  signature: text("signature"), // Could store digital signature data
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory transactions table - tracks stock movements
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  transactionType: varchar("transaction_type", { enum: ["stock_in", "sale", "adjustment", "return"] }).notNull(),
  quantity: integer("quantity").notNull(), // Positive for stock in, negative for sales
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  serviceBookingId: varchar("service_booking_id").references(() => serviceBookings.id), // Links to booking if sold
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parent service notifications table - notifies parents about available mock exams/services
export const parentServiceNotifications = pgTable("parent_service_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentUserId: varchar("parent_user_id").notNull().references(() => users.id),
  mockExamEventId: varchar("mock_exam_event_id").references(() => mockExamEvents.id),
  productId: varchar("product_id").references(() => products.id),
  notificationType: varchar("notification_type", { enum: ["mock_exam_available", "product_available", "reminder", "confirmation"] }).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document store table - stores document metadata for admin/tutor uploaded files
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category", { enum: ["study_material", "worksheet", "exam_paper", "textbook", "reference", "other"] }).notNull().default("other"),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(), // Size in bytes
  fileType: varchar("file_type").notNull(), // MIME type
  objectPath: varchar("object_path").notNull(), // Path in object storage
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  subject: varchar("subject"), // Subject area (Maths, English, etc.)
  examType: varchar("exam_type"), // 11+, 13+, GCSE, A-Level, etc.
  visibleToTutors: boolean("visible_to_tutors").notNull().default(false), // Whether tutors can see this document
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document shares table - links documents to parents
export const documentShares = pgTable("document_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  parentUserId: varchar("parent_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }), // Optional: share for specific student
  sharedBy: varchar("shared_by").notNull().references(() => users.id), // Admin or tutor who shared
  message: text("message"), // Optional message to parent
  tutorVisibleWhenShared: boolean("tutor_visible_when_shared").notNull().default(false), // When shared with parent, can tutors also see this share?
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System settings table for configurable options
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: varchar("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Curriculum topics table - predefined topics/subtopics for session logging
export const curriculumTopics = pgTable("curriculum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  parentId: varchar("parent_id"), // Self-reference for subtopics (null = main topic)
  subject: varchar("subject").notNull().default("Maths"), // Subject area
  sortOrder: integer("sort_order").notNull().default(0), // For ordering topics
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table linking timesheet entries to topics covered
export const sessionTopicsCovered = pgTable("session_topics_covered", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timesheetEntryId: varchar("timesheet_entry_id").notNull().references(() => timesheetEntries.id, { onDelete: "cascade" }),
  topicId: varchar("topic_id").notNull().references(() => curriculumTopics.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work types table - admin-configurable work types for "other" timesheet entries
export const workTypes = pgTable("work_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  paymentType: varchar("payment_type", { enum: ["hourly", "flat_fee"] }).notNull().default("hourly"), // How staff are paid for this work type
  flatFeeAmount: varchar("flat_fee_amount"), // For flat_fee payment type: the fixed amount paid (stored as string for precision)
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit log table - tracks all admin actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: varchar("action", { 
    enum: [
      "user_created", "user_updated", "user_deleted",
      "student_created", "student_updated", "student_deleted",
      "student_activated", "student_deactivated",
      "waitlist_to_student", "student_to_waitlist",
      "tutor_rate_created", "tutor_rate_updated", "tutor_rate_deleted",
      "parent_rate_created", "parent_rate_updated", "parent_rate_deleted",
      "allocation_created", "allocation_updated", "allocation_deleted",
      "group_created", "group_updated", "group_deleted",
      "invoice_created", "invoice_updated", "invoice_deleted", "invoice_sent",
      "payment_recorded", "payment_deleted",
      "timesheet_approved", "timesheet_rejected",
      "document_uploaded", "document_shared", "document_deleted",
      "session_created", "session_updated", "session_deleted",
      "session_cancelled", "session_rescheduled", "session_change_rejected",
      "settings_updated", "other"
    ] 
  }).notNull(),
  entityType: varchar("entity_type", { 
    enum: ["user", "student", "tutor_rate", "parent_rate", "allocation", "group", "invoice", "payment", "timesheet", "document", "session", "session_occurrence", "session_change_request", "settings", "other"] 
  }).notNull(),
  entityId: varchar("entity_id"), // ID of the affected entity
  entityName: varchar("entity_name"), // Human-readable name of the entity (e.g., student name)
  performedBy: varchar("performed_by").notNull().references(() => users.id), // Who performed the action
  details: jsonb("details"), // Additional details about the change (before/after values, etc.)
  ipAddress: varchar("ip_address"), // IP address of the user
  userAgent: text("user_agent"), // Browser/client info
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  timesheetEntries: many(timesheetEntries),
  weeklyTimesheets: many(weeklyTimesheets),
  tutorTimeSlots: many(tutorTimeSlots),
  notifications: many(notifications),
}));

export const weeklyTimesheetsRelations = relations(weeklyTimesheets, ({ one, many }) => ({
  tutor: one(users, {
    fields: [weeklyTimesheets.tutorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [weeklyTimesheets.reviewerId],
    references: [users.id],
  }),
  entries: many(timesheetEntries),
  statusHistory: many(timesheetStatusHistory),
}));

export const timesheetStatusHistoryRelations = relations(timesheetStatusHistory, ({ one }) => ({
  weeklyTimesheet: one(weeklyTimesheets, {
    fields: [timesheetStatusHistory.weeklyTimesheetId],
    references: [weeklyTimesheets.id],
  }),
  changedByUser: one(users, {
    fields: [timesheetStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  tutor: one(users, {
    fields: [students.tutorId],
    references: [users.id],
  }),
  tutors: many(studentTutors),
  timesheetEntries: many(timesheetEntries),
  slotBookings: many(slotBookings),
  invoices: many(invoices),
  payments: many(payments),
}));

export const studentTutorsRelations = relations(studentTutors, ({ one }) => ({
  student: one(students, {
    fields: [studentTutors.studentId],
    references: [students.id],
  }),
  tutor: one(users, {
    fields: [studentTutors.tutorId],
    references: [users.id],
  }),
}));

export const timesheetEntriesRelations = relations(timesheetEntries, ({ one }) => ({
  tutor: one(users, {
    fields: [timesheetEntries.tutorId],
    references: [users.id],
  }),
  student: one(students, {
    fields: [timesheetEntries.studentId],
    references: [students.id],
  }),
  weeklyTimesheet: one(weeklyTimesheets, {
    fields: [timesheetEntries.weeklyTimesheetId],
    references: [weeklyTimesheets.id],
  }),
}));

export const tutorTimeSlotsRelations = relations(tutorTimeSlots, ({ one, many }) => ({
  tutor: one(users, {
    fields: [tutorTimeSlots.tutorId],
    references: [users.id],
  }),
  slotBookings: many(slotBookings),
}));

export const slotBookingsRelations = relations(slotBookings, ({ one }) => ({
  slot: one(tutorTimeSlots, {
    fields: [slotBookings.slotId],
    references: [tutorTimeSlots.id],
  }),
  student: one(students, {
    fields: [slotBookings.studentId],
    references: [students.id],
  }),
}));

export const recurringSessionTemplatesRelations = relations(recurringSessionTemplates, ({ one, many }) => ({
  tutor: one(users, {
    fields: [recurringSessionTemplates.tutorId],
    references: [users.id],
  }),
  student: one(students, {
    fields: [recurringSessionTemplates.studentId],
    references: [students.id],
  }),
  createdByUser: one(users, {
    fields: [recurringSessionTemplates.createdBy],
    references: [users.id],
  }),
  occurrences: many(sessionOccurrences),
}));

export const sessionOccurrencesRelations = relations(sessionOccurrences, ({ one }) => ({
  template: one(recurringSessionTemplates, {
    fields: [sessionOccurrences.templateId],
    references: [recurringSessionTemplates.id],
  }),
  tutor: one(users, {
    fields: [sessionOccurrences.tutorId],
    references: [users.id],
  }),
  student: one(students, {
    fields: [sessionOccurrences.studentId],
    references: [students.id],
  }),
}));

export const tutorAvailabilitySlotsRelations = relations(tutorAvailabilitySlots, ({ one }) => ({
  tutor: one(users, {
    fields: [tutorAvailabilitySlots.tutorId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  student: one(students, {
    fields: [invoices.studentId],
    references: [students.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  timesheetEntry: one(timesheetEntries, {
    fields: [invoiceLineItems.timesheetEntryId],
    references: [timesheetEntries.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
}));

export const parentMessagesRelations = relations(parentMessages, ({ one, many }) => ({
  student: one(students, {
    fields: [parentMessages.studentId],
    references: [students.id],
  }),
  readByTutor: one(users, {
    fields: [parentMessages.readByTutorId],
    references: [users.id],
  }),
  replies: many(parentMessageReplies),
}));

export const parentMessageRepliesRelations = relations(parentMessageReplies, ({ one }) => ({
  message: one(parentMessages, {
    fields: [parentMessageReplies.messageId],
    references: [parentMessages.id],
  }),
  repliedBy: one(users, {
    fields: [parentMessageReplies.repliedById],
    references: [users.id],
  }),
}));

export const studentTopicsRelations = relations(studentTopics, ({ one }) => ({
  student: one(students, {
    fields: [studentTopics.studentId],
    references: [students.id],
  }),
  coveredBy: one(users, {
    fields: [studentTopics.coveredById],
    references: [users.id],
  }),
}));

export const studentGroupsRelations = relations(studentGroups, ({ one, many }) => ({
  tutor: one(users, {
    fields: [studentGroups.tutorId],
    references: [users.id],
  }),
  members: many(studentGroupMembers),
}));

export const studentGroupMembersRelations = relations(studentGroupMembers, ({ one }) => ({
  group: one(studentGroups, {
    fields: [studentGroupMembers.groupId],
    references: [studentGroups.id],
  }),
  student: one(students, {
    fields: [studentGroupMembers.studentId],
    references: [students.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  performedByUser: one(users, {
    fields: [auditLogs.performedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Emergency contact name is required"),
  relationship: z.string().optional(),
  phone: z.string().min(1, "Emergency contact phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  lastUpdatedAt: z.string().optional(),
});

export type EmergencyContact = z.infer<typeof emergencyContactSchema>;

export const insertTimesheetEntrySchema = createInsertSchema(timesheetEntries).omit({
  id: true,
  tutorEarnings: true,
  parentBilling: true,
  status: true,
  weeklyTimesheetId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeeklyTimesheetSchema = createInsertSchema(weeklyTimesheets).omit({
  id: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  reviewerId: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimesheetStatusHistorySchema = createInsertSchema(timesheetStatusHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTutorTimeSlotSchema = createInsertSchema(tutorTimeSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlotBookingSchema = createInsertSchema(slotBookings).omit({
  id: true,
  createdAt: true,
});

export const insertRecurringSessionTemplateSchema = createInsertSchema(recurringSessionTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRecurringSessionTemplateSchema = createInsertSchema(recurringSessionTemplates).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertSessionOccurrenceSchema = createInsertSchema(sessionOccurrences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSessionOccurrenceSchema = createInsertSchema(sessionOccurrences).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertTutorAvailabilitySlotSchema = createInsertSchema(tutorAvailabilitySlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTutorAvailabilitySlotSchema = createInsertSchema(tutorAvailabilitySlots).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertStudentTutorSchema = createInsertSchema(studentTutors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStudentTutorSchema = createInsertSchema(studentTutors).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSessionChangeRequestSchema = createInsertSchema(sessionChangeRequests).omit({
  id: true,
  status: true,
  acknowledgedAt: true,
  acknowledgedBy: true,
  createdAt: true,
});

export const insertSessionLoggingAlertSchema = createInsertSchema(sessionLoggingAlerts).omit({
  id: true,
  alertCreatedAt: true,
  createdAt: true,
});

export const insertInvoicePaymentAlertSchema = createInsertSchema(invoicePaymentAlerts).omit({
  id: true,
  alertCreatedAt: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  status: true,
  paidAt: true,
  parentClaimedPaid: true,
  parentClaimedPaidAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export const insertTutorInvoiceSchema = createInsertSchema(tutorInvoices).omit({
  id: true,
  status: true,
  approvedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTutorInvoiceSchema = createInsertSchema(tutorInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertAdhocInvoiceSchema = createInsertSchema(adhocInvoices).omit({
  id: true,
  paidAt: true,
  inventoryDeducted: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAdhocInvoiceSchema = createInsertSchema(adhocInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertAdhocInvoiceItemSchema = createInsertSchema(adhocInvoiceItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWaitlistSchema = createInsertSchema(waitlist).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertParentMessageSchema = createInsertSchema(parentMessages).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

export const insertParentMessageReplySchema = createInsertSchema(parentMessageReplies).omit({
  id: true,
  createdAt: true,
});

export const insertStudentTopicSchema = createInsertSchema(studentTopics).omit({
  id: true,
  isCovered: true,
  coveredAt: true,
  coveredById: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStudentTopicSchema = createInsertSchema(studentTopics).omit({
  id: true,
  studentId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertRateConfigurationSchema = createInsertSchema(rateConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRateConfigurationSchema = createInsertSchema(rateConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Tutor rate schemas
export const insertTutorRateSchema = createInsertSchema(tutorRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTutorRateSchema = createInsertSchema(tutorRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Parent rate schemas
export const insertParentRateSchema = createInsertSchema(parentRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateParentRateSchema = createInsertSchema(parentRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Rate link schemas
export const insertRateLinkSchema = createInsertSchema(rateLinks).omit({
  id: true,
  createdAt: true,
});

// Tutor group schemas
export const insertTutorGroupSchema = createInsertSchema(tutorGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTutorGroupSchema = createInsertSchema(tutorGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertTutorGroupMemberSchema = createInsertSchema(tutorGroupMembers).omit({
  id: true,
  createdAt: true,
});

// Tutor rate to tutors schema
export const insertTutorRateTutorSchema = createInsertSchema(tutorRateTutors).omit({
  id: true,
  createdAt: true,
});

// Tutor rate to tutor groups schema
export const insertTutorRateTutorGroupSchema = createInsertSchema(tutorRateTutorGroups).omit({
  id: true,
  createdAt: true,
});

// Student group schemas
export const insertStudentGroupSchema = createInsertSchema(studentGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateStudentGroupSchema = createInsertSchema(studentGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertStudentGroupMemberSchema = createInsertSchema(studentGroupMembers).omit({
  id: true,
  createdAt: true,
});

// Group sessions schemas
export const insertGroupSessionSchema = createInsertSchema(groupSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateGroupSessionSchema = insertGroupSessionSchema.partial();

export const insertGroupSessionAttendanceSchema = createInsertSchema(groupSessionAttendance).omit({
  id: true,
  createdAt: true,
});

export const updateStudentSchema = insertStudentSchema.partial();
export const updateUserSchema = insertUserSchema.partial();
export const updateTutorTimeSlotSchema = insertTutorTimeSlotSchema.partial();
export const updateInvoiceSchema = insertInvoiceSchema.partial();

// Curriculum topics schemas
export const insertCurriculumTopicSchema = createInsertSchema(curriculumTopics).omit({
  id: true,
  createdAt: true,
});

export const updateCurriculumTopicSchema = createInsertSchema(curriculumTopics).omit({
  id: true,
  createdAt: true,
}).partial();

// Session topics covered schemas
export const insertSessionTopicCoveredSchema = createInsertSchema(sessionTopicsCovered).omit({
  id: true,
  createdAt: true,
});

// Work types schemas
export const insertWorkTypeSchema = createInsertSchema(workTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWorkTypeSchema = createInsertSchema(workTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Audit log schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Products schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Mock exam events schemas
export const insertMockExamEventSchema = createInsertSchema(mockExamEvents).omit({
  id: true,
  currentEnrollments: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMockExamEventSchema = createInsertSchema(mockExamEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Mock exam expenses schemas
export const insertMockExamExpenseSchema = createInsertSchema(mockExamExpenses).omit({
  id: true,
  isPaid: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMockExamExpenseSchema = createInsertSchema(mockExamExpenses).omit({
  id: true,
  mockExamEventId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Mock exam papers schemas
export const insertMockExamPaperSchema = createInsertSchema(mockExamPapers).omit({
  id: true,
  createdAt: true,
});

export const updateMockExamPaperSchema = createInsertSchema(mockExamPapers).omit({
  id: true,
  mockExamEventId: true,
  createdAt: true,
}).partial();

// Mock exam results schemas
export const insertMockExamResultSchema = createInsertSchema(mockExamResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMockExamResultSchema = createInsertSchema(mockExamResults).omit({
  id: true,
  mockExamPaperId: true,
  serviceBookingId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Service bookings schemas
export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Inventory transactions schemas
export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

// Parent service notifications schemas
export const insertParentServiceNotificationSchema = createInsertSchema(parentServiceNotifications).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

// Document store schemas
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedBy: true,
  objectPath: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Document share schemas
export const insertDocumentShareSchema = createInsertSchema(documentShares).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

// Terms and Conditions schemas
export const insertTermsAndConditionsSchema = createInsertSchema(termsAndConditions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTermsAndConditionsSchema = createInsertSchema(termsAndConditions).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Mock exam registration schemas
export const insertMockExamRegistrationSchema = createInsertSchema(mockExamRegistrations).omit({
  id: true,
  status: true,
  invoiceId: true,
  termsAcceptanceId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMockExamRegistrationSchema = createInsertSchema(mockExamRegistrations).omit({
  id: true,
  mockExamEventId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Registration exam selections schemas
export const insertRegistrationExamSelectionSchema = createInsertSchema(registrationExamSelections).omit({
  id: true,
  createdAt: true,
});

// Terms acceptances schemas
export const insertTermsAcceptanceSchema = createInsertSchema(termsAcceptances).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;
export type TimesheetEntry = typeof timesheetEntries.$inferSelect;
export type InsertTimesheetEntry = z.infer<typeof insertTimesheetEntrySchema>;
export type WeeklyTimesheet = typeof weeklyTimesheets.$inferSelect;
export type InsertWeeklyTimesheet = z.infer<typeof insertWeeklyTimesheetSchema>;
export type TimesheetStatusHistory = typeof timesheetStatusHistory.$inferSelect;
export type InsertTimesheetStatusHistory = z.infer<typeof insertTimesheetStatusHistorySchema>;
export type TutorTimeSlot = typeof tutorTimeSlots.$inferSelect;
export type InsertTutorTimeSlot = z.infer<typeof insertTutorTimeSlotSchema>;
export type UpdateTutorTimeSlot = z.infer<typeof updateTutorTimeSlotSchema>;
export type SlotBooking = typeof slotBookings.$inferSelect;
export type InsertSlotBooking = z.infer<typeof insertSlotBookingSchema>;
export type RecurringSessionTemplate = typeof recurringSessionTemplates.$inferSelect;
export type InsertRecurringSessionTemplate = z.infer<typeof insertRecurringSessionTemplateSchema>;
export type UpdateRecurringSessionTemplate = z.infer<typeof updateRecurringSessionTemplateSchema>;
export type SessionOccurrence = typeof sessionOccurrences.$inferSelect;
export type InsertSessionOccurrence = z.infer<typeof insertSessionOccurrenceSchema>;
export type UpdateSessionOccurrence = z.infer<typeof updateSessionOccurrenceSchema>;
export type TutorAvailabilitySlot = typeof tutorAvailabilitySlots.$inferSelect;
export type InsertTutorAvailabilitySlot = z.infer<typeof insertTutorAvailabilitySlotSchema>;
export type UpdateTutorAvailabilitySlot = z.infer<typeof updateTutorAvailabilitySlotSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SessionChangeRequest = typeof sessionChangeRequests.$inferSelect;
export type InsertSessionChangeRequest = z.infer<typeof insertSessionChangeRequestSchema>;
export type SessionLoggingAlert = typeof sessionLoggingAlerts.$inferSelect;
export type InsertSessionLoggingAlert = z.infer<typeof insertSessionLoggingAlertSchema>;
export type InvoicePaymentAlert = typeof invoicePaymentAlerts.$inferSelect;
export type InsertInvoicePaymentAlert = z.infer<typeof insertInvoicePaymentAlertSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;
export type TutorInvoice = typeof tutorInvoices.$inferSelect;
export type InsertTutorInvoice = z.infer<typeof insertTutorInvoiceSchema>;
export type UpdateTutorInvoice = z.infer<typeof updateTutorInvoiceSchema>;
export type AdhocInvoice = typeof adhocInvoices.$inferSelect;
export type InsertAdhocInvoice = z.infer<typeof insertAdhocInvoiceSchema>;
export type UpdateAdhocInvoice = z.infer<typeof updateAdhocInvoiceSchema>;
export type AdhocInvoiceItem = typeof adhocInvoiceItems.$inferSelect;
export type InsertAdhocInvoiceItem = z.infer<typeof insertAdhocInvoiceItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistSchema>;
export type UpdateWaitlistEntry = z.infer<typeof updateWaitlistSchema>;
export type ParentMessage = typeof parentMessages.$inferSelect;
export type InsertParentMessage = z.infer<typeof insertParentMessageSchema>;
export type ParentMessageReply = typeof parentMessageReplies.$inferSelect;
export type InsertParentMessageReply = z.infer<typeof insertParentMessageReplySchema>;
export type StudentTopic = typeof studentTopics.$inferSelect;
export type InsertStudentTopic = z.infer<typeof insertStudentTopicSchema>;
export type UpdateStudentTopic = z.infer<typeof updateStudentTopicSchema>;
export type RateConfiguration = typeof rateConfigurations.$inferSelect;
export type InsertRateConfiguration = z.infer<typeof insertRateConfigurationSchema>;
export type UpdateRateConfiguration = z.infer<typeof updateRateConfigurationSchema>;
export type TutorRate = typeof tutorRates.$inferSelect;
export type InsertTutorRate = z.infer<typeof insertTutorRateSchema>;
export type UpdateTutorRate = z.infer<typeof updateTutorRateSchema>;
export type ParentRate = typeof parentRates.$inferSelect;
export type InsertParentRate = z.infer<typeof insertParentRateSchema>;
export type UpdateParentRate = z.infer<typeof updateParentRateSchema>;
export type RateLink = typeof rateLinks.$inferSelect;
export type InsertRateLink = z.infer<typeof insertRateLinkSchema>;
export type TutorGroup = typeof tutorGroups.$inferSelect;
export type InsertTutorGroup = z.infer<typeof insertTutorGroupSchema>;
export type UpdateTutorGroup = z.infer<typeof updateTutorGroupSchema>;
export type TutorGroupMember = typeof tutorGroupMembers.$inferSelect;
export type InsertTutorGroupMember = z.infer<typeof insertTutorGroupMemberSchema>;
export type TutorRateTutor = typeof tutorRateTutors.$inferSelect;
export type InsertTutorRateTutor = z.infer<typeof insertTutorRateTutorSchema>;
export type TutorRateTutorGroup = typeof tutorRateTutorGroups.$inferSelect;
export type InsertTutorRateTutorGroup = z.infer<typeof insertTutorRateTutorGroupSchema>;
export type StudentTutor = typeof studentTutors.$inferSelect;
export type InsertStudentTutor = z.infer<typeof insertStudentTutorSchema>;
export type UpdateStudentTutor = z.infer<typeof updateStudentTutorSchema>;
export type StudentGroup = typeof studentGroups.$inferSelect;
export type InsertStudentGroup = z.infer<typeof insertStudentGroupSchema>;
export type UpdateStudentGroup = z.infer<typeof updateStudentGroupSchema>;
export type StudentGroupMember = typeof studentGroupMembers.$inferSelect;
export type InsertStudentGroupMember = z.infer<typeof insertStudentGroupMemberSchema>;
export type GroupSession = typeof groupSessions.$inferSelect;
export type InsertGroupSession = z.infer<typeof insertGroupSessionSchema>;
export type UpdateGroupSession = z.infer<typeof updateGroupSessionSchema>;
export type GroupSessionAttendance = typeof groupSessionAttendance.$inferSelect;
export type InsertGroupSessionAttendance = z.infer<typeof insertGroupSessionAttendanceSchema>;
export type CurriculumTopic = typeof curriculumTopics.$inferSelect;
export type InsertCurriculumTopic = z.infer<typeof insertCurriculumTopicSchema>;
export type UpdateCurriculumTopic = z.infer<typeof updateCurriculumTopicSchema>;
export type SessionTopicCovered = typeof sessionTopicsCovered.$inferSelect;
export type InsertSessionTopicCovered = z.infer<typeof insertSessionTopicCoveredSchema>;
export type WorkType = typeof workTypes.$inferSelect;
export type InsertWorkType = z.infer<typeof insertWorkTypeSchema>;
export type UpdateWorkType = z.infer<typeof updateWorkTypeSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type MockExamEvent = typeof mockExamEvents.$inferSelect;
export type InsertMockExamEvent = z.infer<typeof insertMockExamEventSchema>;
export type UpdateMockExamEvent = z.infer<typeof updateMockExamEventSchema>;
export type MockExamExpense = typeof mockExamExpenses.$inferSelect;
export type InsertMockExamExpense = z.infer<typeof insertMockExamExpenseSchema>;
export type UpdateMockExamExpense = z.infer<typeof updateMockExamExpenseSchema>;
export type MockExamPaper = typeof mockExamPapers.$inferSelect;
export type InsertMockExamPaper = z.infer<typeof insertMockExamPaperSchema>;
export type UpdateMockExamPaper = z.infer<typeof updateMockExamPaperSchema>;
export type MockExamResult = typeof mockExamResults.$inferSelect;
export type InsertMockExamResult = z.infer<typeof insertMockExamResultSchema>;
export type UpdateMockExamResult = z.infer<typeof updateMockExamResultSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type UpdateServiceBooking = z.infer<typeof updateServiceBookingSchema>;
export type TermsAndConditions = typeof termsAndConditions.$inferSelect;
export type InsertTermsAndConditions = z.infer<typeof insertTermsAndConditionsSchema>;
export type UpdateTermsAndConditions = z.infer<typeof updateTermsAndConditionsSchema>;
export type MockExamRegistration = typeof mockExamRegistrations.$inferSelect;
export type InsertMockExamRegistration = z.infer<typeof insertMockExamRegistrationSchema>;
export type UpdateMockExamRegistration = z.infer<typeof updateMockExamRegistrationSchema>;
export type RegistrationExamSelection = typeof registrationExamSelections.$inferSelect;
export type InsertRegistrationExamSelection = z.infer<typeof insertRegistrationExamSelectionSchema>;
export type TermsAcceptance = typeof termsAcceptances.$inferSelect;
export type InsertTermsAcceptance = z.infer<typeof insertTermsAcceptanceSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type ParentServiceNotification = typeof parentServiceNotifications.$inferSelect;
export type InsertParentServiceNotification = z.infer<typeof insertParentServiceNotificationSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Audit log with user details
export type AuditLogWithUser = AuditLog & {
  performedByUser: User;
};

// Extended types with relations
export type StudentTutorWithUser = StudentTutor & {
  tutor: User;
};

export type AllocationWithRelations = StudentTutor & {
  tutor: User;
  student: Student;
  profit: string; // Computed: parentRate - tutorRate
};

export type TutorProfitSummary = {
  tutorId: string;
  tutorName: string;
  totalAllocations: number;
  activeAllocations: number;
  totalParentRevenue: string;
  totalTutorCost: string;
  totalProfit: string;
  profitMargin: string;
};

export type StudentWithTutor = Student & {
  tutor: User;
  assignedTutors?: StudentTutorWithUser[];
};

export type StudentWithRelations = Student & {
  tutor: User;
  parent?: User;
};

export type TimesheetEntryWithRelations = TimesheetEntry & {
  student: Student;
  tutor: User;
  topicsCovered?: CurriculumTopic[];
};

export type CurriculumTopicWithSubtopics = CurriculumTopic & {
  subtopics: CurriculumTopic[];
};

export type WeeklyTimesheetWithRelations = WeeklyTimesheet & {
  tutor: User;
  reviewer?: User | null;
  entries: TimesheetEntryWithRelations[];
};

export type TutorTimeSlotWithRelations = TutorTimeSlot & {
  tutor: User;
  slotBookings: SlotBookingWithRelations[];
};

export type SlotBookingWithRelations = SlotBooking & {
  slot: TutorTimeSlot;
  student: StudentWithRelations;
};

export type InvoiceWithRelations = Invoice & {
  student: Student;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
};

export type PaymentWithRelations = Payment & {
  invoice?: Invoice | null;
  student: Student;
};

// Archive summary types
export type ArchivedStudentSummary = Student & {
  tutor: User;
  totalBilled: number;
  totalReceived: number;
  totalOutstanding: number;
  invoiceCount: number;
  sessionCount: number;
};

export type ArchivedTutorSummary = User & {
  totalEarnings: number;
  totalPaid: number;
  totalOutstanding: number;
  sessionCount: number;
  studentCount: number;
};

export type ParentMessageReplyWithRelations = ParentMessageReply & {
  repliedBy: User;
};

export type ParentMessageWithRelations = ParentMessage & {
  student: Student;
  replies?: ParentMessageReplyWithRelations[];
  readByTutor?: User | null;
};

export type StudentTopicWithRelations = StudentTopic & {
  student: Student;
  coveredBy?: User | null;
};

export type StudentGroupMemberWithStudent = StudentGroupMember & {
  student: Student;
};

export type StudentGroupWithMembers = StudentGroup & {
  tutor: User;
  members: StudentGroupMemberWithStudent[];
};

// Tutor group types with relations
export type TutorGroupMemberWithUser = TutorGroupMember & {
  tutor: User;
};

export type TutorGroupWithMembers = TutorGroup & {
  members: TutorGroupMemberWithUser[];
};

// Group session types with relations
export type GroupSessionAttendanceWithStudent = GroupSessionAttendance & {
  student: Student;
};

export type GroupSessionWithDetails = GroupSession & {
  group: StudentGroupWithMembers;
  tutor: User;
  attendance: GroupSessionAttendanceWithStudent[];
};

// System settings schemas and types
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({ id: true, updatedAt: true });
export const updateSystemSettingSchema = insertSystemSettingSchema.partial();
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type UpdateSystemSetting = z.infer<typeof updateSystemSettingSchema>;

// Service booking with relations
export type ServiceBookingWithRelations = ServiceBooking & {
  parent?: User | null;
  student?: Student | null;
  mockExamEvent?: MockExamEvent | null;
  product?: Product | null;
  invoice?: AdhocInvoice | null;
};

// Mock exam result with relations
export type MockExamResultWithRelations = MockExamResult & {
  paper?: MockExamPaper;
  booking?: ServiceBookingWithRelations;
};

// Mock exam paper with results
export type MockExamPaperWithResults = MockExamPaper & {
  results: MockExamResultWithRelations[];
};

// Mock exam event with bookings
export type MockExamEventWithBookings = MockExamEvent & {
  bookings: ServiceBookingWithRelations[];
  expenses?: MockExamExpense[];
  papers?: MockExamPaperWithResults[];
  financials?: {
    totalIncome: number;
    paidIncome: number;
    totalExpenses: number;
    paidExpenses: number;
    profit: number;
  };
};

// Product with inventory info
export type ProductWithInventory = Product & {
  recentTransactions?: InventoryTransaction[];
  isLowStock: boolean;
};

// Parent service notification with relations
export type ParentServiceNotificationWithRelations = ParentServiceNotification & {
  mockExamEvent?: MockExamEvent | null;
  product?: Product | null;
};

// Document with uploader info
export type DocumentWithUploader = Document & {
  uploader: User;
  shareCount?: number;
};

// Document share with full relations
export type DocumentShareWithRelations = DocumentShare & {
  document: Document;
  parent: User;
  student?: Student | null;
  sharedByUser: User;
};

// Mock exam registration with relations
export type MockExamRegistrationWithRelations = MockExamRegistration & {
  mockExamEvent: MockExamEvent;
  student?: Student | null;
  parent?: User | null;
  examSelections: (RegistrationExamSelection & { paper: MockExamPaper })[];
  termsAcceptance?: TermsAcceptance | null;
  invoice?: AdhocInvoice | null;
};

// Terms and conditions with creator info
export type TermsAndConditionsWithCreator = TermsAndConditions & {
  creator?: User | null;
};
