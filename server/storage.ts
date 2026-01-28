import {
  users,
  students,
  studentTutors,
  timesheetEntries,
  weeklyTimesheets,
  timesheetStatusHistory,
  tutorTimeSlots,
  slotBookings,
  notifications,
  sessionLoggingAlerts,
  invoicePaymentAlerts,
  invoices,
  invoiceLineItems,
  payments,
  tutorInvoices,
  waitlist,
  parentMessages,
  parentMessageReplies,
  studentTopics,
  rateConfigurations,
  tutorRates,
  parentRates,
  rateLinks,
  tutorGroups,
  tutorGroupMembers,
  tutorRateTutors,
  tutorRateTutorGroups,
  adhocInvoices,
  adhocInvoiceItems,
  systemSettings,
  studentGroups,
  studentGroupMembers,
  groupSessions,
  groupSessionAttendance,
  type User,
  type UpsertUser,
  type InsertUser,
  type UpdateUser,
  type Student,
  type InsertStudent,
  type UpdateStudent,
  type TimesheetEntry,
  type InsertTimesheetEntry,
  type WeeklyTimesheet,
  type InsertWeeklyTimesheet,
  type TimesheetStatusHistory,
  type InsertTimesheetStatusHistory,
  type TutorTimeSlot,
  type InsertTutorTimeSlot,
  type UpdateTutorTimeSlot,
  type SlotBooking,
  type InsertSlotBooking,
  type Notification,
  type InsertNotification,
  type SessionLoggingAlert,
  type InsertSessionLoggingAlert,
  type InvoicePaymentAlert,
  type InsertInvoicePaymentAlert,
  type Invoice,
  type InsertInvoice,
  type UpdateInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type Payment,
  type InsertPayment,
  type WaitlistEntry,
  type InsertWaitlistEntry,
  type UpdateWaitlistEntry,
  type ParentMessage,
  type InsertParentMessage,
  type ParentMessageWithRelations,
  type ParentMessageReply,
  type InsertParentMessageReply,
  type ParentMessageReplyWithRelations,
  type StudentWithTutor,
  type StudentWithRelations,
  type TimesheetEntryWithRelations,
  type WeeklyTimesheetWithRelations,
  type TutorTimeSlotWithRelations,
  type SlotBookingWithRelations,
  type InvoiceWithRelations,
  type PaymentWithRelations,
  type ArchivedStudentSummary,
  type ArchivedTutorSummary,
  type StudentTopic,
  type InsertStudentTopic,
  type UpdateStudentTopic,
  type StudentTutor,
  type InsertStudentTutor,
  type UpdateStudentTutor,
  type StudentTutorWithUser,
  type AllocationWithRelations,
  type TutorProfitSummary,
  type StudentTopicWithRelations,
  type RateConfiguration,
  type InsertRateConfiguration,
  type UpdateRateConfiguration,
  type TutorRate,
  type InsertTutorRate,
  type UpdateTutorRate,
  type ParentRate,
  type InsertParentRate,
  type UpdateParentRate,
  type RateLink,
  type InsertRateLink,
  type TutorGroup,
  type InsertTutorGroup,
  type UpdateTutorGroup,
  type TutorGroupMember,
  type InsertTutorGroupMember,
  type TutorRateTutor,
  type InsertTutorRateTutor,
  type TutorRateTutorGroup,
  type InsertTutorRateTutorGroup,
  type TutorGroupWithMembers,
  type TutorGroupMemberWithUser,
  type TutorInvoice,
  type InsertTutorInvoice,
  type UpdateTutorInvoice,
  type AdhocInvoice,
  type InsertAdhocInvoice,
  type UpdateAdhocInvoice,
  type AdhocInvoiceItem,
  type InsertAdhocInvoiceItem,
  type SystemSetting,
  type InsertSystemSetting,
  type UpdateSystemSetting,
  type StudentGroup,
  type InsertStudentGroup,
  type UpdateStudentGroup,
  type StudentGroupMember,
  type InsertStudentGroupMember,
  type StudentGroupWithMembers,
  type StudentGroupMemberWithStudent,
  type GroupSession,
  type InsertGroupSession,
  type GroupSessionAttendance,
  type InsertGroupSessionAttendance,
  type GroupSessionWithDetails,
  type GroupSessionAttendanceWithStudent,
  curriculumTopics,
  sessionTopicsCovered,
  recurringSessionTemplates,
  sessionOccurrences,
  tutorAvailabilitySlots,
  products,
  mockExamEvents,
  mockExamExpenses,
  mockExamPapers,
  mockExamResults,
  serviceBookings,
  inventoryTransactions,
  parentServiceNotifications,
  documents,
  documentShares,
  termsAndConditions,
  mockExamRegistrations,
  registrationExamSelections,
  termsAcceptances,
  type Product,
  type InsertProduct,
  type UpdateProduct,
  type MockExamEvent,
  type InsertMockExamEvent,
  type UpdateMockExamEvent,
  type MockExamExpense,
  type InsertMockExamExpense,
  type UpdateMockExamExpense,
  type MockExamPaper,
  type InsertMockExamPaper,
  type UpdateMockExamPaper,
  type MockExamResult,
  type InsertMockExamResult,
  type UpdateMockExamResult,
  type MockExamPaperWithResults,
  type MockExamResultWithRelations,
  type ServiceBooking,
  type InsertServiceBooking,
  type UpdateServiceBooking,
  type InventoryTransaction,
  type InsertInventoryTransaction,
  type ParentServiceNotification,
  type InsertParentServiceNotification,
  type ServiceBookingWithRelations,
  type MockExamEventWithBookings,
  type ProductWithInventory,
  type ParentServiceNotificationWithRelations,
  type Document,
  type InsertDocument,
  type UpdateDocument,
  type DocumentShare,
  type InsertDocumentShare,
  type DocumentWithUploader,
  type DocumentShareWithRelations,
  type TermsAndConditions,
  type InsertTermsAndConditions,
  type UpdateTermsAndConditions,
  type TermsAndConditionsWithCreator,
  type MockExamRegistration,
  type InsertMockExamRegistration,
  type UpdateMockExamRegistration,
  type MockExamRegistrationWithRelations,
  type RegistrationExamSelection,
  type InsertRegistrationExamSelection,
  type TermsAcceptance,
  type InsertTermsAcceptance,
  sessionChangeRequests,
  type CurriculumTopic,
  type InsertCurriculumTopic,
  type UpdateCurriculumTopic,
  type CurriculumTopicWithSubtopics,
  type SessionTopicCovered,
  type InsertSessionTopicCovered,
  workTypes,
  type WorkType,
  type InsertWorkType,
  type UpdateWorkType,
  type RecurringSessionTemplate,
  type InsertRecurringSessionTemplate,
  type UpdateRecurringSessionTemplate,
  type SessionOccurrence,
  type InsertSessionOccurrence,
  type UpdateSessionOccurrence,
  type TutorAvailabilitySlot,
  type InsertTutorAvailabilitySlot,
  type UpdateTutorAvailabilitySlot,
  type EmergencyContact,
  type SessionChangeRequest,
  type InsertSessionChangeRequest,
  auditLogs,
  type AuditLog,
  type InsertAuditLog,
  type AuditLogWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, lt, desc, asc, sql, inArray, not, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// Fiscal year utilities
const DEFAULT_FISCAL_YEAR_START_MONTH = 10; // October

export interface FiscalYearRange {
  year: number;  // The starting year of the fiscal year (e.g., 2024 for FY 2024-2025)
  startDate: Date;
  endDate: Date;
  label: string; // e.g., "2024-2025"
}

export function getFiscalYearRange(year: number, startMonth: number = DEFAULT_FISCAL_YEAR_START_MONTH): FiscalYearRange {
  // Fiscal year 2024-2025 runs from Oct 1, 2024 to Sep 30, 2025
  const startDate = new Date(year, startMonth - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year + 1, startMonth - 1, 0, 23, 59, 59, 999); // Last day of month before start month next year
  return {
    year,
    startDate,
    endDate,
    label: `${year}-${year + 1}`,
  };
}

export function getCurrentFiscalYear(startMonth: number = DEFAULT_FISCAL_YEAR_START_MONTH): number {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  // If we're before the start month, we're in the previous fiscal year
  return currentMonth >= startMonth ? currentYear : currentYear - 1;
}

export function getAvailableFiscalYears(startMonth: number = DEFAULT_FISCAL_YEAR_START_MONTH): FiscalYearRange[] {
  const currentFY = getCurrentFiscalYear(startMonth);
  const years: FiscalYearRange[] = [];
  // Show current year and up to 5 previous years
  for (let i = 0; i <= 5; i++) {
    years.push(getFiscalYearRange(currentFY - i, startMonth));
  }
  return years;
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tutor management
  getTutors(includeInactive?: boolean): Promise<User[]>;
  getAdditionalStaff(): Promise<User[]>;
  createTutor(tutor: InsertUser): Promise<User>;
  updateTutor(id: string, updates: UpdateUser): Promise<User>;
  archiveTutor(id: string): Promise<User>;
  restoreTutor(id: string): Promise<User>;
  
  // Role-based user queries
  getUsersByRole(role: string): Promise<User[]>;
  
  // Parent user management
  getParentUsers(): Promise<User[]>;
  
  // Student operations
  getStudents(includeInactive?: boolean): Promise<StudentWithTutor[]>;
  getStudentsByTutor(tutorId: string): Promise<StudentWithTutor[]>;
  getStudent(id: string): Promise<StudentWithTutor | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: UpdateStudent): Promise<Student>;
  decrementStudentSessions(id: string): Promise<Student>;
  incrementStudentSessions(id: string): Promise<Student>;
  addSessionsToStudent(id: string, sessions: number): Promise<Student>;
  archiveStudent(id: string): Promise<Student>;
  restoreStudent(id: string): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  // Timesheet operations
  getTimesheetEntries(tutorId?: string, startDate?: Date, endDate?: Date): Promise<TimesheetEntryWithRelations[]>;
  getTimesheetEntriesByStatus(status: "pending" | "approved" | "rejected"): Promise<TimesheetEntryWithRelations[]>;
  createTimesheetEntry(entry: InsertTimesheetEntry & { tutorId: string }): Promise<TimesheetEntry>;
  updateTimesheetEntryStatus(id: string, status: "approved" | "rejected"): Promise<TimesheetEntry>;
  
  // Weekly timesheet operations
  getOrCreateWeeklyTimesheet(tutorId: string, weekStart: Date, weekEnd: Date): Promise<WeeklyTimesheet>;
  getWeeklyTimesheet(id: string): Promise<WeeklyTimesheetWithRelations | undefined>;
  getWeeklyTimesheetsByTutor(tutorId: string): Promise<WeeklyTimesheetWithRelations[]>;
  getWeeklyTimesheetsByStatus(status: "draft" | "submitted" | "approved" | "rejected"): Promise<WeeklyTimesheetWithRelations[]>;
  getAllWeeklyTimesheets(): Promise<WeeklyTimesheetWithRelations[]>;
  submitWeeklyTimesheet(id: string): Promise<WeeklyTimesheet>;
  reviewWeeklyTimesheet(id: string, reviewerId: string, status: "approved" | "rejected", notes?: string): Promise<WeeklyTimesheet>;
  
  // Timesheet entry operations for tutors
  getTimesheetEntry(id: string): Promise<TimesheetEntry | undefined>;
  getTimesheetEntryBySessionOccurrence(sessionOccurrenceId: string): Promise<TimesheetEntry | undefined>;
  updateTimesheetEntryByTutor(id: string, tutorId: string, updates: { date?: Date; duration?: number; notes?: string }): Promise<TimesheetEntry>;
  deleteTimesheetEntry(id: string, tutorId: string): Promise<void>;
  
  // Timesheet status history operations
  addTimesheetStatusHistory(history: InsertTimesheetStatusHistory): Promise<TimesheetStatusHistory>;
  getTimesheetStatusHistory(weeklyTimesheetId: string): Promise<(TimesheetStatusHistory & { changedByName?: string })[]>;
  
  // Time slot operations
  getTutorTimeSlots(tutorId?: string, startDate?: Date, endDate?: Date): Promise<TutorTimeSlotWithRelations[]>;
  createTutorTimeSlot(slot: InsertTutorTimeSlot): Promise<TutorTimeSlot>;
  updateTutorTimeSlot(id: string, updates: UpdateTutorTimeSlot): Promise<TutorTimeSlot>;
  deleteTutorTimeSlot(id: string): Promise<void>;
  getAvailableSlots(startDate?: Date, endDate?: Date, tutorId?: string, subject?: string): Promise<TutorTimeSlotWithRelations[]>;
  
  // Booking operations
  getSlotBookings(studentId?: string, slotId?: string): Promise<SlotBookingWithRelations[]>;
  createSlotBooking(booking: InsertSlotBooking): Promise<SlotBooking>;
  cancelSlotBooking(id: string): Promise<SlotBooking>;
  markAttendance(slotId: string, presentStudentIds: string[]): Promise<TimesheetEntry[]>;
  
  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  getAdminNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification>;
  
  // Session logging alert operations
  getOverdueSessionsForAlerts(): Promise<SessionOccurrence[]>;
  createSessionLoggingAlert(alert: InsertSessionLoggingAlert): Promise<SessionLoggingAlert>;
  getSessionLoggingAlerts(tutorId?: string, status?: string): Promise<(SessionLoggingAlert & { tutorName: string; studentName: string })[]>;
  resolveSessionLoggingAlert(sessionOccurrenceId: string, timesheetEntryId: string): Promise<SessionLoggingAlert | undefined>;
  dismissSessionLoggingAlert(id: string, adminId: string, reason: string): Promise<SessionLoggingAlert>;
  getTutorComplianceMetrics(tutorId?: string): Promise<{ tutorId: string; tutorName: string; totalSessions: number; lateLogged: number; latePercentage: number; avgHoursLate: number; pendingAlerts: number }[]>;
  
  // Invoice payment alert operations
  getOverdueInvoicesForAlerts(): Promise<Invoice[]>;
  createInvoicePaymentAlert(alert: InsertInvoicePaymentAlert): Promise<InvoicePaymentAlert>;
  getInvoicePaymentAlerts(parentId?: string, status?: string): Promise<(InvoicePaymentAlert & { parentName: string; studentName: string; invoiceNumber: string; amount: string })[]>;
  resolveInvoicePaymentAlert(invoiceId: string): Promise<InvoicePaymentAlert | undefined>;
  dismissInvoicePaymentAlert(id: string, adminId: string, reason: string): Promise<InvoicePaymentAlert>;
  markInvoiceAsPaidByParent(invoiceId: string): Promise<Invoice>;
  confirmInvoicePaid(invoiceId: string): Promise<Invoice>;
  getParentPaymentComplianceMetrics(): Promise<{ parentId: string; parentName: string; totalInvoices: number; latePaid: number; latePercentage: number; pendingAlerts: number }[]>;
  
  // Invoice reminder operations
  checkAndSendInvoiceReminders(): Promise<{ reminder2Days: number; reminder4Days: number; reminder5Days: number }>;
  
  // Emergency contact operations (for tutors)
  getTutorEmergencyContact(tutorId: string): Promise<EmergencyContact | null>;
  updateTutorEmergencyContact(tutorId: string, emergencyContact: EmergencyContact): Promise<User>;
  
  // Analytics
  getTutorWeeklyEarnings(tutorId: string, startDate: Date, endDate: Date): Promise<number>;
  getTutorWeeks(tutorId: string): Promise<{ weekStart: Date; weekEnd: Date }[]>;
  getTutorAnnualEarnings(tutorId: string, year: number): Promise<{ totalEarnings: number; approvedSessions: number; year: number }>;
  getAdminStats(fiscalYear?: number): Promise<{
    bookedRevenue: number;
    paidRevenue: number;
    bookedExpenditure: number;
    paidExpenditure: number;
    activeStudents: number;
    activeTutors: number;
    lowBalanceAlerts: number;
    weeklyOutgoings: number;
    monthlyIncome: number;
    fiscalYearLabel: string;
    studentsPerTutor: Array<{ tutorId: string; tutorName: string; studentCount: number }>;
    studentsPerSubject: Array<{ subject: string; studentCount: number }>;
  }>;
  
  // Archive operations
  getArchivedStudents(): Promise<ArchivedStudentSummary[]>;
  getArchivedStudentDetails(id: string): Promise<{
    student: StudentWithTutor;
    invoices: InvoiceWithRelations[];
    payments: PaymentWithRelations[];
    timesheetEntries: TimesheetEntryWithRelations[];
    totalBilled: number;
    totalReceived: number;
    totalOutstanding: number;
  } | undefined>;
  getArchivedTutors(): Promise<ArchivedTutorSummary[]>;
  getArchivedTutorDetails(id: string): Promise<{
    tutor: User;
    timesheetEntries: TimesheetEntryWithRelations[];
    students: StudentWithTutor[];
    totalEarnings: number;
    totalPaid: number;
    totalOutstanding: number;
  } | undefined>;
  
  // Invoice operations
  getInvoices(studentId?: string): Promise<InvoiceWithRelations[]>;
  getInvoice(id: string): Promise<InvoiceWithRelations | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, updates: UpdateInvoice): Promise<Invoice>;
  processScheduledInvoices(): Promise<number>; // Returns count of invoices processed
  addInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  
  // Adhoc invoice operations
  getAdhocInvoices(): Promise<AdhocInvoice[]>;
  getAdhocInvoice(id: string): Promise<AdhocInvoice | undefined>;
  createAdhocInvoice(invoice: InsertAdhocInvoice): Promise<AdhocInvoice>;
  updateAdhocInvoice(id: string, updates: UpdateAdhocInvoice): Promise<AdhocInvoice>;
  deleteAdhocInvoice(id: string): Promise<void>;
  
  // Adhoc invoice item operations (inventory linking)
  getAdhocInvoiceItems(adhocInvoiceId: string): Promise<AdhocInvoiceItem[]>;
  createAdhocInvoiceItem(item: InsertAdhocInvoiceItem): Promise<AdhocInvoiceItem>;
  deleteAdhocInvoiceItems(adhocInvoiceId: string): Promise<void>;
  deductInventoryForAdhocInvoice(adhocInvoiceId: string): Promise<void>;
  
  // Payment operations
  getPayments(studentId?: string): Promise<PaymentWithRelations[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Financial ledger operations (Legacy tab)
  getFinancialLedger(): Promise<{
    moneyIn: Array<{
      id: string;
      type: 'parent_invoice' | 'adhoc_invoice';
      invoiceNumber: string;
      description: string;
      amount: string;
      paidAt: Date;
      studentName?: string;
      parentName?: string;
    }>;
    moneyOut: Array<{
      id: string;
      type: 'tutor_invoice';
      invoiceNumber: string;
      tutorName: string;
      amount: string;
      hoursWorked: string;
      paidAt: Date;
    }>;
    totalIn: number;
    totalOut: number;
    netProfit: number;
  }>;
  
  // Grouped financial ledger (Legacy tab redesign)
  getGroupedFinancialLedger(fiscalYear?: number): Promise<{
    parentGroups: Array<{
      parentId: string;
      parentName: string;
      totalBooked: number;
      totalPaid: number;
      invoiceCount: number;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        type: 'parent_invoice' | 'adhoc_invoice';
        amount: string;
        status: string;
        sentAt: Date | null;
        paidAt: Date | null;
        notes: string | null;
        description: string;
        studentName?: string;
      }>;
    }>;
    tutorGroups: Array<{
      tutorId: string;
      tutorName: string;
      totalBooked: number;
      totalPaid: number;
      invoiceCount: number;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        amount: string;
        hoursWorked: string;
        status: string;
        submittedAt: Date | null;
        approvedAt: Date | null;
        paidAt: Date | null;
        notes: string | null;
        weekStart?: Date;
        weekEnd?: Date;
        rejectionReason?: string;
        statusHistory: Array<{
          status: string;
          changedAt: Date;
          changedByName: string;
          notes?: string;
        }>;
      }>;
    }>;
    bookedIn: number;
    paidIn: number;
    bookedOut: number;
    paidOut: number;
    netProfit: number;
    fiscalYearLabel: string;
  }>;
  
  // Waitlist operations
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  getWaitlistEntry(id: string): Promise<WaitlistEntry | undefined>;
  createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: string, updates: UpdateWaitlistEntry): Promise<WaitlistEntry>;
  deleteWaitlistEntry(id: string): Promise<void>;
  convertWaitlistToStudent(waitlistId: string, additionalInfo: { parentRate: number } & Partial<InsertStudent>): Promise<{ student: Student; waitlistEntry: WaitlistEntry }>;
  
  // Parent portal operations
  getStudentsByParentEmail(email: string): Promise<StudentWithTutor[]>;
  getTimesheetEntriesByStudentIds(studentIds: string[]): Promise<TimesheetEntryWithRelations[]>;
  getInvoicesByStudentIds(studentIds: string[]): Promise<Invoice[]>;
  getStudentInvoiceSummaries(): Promise<{ studentId: string; outstandingInvoices: number; paidSessionsDelivered: number; unpaidSessionsDelivered: number; awaitingInvoice: number; hasPendingInvoice: boolean }[]>;
  getPaymentsByStudentIds(studentIds: string[]): Promise<Payment[]>;
  
  // Parent message operations
  getParentMessages(recipientType?: "tutor" | "admin", tutorId?: string): Promise<ParentMessageWithRelations[]>;
  getParentMessagesByParentEmail(email: string): Promise<ParentMessageWithRelations[]>;
  getParentMessage(id: string): Promise<ParentMessageWithRelations | undefined>;
  createParentMessage(message: InsertParentMessage): Promise<ParentMessage>;
  markParentMessageRead(id: string, tutorId?: string): Promise<ParentMessage>;
  createParentMessageReply(reply: InsertParentMessageReply): Promise<ParentMessageReply>;
  getParentMessageReplies(messageId: string): Promise<ParentMessageReplyWithRelations[]>;
  
  // Student topics operations
  getStudentTopics(studentId: string): Promise<StudentTopic[]>;
  replaceStudentTopics(studentId: string, topics: InsertStudentTopic[]): Promise<StudentTopic[]>;
  addStudentTopics(studentId: string, topics: InsertStudentTopic[]): Promise<StudentTopic[]>;
  updateStudentTopic(id: string, updates: UpdateStudentTopic): Promise<StudentTopic>;
  markStudentTopicCovered(topicId: string, tutorId: string, isCovered: boolean, coveredAt?: Date): Promise<StudentTopic>;
  
  // Rate configuration operations (deprecated)
  getRateConfigurations(): Promise<RateConfiguration[]>;
  getRateConfiguration(id: string): Promise<RateConfiguration | undefined>;
  createRateConfiguration(rate: InsertRateConfiguration): Promise<RateConfiguration>;
  updateRateConfiguration(id: string, updates: UpdateRateConfiguration): Promise<RateConfiguration>;
  deleteRateConfiguration(id: string): Promise<void>;
  
  // Tutor rate operations (independent)
  getTutorRates(): Promise<TutorRate[]>;
  getTutorRate(id: string): Promise<TutorRate | undefined>;
  createTutorRate(rate: InsertTutorRate): Promise<TutorRate>;
  updateTutorRate(id: string, updates: UpdateTutorRate): Promise<TutorRate>;
  deleteTutorRate(id: string): Promise<void>;
  
  // Parent rate operations (independent)
  getParentRates(): Promise<ParentRate[]>;
  getParentRate(id: string): Promise<ParentRate | undefined>;
  createParentRate(rate: InsertParentRate): Promise<ParentRate>;
  updateParentRate(id: string, updates: UpdateParentRate): Promise<ParentRate>;
  deleteParentRate(id: string): Promise<void>;
  
  // Rate link operations (for profit analysis)
  getRateLinks(): Promise<(RateLink & { tutorRate: TutorRate; parentRate: ParentRate })[]>;
  createRateLink(link: InsertRateLink): Promise<RateLink>;
  deleteRateLink(id: string): Promise<void>;
  deleteLinkByTutorRateId(tutorRateId: string): Promise<void>;
  deleteLinkByParentRateId(parentRateId: string): Promise<void>;
  
  // Tutor group operations
  getTutorGroups(): Promise<TutorGroupWithMembers[]>;
  getTutorGroup(id: string): Promise<TutorGroupWithMembers | undefined>;
  createTutorGroup(group: InsertTutorGroup, tutorIds: string[]): Promise<TutorGroupWithMembers>;
  updateTutorGroup(id: string, updates: UpdateTutorGroup, tutorIds?: string[]): Promise<TutorGroupWithMembers>;
  deleteTutorGroup(id: string): Promise<void>;
  
  // Tutor rate to tutors operations
  getTutorRateTutors(tutorRateId: string): Promise<TutorRateTutor[]>;
  setTutorRateTutors(tutorRateId: string, tutorIds: string[]): Promise<void>;
  
  // Tutor rate to tutor groups operations
  getTutorRateTutorGroups(tutorRateId: string): Promise<TutorRateTutorGroup[]>;
  setTutorRateTutorGroups(tutorRateId: string, tutorGroupIds: string[]): Promise<void>;
  
  // Student group operations
  getStudentGroups(tutorId?: string): Promise<StudentGroupWithMembers[]>;
  getStudentGroup(id: string): Promise<StudentGroupWithMembers | undefined>;
  createStudentGroup(group: InsertStudentGroup, studentIds: string[]): Promise<StudentGroupWithMembers>;
  updateStudentGroup(id: string, updates: UpdateStudentGroup, studentIds?: string[]): Promise<StudentGroupWithMembers>;
  deleteStudentGroup(id: string): Promise<void>;
  getStudentGroupsByTutor(tutorId: string): Promise<StudentGroupWithMembers[]>;
  
  // Group session operations
  getGroupSessions(tutorId?: string): Promise<GroupSessionWithDetails[]>;
  getGroupSession(id: string): Promise<GroupSessionWithDetails | undefined>;
  createGroupSession(session: InsertGroupSession, attendance: { studentId: string; present: boolean; chargeType: 'charge' | 'deduct' | 'no_change'; notes?: string }[], sessionSubject?: string, topicIds?: string[], otherTopicsText?: string): Promise<GroupSessionWithDetails>;
  updateGroupSessionAttendance(groupSessionId: string, attendance: { studentId: string; present: boolean; chargeType: 'charge' | 'deduct' | 'no_change'; notes?: string }[]): Promise<GroupSessionWithDetails>;
  deleteGroupSession(id: string): Promise<void>;
  deleteGroupSessionCascade(id: string): Promise<void>;
  
  // System settings operations
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  getSystemSettings(): Promise<SystemSetting[]>;
  upsertSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting>;
  
  // Overdue invoice operations
  markOverdueInvoices(): Promise<number>;
  
  // Password authentication operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(userData: { email: string; passwordHash: string; firstName: string; lastName: string; role: string; description?: string | null; startYear?: number | null; phone?: string | null; emergencyContactName?: string | null; emergencyContactPhone?: string | null }): Promise<User>;
  updateUserPassword(id: string, passwordHash: string): Promise<User>;
  
  // Curriculum topics operations
  getCurriculumTopics(subject?: string): Promise<CurriculumTopicWithSubtopics[]>;
  getCurriculumTopic(id: string): Promise<CurriculumTopic | undefined>;
  createCurriculumTopic(topic: InsertCurriculumTopic): Promise<CurriculumTopic>;
  updateCurriculumTopic(id: string, updates: UpdateCurriculumTopic): Promise<CurriculumTopic>;
  deleteCurriculumTopic(id: string): Promise<void>;
  
  // Session topics covered operations
  getSessionTopicsCovered(timesheetEntryId: string): Promise<CurriculumTopic[]>;
  setSessionTopicsCovered(timesheetEntryId: string, topicIds: string[]): Promise<void>;
  
  // Work types operations
  getWorkTypes(includeInactive?: boolean): Promise<WorkType[]>;
  getWorkType(id: string): Promise<WorkType | undefined>;
  createWorkType(workType: InsertWorkType): Promise<WorkType>;
  updateWorkType(id: string, updates: UpdateWorkType): Promise<WorkType>;
  deleteWorkType(id: string): Promise<void>;
  
  // Recurring session template operations
  getRecurringSessionTemplates(tutorId?: string, studentId?: string, groupId?: string): Promise<(RecurringSessionTemplate & { student?: Student; tutor?: User; group?: StudentGroup })[]>;
  getRecurringSessionTemplate(id: string): Promise<(RecurringSessionTemplate & { student?: Student; tutor?: User }) | undefined>;
  createRecurringSessionTemplate(template: InsertRecurringSessionTemplate): Promise<RecurringSessionTemplate>;
  updateRecurringSessionTemplate(id: string, updates: UpdateRecurringSessionTemplate): Promise<RecurringSessionTemplate>;
  deleteRecurringSessionTemplate(id: string): Promise<void>;
  
  // Session occurrence operations
  getSessionOccurrences(tutorId?: string, startDate?: Date, endDate?: Date): Promise<(SessionOccurrence & { student?: Student; tutor?: User; group?: StudentGroup; groupMembers?: Student[] })[]>;
  getSessionOccurrencesByStudentIds(studentIds: string[]): Promise<(SessionOccurrence & { student?: Student; tutor?: User; groupId?: string; groupName?: string })[]>;
  getSessionOccurrence(id: string): Promise<SessionOccurrence | undefined>;
  createSessionOccurrence(occurrence: InsertSessionOccurrence): Promise<SessionOccurrence>;
  updateSessionOccurrence(id: string, updates: UpdateSessionOccurrence): Promise<SessionOccurrence>;
  deleteSessionOccurrence(id: string): Promise<void>;
  deleteFutureSessionOccurrences(templateId: string): Promise<void>;
  generateSessionOccurrences(templateId: string, endDate: Date): Promise<SessionOccurrence[]>;
  
  // Tutor availability slot operations
  getTutorAvailabilitySlots(tutorId?: string): Promise<TutorAvailabilitySlot[]>;
  getTutorAvailabilitySlot(id: string): Promise<TutorAvailabilitySlot | undefined>;
  createTutorAvailabilitySlot(slot: InsertTutorAvailabilitySlot): Promise<TutorAvailabilitySlot>;
  updateTutorAvailabilitySlot(id: string, updates: UpdateTutorAvailabilitySlot): Promise<TutorAvailabilitySlot>;
  deleteTutorAvailabilitySlot(id: string): Promise<void>;
  
  // Session change request operations
  getSessionChangeRequests(status?: string): Promise<(SessionChangeRequest & { student?: Student; parent?: User; tutor?: User; sessionOccurrence?: SessionOccurrence })[]>;
  getSessionChangeRequestsByParent(parentId: string): Promise<(SessionChangeRequest & { sessionOccurrence?: SessionOccurrence & { student?: Student } })[]>;
  getSessionChangeRequestsByTutor(tutorId: string): Promise<(SessionChangeRequest & { student?: Student; parent?: User; sessionOccurrence?: SessionOccurrence })[]>;
  createSessionChangeRequest(request: InsertSessionChangeRequest): Promise<SessionChangeRequest>;
  updateSessionChangeRequest(id: string, updates: Partial<SessionChangeRequest>): Promise<SessionChangeRequest>;
  
  // Product operations
  getProducts(includeInactive?: boolean): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: UpdateProduct): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(): Promise<ProductWithInventory[]>;
  
  // Mock exam event operations
  getMockExamEvents(includeCompleted?: boolean): Promise<MockExamEvent[]>;
  getMockExamEvent(id: string): Promise<MockExamEventWithBookings | undefined>;
  createMockExamEvent(event: InsertMockExamEvent): Promise<MockExamEvent>;
  updateMockExamEvent(id: string, updates: UpdateMockExamEvent): Promise<MockExamEvent>;
  deleteMockExamEvent(id: string): Promise<void>;
  
  // Mock exam expense operations
  getMockExamExpenses(mockExamEventId: string): Promise<MockExamExpense[]>;
  getMockExamExpense(id: string): Promise<MockExamExpense | undefined>;
  createMockExamExpense(expense: InsertMockExamExpense): Promise<MockExamExpense>;
  updateMockExamExpense(id: string, updates: UpdateMockExamExpense): Promise<MockExamExpense>;
  deleteMockExamExpense(id: string): Promise<void>;
  markMockExamExpensePaid(id: string): Promise<MockExamExpense>;
  
  // Service booking operations
  getServiceBookings(parentId?: string, status?: string): Promise<ServiceBookingWithRelations[]>;
  getServiceBooking(id: string): Promise<ServiceBookingWithRelations | undefined>;
  createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
  updateServiceBooking(id: string, updates: UpdateServiceBooking): Promise<ServiceBooking>;
  deleteServiceBooking(id: string): Promise<void>;
  
  // Inventory transaction operations
  getInventoryTransactions(productId: string): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  adjustProductStock(productId: string, quantity: number, type: 'stock_in' | 'sale' | 'adjustment' | 'return', notes?: string, createdBy?: string, serviceBookingId?: string): Promise<Product>;
  
  // Parent service notification operations
  getParentServiceNotifications(parentId: string, unreadOnly?: boolean): Promise<ParentServiceNotificationWithRelations[]>;
  createParentServiceNotification(notification: InsertParentServiceNotification): Promise<ParentServiceNotification>;
  markParentServiceNotificationRead(id: string): Promise<ParentServiceNotification>;
  notifyParentsOfMockExam(mockExamEventId: string): Promise<number>;
  
  // Document store operations
  getDocuments(includeInactive?: boolean): Promise<DocumentWithUploader[]>;
  getDocumentsForTutor(tutorId: string): Promise<DocumentWithUploader[]>;
  getDocument(id: string): Promise<DocumentWithUploader | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: UpdateDocument): Promise<Document>;
  updateDocumentTutorVisibility(id: string, visibleToTutors: boolean): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Document share operations
  getDocumentShares(documentId: string): Promise<DocumentShareWithRelations[]>;
  getDocumentSharesForParent(parentId: string, unreadOnly?: boolean): Promise<DocumentShareWithRelations[]>;
  getDocumentSharesVisibleToTutor(tutorId: string): Promise<DocumentShareWithRelations[]>;
  getAllDocumentSharesWithParentInfo(): Promise<DocumentShareWithRelations[]>;
  shareDocument(share: InsertDocumentShare): Promise<DocumentShare>;
  shareDocumentWithMultipleParents(documentId: string, parentIds: string[], sharedBy: string, message?: string, studentId?: string, tutorVisibleWhenShared?: boolean): Promise<number>;
  markDocumentShareRead(shareId: string): Promise<DocumentShare>;
  deleteDocumentShare(shareId: string): Promise<void>;
  
  // Shareable recipients for document sharing
  getShareableRecipients(tutorId?: string, yearGroup?: number): Promise<{
    parentId: string;
    parentName: string;
    parentEmail: string | null;
    studentId: string | null;
    studentName: string | null;
    yearGroup: number | null;
    tutorIds: string[];
    tutorNames: string[];
  }[]>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number, offset?: number, filters?: {
    action?: string;
    entityType?: string;
    performedBy?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ logs: AuditLogWithUser[]; total: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getStudents(includeInactive: boolean = false): Promise<StudentWithTutor[]> {
    const condition = includeInactive ? undefined : eq(students.isActive, true);
    
    // Get all students
    let studentsQuery = db.select().from(students);
    if (condition) {
      studentsQuery = studentsQuery.where(condition);
    }
    const allStudents = await studentsQuery.orderBy(asc(students.name));
    
    // Get all active allocations with tutors (derive tutor from allocations, not legacy tutorId)
    const allocations = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .where(eq(studentTutors.isActive, true));
    
    // Build maps for primary tutor and all assigned tutors per student
    const studentPrimaryTutorMap = new Map<string, typeof users.$inferSelect | null>();
    const studentAllTutorsMap = new Map<string, Array<{ tutor: typeof users.$inferSelect; isPrimary: boolean; studentTutor: typeof studentTutors.$inferSelect }>>();
    
    for (const alloc of allocations) {
      const studentId = alloc.student_tutors.studentId;
      const tutor = alloc.users;
      const isPrimary = alloc.student_tutors.isPrimary;
      
      // Track all tutors for this student
      if (!studentAllTutorsMap.has(studentId)) {
        studentAllTutorsMap.set(studentId, []);
      }
      if (tutor) {
        studentAllTutorsMap.get(studentId)!.push({ 
          tutor, 
          isPrimary, 
          studentTutor: alloc.student_tutors 
        });
      }
      
      // Track primary tutor (prefer isPrimary=true, otherwise first allocation)
      if (!studentPrimaryTutorMap.has(studentId) || isPrimary) {
        studentPrimaryTutorMap.set(studentId, tutor);
      }
    }
    
    // Map students to include tutor and assignedTutors from allocations
    return allStudents.map(student => {
      const allTutors = studentAllTutorsMap.get(student.id) || [];
      return {
        ...student,
        tutor: studentPrimaryTutorMap.get(student.id) || null,
        assignedTutors: allTutors.map(t => ({
          ...t.studentTutor,
          tutor: t.tutor,
        })),
      };
    });
  }

  async getStudentsByTutor(tutorId: string): Promise<StudentWithTutor[]> {
    // Get students assigned to this tutor via allocations only
    const assignedStudentIds = await db
      .select({ studentId: studentTutors.studentId })
      .from(studentTutors)
      .where(and(eq(studentTutors.tutorId, tutorId), eq(studentTutors.isActive, true)));

    if (assignedStudentIds.length === 0) {
      return [];
    }

    // Get the student records
    const studentRecords = await db
      .select()
      .from(students)
      .where(and(
        inArray(students.id, assignedStudentIds.map(s => s.studentId)),
        eq(students.isActive, true)
      ))
      .orderBy(asc(students.name));

    // Get tutor info for this tutor
    const [tutor] = await db.select().from(users).where(eq(users.id, tutorId));

    // Map students with tutor info
    return studentRecords.map(student => ({
      ...student,
      tutor: tutor || null,
    }));
  }

  // Student-Tutor relationship methods
  async getStudentTutors(studentId: string): Promise<StudentTutorWithUser[]> {
    return await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .where(eq(studentTutors.studentId, studentId))
      .then(rows => 
        rows.map(row => ({
          ...row.student_tutors,
          tutor: row.users!,
        }))
      );
  }

  async addStudentTutor(studentId: string, tutorId: string, isPrimary: boolean = false): Promise<StudentTutor> {
    // Check if assignment already exists
    const existing = await db
      .select()
      .from(studentTutors)
      .where(and(eq(studentTutors.studentId, studentId), eq(studentTutors.tutorId, tutorId)));
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [newAssignment] = await db
      .insert(studentTutors)
      .values({ studentId, tutorId, isPrimary })
      .returning();
    return newAssignment;
  }

  async removeStudentTutor(studentId: string, tutorId: string): Promise<void> {
    await db
      .delete(studentTutors)
      .where(and(eq(studentTutors.studentId, studentId), eq(studentTutors.tutorId, tutorId)));
  }

  async setStudentTutors(studentId: string, tutorIds: string[]): Promise<StudentTutorWithUser[]> {
    // Remove all existing assignments
    await db
      .delete(studentTutors)
      .where(eq(studentTutors.studentId, studentId));

    // Add new assignments if any
    if (tutorIds.length > 0) {
      await db
        .insert(studentTutors)
        .values(tutorIds.map((tutorId, index) => ({
          studentId,
          tutorId,
          isPrimary: index === 0,
        })));
    }

    return this.getStudentTutors(studentId);
  }

  // ========== Allocation Management Methods ==========

  async getAllAllocations(): Promise<AllocationWithRelations[]> {
    const results = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .leftJoin(students, eq(studentTutors.studentId, students.id))
      .orderBy(asc(users.firstName), asc(students.name));
    
    return results.map(row => ({
      ...row.student_tutors,
      tutor: row.users!,
      student: row.students!,
      profit: (parseFloat(row.student_tutors.parentRate || "0") - parseFloat(row.student_tutors.tutorRate || "0")).toFixed(2),
    }));
  }

  async getAllStudentTutorAllocations(): Promise<StudentTutor[]> {
    return db.select().from(studentTutors).orderBy(asc(studentTutors.studentId));
  }

  async getAllocationsByTutor(tutorId: string): Promise<AllocationWithRelations[]> {
    const results = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .leftJoin(students, eq(studentTutors.studentId, students.id))
      .where(eq(studentTutors.tutorId, tutorId))
      .orderBy(asc(students.name));
    
    return results.map(row => ({
      ...row.student_tutors,
      tutor: row.users!,
      student: row.students!,
      profit: (parseFloat(row.student_tutors.parentRate || "0") - parseFloat(row.student_tutors.tutorRate || "0")).toFixed(2),
    }));
  }

  async getAllocationsByStudent(studentId: string): Promise<AllocationWithRelations[]> {
    const results = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .leftJoin(students, eq(studentTutors.studentId, students.id))
      .where(eq(studentTutors.studentId, studentId))
      .orderBy(asc(users.firstName));
    
    return results.map(row => ({
      ...row.student_tutors,
      tutor: row.users!,
      student: row.students!,
      profit: (parseFloat(row.student_tutors.parentRate || "0") - parseFloat(row.student_tutors.tutorRate || "0")).toFixed(2),
    }));
  }

  async createAllocation(data: InsertStudentTutor): Promise<StudentTutor> {
    // Check if allocation already exists
    const existing = await db
      .select()
      .from(studentTutors)
      .where(and(
        eq(studentTutors.studentId, data.studentId),
        eq(studentTutors.tutorId, data.tutorId)
      ));
    
    if (existing.length > 0) {
      throw new Error("Allocation already exists for this student-tutor pair");
    }

    const [allocation] = await db
      .insert(studentTutors)
      .values(data)
      .returning();
    return allocation;
  }

  async updateAllocation(id: string, data: UpdateStudentTutor): Promise<StudentTutor> {
    const [updated] = await db
      .update(studentTutors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentTutors.id, id))
      .returning();
    return updated;
  }

  async deleteAllocation(id: string): Promise<void> {
    await db.delete(studentTutors).where(eq(studentTutors.id, id));
  }

  async getAllocation(id: string): Promise<AllocationWithRelations | undefined> {
    const results = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .leftJoin(students, eq(studentTutors.studentId, students.id))
      .where(eq(studentTutors.id, id));
    
    if (results.length === 0) return undefined;
    
    const row = results[0];
    return {
      ...row.student_tutors,
      tutor: row.users!,
      student: row.students!,
      profit: (parseFloat(row.student_tutors.parentRate || "0") - parseFloat(row.student_tutors.tutorRate || "0")).toFixed(2),
    };
  }

  async getTutorProfitSummary(): Promise<TutorProfitSummary[]> {
    const allAllocations = await this.getAllAllocations();
    
    // Group by tutor
    const tutorMap = new Map<string, {
      tutor: User;
      allocations: AllocationWithRelations[];
    }>();
    
    for (const alloc of allAllocations) {
      if (!tutorMap.has(alloc.tutorId)) {
        tutorMap.set(alloc.tutorId, {
          tutor: alloc.tutor,
          allocations: [],
        });
      }
      tutorMap.get(alloc.tutorId)!.allocations.push(alloc);
    }
    
    const summaries: TutorProfitSummary[] = [];
    for (const [tutorId, data] of tutorMap) {
      const activeAllocations = data.allocations.filter(a => a.isActive);
      const totalParentRevenue = data.allocations.reduce((sum, a) => sum + parseFloat(a.parentRate || "0"), 0);
      const totalTutorCost = data.allocations.reduce((sum, a) => sum + parseFloat(a.tutorRate || "0"), 0);
      const totalProfit = totalParentRevenue - totalTutorCost;
      const profitMargin = totalParentRevenue > 0 ? (totalProfit / totalParentRevenue * 100) : 0;
      
      summaries.push({
        tutorId,
        tutorName: `${data.tutor.firstName || ''} ${data.tutor.lastName || ''}`.trim() || data.tutor.email || 'Unknown',
        totalAllocations: data.allocations.length,
        activeAllocations: activeAllocations.length,
        totalParentRevenue: totalParentRevenue.toFixed(2),
        totalTutorCost: totalTutorCost.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        profitMargin: profitMargin.toFixed(1),
      });
    }
    
    return summaries.sort((a, b) => parseFloat(b.totalProfit) - parseFloat(a.totalProfit));
  }

  async archiveStudent(id: string): Promise<Student> {
    // Delete recurring session templates and their occurrences for this student
    const templates = await db
      .select()
      .from(recurringSessionTemplates)
      .where(eq(recurringSessionTemplates.studentId, id));
    
    for (const template of templates) {
      await db.delete(sessionOccurrences).where(eq(sessionOccurrences.templateId, template.id));
      await db.delete(recurringSessionTemplates).where(eq(recurringSessionTemplates.id, template.id));
    }
    
    const [updatedStudent] = await db
      .update(students)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async restoreStudent(id: string): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    // First check if student is archived (only archived students can be deleted)
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    
    if (!student) {
      throw new Error("Student not found");
    }
    
    if (student.isActive) {
      throw new Error("Only archived students can be permanently deleted");
    }
    
    // Delete related records first (timesheet entries, slot bookings, student-tutor assignments)
    await db.delete(timesheetEntries).where(eq(timesheetEntries.studentId, id));
    await db.delete(slotBookings).where(eq(slotBookings.studentId, id));
    await db.delete(studentTutors).where(eq(studentTutors.studentId, id));
    
    // Delete the student
    await db.delete(students).where(eq(students.id, id));
  }

  async getStudent(id: string): Promise<StudentWithTutor | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    
    if (!student) return undefined;
    
    // Get tutor from allocations (prefer primary tutor)
    const allocations = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .where(and(eq(studentTutors.studentId, id), eq(studentTutors.isActive, true)));
    
    let tutor: typeof users.$inferSelect | null = null;
    for (const alloc of allocations) {
      if (!tutor || alloc.student_tutors.isPrimary) {
        tutor = alloc.users;
      }
    }
    
    return {
      ...student,
      tutor,
    };
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    
    // Note: Invoices are now generated per session logged, not upfront
    // The sessionsBooked field tracks prepaid credits for reference
    
    return newStudent;
  }

  async updateStudent(id: string, updates: UpdateStudent): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async decrementStudentSessions(id: string): Promise<Student> {
    // Simply decrement sessions for tracking prepaid credits
    // Invoice generation is now handled separately in createTimesheetEntry
    const [updatedStudent] = await db
      .update(students)
      .set({ 
        sessionsRemaining: sql`${students.sessionsRemaining} - 1`,
        updatedAt: new Date()
      })
      .where(eq(students.id, id))
      .returning();
    
    return updatedStudent;
  }

  async incrementStudentSessions(id: string): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ 
        sessionsRemaining: sql`${students.sessionsRemaining} + 1`,
        updatedAt: new Date()
      })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async addSessionsToStudent(id: string, sessions: number): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ 
        sessionsRemaining: sql`${students.sessionsRemaining} + ${sessions}`,
        sessionsBooked: sessions, // Update the booked count for future invoices
        updatedAt: new Date()
      })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async getTimesheetEntries(tutorId?: string, startDate?: Date, endDate?: Date): Promise<TimesheetEntryWithRelations[]> {
    let query = db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id));

    const conditions = [];
    if (tutorId) conditions.push(eq(timesheetEntries.tutorId, tutorId));
    if (startDate) conditions.push(gte(timesheetEntries.date, startDate));
    if (endDate) conditions.push(lte(timesheetEntries.date, endDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const rows = await query.orderBy(desc(timesheetEntries.date));
    
    return rows.map(row => ({
      ...row.timesheet_entries,
      student: row.students!,
      tutor: row.users!,
    }));
  }

  async getTimesheetEntriesByStatus(status: "pending" | "approved" | "rejected"): Promise<TimesheetEntryWithRelations[]> {
    const rows = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(eq(timesheetEntries.status, status))
      .orderBy(desc(timesheetEntries.createdAt));

    return rows.map(row => ({
      ...row.timesheet_entries,
      student: row.students!,
      tutor: row.users!,
    }));
  }

  async createTimesheetEntry(entry: InsertTimesheetEntry & { tutorId: string }): Promise<TimesheetEntry> {
    // Get student to calculate rates
    const student = await this.getStudent(entry.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const duration = parseFloat(entry.duration.toString());
    
    // Look up rates from student-tutor allocation (preferred) or fall back to student record
    const allocation = await db
      .select()
      .from(studentTutors)
      .where(
        and(
          eq(studentTutors.studentId, entry.studentId),
          eq(studentTutors.tutorId, entry.tutorId),
          eq(studentTutors.isActive, true)
        )
      )
      .limit(1);
    
    // Use allocation rates if found, otherwise fall back to student rates
    const baseTutorRate = allocation[0] 
      ? parseFloat(allocation[0].tutorRate.toString())
      : parseFloat(student.tutorRate.toString());
    const baseParentRate = allocation[0]
      ? parseFloat(allocation[0].parentRate.toString())
      : parseFloat(student.parentRate.toString());
    
    // Calculate earnings/billing using fixed rates
    const tutorEarnings = baseTutorRate * duration;
    const parentBilling = baseParentRate * duration;

    // Get or create the weekly timesheet for this session's week
    const sessionDate = new Date(entry.date);
    const dayOfWeek = sessionDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(sessionDate);
    weekStart.setDate(sessionDate.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // getOrCreateWeeklyTimesheet will return a draft/rejected timesheet if one exists,
    // or create a new draft timesheet (even if submitted/approved ones exist for this week)
    const weeklyTimesheet = await this.getOrCreateWeeklyTimesheet(entry.tutorId, weekStart, weekEnd);

    const [newEntry] = await db
      .insert(timesheetEntries)
      .values({
        ...entry,
        weeklyTimesheetId: weeklyTimesheet.id,
        tutorEarnings: tutorEarnings.toString(),
        parentBilling: parentBilling.toString(),
      })
      .returning();

    // Decrement student sessions (for tracking prepaid credits)
    const updatedStudent = await this.decrementStudentSessions(entry.studentId);
    
    // Only generate a parent invoice when sessions remaining reaches 0 or below
    // This means the prepaid package has been exhausted
    if (updatedStudent.sessionsRemaining <= 0) {
      // Check if student has auto-invoice enabled for recurring invoices
      if (updatedStudent.autoInvoiceEnabled) {
        // Use the student's default session pack for the recurring invoice
        const sessionsToInvoice = updatedStudent.defaultSessionPack || 4;
        await this.generateParentInvoiceForStudent(entry.studentId, sessionsToInvoice);
      } else {
        // Legacy behavior: generate invoice for the completed sessions
        await this.generateParentInvoiceForSession(entry.studentId, newEntry.id, duration, parentBilling);
      }
    }

    return newEntry;
  }

  async updateTimesheetEntryStatus(id: string, status: "approved" | "rejected"): Promise<TimesheetEntry> {
    const [updatedEntry] = await db
      .update(timesheetEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(timesheetEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async updateTimesheetEntry(id: string, updates: { tutorEarnings?: string; parentBilling?: string; duration?: string; notes?: string }): Promise<TimesheetEntry> {
    const [updatedEntry] = await db
      .update(timesheetEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timesheetEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async getTimesheetEntry(id: string): Promise<TimesheetEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timesheetEntries)
      .where(eq(timesheetEntries.id, id));
    return entry;
  }

  async getTimesheetEntryBySessionOccurrence(sessionOccurrenceId: string): Promise<TimesheetEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timesheetEntries)
      .where(eq(timesheetEntries.sessionOccurrenceId, sessionOccurrenceId));
    return entry;
  }

  async updateTimesheetEntryByTutor(id: string, tutorId: string, updates: { date?: Date; duration?: number; notes?: string }): Promise<TimesheetEntry> {
    // Verify the entry belongs to this tutor and the timesheet is in rejected status
    const entry = await this.getTimesheetEntry(id);
    if (!entry) {
      throw new Error("Timesheet entry not found");
    }
    if (entry.tutorId !== tutorId) {
      throw new Error("You can only edit your own entries");
    }

    // Check if the weekly timesheet is in rejected status
    if (entry.weeklyTimesheetId) {
      const weeklyTimesheet = await this.getWeeklyTimesheet(entry.weeklyTimesheetId);
      if (weeklyTimesheet && weeklyTimesheet.status !== "rejected" && weeklyTimesheet.status !== "draft") {
        throw new Error("Can only edit entries in rejected or draft timesheets");
      }
    }

    // Recalculate earnings if duration changed
    const updateFields: any = { ...updates, updatedAt: new Date() };
    if (updates.duration !== undefined) {
      // Get student to recalculate rates
      const [studentResult] = await db
        .select()
        .from(students)
        .where(eq(students.id, entry.studentId));
      
      if (studentResult) {
        const tutorEarnings = Number(studentResult.tutorRate) * updates.duration;
        const parentBilling = Number(studentResult.parentRate) * updates.duration;
        updateFields.tutorEarnings = tutorEarnings.toString();
        updateFields.parentBilling = parentBilling.toString();
        updateFields.duration = updates.duration.toString();
      }
    }

    const [updatedEntry] = await db
      .update(timesheetEntries)
      .set(updateFields)
      .where(eq(timesheetEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteTimesheetEntry(id: string, tutorId: string): Promise<void> {
    // Verify the entry belongs to this tutor and the timesheet is in rejected/draft status
    const entry = await this.getTimesheetEntry(id);
    if (!entry) {
      throw new Error("Timesheet entry not found");
    }
    if (entry.tutorId !== tutorId) {
      throw new Error("You can only delete your own entries");
    }

    // Check if the weekly timesheet is in rejected or draft status
    if (entry.weeklyTimesheetId) {
      const weeklyTimesheet = await this.getWeeklyTimesheet(entry.weeklyTimesheetId);
      if (weeklyTimesheet && weeklyTimesheet.status !== "rejected" && weeklyTimesheet.status !== "draft") {
        throw new Error("Can only delete entries in rejected or draft timesheets");
      }
    }

    await db.delete(timesheetEntries).where(eq(timesheetEntries.id, id));

    // Restore the session to the student's balance
    await this.incrementStudentSessions(entry.studentId);
  }

  async addTimesheetStatusHistory(history: InsertTimesheetStatusHistory): Promise<TimesheetStatusHistory> {
    const [newHistory] = await db
      .insert(timesheetStatusHistory)
      .values(history)
      .returning();
    return newHistory;
  }

  async getTimesheetStatusHistory(weeklyTimesheetId: string): Promise<(TimesheetStatusHistory & { changedByName?: string })[]> {
    const history = await db
      .select()
      .from(timesheetStatusHistory)
      .leftJoin(users, eq(timesheetStatusHistory.changedBy, users.id))
      .where(eq(timesheetStatusHistory.weeklyTimesheetId, weeklyTimesheetId))
      .orderBy(desc(timesheetStatusHistory.createdAt));

    return history.map(h => ({
      ...h.timesheet_status_history,
      changedByName: h.users?.firstName && h.users?.lastName 
        ? `${h.users.firstName} ${h.users.lastName}` 
        : h.users?.email || 'Unknown',
    }));
  }

  // Weekly Timesheet Operations
  async getOrCreateWeeklyTimesheet(tutorId: string, weekStart: Date, weekEnd: Date): Promise<WeeklyTimesheet> {
    // Check if a draft or rejected weekly timesheet exists for this tutor and week
    // We only want to add to a timesheet that's still editable
    const existing = await db
      .select()
      .from(weeklyTimesheets)
      .where(
        and(
          eq(weeklyTimesheets.tutorId, tutorId),
          eq(weeklyTimesheets.weekStart, weekStart)
        )
      );

    // Look for a draft or rejected timesheet we can add to
    const editableTimesheet = existing.find(ts => ts.status === "draft" || ts.status === "rejected");
    if (editableTimesheet) {
      return editableTimesheet;
    }

    // No editable timesheet exists - create a new one
    // This allows late submissions to go to a separate timesheet even if one was already submitted/approved
    const [newTimesheet] = await db
      .insert(weeklyTimesheets)
      .values({
        tutorId,
        weekStart,
        weekEnd,
      })
      .returning();

    return newTimesheet;
  }

  async getWeeklyTimesheet(id: string): Promise<WeeklyTimesheetWithRelations | undefined> {
    const [result] = await db
      .select()
      .from(weeklyTimesheets)
      .leftJoin(users, eq(weeklyTimesheets.tutorId, users.id))
      .where(eq(weeklyTimesheets.id, id));

    if (!result) return undefined;

    // Get entries for this timesheet
    const entries = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(eq(timesheetEntries.weeklyTimesheetId, id))
      .orderBy(desc(timesheetEntries.date));

    // Get reviewer if exists
    let reviewer = null;
    if (result.weekly_timesheets.reviewerId) {
      const [reviewerResult] = await db
        .select()
        .from(users)
        .where(eq(users.id, result.weekly_timesheets.reviewerId));
      reviewer = reviewerResult || null;
    }

    return {
      ...result.weekly_timesheets,
      tutor: result.users!,
      reviewer,
      entries: entries.map(row => ({
        ...row.timesheet_entries,
        student: row.students!,
        tutor: row.users!,
      })),
    };
  }

  async getWeeklyTimesheetsByTutor(tutorId: string): Promise<WeeklyTimesheetWithRelations[]> {
    const results = await db
      .select()
      .from(weeklyTimesheets)
      .leftJoin(users, eq(weeklyTimesheets.tutorId, users.id))
      .where(eq(weeklyTimesheets.tutorId, tutorId))
      .orderBy(desc(weeklyTimesheets.weekStart));

    const timesheetsWithRelations: WeeklyTimesheetWithRelations[] = [];

    for (const result of results) {
      const entries = await db
        .select()
        .from(timesheetEntries)
        .leftJoin(students, eq(timesheetEntries.studentId, students.id))
        .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
        .where(eq(timesheetEntries.weeklyTimesheetId, result.weekly_timesheets.id))
        .orderBy(desc(timesheetEntries.date));

      let reviewer = null;
      if (result.weekly_timesheets.reviewerId) {
        const [reviewerResult] = await db
          .select()
          .from(users)
          .where(eq(users.id, result.weekly_timesheets.reviewerId));
        reviewer = reviewerResult || null;
      }

      timesheetsWithRelations.push({
        ...result.weekly_timesheets,
        tutor: result.users!,
        reviewer,
        entries: entries.map(row => ({
          ...row.timesheet_entries,
          student: row.students!,
          tutor: row.users!,
        })),
      });
    }

    return timesheetsWithRelations;
  }

  async getWeeklyTimesheetsByStatus(status: "draft" | "submitted" | "approved" | "rejected"): Promise<WeeklyTimesheetWithRelations[]> {
    const results = await db
      .select()
      .from(weeklyTimesheets)
      .leftJoin(users, eq(weeklyTimesheets.tutorId, users.id))
      .where(eq(weeklyTimesheets.status, status))
      .orderBy(desc(weeklyTimesheets.weekStart));

    const timesheetsWithRelations: WeeklyTimesheetWithRelations[] = [];

    for (const result of results) {
      const entries = await db
        .select()
        .from(timesheetEntries)
        .leftJoin(students, eq(timesheetEntries.studentId, students.id))
        .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
        .where(eq(timesheetEntries.weeklyTimesheetId, result.weekly_timesheets.id))
        .orderBy(desc(timesheetEntries.date));

      let reviewer = null;
      if (result.weekly_timesheets.reviewerId) {
        const [reviewerResult] = await db
          .select()
          .from(users)
          .where(eq(users.id, result.weekly_timesheets.reviewerId));
        reviewer = reviewerResult || null;
      }

      timesheetsWithRelations.push({
        ...result.weekly_timesheets,
        tutor: result.users!,
        reviewer,
        entries: entries.map(row => ({
          ...row.timesheet_entries,
          student: row.students!,
          tutor: row.users!,
        })),
      });
    }

    return timesheetsWithRelations;
  }

  async getAllWeeklyTimesheets(): Promise<WeeklyTimesheetWithRelations[]> {
    const results = await db
      .select()
      .from(weeklyTimesheets)
      .leftJoin(users, eq(weeklyTimesheets.tutorId, users.id))
      .orderBy(desc(weeklyTimesheets.weekStart));

    const timesheetsWithRelations: WeeklyTimesheetWithRelations[] = [];

    for (const result of results) {
      const entries = await db
        .select()
        .from(timesheetEntries)
        .leftJoin(students, eq(timesheetEntries.studentId, students.id))
        .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
        .where(eq(timesheetEntries.weeklyTimesheetId, result.weekly_timesheets.id))
        .orderBy(desc(timesheetEntries.date));

      let reviewer = null;
      if (result.weekly_timesheets.reviewerId) {
        const [reviewerResult] = await db
          .select()
          .from(users)
          .where(eq(users.id, result.weekly_timesheets.reviewerId));
        reviewer = reviewerResult || null;
      }

      timesheetsWithRelations.push({
        ...result.weekly_timesheets,
        tutor: result.users!,
        reviewer,
        entries: entries.map(row => ({
          ...row.timesheet_entries,
          student: row.students!,
          tutor: row.users!,
        })),
      });
    }

    return timesheetsWithRelations;
  }

  async submitWeeklyTimesheet(id: string): Promise<WeeklyTimesheet> {
    // Get the current status before updating
    const [current] = await db
      .select()
      .from(weeklyTimesheets)
      .where(eq(weeklyTimesheets.id, id));

    const fromStatus = current?.status as "draft" | "submitted" | "approved" | "rejected" | undefined;

    const [submitted] = await db
      .update(weeklyTimesheets)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        reviewNotes: null, // Clear any previous rejection notes on resubmit
        updatedAt: new Date(),
      })
      .where(eq(weeklyTimesheets.id, id))
      .returning();

    // Log status history
    await this.addTimesheetStatusHistory({
      weeklyTimesheetId: id,
      fromStatus: fromStatus || null,
      toStatus: "submitted",
      changedBy: submitted.tutorId,
      notes: fromStatus === "rejected" ? "Resubmitted after rejection" : "Submitted for approval",
    });

    // Update all entries in this timesheet to pending
    await db
      .update(timesheetEntries)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(timesheetEntries.weeklyTimesheetId, id));

    return submitted;
  }

  async reviewWeeklyTimesheet(id: string, reviewerId: string, status: "approved" | "rejected", notes?: string): Promise<WeeklyTimesheet> {
    // Get the current status before updating
    const [current] = await db
      .select()
      .from(weeklyTimesheets)
      .where(eq(weeklyTimesheets.id, id));

    const fromStatus = current?.status as "draft" | "submitted" | "approved" | "rejected" | undefined;

    const [reviewed] = await db
      .update(weeklyTimesheets)
      .set({
        status,
        reviewedAt: new Date(),
        reviewerId,
        reviewNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(weeklyTimesheets.id, id))
      .returning();

    // Log status history
    await this.addTimesheetStatusHistory({
      weeklyTimesheetId: id,
      fromStatus: fromStatus || null,
      toStatus: status,
      changedBy: reviewerId,
      notes: notes || (status === "approved" ? "Approved" : "Rejected"),
    });

    // Update all entries in this timesheet to match the status
    await db
      .update(timesheetEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(timesheetEntries.weeklyTimesheetId, id));

    // Auto-generate tutor invoice when timesheet is approved
    if (status === "approved" && current) {
      // Calculate total earnings and hours from all entries in this timesheet
      const entries = await db
        .select()
        .from(timesheetEntries)
        .where(eq(timesheetEntries.weeklyTimesheetId, id));

      const totalAmount = entries.reduce((sum, entry) => {
        return sum + parseFloat(entry.tutorEarnings?.toString() || "0");
      }, 0);

      const totalHours = entries.reduce((sum, entry) => {
        return sum + parseFloat(entry.duration?.toString() || "0");
      }, 0);

      if (totalAmount > 0) {
        // Get tutor info for invoice title
        const [tutor] = await db.select().from(users).where(eq(users.id, current.tutorId));
        const tutorName = tutor ? (tutor.firstName && tutor.lastName 
          ? `${tutor.firstName}-${tutor.lastName}` 
          : tutor.email.split('@')[0]).toUpperCase().replace(/\s+/g, '-').substring(0, 15) 
          : 'TUTOR';
        
        // Get next sequential invoice number
        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(tutorInvoices);
        const nextNumber = (countResult?.count || 0) + 1;
        
        // Generate invoice number: TutorName-Date-SequentialNumber
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const invoiceNumber = `${tutorName}-${dateStr}-${String(nextNumber).padStart(4, '0')}`;

        // Create tutor invoice automatically with approved status
        await db.insert(tutorInvoices).values({
          tutorId: current.tutorId,
          weeklyTimesheetId: id,
          invoiceNumber,
          amount: totalAmount.toFixed(2),
          hoursWorked: totalHours.toFixed(2),
          status: "approved",
          approvedAt: new Date(),
          submittedAt: new Date(),
          notes: `Auto-generated from approved timesheet for week of ${current.weekStart.toISOString().split('T')[0]}`,
        });
      }

      // Update parent invoices linked to timesheet entries to "approved" status
      const entryIds = entries.map(e => e.id);
      if (entryIds.length > 0) {
        // Find all invoice line items linked to these entries
        const lineItems = await db
          .select({ invoiceId: invoiceLineItems.invoiceId })
          .from(invoiceLineItems)
          .where(inArray(invoiceLineItems.timesheetEntryId, entryIds));
        
        const invoiceIds = Array.from(new Set(lineItems.map(li => li.invoiceId)));
        
        if (invoiceIds.length > 0) {
          // Update parent invoices to approved status (only if not already paid)
          await db
            .update(invoices)
            .set({ 
              status: "approved",
              updatedAt: new Date() 
            })
            .where(
              and(
                inArray(invoices.id, invoiceIds),
                not(inArray(invoices.status, ["paid", "cancelled"]))
              )
            );
        }
      }
    }

    return reviewed;
  }

  async getTutorWeeklyEarnings(tutorId: string, startDate: Date, endDate: Date): Promise<number> {
    const entries = await db
      .select()
      .from(timesheetEntries)
      .where(
        and(
          eq(timesheetEntries.tutorId, tutorId),
          eq(timesheetEntries.status, "approved"),
          gte(timesheetEntries.date, startDate),
          lte(timesheetEntries.date, endDate)
        )
      );

    return entries.reduce((total, entry) => {
      return total + parseFloat(entry.tutorEarnings.toString());
    }, 0);
  }

  async getTutorWeeks(tutorId: string): Promise<{ weekStart: Date; weekEnd: Date }[]> {
    const entries = await db
      .select({ date: timesheetEntries.date })
      .from(timesheetEntries)
      .where(eq(timesheetEntries.tutorId, tutorId))
      .orderBy(desc(timesheetEntries.date));

    const weekMap = new Map<string, { weekStart: Date; weekEnd: Date }>();
    
    for (const entry of entries) {
      const date = new Date(entry.date);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(date);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const key = weekStart.toISOString().split('T')[0];
      if (!weekMap.has(key)) {
        weekMap.set(key, { weekStart, weekEnd });
      }
    }
    
    return Array.from(weekMap.values()).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }

  async getTutorAnnualEarnings(tutorId: string, year: number): Promise<{ totalEarnings: number; approvedSessions: number; year: number }> {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const entries = await db
      .select({
        tutorEarnings: timesheetEntries.tutorEarnings,
      })
      .from(timesheetEntries)
      .innerJoin(weeklyTimesheets, eq(timesheetEntries.weeklyTimesheetId, weeklyTimesheets.id))
      .where(
        and(
          eq(timesheetEntries.tutorId, tutorId),
          eq(weeklyTimesheets.status, "approved"),
          gte(timesheetEntries.date, yearStart),
          lte(timesheetEntries.date, yearEnd)
        )
      );

    const totalEarnings = entries.reduce((total, entry) => {
      return total + parseFloat(entry.tutorEarnings.toString());
    }, 0);

    return {
      totalEarnings,
      approvedSessions: entries.length,
      year,
    };
  }

  async getTutors(includeInactive: boolean = false): Promise<User[]> {
    // Return only staff (admins, tutors, and additional_staff) - exclude parents
    const roleCondition = or(eq(users.role, "admin"), eq(users.role, "tutor"), eq(users.role, "additional_staff"));
    const activeCondition = includeInactive ? roleCondition : and(roleCondition, eq(users.isActive, true));
    
    return await db
      .select()
      .from(users)
      .where(activeCondition)
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async getAdditionalStaff(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "additional_staff"))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, role), eq(users.isActive, true)))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async archiveTutor(id: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async restoreTutor(id: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async createTutor(tutorData: InsertUser): Promise<User> {
    const [tutor] = await db
      .insert(users)
      .values({ ...tutorData, role: "tutor" })
      .returning();
    return tutor;
  }

  async updateTutor(id: string, updates: UpdateUser): Promise<User> {
    const [updatedTutor] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedTutor;
  }

  async getParentUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "parent"))
      .orderBy(asc(users.firstName), asc(users.lastName));
  }

  async getAdminStats(fiscalYear?: number): Promise<{
    bookedRevenue: number;
    paidRevenue: number;
    bookedExpenditure: number;
    paidExpenditure: number;
    activeStudents: number;
    activeTutors: number;
    lowBalanceAlerts: number;
    weeklyOutgoings: number;
    monthlyIncome: number;
    fiscalYearLabel: string;
    studentsPerTutor: Array<{ tutorId: string; tutorName: string; studentCount: number }>;
    studentsPerSubject: Array<{ subject: string; studentCount: number }>;
  }> {
    // Get fiscal year range
    const fyYear = fiscalYear ?? getCurrentFiscalYear();
    const fyRange = getFiscalYearRange(fyYear);
    
    // Get all invoices within the fiscal year for BOOKED revenue (all statuses)
    const allParentInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          gte(invoices.createdAt, fyRange.startDate),
          lte(invoices.createdAt, fyRange.endDate)
        )
      );
    
    const allAdhocInvoices = await db
      .select()
      .from(adhocInvoices)
      .where(
        and(
          gte(adhocInvoices.createdAt, fyRange.startDate),
          lte(adhocInvoices.createdAt, fyRange.endDate)
        )
      );

    // Calculate booked revenue (all invoices regardless of status)
    const bookedRevenue = 
      allParentInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0) +
      allAdhocInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);

    // Calculate paid revenue (only paid invoices)
    const paidRevenue = 
      allParentInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0) +
      allAdhocInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);

    // Get all tutor invoices within fiscal year for BOOKED expenditure
    const allTutorInvs = await db
      .select()
      .from(tutorInvoices)
      .where(
        and(
          gte(tutorInvoices.submittedAt, fyRange.startDate),
          lte(tutorInvoices.submittedAt, fyRange.endDate)
        )
      );

    // Calculate booked expenditure (all tutor invoices regardless of status)
    const bookedExpenditure = allTutorInvs.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);

    // Calculate paid expenditure (only paid tutor invoices)
    const paidExpenditure = allTutorInvs
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);

    // Get active students count
    const allStudents = await db.select().from(students);
    const activeStudents = allStudents.filter(student => student.isActive).length;

    // Get active tutors count
    const allTutors = await db.select().from(users).where(eq(users.role, "tutor"));
    const activeTutors = allTutors.length;

    // Get low balance alerts (students with 5 or fewer sessions, including 0)
    const lowBalanceAlerts = allStudents.filter(student => student.isActive && student.sessionsRemaining <= 5).length;

    // Calculate weekly outgoings (tutor payments for this week)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyTutorInvoices = await db
      .select()
      .from(tutorInvoices)
      .where(
        and(
          eq(tutorInvoices.status, "paid"),
          gte(tutorInvoices.paidAt, weekStart),
          lte(tutorInvoices.paidAt, weekEnd)
        )
      );

    const weeklyOutgoings = weeklyTutorInvoices.reduce((total, inv) => {
      return total + parseFloat(inv.amount || '0');
    }, 0);

    // Calculate monthly income (paid invoices this month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthlyPaidInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.status, 'paid'),
          gte(invoices.paidAt, monthStart),
          lte(invoices.paidAt, monthEnd)
        )
      );
    
    const monthlyPaidAdhoc = await db
      .select()
      .from(adhocInvoices)
      .where(
        and(
          eq(adhocInvoices.status, 'paid'),
          gte(adhocInvoices.paidAt, monthStart),
          lte(adhocInvoices.paidAt, monthEnd)
        )
      );

    const monthlyIncome = 
      monthlyPaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0) +
      monthlyPaidAdhoc.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0);

    // Calculate students per tutor (using allocations for accuracy)
    const activeStudentsList = allStudents.filter(s => s.isActive);
    const allAllocations = await db
      .select()
      .from(studentTutors)
      .leftJoin(users, eq(studentTutors.tutorId, users.id))
      .leftJoin(students, eq(studentTutors.studentId, students.id))
      .where(eq(studentTutors.isActive, true));
    
    // Group allocations by tutor
    const tutorStudentMap = new Map<string, { tutorName: string; studentIds: Set<string> }>();
    for (const allocation of allAllocations) {
      if (allocation.users && allocation.students?.isActive) {
        const tutorId = allocation.student_tutors.tutorId;
        const tutorName = allocation.users.firstName && allocation.users.lastName 
          ? `${allocation.users.firstName} ${allocation.users.lastName}`
          : allocation.users.email || 'Unknown';
        
        if (!tutorStudentMap.has(tutorId)) {
          tutorStudentMap.set(tutorId, { tutorName, studentIds: new Set() });
        }
        tutorStudentMap.get(tutorId)!.studentIds.add(allocation.student_tutors.studentId);
      }
    }
    
    const studentsPerTutor = Array.from(tutorStudentMap.entries())
      .map(([tutorId, data]) => ({
        tutorId,
        tutorName: data.tutorName,
        studentCount: data.studentIds.size,
      }))
      .sort((a, b) => b.studentCount - a.studentCount);

    // Calculate students per subject (from studentTutors allocations)
    // Subjects can be comma-separated, so split them into individual subjects
    const subjectMap = new Map<string, Set<string>>();
    for (const allocation of allAllocations) {
      if (allocation.students?.isActive) {
        const subjectField = allocation.student_tutors.subject;
        if (subjectField) {
          // Split comma-separated subjects and count each separately
          const subjects = subjectField.split(',').map(s => s.trim()).filter(s => s.length > 0);
          for (const subject of subjects) {
            if (!subjectMap.has(subject)) {
              subjectMap.set(subject, new Set());
            }
            subjectMap.get(subject)!.add(allocation.student_tutors.studentId);
          }
        } else {
          // No subject specified
          if (!subjectMap.has('Unspecified')) {
            subjectMap.set('Unspecified', new Set());
          }
          subjectMap.get('Unspecified')!.add(allocation.student_tutors.studentId);
        }
      }
    }
    
    const studentsPerSubject = Array.from(subjectMap.entries())
      .map(([subject, studentIds]) => ({ subject, studentCount: studentIds.size }))
      .sort((a, b) => b.studentCount - a.studentCount);

    return {
      bookedRevenue,
      paidRevenue,
      bookedExpenditure,
      paidExpenditure,
      activeStudents,
      activeTutors,
      lowBalanceAlerts,
      weeklyOutgoings,
      monthlyIncome,
      fiscalYearLabel: fyRange.label,
      studentsPerTutor,
      studentsPerSubject,
    };
  }

  // Time slot operations
  async getTutorTimeSlots(tutorId?: string, startDate?: Date, endDate?: Date): Promise<TutorTimeSlotWithRelations[]> {
    const conditions = [eq(tutorTimeSlots.isCanceled, false)];
    
    if (tutorId) {
      conditions.push(eq(tutorTimeSlots.tutorId, tutorId));
    }
    if (startDate) {
      conditions.push(gte(tutorTimeSlots.startTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(tutorTimeSlots.endTime, endDate));
    }

    const results = await db
      .select()
      .from(tutorTimeSlots)
      .leftJoin(users, eq(tutorTimeSlots.tutorId, users.id))
      .where(and(...conditions))
      .orderBy(asc(tutorTimeSlots.startTime));
    
    // Get bookings for each slot
    const slotsWithBookings: TutorTimeSlotWithRelations[] = [];
    
    for (const result of results) {
      const bookings = await this.getSlotBookings(undefined, result.tutor_time_slots.id);
      slotsWithBookings.push({
        ...result.tutor_time_slots,
        tutor: result.users!,
        slotBookings: bookings,
      });
    }

    return slotsWithBookings;
  }

  async createTutorTimeSlot(slotData: InsertTutorTimeSlot): Promise<TutorTimeSlot> {
    const [slot] = await db
      .insert(tutorTimeSlots)
      .values(slotData)
      .returning();
    return slot;
  }

  async updateTutorTimeSlot(id: string, updates: UpdateTutorTimeSlot): Promise<TutorTimeSlot> {
    const [updatedSlot] = await db
      .update(tutorTimeSlots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tutorTimeSlots.id, id))
      .returning();
    return updatedSlot;
  }

  async deleteTutorTimeSlot(id: string): Promise<void> {
    await db
      .update(tutorTimeSlots)
      .set({ isCanceled: true, updatedAt: new Date() })
      .where(eq(tutorTimeSlots.id, id));
  }

  async getAvailableSlots(startDate?: Date, endDate?: Date, tutorId?: string, subject?: string): Promise<TutorTimeSlotWithRelations[]> {
    const conditions = [
      eq(tutorTimeSlots.isCanceled, false),
      gte(tutorTimeSlots.startTime, new Date()) // Only future slots
    ];
    
    if (startDate) {
      conditions.push(gte(tutorTimeSlots.startTime, startDate));
    }
    if (endDate) {
      conditions.push(lte(tutorTimeSlots.endTime, endDate));
    }
    if (tutorId) {
      conditions.push(eq(tutorTimeSlots.tutorId, tutorId));
    }
    if (subject) {
      conditions.push(eq(tutorTimeSlots.subject, subject));
    }

    const results = await db
      .select()
      .from(tutorTimeSlots)
      .leftJoin(users, eq(tutorTimeSlots.tutorId, users.id))
      .where(and(...conditions))
      .orderBy(asc(tutorTimeSlots.startTime));
    
    // Get bookings and filter slots that have availability
    const availableSlots: TutorTimeSlotWithRelations[] = [];
    
    for (const result of results) {
      const bookings = await this.getSlotBookings(undefined, result.tutor_time_slots.id);
      const bookedCount = bookings.filter(b => b.status === "booked").length;
      
      if (bookedCount < result.tutor_time_slots.capacity) {
        availableSlots.push({
          ...result.tutor_time_slots,
          tutor: result.users!,
          slotBookings: bookings,
        });
      }
    }

    return availableSlots;
  }

  // Booking operations
  async getSlotBookings(studentId?: string, slotId?: string): Promise<SlotBookingWithRelations[]> {
    const conditions = [];
    
    if (studentId) {
      conditions.push(eq(slotBookings.studentId, studentId));
    }
    if (slotId) {
      conditions.push(eq(slotBookings.slotId, slotId));
    }

    let query = db
      .select()
      .from(slotBookings)
      .leftJoin(tutorTimeSlots, eq(slotBookings.slotId, tutorTimeSlots.id))
      .leftJoin(students, eq(slotBookings.studentId, students.id))
      .leftJoin(users, eq(students.tutorId, users.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(slotBookings.createdAt));
    
    return results.map(result => ({
      ...result.slot_bookings,
      slot: result.tutor_time_slots!,
      student: {
        ...result.students!,
        tutor: result.users!,
      },
    }));
  }

  async createSlotBooking(bookingData: InsertSlotBooking): Promise<SlotBooking> {
    // Check if slot has capacity and student has sessions remaining
    const slot = await db.select().from(tutorTimeSlots).where(eq(tutorTimeSlots.id, bookingData.slotId));
    if (!slot[0]) {
      throw new Error("Slot not found");
    }

    const existingBookings = await this.getSlotBookings(undefined, bookingData.slotId);
    const bookedCount = existingBookings.filter(b => b.status === "booked").length;
    
    if (bookedCount >= slot[0].capacity) {
      throw new Error("Slot is full");
    }

    const student = await this.getStudent(bookingData.studentId);
    if (!student || student.sessionsRemaining <= 0) {
      throw new Error("Student has no remaining sessions");
    }

    const [booking] = await db
      .insert(slotBookings)
      .values(bookingData)
      .returning();
    
    // Internal admin notification only (no parent notifications)
    await this.createNotification({
      userId: slot[0].tutorId, // Notify the tutor
      type: "schedule_changed",
      payload: {
        message: `Student ${student.name} assigned to your session`,
        slotTime: slot[0].startTime,
        studentName: student.name
      }
    });

    return booking;
  }

  async cancelSlotBooking(id: string): Promise<SlotBooking> {
    const [canceledBooking] = await db
      .update(slotBookings)
      .set({ status: "canceled" })
      .where(eq(slotBookings.id, id))
      .returning();
    return canceledBooking;
  }

  async markAttendance(slotId: string, presentStudentIds: string[]): Promise<TimesheetEntry[]> {
    const slot = await db.select().from(tutorTimeSlots).where(eq(tutorTimeSlots.id, slotId));
    if (!slot[0]) {
      throw new Error("Slot not found");
    }

    const bookings = await this.getSlotBookings(undefined, slotId);
    const timesheetEntries: TimesheetEntry[] = [];

    for (const booking of bookings) {
      if (presentStudentIds.includes(booking.student.id)) {
        // Mark as attended
        await db
          .update(slotBookings)
          .set({ status: "attended" })
          .where(eq(slotBookings.id, booking.id));

        // Create timesheet entry
        const duration = (slot[0].endTime.getTime() - slot[0].startTime.getTime()) / (1000 * 60 * 60);
        const timesheetEntry = await this.createTimesheetEntry({
          tutorId: slot[0].tutorId,
          studentId: booking.student.id,
          date: slot[0].startTime,
          duration: duration.toString(),
          notes: `Group class attendance - ${slot[0].subject || booking.student.subject}`,
        });
        
        timesheetEntries.push(timesheetEntry);

        // Decrement student sessions
        await this.decrementStudentSessions(booking.student.id);

        // Check for low balance notification (notify admins, not parents)
        const updatedStudent = await this.getStudent(booking.student.id);
        if (updatedStudent && updatedStudent.sessionsRemaining <= 2) {
          // Notify admin users about low balance
          const admins = await db.select().from(users).where(eq(users.role, "admin"));
          for (const admin of admins) {
            await this.createNotification({
              userId: admin.id,
              type: "low_balance",
              payload: {
                studentName: updatedStudent.name,
                sessionsRemaining: updatedStudent.sessionsRemaining,
                message: `Student ${updatedStudent.name} has ${updatedStudent.sessionsRemaining} sessions remaining`
              }
            });
          }
        }
      } else {
        // Mark as no-show
        await db
          .update(slotBookings)
          .set({ status: "no_show" })
          .where(eq(slotBookings.id, booking.id));
      }
    }

    return timesheetEntries;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getAdminNotifications(): Promise<Notification[]> {
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));
    
    if (adminUsers.length === 0) {
      return [];
    }
    
    const adminIds = adminUsers.map(u => u.id);
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(inArray(notifications.userId, adminIds))
      .orderBy(desc(notifications.createdAt));
    
    return allNotifications;
  }

  // Session logging alert operations
  async getOverdueSessionsForAlerts(): Promise<SessionOccurrence[]> {
    // Find scheduled sessions that ended more than 24 hours ago and haven't been:
    // 1. Logged as a timesheet
    // 2. Changed to a resolved status (completed, cancelled, no_show, rescheduled)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Get sessions that should have alerts but don't yet
    const overdueSessionsResult = await db
      .select()
      .from(sessionOccurrences)
      .leftJoin(timesheetEntries, eq(sessionOccurrences.id, timesheetEntries.sessionOccurrenceId))
      .leftJoin(sessionLoggingAlerts, eq(sessionOccurrences.id, sessionLoggingAlerts.sessionOccurrenceId))
      .where(
        and(
          // Session is still "scheduled" or "confirmed" - tutor hasn't taken action
          or(
            eq(sessionOccurrences.status, "scheduled"),
            eq(sessionOccurrences.status, "confirmed")
          ),
          lt(sessionOccurrences.endDateTime, twentyFourHoursAgo),
          isNull(timesheetEntries.id), // No timesheet entry linked
          isNull(sessionLoggingAlerts.id) // No alert created yet
        )
      );
    
    return overdueSessionsResult.map(r => r.session_occurrences);
  }

  async createSessionLoggingAlert(alertData: InsertSessionLoggingAlert): Promise<SessionLoggingAlert> {
    const [alert] = await db
      .insert(sessionLoggingAlerts)
      .values(alertData)
      .returning();
    return alert;
  }

  async getSessionLoggingAlerts(tutorId?: string, status?: string): Promise<(SessionLoggingAlert & { tutorName: string; studentName: string })[]> {
    const conditions: any[] = [];
    if (tutorId) {
      conditions.push(eq(sessionLoggingAlerts.tutorId, tutorId));
    }
    if (status) {
      conditions.push(eq(sessionLoggingAlerts.status, status as "pending" | "resolved" | "dismissed"));
    }
    
    const results = await db
      .select({
        alert: sessionLoggingAlerts,
        tutorFirstName: users.firstName,
        tutorLastName: users.lastName,
        studentName: students.name,
      })
      .from(sessionLoggingAlerts)
      .leftJoin(users, eq(sessionLoggingAlerts.tutorId, users.id))
      .leftJoin(students, eq(sessionLoggingAlerts.studentId, students.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(sessionLoggingAlerts.alertCreatedAt));
    
    return results.map(r => ({
      ...r.alert,
      tutorName: `${r.tutorFirstName || ''} ${r.tutorLastName || ''}`.trim() || 'Unknown Tutor',
      studentName: r.studentName || 'Unknown Student',
    }));
  }

  async resolveSessionLoggingAlert(sessionOccurrenceId: string, timesheetEntryId: string): Promise<SessionLoggingAlert | undefined> {
    const now = new Date();
    
    // Find the pending alert for this session
    const [existingAlert] = await db
      .select()
      .from(sessionLoggingAlerts)
      .where(
        and(
          eq(sessionLoggingAlerts.sessionOccurrenceId, sessionOccurrenceId),
          eq(sessionLoggingAlerts.status, "pending")
        )
      );
    
    if (!existingAlert) {
      return undefined;
    }
    
    // Calculate hours late (from when alert was created to now)
    const hoursLate = (now.getTime() - (existingAlert.alertCreatedAt?.getTime() || now.getTime())) / (1000 * 60 * 60);
    
    const [resolved] = await db
      .update(sessionLoggingAlerts)
      .set({
        status: "resolved",
        resolvedAt: now,
        resolvedByTimesheetEntryId: timesheetEntryId,
        hoursLate: hoursLate.toFixed(2),
      })
      .where(eq(sessionLoggingAlerts.id, existingAlert.id))
      .returning();
    
    return resolved;
  }

  async dismissSessionLoggingAlert(id: string, adminId: string, reason: string): Promise<SessionLoggingAlert> {
    const [dismissed] = await db
      .update(sessionLoggingAlerts)
      .set({
        status: "dismissed",
        dismissedBy: adminId,
        dismissReason: reason,
      })
      .where(eq(sessionLoggingAlerts.id, id))
      .returning();
    
    if (!dismissed) {
      throw new Error("Alert not found");
    }
    
    return dismissed;
  }

  async getTutorComplianceMetrics(tutorId?: string): Promise<{ tutorId: string; tutorName: string; totalSessions: number; lateLogged: number; latePercentage: number; avgHoursLate: number; pendingAlerts: number }[]> {
    const conditions: any[] = [];
    if (tutorId) {
      conditions.push(eq(sessionLoggingAlerts.tutorId, tutorId));
    }
    
    // Get all resolved alerts (these are sessions that were logged late)
    const resolvedAlerts = await db
      .select({
        tutorId: sessionLoggingAlerts.tutorId,
        hoursLate: sessionLoggingAlerts.hoursLate,
        tutorFirstName: users.firstName,
        tutorLastName: users.lastName,
      })
      .from(sessionLoggingAlerts)
      .leftJoin(users, eq(sessionLoggingAlerts.tutorId, users.id))
      .where(
        conditions.length > 0
          ? and(eq(sessionLoggingAlerts.status, "resolved"), ...conditions)
          : eq(sessionLoggingAlerts.status, "resolved")
      );
    
    // Get pending alerts count per tutor
    const pendingAlerts = await db
      .select({
        tutorId: sessionLoggingAlerts.tutorId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(sessionLoggingAlerts)
      .where(
        tutorId
          ? and(eq(sessionLoggingAlerts.status, "pending"), eq(sessionLoggingAlerts.tutorId, tutorId))
          : eq(sessionLoggingAlerts.status, "pending")
      )
      .groupBy(sessionLoggingAlerts.tutorId);
    
    // Get total completed sessions per tutor from session_occurrences
    const completedSessions = await db
      .select({
        tutorId: sessionOccurrences.tutorId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(sessionOccurrences)
      .where(
        tutorId
          ? and(eq(sessionOccurrences.status, "completed"), eq(sessionOccurrences.tutorId, tutorId))
          : eq(sessionOccurrences.status, "completed")
      )
      .groupBy(sessionOccurrences.tutorId);
    
    // Aggregate metrics per tutor
    const metricsMap = new Map<string, { tutorId: string; tutorName: string; totalSessions: number; lateLogged: number; totalHoursLate: number; pendingAlerts: number }>();
    
    // Initialize with completed sessions count
    for (const session of completedSessions) {
      if (!session.tutorId) continue;
      metricsMap.set(session.tutorId, {
        tutorId: session.tutorId,
        tutorName: '',
        totalSessions: Number(session.count),
        lateLogged: 0,
        totalHoursLate: 0,
        pendingAlerts: 0,
      });
    }
    
    // Add late logging data
    for (const alert of resolvedAlerts) {
      if (!alert.tutorId) continue;
      const existing = metricsMap.get(alert.tutorId);
      if (existing) {
        existing.lateLogged++;
        existing.totalHoursLate += parseFloat(alert.hoursLate || '0');
        existing.tutorName = `${alert.tutorFirstName || ''} ${alert.tutorLastName || ''}`.trim();
      }
    }
    
    // Add pending alerts count
    for (const pending of pendingAlerts) {
      if (!pending.tutorId) continue;
      const existing = metricsMap.get(pending.tutorId);
      if (existing) {
        existing.pendingAlerts = Number(pending.count);
      }
    }
    
    // Convert to array with calculated percentages
    return Array.from(metricsMap.values()).map(m => ({
      tutorId: m.tutorId,
      tutorName: m.tutorName || 'Unknown',
      totalSessions: m.totalSessions,
      lateLogged: m.lateLogged,
      latePercentage: m.totalSessions > 0 ? (m.lateLogged / m.totalSessions) * 100 : 0,
      avgHoursLate: m.lateLogged > 0 ? m.totalHoursLate / m.lateLogged : 0,
      pendingAlerts: m.pendingAlerts,
    }));
  }

  // Invoice Payment Alert Methods
  
  async getOverdueInvoicesForAlerts(): Promise<Invoice[]> {
    // Get invoices that are 2+ days past sent date and not paid, with no existing alert
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    const overdueInvoicesResult = await db
      .select({
        invoice: invoices,
      })
      .from(invoices)
      .leftJoin(invoicePaymentAlerts, eq(invoices.id, invoicePaymentAlerts.invoiceId))
      .where(
        and(
          eq(invoices.status, "sent"),
          lt(invoices.sentAt, twoDaysAgo),
          isNull(invoicePaymentAlerts.id) // No alert created yet
        )
      );
    
    return overdueInvoicesResult.map(r => r.invoice);
  }

  async createInvoicePaymentAlert(alertData: InsertInvoicePaymentAlert): Promise<InvoicePaymentAlert> {
    const [alert] = await db
      .insert(invoicePaymentAlerts)
      .values(alertData)
      .returning();
    return alert;
  }

  async getInvoicePaymentAlerts(parentId?: string, status?: string): Promise<(InvoicePaymentAlert & { parentName: string; studentName: string; invoiceNumber: string; amount: string })[]> {
    const conditions: any[] = [];
    if (parentId) {
      conditions.push(eq(invoicePaymentAlerts.parentId, parentId));
    }
    if (status) {
      conditions.push(eq(invoicePaymentAlerts.status, status as "pending" | "resolved" | "dismissed"));
    }
    
    const results = await db
      .select({
        alert: invoicePaymentAlerts,
        parentFirstName: users.firstName,
        parentLastName: users.lastName,
        studentName: students.name,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
      })
      .from(invoicePaymentAlerts)
      .leftJoin(users, eq(invoicePaymentAlerts.parentId, users.id))
      .leftJoin(students, eq(invoicePaymentAlerts.studentId, students.id))
      .leftJoin(invoices, eq(invoicePaymentAlerts.invoiceId, invoices.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(invoicePaymentAlerts.alertCreatedAt));
    
    return results.map(r => ({
      ...r.alert,
      parentName: `${r.parentFirstName || ''} ${r.parentLastName || ''}`.trim() || 'Unknown Parent',
      studentName: r.studentName || 'Unknown Student',
      invoiceNumber: r.invoiceNumber || 'Unknown',
      amount: r.amount || '0',
    }));
  }

  async resolveInvoicePaymentAlert(invoiceId: string): Promise<InvoicePaymentAlert | undefined> {
    const now = new Date();
    
    // Find the pending alert for this invoice
    const [existingAlert] = await db
      .select()
      .from(invoicePaymentAlerts)
      .where(
        and(
          eq(invoicePaymentAlerts.invoiceId, invoiceId),
          eq(invoicePaymentAlerts.status, "pending")
        )
      );
    
    if (!existingAlert) {
      return undefined;
    }
    
    // Calculate days overdue
    const daysOverdue = Math.floor((now.getTime() - (existingAlert.dueDate?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24));
    
    const [resolved] = await db
      .update(invoicePaymentAlerts)
      .set({
        status: "resolved",
        resolvedAt: now,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0,
      })
      .where(eq(invoicePaymentAlerts.id, existingAlert.id))
      .returning();
    
    return resolved;
  }

  async dismissInvoicePaymentAlert(id: string, adminId: string, reason: string): Promise<InvoicePaymentAlert> {
    const [dismissed] = await db
      .update(invoicePaymentAlerts)
      .set({
        status: "dismissed",
        dismissedBy: adminId,
        dismissReason: reason,
      })
      .where(eq(invoicePaymentAlerts.id, id))
      .returning();
    
    if (!dismissed) {
      throw new Error("Alert not found");
    }
    
    return dismissed;
  }

  async markInvoiceAsPaidByParent(invoiceId: string): Promise<Invoice> {
    const now = new Date();
    
    const [updated] = await db
      .update(invoices)
      .set({
        parentClaimedPaid: true,
        parentClaimedPaidAt: now,
        updatedAt: now,
      })
      .where(eq(invoices.id, invoiceId))
      .returning();
    
    if (!updated) {
      throw new Error("Invoice not found");
    }
    
    return updated;
  }

  async confirmInvoicePaid(invoiceId: string): Promise<Invoice> {
    const now = new Date();
    
    const [updated] = await db
      .update(invoices)
      .set({
        status: "paid",
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(invoices.id, invoiceId))
      .returning();
    
    if (!updated) {
      throw new Error("Invoice not found");
    }
    
    // Also resolve any pending alerts for this invoice
    await this.resolveInvoicePaymentAlert(invoiceId);
    
    return updated;
  }

  async getParentPaymentComplianceMetrics(): Promise<{ parentId: string; parentName: string; totalInvoices: number; latePaid: number; latePercentage: number; pendingAlerts: number }[]> {
    try {
      // Get all resolved alerts (invoices that were paid late)
      const resolvedAlerts = await db
        .select({
          parentId: invoicePaymentAlerts.parentId,
          parentFirstName: users.firstName,
          parentLastName: users.lastName,
        })
        .from(invoicePaymentAlerts)
        .leftJoin(users, eq(invoicePaymentAlerts.parentId, users.id))
        .where(eq(invoicePaymentAlerts.status, "resolved"));
      
      // Get pending alerts count per parent
      const pendingAlerts = await db
        .select({
          parentId: invoicePaymentAlerts.parentId,
          count: sql<number>`count(*)`.as("count"),
        })
        .from(invoicePaymentAlerts)
        .where(eq(invoicePaymentAlerts.status, "pending"))
        .groupBy(invoicePaymentAlerts.parentId);
      
      // Get total sent invoices per parent (through student relationship)
      // Use a direct query approach to avoid issues with empty results
      const sentInvoicesRaw = await db
        .select({
          parentId: students.parentUserId,
          count: sql<number>`count(*)`.as("count"),
        })
        .from(invoices)
        .innerJoin(students, eq(invoices.studentId, students.id))
        .where(
          and(
            sql`${students.parentUserId} IS NOT NULL`,
            inArray(invoices.status, ["sent", "paid", "overdue"])
          )
        )
        .groupBy(students.parentUserId);
      
      const sentInvoices = sentInvoicesRaw || [];
      
      // Aggregate metrics per parent
      const metricsMap = new Map<string, { parentId: string; parentName: string; totalInvoices: number; latePaid: number; pendingAlerts: number }>();
      
      // Initialize with total invoices
      for (const inv of sentInvoices) {
        if (!inv.parentId) continue;
        metricsMap.set(inv.parentId, {
          parentId: inv.parentId,
          parentName: '',
          totalInvoices: Number(inv.count),
          latePaid: 0,
          pendingAlerts: 0,
        });
      }
      
      // Add late payment data
      for (const alert of resolvedAlerts) {
        if (!alert.parentId) continue;
        const existing = metricsMap.get(alert.parentId);
        if (existing) {
          existing.latePaid++;
          existing.parentName = `${alert.parentFirstName || ''} ${alert.parentLastName || ''}`.trim();
        }
      }
      
      // Add pending alerts count
      for (const pending of pendingAlerts) {
        if (!pending.parentId) continue;
        const existing = metricsMap.get(pending.parentId);
        if (existing) {
          existing.pendingAlerts = Number(pending.count);
        }
      }
      
      // Convert to array with calculated percentages
      return Array.from(metricsMap.values()).map(m => ({
        parentId: m.parentId,
        parentName: m.parentName || 'Unknown',
        totalInvoices: m.totalInvoices,
        latePaid: m.latePaid,
        latePercentage: m.totalInvoices > 0 ? (m.latePaid / m.totalInvoices) * 100 : 0,
        pendingAlerts: m.pendingAlerts,
      }));
    } catch (error) {
      console.error("Error in getParentPaymentComplianceMetrics:", error);
      return [];
    }
  }

  async checkAndSendInvoiceReminders(): Promise<{ reminder2Days: number; reminder4Days: number; reminder5Days: number }> {
    const now = new Date();
    let reminder2Days = 0;
    let reminder4Days = 0;
    let reminder5Days = 0;

    // Get all sent invoices that haven't been paid
    const unpaidInvoices = await db
      .select({
        invoice: invoices,
        student: students,
        parent: users,
      })
      .from(invoices)
      .leftJoin(students, eq(invoices.studentId, students.id))
      .leftJoin(users, eq(students.parentUserId, users.id))
      .where(
        and(
          eq(invoices.status, "sent"),
          isNotNull(invoices.sentAt),
          isNull(invoices.paidAt),
          eq(invoices.parentClaimedPaid, false)
        )
      );

    for (const { invoice, student, parent } of unpaidInvoices) {
      if (!invoice.sentAt || !parent) continue;

      const sentAt = new Date(invoice.sentAt);
      const daysSinceSent = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24));

      // Check for 2-day reminder (sent 2+ days ago, reminder not sent)
      if (daysSinceSent >= 2 && !invoice.reminder2DaysSentAt) {
        // Create notification for parent
        await this.createNotification({
          userId: parent.id,
          type: "invoice_reminder",
          payload: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            studentName: `${student?.firstName || ''} ${student?.surname || ''}`.trim(),
            daysSinceSent: 2,
            dueIn: 3, // 5 - 2 = 3 days until due
            message: `Reminder: Invoice ${invoice.invoiceNumber} for £${invoice.amount} was sent 2 days ago. Payment is due in 3 days.`,
          },
        });
        
        // Mark reminder as sent
        await db
          .update(invoices)
          .set({ reminder2DaysSentAt: now })
          .where(eq(invoices.id, invoice.id));
        
        reminder2Days++;
      }

      // Check for 4-day reminder (sent 4+ days ago, reminder not sent)
      if (daysSinceSent >= 4 && !invoice.reminder4DaysSentAt) {
        await this.createNotification({
          userId: parent.id,
          type: "invoice_reminder",
          payload: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            studentName: `${student?.firstName || ''} ${student?.surname || ''}`.trim(),
            daysSinceSent: 4,
            dueIn: 1, // 5 - 4 = 1 day until due
            message: `Reminder: Invoice ${invoice.invoiceNumber} for £${invoice.amount} is due tomorrow. Please make payment to avoid any disruption.`,
          },
        });
        
        await db
          .update(invoices)
          .set({ reminder4DaysSentAt: now })
          .where(eq(invoices.id, invoice.id));
        
        reminder4Days++;
      }

      // Check for 5-day reminder (sent 5+ days ago, due date, reminder not sent)
      if (daysSinceSent >= 5 && !invoice.reminder5DaysSentAt) {
        await this.createNotification({
          userId: parent.id,
          type: "invoice_reminder",
          payload: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            studentName: `${student?.firstName || ''} ${student?.surname || ''}`.trim(),
            daysSinceSent: 5,
            dueIn: 0, // Due today
            message: `URGENT: Invoice ${invoice.invoiceNumber} for £${invoice.amount} is due TODAY. Please make payment immediately to avoid late fees.`,
          },
        });
        
        await db
          .update(invoices)
          .set({ reminder5DaysSentAt: now })
          .where(eq(invoices.id, invoice.id));
        
        reminder5Days++;
      }
    }

    return { reminder2Days, reminder4Days, reminder5Days };
  }

  async getTutorEmergencyContact(tutorId: string): Promise<EmergencyContact | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, tutorId), eq(users.role, "tutor")));
    
    if (!user || !user.emergencyContact) {
      return null;
    }
    
    return user.emergencyContact as EmergencyContact;
  }

  async updateTutorEmergencyContact(tutorId: string, emergencyContact: EmergencyContact): Promise<User> {
    const contactWithTimestamp = {
      ...emergencyContact,
      lastUpdatedAt: new Date().toISOString(),
    };
    
    const [updatedUser] = await db
      .update(users)
      .set({ 
        emergencyContact: contactWithTimestamp,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, tutorId), eq(users.role, "tutor")))
      .returning();
    
    if (!updatedUser) {
      throw new Error("Tutor not found");
    }
    
    // Create notification for all admin users
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));
    
    for (const admin of adminUsers) {
      await this.createNotification({
        userId: admin.id,
        type: "emergency_contact_updated",
        payload: {
          tutorId,
          tutorName: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
          tutorEmail: updatedUser.email,
          contactName: emergencyContact.name,
          contactPhone: emergencyContact.phone,
          updatedAt: contactWithTimestamp.lastUpdatedAt,
        },
      });
    }
    
    return updatedUser;
  }

  // QuickBooks Export Methods - Replace Excel-to-QuickBooks workflow
  async generateParentInvoicesCSV(startDate: Date, endDate: Date): Promise<string> {
    // Get approved timesheet entries within date range
    const approvedEntries = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(
        and(
          eq(timesheetEntries.status, "approved"),
          gte(timesheetEntries.date, startDate),
          lte(timesheetEntries.date, endDate)
        )
      )
      .orderBy(students.name);

    // Group by student for invoicing
    const invoiceData: Record<string, {
      studentName: string;
      parentContact: string;
      totalHours: number;
      totalAmount: number;
      sessions: Array<{
        date: Date;
        duration: number;
        rate: number;
        amount: number;
        tutorName: string;
        subject: string;
      }>;
    }> = {};

    for (const entry of approvedEntries) {
      const student = entry.students!;
      const tutor = entry.users!;
      const timesheet = entry.timesheet_entries;
      
      if (!invoiceData[student.id]) {
        invoiceData[student.id] = {
          studentName: student.name,
          parentContact: student.parentContactInfo || 'No contact info',
          totalHours: 0,
          totalAmount: 0,
          sessions: []
        };
      }

      const duration = parseFloat(timesheet.duration);
      const amount = parseFloat(timesheet.parentBilling);
      
      invoiceData[student.id].totalHours += duration;
      invoiceData[student.id].totalAmount += amount;
      invoiceData[student.id].sessions.push({
        date: timesheet.date,
        duration: duration,
        rate: parseFloat(student.parentRate),
        amount: amount,
        tutorName: `${tutor.firstName} ${tutor.lastName}`,
        subject: student.subject
      });
    }

    // Generate CSV for QuickBooks import
    const csvRows = [
      'Student Name,Parent Contact,Date,Hours,Rate,Amount,Tutor,Subject,Invoice Total',
    ];

    for (const studentData of Object.values(invoiceData)) {
      for (const session of studentData.sessions) {
        csvRows.push([
          `"${studentData.studentName}"`,
          `"${studentData.parentContact}"`,
          session.date.toISOString().split('T')[0],
          session.duration.toString(),
          session.rate.toString(),
          session.amount.toString(),
          `"${session.tutorName}"`,
          `"${session.subject}"`,
          studentData.totalAmount.toString()
        ].join(','));
      }
    }

    return csvRows.join('\n');
  }

  async generateTutorPayrollCSV(startDate: Date, endDate: Date): Promise<string> {
    // Get approved timesheet entries within date range
    const approvedEntries = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(
        and(
          eq(timesheetEntries.status, "approved"),
          gte(timesheetEntries.date, startDate),
          lte(timesheetEntries.date, endDate)
        )
      )
      .orderBy(users.firstName);

    // Group by tutor for payroll
    const payrollData: Record<string, {
      tutorName: string;
      tutorEmail: string;
      totalHours: number;
      totalEarnings: number;
      sessions: Array<{
        date: Date;
        studentName: string;
        duration: number;
        rate: number;
        earnings: number;
        subject: string;
      }>;
    }> = {};

    for (const entry of approvedEntries) {
      const student = entry.students!;
      const tutor = entry.users!;
      const timesheet = entry.timesheet_entries;
      
      if (!payrollData[tutor.id]) {
        payrollData[tutor.id] = {
          tutorName: `${tutor.firstName} ${tutor.lastName}`,
          tutorEmail: tutor.email || 'No email',
          totalHours: 0,
          totalEarnings: 0,
          sessions: []
        };
      }

      const duration = parseFloat(timesheet.duration);
      const earnings = parseFloat(timesheet.tutorEarnings);
      
      payrollData[tutor.id].totalHours += duration;
      payrollData[tutor.id].totalEarnings += earnings;
      payrollData[tutor.id].sessions.push({
        date: timesheet.date,
        studentName: student.name,
        duration: duration,
        rate: parseFloat(student.tutorRate),
        earnings: earnings,
        subject: student.subject
      });
    }

    // Generate CSV for payroll processing
    const csvRows = [
      'Tutor Name,Tutor Email,Date,Student,Hours,Rate,Earnings,Subject,Total Earnings',
    ];

    for (const tutorData of Object.values(payrollData)) {
      for (const session of tutorData.sessions) {
        csvRows.push([
          `"${tutorData.tutorName}"`,
          `"${tutorData.tutorEmail}"`,
          session.date.toISOString().split('T')[0],
          `"${session.studentName}"`,
          session.duration.toString(),
          session.rate.toString(),
          session.earnings.toString(),
          `"${session.subject}"`,
          tutorData.totalEarnings.toString()
        ].join(','));
      }
    }

    return csvRows.join('\n');
  }

  // Archive operations
  async getArchivedStudents(): Promise<ArchivedStudentSummary[]> {
    const archivedStudents = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.tutorId, users.id))
      .where(eq(students.isActive, false))
      .orderBy(desc(students.updatedAt));

    const results: ArchivedStudentSummary[] = [];

    for (const row of archivedStudents) {
      const student = row.students;
      const tutor = row.users!;

      // Get total billed from approved timesheet entries
      const billedResult = await db
        .select({ total: sql<string>`COALESCE(SUM(${timesheetEntries.parentBilling}), 0)` })
        .from(timesheetEntries)
        .where(and(
          eq(timesheetEntries.studentId, student.id),
          eq(timesheetEntries.status, "approved")
        ));
      const totalBilled = parseFloat(billedResult[0]?.total || "0");

      // Get total received from payments
      const receivedResult = await db
        .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(eq(payments.studentId, student.id));
      const totalReceived = parseFloat(receivedResult[0]?.total || "0");

      // Get counts
      const invoiceCountResult = await db
        .select({ count: sql<string>`COUNT(*)` })
        .from(invoices)
        .where(eq(invoices.studentId, student.id));
      const invoiceCount = parseInt(invoiceCountResult[0]?.count || "0");

      const sessionCountResult = await db
        .select({ count: sql<string>`COUNT(*)` })
        .from(timesheetEntries)
        .where(eq(timesheetEntries.studentId, student.id));
      const sessionCount = parseInt(sessionCountResult[0]?.count || "0");

      results.push({
        ...student,
        tutor,
        totalBilled,
        totalReceived,
        totalOutstanding: totalBilled - totalReceived,
        invoiceCount,
        sessionCount,
      });
    }

    return results;
  }

  async getArchivedStudentDetails(id: string): Promise<{
    student: StudentWithTutor;
    invoices: InvoiceWithRelations[];
    payments: PaymentWithRelations[];
    timesheetEntries: TimesheetEntryWithRelations[];
    totalBilled: number;
    totalReceived: number;
    totalOutstanding: number;
  } | undefined> {
    const studentResult = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.tutorId, users.id))
      .where(eq(students.id, id));

    if (studentResult.length === 0) return undefined;

    const student = studentResult[0].students;
    const tutor = studentResult[0].users!;

    // Get invoices with line items and payments
    const invoiceResults = await db
      .select()
      .from(invoices)
      .where(eq(invoices.studentId, id))
      .orderBy(desc(invoices.createdAt));

    const invoicesWithRelations: InvoiceWithRelations[] = [];
    for (const invoice of invoiceResults) {
      const lineItems = await db
        .select()
        .from(invoiceLineItems)
        .where(eq(invoiceLineItems.invoiceId, invoice.id));
      
      const invoicePayments = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, invoice.id));

      invoicesWithRelations.push({
        ...invoice,
        student,
        lineItems,
        payments: invoicePayments,
      });
    }

    // Get all payments
    const paymentResults = await db
      .select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(payments.studentId, id))
      .orderBy(desc(payments.receivedAt));

    const paymentsWithRelations: PaymentWithRelations[] = paymentResults.map(row => ({
      ...row.payments,
      invoice: row.invoices || null,
      student,
    }));

    // Get timesheet entries
    const entryResults = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(eq(timesheetEntries.studentId, id))
      .orderBy(desc(timesheetEntries.date));

    const entries: TimesheetEntryWithRelations[] = entryResults.map(row => ({
      ...row.timesheet_entries,
      student: row.students!,
      tutor: row.users!,
    }));

    // Calculate totals
    const billedResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${timesheetEntries.parentBilling}), 0)` })
      .from(timesheetEntries)
      .where(and(
        eq(timesheetEntries.studentId, id),
        eq(timesheetEntries.status, "approved")
      ));
    const totalBilled = parseFloat(billedResult[0]?.total || "0");

    const receivedResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
      .from(payments)
      .where(eq(payments.studentId, id));
    const totalReceived = parseFloat(receivedResult[0]?.total || "0");

    return {
      student: { ...student, tutor },
      invoices: invoicesWithRelations,
      payments: paymentsWithRelations,
      timesheetEntries: entries,
      totalBilled,
      totalReceived,
      totalOutstanding: totalBilled - totalReceived,
    };
  }

  async getArchivedTutors(): Promise<ArchivedTutorSummary[]> {
    // Get all archived staff (both tutors and admins)
    const archivedTutors = await db
      .select()
      .from(users)
      .where(eq(users.isActive, false))
      .orderBy(desc(users.updatedAt));

    const results: ArchivedTutorSummary[] = [];

    for (const tutor of archivedTutors) {
      // Get total earnings from approved timesheet entries
      const earningsResult = await db
        .select({ total: sql<string>`COALESCE(SUM(${timesheetEntries.tutorEarnings}), 0)` })
        .from(timesheetEntries)
        .where(and(
          eq(timesheetEntries.tutorId, tutor.id),
          eq(timesheetEntries.status, "approved")
        ));
      const totalEarnings = parseFloat(earningsResult[0]?.total || "0");

      // Get session count
      const sessionCountResult = await db
        .select({ count: sql<string>`COUNT(*)` })
        .from(timesheetEntries)
        .where(eq(timesheetEntries.tutorId, tutor.id));
      const sessionCount = parseInt(sessionCountResult[0]?.count || "0");

      // Get student count
      const studentCountResult = await db
        .select({ count: sql<string>`COUNT(DISTINCT ${students.id})` })
        .from(students)
        .where(eq(students.tutorId, tutor.id));
      const studentCount = parseInt(studentCountResult[0]?.count || "0");

      results.push({
        ...tutor,
        totalEarnings,
        totalPaid: totalEarnings, // Assuming all approved earnings are paid
        totalOutstanding: 0,
        sessionCount,
        studentCount,
      });
    }

    return results;
  }

  async getArchivedTutorDetails(id: string): Promise<{
    tutor: User;
    timesheetEntries: TimesheetEntryWithRelations[];
    students: StudentWithTutor[];
    totalEarnings: number;
    totalPaid: number;
    totalOutstanding: number;
  } | undefined> {
    const tutorResult = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (tutorResult.length === 0) return undefined;
    const tutor = tutorResult[0];

    // Get timesheet entries
    const entryResults = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(eq(timesheetEntries.tutorId, id))
      .orderBy(desc(timesheetEntries.date));

    const entries: TimesheetEntryWithRelations[] = entryResults.map(row => ({
      ...row.timesheet_entries,
      student: row.students!,
      tutor: row.users!,
    }));

    // Get students assigned to this tutor
    const studentResults = await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.tutorId, users.id))
      .where(eq(students.tutorId, id));

    const tutorStudents: StudentWithTutor[] = studentResults.map(row => ({
      ...row.students,
      tutor: row.users!,
    }));

    // Calculate totals
    const earningsResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${timesheetEntries.tutorEarnings}), 0)` })
      .from(timesheetEntries)
      .where(and(
        eq(timesheetEntries.tutorId, id),
        eq(timesheetEntries.status, "approved")
      ));
    const totalEarnings = parseFloat(earningsResult[0]?.total || "0");

    return {
      tutor,
      timesheetEntries: entries,
      students: tutorStudents,
      totalEarnings,
      totalPaid: totalEarnings,
      totalOutstanding: 0,
    };
  }

  // Invoice operations
  async getInvoices(studentId?: string): Promise<InvoiceWithRelations[]> {
    let query = db.select().from(invoices).leftJoin(students, eq(invoices.studentId, students.id));
    
    if (studentId) {
      query = query.where(eq(invoices.studentId, studentId)) as typeof query;
    }

    const results = await query.orderBy(desc(invoices.createdAt));

    const invoicesWithRelations: InvoiceWithRelations[] = [];
    for (const row of results) {
      const lineItems = await db
        .select()
        .from(invoiceLineItems)
        .where(eq(invoiceLineItems.invoiceId, row.invoices.id));
      
      const invoicePayments = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, row.invoices.id));

      invoicesWithRelations.push({
        ...row.invoices,
        student: row.students!,
        lineItems,
        payments: invoicePayments,
      });
    }

    return invoicesWithRelations;
  }

  async getInvoice(id: string): Promise<InvoiceWithRelations | undefined> {
    const result = await db
      .select()
      .from(invoices)
      .leftJoin(students, eq(invoices.studentId, students.id))
      .where(eq(invoices.id, id));

    if (result.length === 0) return undefined;

    const invoice = result[0].invoices;
    const student = result[0].students!;

    const lineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id));

    const invoicePayments = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id));

    return {
      ...invoice,
      student,
      lineItems,
      payments: invoicePayments,
    };
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(invoice).returning();
    return created;
  }

  async updateInvoice(id: string, updates: UpdateInvoice): Promise<Invoice> {
    const [updated] = await db
      .update(invoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async processScheduledInvoices(): Promise<number> {
    const now = new Date();
    
    // Find all invoices with status "scheduled" where scheduledSendDate <= now
    const scheduledInvoices = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.status, "scheduled"),
          lte(invoices.scheduledSendDate, now)
        )
      );
    
    let processedCount = 0;
    
    for (const invoice of scheduledInvoices) {
      try {
        // Update invoice to "sent" status
        await db
          .update(invoices)
          .set({ 
            status: "sent", 
            sentAt: now,
            updatedAt: now,
            notes: invoice.notes 
              ? `${invoice.notes} | Auto-sent on ${now.toLocaleDateString()}`
              : `Auto-sent on ${now.toLocaleDateString()}`
          })
          .where(eq(invoices.id, invoice.id));
        
        processedCount++;
        console.log(`[Scheduled Invoice] Processed invoice ${invoice.invoiceNumber} - status changed to sent`);
      } catch (error) {
        console.error(`[Scheduled Invoice] Failed to process invoice ${invoice.invoiceNumber}:`, error);
      }
    }
    
    return processedCount;
  }

  async addInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    const [created] = await db.insert(invoiceLineItems).values(lineItem).returning();
    return created;
  }

  // Adhoc invoice operations
  async getAdhocInvoices(): Promise<AdhocInvoice[]> {
    return await db
      .select()
      .from(adhocInvoices)
      .orderBy(desc(adhocInvoices.createdAt));
  }

  async getAdhocInvoice(id: string): Promise<AdhocInvoice | undefined> {
    const [invoice] = await db
      .select()
      .from(adhocInvoices)
      .where(eq(adhocInvoices.id, id));
    return invoice;
  }

  async createAdhocInvoice(invoice: InsertAdhocInvoice): Promise<AdhocInvoice> {
    // Generate invoice number: ADHOC-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get count of adhoc invoices for sequential numbering
    const existingInvoices = await db
      .select({ count: sql<number>`count(*)` })
      .from(adhocInvoices);
    const count = Number(existingInvoices[0]?.count || 0) + 1;
    const invoiceNumber = `ADHOC-${dateStr}-${String(count).padStart(4, '0')}`;
    
    const [created] = await db
      .insert(adhocInvoices)
      .values({ ...invoice, invoiceNumber })
      .returning();
    return created;
  }

  async updateAdhocInvoice(id: string, updates: UpdateAdhocInvoice): Promise<AdhocInvoice> {
    const [updated] = await db
      .update(adhocInvoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adhocInvoices.id, id))
      .returning();
    return updated;
  }

  async deleteAdhocInvoice(id: string): Promise<void> {
    await db.delete(adhocInvoices).where(eq(adhocInvoices.id, id));
  }

  // Adhoc invoice item operations (inventory linking)
  async getAdhocInvoiceItems(adhocInvoiceId: string): Promise<AdhocInvoiceItem[]> {
    return await db
      .select()
      .from(adhocInvoiceItems)
      .where(eq(adhocInvoiceItems.adhocInvoiceId, adhocInvoiceId));
  }

  async createAdhocInvoiceItem(item: InsertAdhocInvoiceItem): Promise<AdhocInvoiceItem> {
    const [created] = await db.insert(adhocInvoiceItems).values(item).returning();
    return created;
  }

  async deleteAdhocInvoiceItems(adhocInvoiceId: string): Promise<void> {
    await db.delete(adhocInvoiceItems).where(eq(adhocInvoiceItems.adhocInvoiceId, adhocInvoiceId));
  }

  async deductInventoryForAdhocInvoice(adhocInvoiceId: string): Promise<void> {
    // Get the invoice first to check if already deducted
    const invoice = await this.getAdhocInvoice(adhocInvoiceId);
    if (!invoice || invoice.inventoryDeducted) {
      return; // Already deducted or invoice doesn't exist
    }

    // Get all items linked to this invoice
    const items = await this.getAdhocInvoiceItems(adhocInvoiceId);
    if (items.length === 0) {
      return; // No items to deduct
    }

    // Deduct inventory for each item
    for (const item of items) {
      // Get current product stock
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (product) {
        const previousStock = product.stockQuantity || 0;
        const newStock = Math.max(0, previousStock - item.quantity);
        
        // Update product stock
        await db
          .update(products)
          .set({ stockQuantity: newStock, updatedAt: new Date() })
          .where(eq(products.id, item.productId));

        // Create inventory transaction record
        await db.insert(inventoryTransactions).values({
          productId: item.productId,
          transactionType: 'sale',
          quantity: -item.quantity,
          previousStock: previousStock,
          newStock: newStock,
          notes: `Auto-deducted for adhoc invoice ${invoice.invoiceNumber}`,
        });
      }
    }

    // Mark invoice as inventory deducted
    await db
      .update(adhocInvoices)
      .set({ inventoryDeducted: true, updatedAt: new Date() })
      .where(eq(adhocInvoices.id, adhocInvoiceId));
  }

  // Payment operations
  async getPayments(studentId?: string): Promise<PaymentWithRelations[]> {
    let query = db
      .select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(students, eq(payments.studentId, students.id));

    if (studentId) {
      query = query.where(eq(payments.studentId, studentId)) as typeof query;
    }

    const results = await query.orderBy(desc(payments.receivedAt));

    return results.map(row => ({
      ...row.payments,
      invoice: row.invoices || null,
      student: row.students!,
    }));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    
    // If payment is linked to an invoice, update invoice status
    if (payment.invoiceId) {
      const invoice = await this.getInvoice(payment.invoiceId);
      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(payment.amount);
        const invoiceAmount = parseFloat(invoice.amount);
        
        let newStatus: "paid" | "partial" = "partial";
        if (totalPaid >= invoiceAmount) {
          newStatus = "paid";
          await this.updateInvoice(payment.invoiceId, { status: newStatus, paidAt: new Date() } as any);
        } else {
          await this.updateInvoice(payment.invoiceId, { status: newStatus } as any);
        }
      }
    }

    return created;
  }

  // Financial ledger operations (Legacy tab)
  async getFinancialLedger(): Promise<{
    moneyIn: Array<{
      id: string;
      type: 'parent_invoice' | 'adhoc_invoice';
      invoiceNumber: string;
      description: string;
      amount: string;
      paidAt: Date;
      studentName?: string;
      parentName?: string;
    }>;
    moneyOut: Array<{
      id: string;
      type: 'tutor_invoice';
      invoiceNumber: string;
      tutorName: string;
      amount: string;
      hoursWorked: string;
      paidAt: Date;
    }>;
    totalIn: number;
    totalOut: number;
    netProfit: number;
  }> {
    // Get all paid parent invoices
    const paidParentInvoices = await db
      .select()
      .from(invoices)
      .leftJoin(students, eq(invoices.studentId, students.id))
      .where(eq(invoices.status, 'paid'))
      .orderBy(desc(invoices.paidAt));

    // Get all paid adhoc invoices
    const paidAdhocInvoices = await db
      .select()
      .from(adhocInvoices)
      .where(eq(adhocInvoices.status, 'paid'))
      .orderBy(desc(adhocInvoices.paidAt));

    // Get all paid tutor invoices
    const paidTutorInvoices = await db
      .select()
      .from(tutorInvoices)
      .leftJoin(users, eq(tutorInvoices.tutorId, users.id))
      .where(eq(tutorInvoices.status, 'paid'))
      .orderBy(desc(tutorInvoices.paidAt));

    // Transform parent invoices
    const moneyInParent = paidParentInvoices.map(row => ({
      id: row.invoices.id,
      type: 'parent_invoice' as const,
      invoiceNumber: row.invoices.invoiceNumber,
      description: `${row.invoices.sessionsIncluded || 0} sessions`,
      amount: row.invoices.amount,
      paidAt: row.invoices.paidAt!,
      studentName: row.students?.name,
    }));

    // Transform adhoc invoices
    const moneyInAdhoc = paidAdhocInvoices.map(inv => ({
      id: inv.id,
      type: 'adhoc_invoice' as const,
      invoiceNumber: inv.invoiceNumber,
      description: inv.reason,
      amount: inv.amount,
      paidAt: inv.paidAt!,
      parentName: `${inv.parentFirstName} ${inv.parentSurname}`,
    }));

    // Combine and sort by date
    const moneyIn = [...moneyInParent, ...moneyInAdhoc].sort((a, b) => 
      new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    );

    // Transform tutor invoices
    const moneyOut = paidTutorInvoices.map(row => ({
      id: row.tutor_invoices.id,
      type: 'tutor_invoice' as const,
      invoiceNumber: row.tutor_invoices.invoiceNumber,
      tutorName: row.users ? `${row.users.firstName} ${row.users.lastName}` : 'Unknown',
      amount: row.tutor_invoices.amount,
      hoursWorked: row.tutor_invoices.hoursWorked,
      paidAt: row.tutor_invoices.paidAt!,
    }));

    // Calculate totals
    const totalIn = moneyIn.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const totalOut = moneyOut.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const netProfit = totalIn - totalOut;

    return { moneyIn, moneyOut, totalIn, totalOut, netProfit };
  }

  // Grouped financial ledger (Legacy tab redesign)
  async getGroupedFinancialLedger(fiscalYear?: number): Promise<{
    parentGroups: Array<{
      parentId: string;
      parentName: string;
      totalBooked: number;
      totalPaid: number;
      invoiceCount: number;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        type: 'parent_invoice' | 'adhoc_invoice';
        amount: string;
        status: string;
        sentAt: Date | null;
        paidAt: Date | null;
        notes: string | null;
        description: string;
        studentName?: string;
      }>;
    }>;
    tutorGroups: Array<{
      tutorId: string;
      tutorName: string;
      totalBooked: number;
      totalPaid: number;
      invoiceCount: number;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        amount: string;
        hoursWorked: string;
        status: string;
        submittedAt: Date | null;
        approvedAt: Date | null;
        paidAt: Date | null;
        notes: string | null;
        weekStart?: Date;
        weekEnd?: Date;
        rejectionReason?: string;
        statusHistory: Array<{
          status: string;
          changedAt: Date;
          changedByName: string;
          notes?: string;
        }>;
      }>;
    }>;
    bookedIn: number;
    paidIn: number;
    bookedOut: number;
    paidOut: number;
    netProfit: number;
    fiscalYearLabel: string;
  }> {
    // Get fiscal year range
    const fyYear = fiscalYear ?? getCurrentFiscalYear();
    const fyRange = getFiscalYearRange(fyYear);

    // Get ALL parent invoices within fiscal year (all statuses for booked, filter for paid)
    const allParentInvoices = await db
      .select()
      .from(invoices)
      .leftJoin(students, eq(invoices.studentId, students.id))
      .leftJoin(users, eq(students.parentUserId, users.id))
      .where(
        and(
          gte(invoices.createdAt, fyRange.startDate),
          lte(invoices.createdAt, fyRange.endDate)
        )
      )
      .orderBy(desc(invoices.createdAt));

    // Get ALL adhoc invoices within fiscal year - join with students and users to get parent info
    const allAdhocInvoices = await db
      .select()
      .from(adhocInvoices)
      .leftJoin(students, eq(adhocInvoices.studentId, students.id))
      .leftJoin(users, eq(adhocInvoices.parentUserId, users.id))
      .where(
        and(
          gte(adhocInvoices.createdAt, fyRange.startDate),
          lte(adhocInvoices.createdAt, fyRange.endDate)
        )
      )
      .orderBy(desc(adhocInvoices.createdAt));

    // Get ALL tutor invoices within fiscal year
    const allTutorInvs = await db
      .select()
      .from(tutorInvoices)
      .leftJoin(users, eq(tutorInvoices.tutorId, users.id))
      .leftJoin(weeklyTimesheets, eq(tutorInvoices.weeklyTimesheetId, weeklyTimesheets.id))
      .where(
        and(
          gte(tutorInvoices.submittedAt, fyRange.startDate),
          lte(tutorInvoices.submittedAt, fyRange.endDate)
        )
      )
      .orderBy(desc(tutorInvoices.submittedAt));

    // Get status history for all weekly timesheets linked to tutor invoices
    const timesheetIds = allTutorInvs
      .filter(row => row.weekly_timesheets?.id)
      .map(row => row.weekly_timesheets!.id);
    
    const statusHistories = timesheetIds.length > 0 
      ? await db
          .select()
          .from(timesheetStatusHistory)
          .leftJoin(users, eq(timesheetStatusHistory.changedBy, users.id))
          .where(inArray(timesheetStatusHistory.weeklyTimesheetId, timesheetIds))
          .orderBy(desc(timesheetStatusHistory.createdAt))
      : [];

    // Group status histories by timesheet ID
    const historyByTimesheet = new Map<string, Array<{
      status: string;
      changedAt: Date;
      changedByName: string;
      notes?: string;
    }>>();
    
    for (const row of statusHistories) {
      const tsId = row.timesheet_status_history.weeklyTimesheetId;
      if (!historyByTimesheet.has(tsId)) {
        historyByTimesheet.set(tsId, []);
      }
      historyByTimesheet.get(tsId)!.push({
        status: row.timesheet_status_history.toStatus,
        changedAt: row.timesheet_status_history.createdAt!,
        changedByName: row.users ? `${row.users.firstName} ${row.users.lastName}` : 'System',
        notes: row.timesheet_status_history.notes || undefined,
      });
    }

    // Group parent invoices by parent
    const parentGroupsMap = new Map<string, {
      parentId: string;
      parentName: string;
      totalBooked: number;
      totalPaid: number;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        type: 'parent_invoice' | 'adhoc_invoice';
        amount: string;
        status: string;
        sentAt: Date | null;
        paidAt: Date | null;
        notes: string | null;
        description: string;
        studentName?: string;
      }>;
    }>();

    // Process parent invoices (from invoices table)
    for (const row of allParentInvoices) {
      const parentId = row.users?.id || row.students?.parentUserId || 'unknown';
      const parentName = row.users 
        ? `${row.users.firstName} ${row.users.lastName}` 
        : 'Unknown Parent';
      
      if (!parentGroupsMap.has(parentId)) {
        parentGroupsMap.set(parentId, {
          parentId,
          parentName,
          totalBooked: 0,
          totalPaid: 0,
          invoices: [],
        });
      }
      
      const group = parentGroupsMap.get(parentId)!;
      const amount = parseFloat(row.invoices.amount);
      group.totalBooked += amount;
      if (row.invoices.status === 'paid') {
        group.totalPaid += amount;
      }
      group.invoices.push({
        id: row.invoices.id,
        invoiceNumber: row.invoices.invoiceNumber,
        type: 'parent_invoice',
        amount: row.invoices.amount,
        status: row.invoices.status,
        sentAt: row.invoices.sentAt,
        paidAt: row.invoices.paidAt,
        notes: row.invoices.notes,
        description: `${row.invoices.sessionsIncluded || 0} sessions`,
        studentName: row.students?.name,
      });
    }

    // Process adhoc invoices - use parentUserId if available, otherwise fall back to name-based key
    for (const row of allAdhocInvoices) {
      const inv = row.adhoc_invoices;
      // If we have a parentUserId and the parent user exists, use their ID as the key
      // Otherwise fall back to name-based grouping
      const parentKey = row.users?.id || row.adhoc_invoices.parentUserId || `adhoc_${inv.parentFirstName}_${inv.parentSurname}`.toLowerCase();
      const parentName = row.users 
        ? `${row.users.firstName} ${row.users.lastName}` 
        : `${inv.parentFirstName} ${inv.parentSurname}`;
      
      if (!parentGroupsMap.has(parentKey)) {
        parentGroupsMap.set(parentKey, {
          parentId: parentKey,
          parentName,
          totalBooked: 0,
          totalPaid: 0,
          invoices: [],
        });
      }
      
      const group = parentGroupsMap.get(parentKey)!;
      const amount = parseFloat((inv as any).totalAmount || inv.amount || '0');
      group.totalBooked += amount;
      if (inv.status === 'paid') {
        group.totalPaid += amount;
      }
      group.invoices.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        type: 'adhoc_invoice',
        amount: (inv as any).totalAmount || inv.amount || '0',
        status: inv.status,
        sentAt: inv.createdAt,
        paidAt: inv.paidAt,
        notes: inv.notes,
        description: inv.reason,
        studentName: row.students?.name,
      });
    }

    // Group tutor invoices by tutor
    const tutorGroupsMap = new Map<string, {
      tutorId: string;
      tutorName: string;
      totalBooked: number;
      totalPaid: number;
      invoices: Array<{
        id: string;
        invoiceNumber: string;
        amount: string;
        hoursWorked: string;
        status: string;
        submittedAt: Date | null;
        approvedAt: Date | null;
        paidAt: Date | null;
        notes: string | null;
        weekStart?: Date;
        weekEnd?: Date;
        rejectionReason?: string;
        statusHistory: Array<{
          status: string;
          changedAt: Date;
          changedByName: string;
          notes?: string;
        }>;
      }>;
    }>();

    for (const row of allTutorInvs) {
      const tutorId = row.tutor_invoices.tutorId;
      const tutorName = row.users 
        ? `${row.users.firstName} ${row.users.lastName}` 
        : 'Unknown Tutor';
      
      if (!tutorGroupsMap.has(tutorId)) {
        tutorGroupsMap.set(tutorId, {
          tutorId,
          tutorName,
          totalBooked: 0,
          totalPaid: 0,
          invoices: [],
        });
      }
      
      const group = tutorGroupsMap.get(tutorId)!;
      const amount = parseFloat(row.tutor_invoices.amount);
      group.totalBooked += amount;
      if (row.tutor_invoices.status === 'paid') {
        group.totalPaid += amount;
      }
      
      // Get status history for this invoice's timesheet
      const timesheetId = row.weekly_timesheets?.id;
      const invoiceStatusHistory = timesheetId 
        ? (historyByTimesheet.get(timesheetId) || [])
        : [];
      
      // Find rejection reason from status history
      const rejectionEntry = invoiceStatusHistory.find(h => h.status === 'rejected');
      
      group.invoices.push({
        id: row.tutor_invoices.id,
        invoiceNumber: row.tutor_invoices.invoiceNumber,
        amount: row.tutor_invoices.amount,
        hoursWorked: row.tutor_invoices.hoursWorked,
        status: row.tutor_invoices.status,
        submittedAt: row.tutor_invoices.submittedAt,
        approvedAt: row.tutor_invoices.approvedAt,
        paidAt: row.tutor_invoices.paidAt,
        notes: row.tutor_invoices.notes,
        weekStart: row.weekly_timesheets?.weekStart,
        weekEnd: row.weekly_timesheets?.weekEnd,
        rejectionReason: rejectionEntry?.notes,
        statusHistory: invoiceStatusHistory,
      });
    }

    // Convert maps to arrays and sort by total booked
    const parentGroups = Array.from(parentGroupsMap.values())
      .map(g => ({ ...g, invoiceCount: g.invoices.length }))
      .sort((a, b) => b.totalBooked - a.totalBooked);

    const tutorGroups = Array.from(tutorGroupsMap.values())
      .map(g => ({ ...g, invoiceCount: g.invoices.length }))
      .sort((a, b) => b.totalBooked - a.totalBooked);

    // Calculate totals
    const bookedIn = parentGroups.reduce((sum, g) => sum + g.totalBooked, 0);
    const paidIn = parentGroups.reduce((sum, g) => sum + g.totalPaid, 0);
    const bookedOut = tutorGroups.reduce((sum, g) => sum + g.totalBooked, 0);
    const paidOut = tutorGroups.reduce((sum, g) => sum + g.totalPaid, 0);
    const netProfit = paidIn - paidOut;

    return { 
      parentGroups, 
      tutorGroups, 
      bookedIn, 
      paidIn, 
      bookedOut, 
      paidOut, 
      netProfit,
      fiscalYearLabel: fyRange.label,
    };
  }

  // Tutor Invoice operations
  async getTutorInvoices(tutorId?: string, weekStart?: Date): Promise<(TutorInvoice & { tutor: User })[]> {
    let baseQuery = db
      .select()
      .from(tutorInvoices)
      .leftJoin(users, eq(tutorInvoices.tutorId, users.id));

    const conditions = [];
    if (tutorId) {
      conditions.push(eq(tutorInvoices.tutorId, tutorId));
    }
    if (weekStart) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      conditions.push(gte(tutorInvoices.submittedAt, weekStart));
      conditions.push(lte(tutorInvoices.submittedAt, weekEnd));
    }

    const results = conditions.length > 0
      ? await baseQuery.where(and(...conditions)).orderBy(desc(tutorInvoices.submittedAt))
      : await baseQuery.orderBy(desc(tutorInvoices.submittedAt));

    return results.map(row => ({
      ...row.tutor_invoices,
      tutor: row.users!,
    }));
  }

  async getTutorInvoicesThisWeek(): Promise<(TutorInvoice & { tutor: User })[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    return this.getTutorInvoices(undefined, weekStart);
  }

  async createTutorInvoice(invoice: InsertTutorInvoice): Promise<TutorInvoice> {
    const [created] = await db.insert(tutorInvoices).values(invoice).returning();
    return created;
  }

  async updateTutorInvoice(id: string, updates: UpdateTutorInvoice): Promise<TutorInvoice> {
    const processedUpdates = { ...updates };
    if (processedUpdates.paidAt && typeof processedUpdates.paidAt === 'string') {
      processedUpdates.paidAt = new Date(processedUpdates.paidAt);
    }
    const [updated] = await db
      .update(tutorInvoices)
      .set({ ...processedUpdates, updatedAt: new Date() })
      .where(eq(tutorInvoices.id, id))
      .returning();
    return updated;
  }

  // Auto-generate parent invoice when sessions remaining hits 0
  // Invoice covers all previously booked sessions (the full package)
  async generateParentInvoiceForSession(studentId: string, timesheetEntryId: string, duration: number, amount: number): Promise<Invoice | null> {
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) return null;

    // Mark any existing outstanding invoices for this student as overdue
    await db
      .update(invoices)
      .set({ status: "overdue", updatedAt: new Date() })
      .where(
        and(
          eq(invoices.studentId, studentId),
          inArray(invoices.status, ["sent", "draft", "partial"])
        )
      );

    // Generate invoice number with student name, date, and unique suffix
    const now = new Date();
    const studentNameSlug = student.name.replace(/\s+/g, '-').toUpperCase().substring(0, 10);
    const uniqueSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    const invoiceNumber = `INV-${studentNameSlug}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${uniqueSuffix}`;
    
    // Get configurable due date days from system settings (default 6 days)
    const dueDateSetting = await this.getSystemSetting('invoice_due_days');
    const dueDays = dueDateSetting ? parseInt(dueDateSetting.value, 10) : 6;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    const rate = parseFloat(student.parentRate);
    
    // Invoice covers all sessions that were booked (the full package)
    const sessionsToInvoice = student.sessionsBooked;
    // Calculate total amount: rate * sessions (assuming 1 hour per session)
    const totalAmount = rate * sessionsToInvoice;

    const [created] = await db.insert(invoices).values({
      invoiceNumber,
      studentId,
      timesheetEntryId, // Link invoice to the session that triggered the invoice
      invoiceType: "auto_sessions",
      sessionsIncluded: sessionsToInvoice, // Invoice for the full booked package
      amount: totalAmount.toFixed(2),
      status: "sent",
      sentAt: now,
      dueDate,
      notes: `Invoice for ${student.name} - ${sessionsToInvoice} sessions at £${rate}/hr. Auto-generated when sessions completed.`,
    }).returning();

    return created;
  }

  // Legacy function kept for manual invoice generation (e.g., package invoices)
  async generateParentInvoiceForStudent(studentId: string, sessions: number): Promise<Invoice | null> {
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student) return null;

    const rate = parseFloat(student.parentRate);
    const amount = rate * sessions * 1; // Assuming 1 hour per session
    
    // Generate invoice number with student name and unique suffix
    const now = new Date();
    const studentNameSlug = student.name.replace(/\s+/g, '-').toUpperCase().substring(0, 10);
    const uniqueSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    const invoiceNumber = `INV-${studentNameSlug}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${uniqueSuffix}`;
    
    // Get configurable due date days from system settings (default 6 days)
    const dueDateSetting = await this.getSystemSetting('invoice_due_days');
    const dueDays = dueDateSetting ? parseInt(dueDateSetting.value, 10) : 6;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    // Check if student has a recurring invoice send date set
    const scheduledSendDate = student.recurringInvoiceSendDate;
    const isScheduled = scheduledSendDate && scheduledSendDate > now;

    const [created] = await db.insert(invoices).values({
      invoiceNumber,
      studentId,
      invoiceType: "auto_sessions",
      sessionsIncluded: sessions,
      amount: amount.toFixed(2),
      status: isScheduled ? "scheduled" : "sent",
      sentAt: isScheduled ? null : now,
      scheduledSendDate: isScheduled ? scheduledSendDate : null,
      dueDate,
      notes: isScheduled 
        ? `Invoice for ${student.name} - ${sessions} session package at £${rate}/hr. Scheduled for ${scheduledSendDate.toLocaleDateString()}.`
        : `Invoice for ${student.name} - ${sessions} session package at £${rate}/hr.`,
    }).returning();

    // Clear the recurring send date after first use so subsequent auto-invoices send immediately
    if (isScheduled) {
      await db.update(students)
        .set({ recurringInvoiceSendDate: null, updatedAt: now })
        .where(eq(students.id, studentId));
      console.log(`[Recurring Invoice] Created scheduled invoice ${invoiceNumber} for ${student.name}, scheduled for ${scheduledSendDate.toLocaleDateString()}`);
    }

    return created;
  }

  // Waitlist operations
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db
      .select()
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt));
  }

  async getWaitlistEntry(id: string): Promise<WaitlistEntry | undefined> {
    const [entry] = await db.select().from(waitlist).where(eq(waitlist.id, id));
    return entry;
  }

  async createWaitlistEntry(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [created] = await db.insert(waitlist).values(entry).returning();
    return created;
  }

  async updateWaitlistEntry(id: string, updates: UpdateWaitlistEntry): Promise<WaitlistEntry> {
    const [updated] = await db
      .update(waitlist)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(waitlist.id, id))
      .returning();
    return updated;
  }

  async deleteWaitlistEntry(id: string): Promise<void> {
    await db.delete(waitlist).where(eq(waitlist.id, id));
  }

  async convertWaitlistToStudent(waitlistId: string, additionalInfo: { parentRate: number } & Partial<InsertStudent>): Promise<{ student: Student; waitlistEntry: WaitlistEntry }> {
    const entry = await this.getWaitlistEntry(waitlistId);
    if (!entry) {
      throw new Error("Waitlist entry not found");
    }

    // Get first subject from subjects array or use legacy subject field
    const subjects = entry.subjects as string[] | null;
    const subjectValue = subjects && subjects.length > 0 ? subjects[0] : (entry.subject || additionalInfo.subject || "TBD");

    // Remove tutorId from additionalInfo to ensure we don't accidentally set it
    const { tutorId: _removedTutorId, tutorRate: _removedTutorRate, ...safeAdditionalInfo } = additionalInfo as any;

    const studentData: InsertStudent = {
      name: entry.studentName,
      parentName: entry.parentName || undefined,
      parentEmail: entry.parentEmail || undefined,
      parentPhone: entry.parentPhone || undefined,
      subject: subjectValue,
      classType: safeAdditionalInfo.classType || "individual",
      parentRate: additionalInfo.parentRate?.toString() || "0",
      tutorRate: "0", // Will be set when tutor is assigned via Allocations
      sessionsBooked: safeAdditionalInfo.sessionsBooked || 0,
      sessionsRemaining: safeAdditionalInfo.sessionsBooked || 0,
      ...safeAdditionalInfo,
    };
    
    // Explicitly set tutorId to null (not included in studentData to avoid foreign key issues with empty string)
    // The tutorId column allows null so we omit it entirely from the insert

    const [student] = await db.insert(students).values(studentData).returning();

    const [updatedEntry] = await db
      .update(waitlist)
      .set({ status: "converted", updatedAt: new Date() })
      .where(eq(waitlist.id, waitlistId))
      .returning();

    return { student, waitlistEntry: updatedEntry };
  }

  // Parent portal operations
  async getStudentsByParentEmail(email: string): Promise<StudentWithTutor[]> {
    // First, find the user ID for this email to also match by parentUserId
    const parentUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    const parentUserId = parentUser[0]?.id;
    
    // Query students matching either parentEmail OR parentUserId
    const whereCondition = parentUserId
      ? and(
          or(eq(students.parentEmail, email), eq(students.parentUserId, parentUserId)),
          eq(students.isActive, true)
        )
      : and(eq(students.parentEmail, email), eq(students.isActive, true));
    
    return await db
      .select()
      .from(students)
      .leftJoin(users, eq(students.tutorId, users.id))
      .where(whereCondition)
      .orderBy(asc(students.name))
      .then(rows =>
        rows.map(row => ({
          ...row.students,
          tutor: row.users!,
        }))
      );
  }

  async getTimesheetEntriesByStudentIds(studentIds: string[]): Promise<TimesheetEntryWithRelations[]> {
    if (studentIds.length === 0) return [];
    
    const rows = await db
      .select()
      .from(timesheetEntries)
      .leftJoin(students, eq(timesheetEntries.studentId, students.id))
      .leftJoin(users, eq(timesheetEntries.tutorId, users.id))
      .where(inArray(timesheetEntries.studentId, studentIds))
      .orderBy(desc(timesheetEntries.date));

    return rows.map(row => ({
      ...row.timesheet_entries,
      student: row.students!,
      tutor: row.users!,
    }));
  }

  async getInvoicesByStudentIds(studentIds: string[]): Promise<Invoice[]> {
    if (studentIds.length === 0) return [];
    
    return await db
      .select()
      .from(invoices)
      .where(inArray(invoices.studentId, studentIds))
      .orderBy(desc(invoices.dueDate), desc(invoices.createdAt));
  }

  async getStudentInvoiceSummaries(): Promise<{ studentId: string; outstandingInvoices: number; paidSessionsDelivered: number; unpaidSessionsDelivered: number; awaitingInvoice: number; hasPendingInvoice: boolean }[]> {
    // Get all active students
    const activeStudents = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.isActive, true));
    
    if (activeStudents.length === 0) return [];
    
    const studentIds = activeStudents.map(s => s.id);
    
    // Get all invoices for these students
    const allInvoices = await db
      .select()
      .from(invoices)
      .where(inArray(invoices.studentId, studentIds))
      .orderBy(desc(invoices.createdAt));
    
    // Get all timesheet entries for these students
    const allEntries = await db
      .select()
      .from(timesheetEntries)
      .where(inArray(timesheetEntries.studentId, studentIds))
      .orderBy(desc(timesheetEntries.date));
    
    // Calculate summaries for each student
    const summaries = studentIds.map(studentId => {
      const studentInvoices = allInvoices.filter(inv => inv.studentId === studentId);
      const studentEntries = allEntries.filter(entry => entry.studentId === studentId);
      
      // Count outstanding (unpaid) invoices - exclude 'paid' and 'cancelled'
      const outstandingInvoices = studentInvoices.filter(inv => 
        inv.status !== 'paid' && inv.status !== 'cancelled'
      ).length;
      
      // Total sessions delivered = all timesheet entries for this student
      const totalSessionsDelivered = studentEntries.length;
      
      // Calculate paid sessions from paid invoices
      const paidInvoices = studentInvoices.filter(inv => inv.status === 'paid');
      const totalPaidSessions = paidInvoices.reduce((sum, inv) => {
        return sum + (inv.sessionsIncluded || 0);
      }, 0);
      
      // Calculate invoiced but unpaid sessions (from outstanding invoices)
      const unpaidInvoices = studentInvoices.filter(inv => 
        inv.status !== 'paid' && inv.status !== 'cancelled'
      );
      const invoicedButUnpaidSessions = unpaidInvoices.reduce((sum, inv) => {
        return sum + (inv.sessionsIncluded || 0);
      }, 0);
      
      // Calculate total invoiced sessions (paid + unpaid invoices)
      const totalInvoicedSessions = totalPaidSessions + invoicedButUnpaidSessions;
      
      // Sessions awaiting invoice = delivered but not yet invoiced
      const awaitingInvoice = Math.max(0, totalSessionsDelivered - totalInvoicedSessions);
      
      // Paid sessions = min(sessions from paid invoices, total delivered)
      const paidSessionsDelivered = Math.min(totalPaidSessions, totalSessionsDelivered);
      
      // Unpaid sessions = sessions that have been invoiced but invoice not paid
      const unpaidSessionsDelivered = Math.min(invoicedButUnpaidSessions, totalSessionsDelivered - paidSessionsDelivered);
      
      // Check if there's a pending/sent invoice (not paid, not cancelled)
      const hasPendingInvoice = studentInvoices.some(inv => 
        inv.status === 'sent' || inv.status === 'pending' || inv.status === 'overdue'
      );
      
      return { studentId, outstandingInvoices, paidSessionsDelivered, unpaidSessionsDelivered, awaitingInvoice, hasPendingInvoice };
    });
    
    return summaries;
  }

  async getPaymentsByStudentIds(studentIds: string[]): Promise<Payment[]> {
    if (studentIds.length === 0) return [];
    
    return await db
      .select()
      .from(payments)
      .where(inArray(payments.studentId, studentIds))
      .orderBy(desc(payments.receivedAt));
  }

  // Parent message operations
  async getParentMessages(recipientType?: "tutor" | "admin", tutorId?: string): Promise<ParentMessageWithRelations[]> {
    const rows = await db
      .select()
      .from(parentMessages)
      .leftJoin(students, eq(parentMessages.studentId, students.id))
      .leftJoin(users, eq(parentMessages.readByTutorId, users.id))
      .orderBy(desc(parentMessages.createdAt));

    let result = rows.map(row => ({
      ...row.parent_messages,
      student: row.students!,
      readByTutor: row.users || null,
    }));

    if (recipientType === "admin") {
      return result;
    } else if (recipientType === "tutor" && tutorId) {
      return result.filter(msg => 
        msg.recipientType === "tutor" && msg.student.tutorId === tutorId
      );
    }

    return result;
  }

  async getParentMessagesByParentEmail(email: string): Promise<ParentMessageWithRelations[]> {
    const rows = await db
      .select()
      .from(parentMessages)
      .leftJoin(students, eq(parentMessages.studentId, students.id))
      .leftJoin(users, eq(parentMessages.readByTutorId, users.id))
      .where(eq(parentMessages.senderEmail, email))
      .orderBy(desc(parentMessages.createdAt));

    return rows.map(row => ({
      ...row.parent_messages,
      student: row.students!,
      readByTutor: row.users || null,
    }));
  }

  async createParentMessage(message: InsertParentMessage): Promise<ParentMessage> {
    const [created] = await db.insert(parentMessages).values(message).returning();
    return created;
  }

  async markParentMessageRead(id: string, tutorId?: string): Promise<ParentMessage> {
    const updateData: { isRead: boolean; readAt: Date; readByTutorId?: string } = { 
      isRead: true, 
      readAt: new Date(),
    };
    if (tutorId) {
      updateData.readByTutorId = tutorId;
    }
    const [updated] = await db
      .update(parentMessages)
      .set(updateData)
      .where(eq(parentMessages.id, id))
      .returning();
    return updated;
  }

  async getParentMessage(id: string): Promise<ParentMessageWithRelations | undefined> {
    const [row] = await db
      .select()
      .from(parentMessages)
      .leftJoin(students, eq(parentMessages.studentId, students.id))
      .leftJoin(users, eq(parentMessages.readByTutorId, users.id))
      .where(eq(parentMessages.id, id));

    if (!row) return undefined;

    const replies = await this.getParentMessageReplies(id);

    return {
      ...row.parent_messages,
      student: row.students!,
      replies,
      readByTutor: row.users || null,
    };
  }

  async createParentMessageReply(reply: InsertParentMessageReply): Promise<ParentMessageReply> {
    const [created] = await db.insert(parentMessageReplies).values(reply).returning();
    return created;
  }

  async getParentMessageReplies(messageId: string): Promise<ParentMessageReplyWithRelations[]> {
    const rows = await db
      .select()
      .from(parentMessageReplies)
      .leftJoin(users, eq(parentMessageReplies.repliedById, users.id))
      .where(eq(parentMessageReplies.messageId, messageId))
      .orderBy(asc(parentMessageReplies.createdAt));

    return rows.map(row => ({
      ...row.parent_message_replies,
      repliedBy: row.users!,
    }));
  }

  // Student topics operations
  async getStudentTopics(studentId: string): Promise<StudentTopic[]> {
    return await db
      .select()
      .from(studentTopics)
      .where(eq(studentTopics.studentId, studentId))
      .orderBy(asc(studentTopics.orderIndex), asc(studentTopics.title));
  }

  async replaceStudentTopics(studentId: string, topics: InsertStudentTopic[]): Promise<StudentTopic[]> {
    await db.delete(studentTopics).where(eq(studentTopics.studentId, studentId));
    
    if (topics.length === 0) {
      return [];
    }
    
    const topicsWithOrder = topics.map((topic, index) => ({
      ...topic,
      studentId,
      orderIndex: topic.orderIndex ?? index,
    }));
    
    return await db.insert(studentTopics).values(topicsWithOrder).returning();
  }

  async addStudentTopics(studentId: string, topics: InsertStudentTopic[]): Promise<StudentTopic[]> {
    if (topics.length === 0) {
      return [];
    }
    
    // Get the current max orderIndex for this student
    const existingTopics = await this.getStudentTopics(studentId);
    const maxOrderIndex = existingTopics.length > 0 
      ? Math.max(...existingTopics.map(t => t.orderIndex)) 
      : -1;
    
    // Add new topics with order indices starting after existing ones
    const topicsWithOrder = topics.map((topic, index) => ({
      ...topic,
      studentId,
      orderIndex: maxOrderIndex + 1 + index,
    }));
    
    return await db.insert(studentTopics).values(topicsWithOrder).returning();
  }

  async updateStudentTopic(id: string, updates: UpdateStudentTopic): Promise<StudentTopic> {
    const [updated] = await db
      .update(studentTopics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentTopics.id, id))
      .returning();
    return updated;
  }

  async markStudentTopicCovered(topicId: string, tutorId: string, isCovered: boolean, coveredAt?: Date): Promise<StudentTopic> {
    const [updated] = await db
      .update(studentTopics)
      .set({
        isCovered,
        coveredAt: isCovered ? (coveredAt || new Date()) : null,
        coveredById: isCovered ? tutorId : null,
        updatedAt: new Date(),
      })
      .where(eq(studentTopics.id, topicId))
      .returning();
    return updated;
  }

  // Rate configuration operations
  async getRateConfigurations(): Promise<RateConfiguration[]> {
    return await db
      .select()
      .from(rateConfigurations)
      .orderBy(asc(rateConfigurations.name));
  }

  async getRateConfiguration(id: string): Promise<RateConfiguration | undefined> {
    const [rate] = await db
      .select()
      .from(rateConfigurations)
      .where(eq(rateConfigurations.id, id));
    return rate;
  }

  async createRateConfiguration(rate: InsertRateConfiguration): Promise<RateConfiguration> {
    const [created] = await db
      .insert(rateConfigurations)
      .values(rate)
      .returning();
    return created;
  }

  async updateRateConfiguration(id: string, updates: UpdateRateConfiguration): Promise<RateConfiguration> {
    const [updated] = await db
      .update(rateConfigurations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(rateConfigurations.id, id))
      .returning();
    return updated;
  }

  async deleteRateConfiguration(id: string): Promise<void> {
    await db
      .delete(rateConfigurations)
      .where(eq(rateConfigurations.id, id));
  }

  // Tutor rate operations (independent)
  async getTutorRates(): Promise<TutorRate[]> {
    return await db
      .select()
      .from(tutorRates)
      .orderBy(asc(tutorRates.name));
  }

  async getTutorRate(id: string): Promise<TutorRate | undefined> {
    const [rate] = await db
      .select()
      .from(tutorRates)
      .where(eq(tutorRates.id, id));
    return rate;
  }

  async createTutorRate(rate: InsertTutorRate): Promise<TutorRate> {
    const [created] = await db
      .insert(tutorRates)
      .values(rate)
      .returning();
    return created;
  }

  async updateTutorRate(id: string, updates: UpdateTutorRate): Promise<TutorRate> {
    const [updated] = await db
      .update(tutorRates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(tutorRates.id, id))
      .returning();
    return updated;
  }

  async deleteTutorRate(id: string): Promise<void> {
    await db
      .delete(tutorRates)
      .where(eq(tutorRates.id, id));
  }

  // Parent rate operations (independent)
  async getParentRates(): Promise<ParentRate[]> {
    return await db
      .select()
      .from(parentRates)
      .orderBy(asc(parentRates.name));
  }

  async getParentRate(id: string): Promise<ParentRate | undefined> {
    const [rate] = await db
      .select()
      .from(parentRates)
      .where(eq(parentRates.id, id));
    return rate;
  }

  async createParentRate(rate: InsertParentRate): Promise<ParentRate> {
    const [created] = await db
      .insert(parentRates)
      .values(rate)
      .returning();
    return created;
  }

  async updateParentRate(id: string, updates: UpdateParentRate): Promise<ParentRate> {
    const [updated] = await db
      .update(parentRates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(parentRates.id, id))
      .returning();
    return updated;
  }

  async deleteParentRate(id: string): Promise<void> {
    await db
      .delete(parentRates)
      .where(eq(parentRates.id, id));
  }

  // Rate link operations (for profit analysis)
  async getRateLinks(): Promise<(RateLink & { tutorRate: TutorRate; parentRate: ParentRate })[]> {
    const results = await db
      .select()
      .from(rateLinks)
      .innerJoin(tutorRates, eq(rateLinks.tutorRateId, tutorRates.id))
      .innerJoin(parentRates, eq(rateLinks.parentRateId, parentRates.id));
    
    return results.map(r => ({
      ...r.rate_links,
      tutorRate: r.tutor_rates,
      parentRate: r.parent_rates,
    }));
  }

  async createRateLink(link: InsertRateLink): Promise<RateLink> {
    const [created] = await db
      .insert(rateLinks)
      .values(link)
      .returning();
    return created;
  }

  async deleteRateLink(id: string): Promise<void> {
    await db
      .delete(rateLinks)
      .where(eq(rateLinks.id, id));
  }

  async deleteLinkByTutorRateId(tutorRateId: string): Promise<void> {
    await db
      .delete(rateLinks)
      .where(eq(rateLinks.tutorRateId, tutorRateId));
  }

  async deleteLinkByParentRateId(parentRateId: string): Promise<void> {
    await db
      .delete(rateLinks)
      .where(eq(rateLinks.parentRateId, parentRateId));
  }

  // Tutor group operations
  async getTutorGroups(): Promise<TutorGroupWithMembers[]> {
    const groups = await db.select().from(tutorGroups).orderBy(asc(tutorGroups.name));
    
    const result: TutorGroupWithMembers[] = [];
    for (const group of groups) {
      const members = await db
        .select()
        .from(tutorGroupMembers)
        .innerJoin(users, eq(tutorGroupMembers.tutorId, users.id))
        .where(eq(tutorGroupMembers.groupId, group.id));
      
      result.push({
        ...group,
        members: members.map(m => ({
          ...m.tutor_group_members,
          tutor: m.users,
        })),
      });
    }
    
    return result;
  }

  async getTutorGroup(id: string): Promise<TutorGroupWithMembers | undefined> {
    const [group] = await db.select().from(tutorGroups).where(eq(tutorGroups.id, id));
    if (!group) return undefined;
    
    const members = await db
      .select()
      .from(tutorGroupMembers)
      .innerJoin(users, eq(tutorGroupMembers.tutorId, users.id))
      .where(eq(tutorGroupMembers.groupId, group.id));
    
    return {
      ...group,
      members: members.map(m => ({
        ...m.tutor_group_members,
        tutor: m.users,
      })),
    };
  }

  async createTutorGroup(group: InsertTutorGroup, tutorIds: string[]): Promise<TutorGroupWithMembers> {
    const [created] = await db.insert(tutorGroups).values(group).returning();
    
    if (tutorIds.length > 0) {
      await db.insert(tutorGroupMembers).values(
        tutorIds.map(tutorId => ({
          groupId: created.id,
          tutorId,
        }))
      );
    }
    
    return this.getTutorGroup(created.id) as Promise<TutorGroupWithMembers>;
  }

  async updateTutorGroup(id: string, updates: UpdateTutorGroup, tutorIds?: string[]): Promise<TutorGroupWithMembers> {
    await db
      .update(tutorGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tutorGroups.id, id));
    
    if (tutorIds !== undefined) {
      await db.delete(tutorGroupMembers).where(eq(tutorGroupMembers.groupId, id));
      if (tutorIds.length > 0) {
        await db.insert(tutorGroupMembers).values(
          tutorIds.map(tutorId => ({
            groupId: id,
            tutorId,
          }))
        );
      }
    }
    
    return this.getTutorGroup(id) as Promise<TutorGroupWithMembers>;
  }

  async deleteTutorGroup(id: string): Promise<void> {
    await db.delete(tutorGroups).where(eq(tutorGroups.id, id));
  }

  // Tutor rate to tutors operations
  async getTutorRateTutors(tutorRateId: string): Promise<TutorRateTutor[]> {
    return await db
      .select()
      .from(tutorRateTutors)
      .where(eq(tutorRateTutors.tutorRateId, tutorRateId));
  }

  async setTutorRateTutors(tutorRateId: string, tutorIds: string[]): Promise<void> {
    await db.delete(tutorRateTutors).where(eq(tutorRateTutors.tutorRateId, tutorRateId));
    if (tutorIds.length > 0) {
      await db.insert(tutorRateTutors).values(
        tutorIds.map(tutorId => ({
          tutorRateId,
          tutorId,
        }))
      );
    }
  }

  // Tutor rate to tutor groups operations
  async getTutorRateTutorGroups(tutorRateId: string): Promise<TutorRateTutorGroup[]> {
    return await db
      .select()
      .from(tutorRateTutorGroups)
      .where(eq(tutorRateTutorGroups.tutorRateId, tutorRateId));
  }

  async setTutorRateTutorGroups(tutorRateId: string, tutorGroupIds: string[]): Promise<void> {
    await db.delete(tutorRateTutorGroups).where(eq(tutorRateTutorGroups.tutorRateId, tutorRateId));
    if (tutorGroupIds.length > 0) {
      await db.insert(tutorRateTutorGroups).values(
        tutorGroupIds.map(tutorGroupId => ({
          tutorRateId,
          tutorGroupId,
        }))
      );
    }
  }

  // System settings operations
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }

  async getSystemSettings(): Promise<SystemSetting[]> {
    return await db.select().from(systemSettings).orderBy(asc(systemSettings.key));
  }

  async upsertSystemSetting(key: string, value: string, description?: string): Promise<SystemSetting> {
    const [setting] = await db
      .insert(systemSettings)
      .values({ key, value, description })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, description, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }

  // Check all invoices and mark as overdue if past due date
  async markOverdueInvoices(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(invoices)
      .set({ status: "overdue", updatedAt: now })
      .where(
        and(
          inArray(invoices.status, ["sent", "draft", "partial"]),
          lte(invoices.dueDate, now)
        )
      )
      .returning();
    return result.length;
  }

  // Password authentication operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(userData: { email: string; passwordHash: string; firstName: string; lastName: string; role: string; description?: string | null; startYear?: number | null; phone?: string | null; emergencyContactName?: string | null; emergencyContactPhone?: string | null }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as "admin" | "tutor" | "additional_staff" | "parent",
        description: userData.description || null,
        startYear: userData.startYear || null,
        phone: userData.phone || null,
        emergencyContactName: userData.emergencyContactName || null,
        emergencyContactPhone: userData.emergencyContactPhone || null,
      })
      .returning();
    return user;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Student group operations
  async getStudentGroups(tutorId?: string): Promise<StudentGroupWithMembers[]> {
    const condition = tutorId ? eq(studentGroups.tutorId, tutorId) : undefined;
    const groups = await db
      .select()
      .from(studentGroups)
      .leftJoin(users, eq(studentGroups.tutorId, users.id))
      .where(condition ? and(condition, eq(studentGroups.isActive, true)) : eq(studentGroups.isActive, true))
      .orderBy(asc(studentGroups.name));

    const result: StudentGroupWithMembers[] = [];
    for (const row of groups) {
      if (!row.student_groups || !row.users) continue;
      
      const members = await db
        .select()
        .from(studentGroupMembers)
        .leftJoin(students, eq(studentGroupMembers.studentId, students.id))
        .where(eq(studentGroupMembers.groupId, row.student_groups.id));

      result.push({
        ...row.student_groups,
        tutor: row.users,
        members: members
          .filter(m => m.students)
          .map(m => ({
            ...m.student_group_members,
            student: m.students!,
          })),
      });
    }
    return result;
  }

  async getStudentGroup(id: string): Promise<StudentGroupWithMembers | undefined> {
    const [row] = await db
      .select()
      .from(studentGroups)
      .leftJoin(users, eq(studentGroups.tutorId, users.id))
      .where(eq(studentGroups.id, id));

    if (!row?.student_groups || !row?.users) return undefined;

    const members = await db
      .select()
      .from(studentGroupMembers)
      .leftJoin(students, eq(studentGroupMembers.studentId, students.id))
      .where(eq(studentGroupMembers.groupId, id));

    return {
      ...row.student_groups,
      tutor: row.users,
      members: members
        .filter(m => m.students)
        .map(m => ({
          ...m.student_group_members,
          student: m.students!,
        })),
    };
  }

  async createStudentGroup(group: InsertStudentGroup, studentIds: string[]): Promise<StudentGroupWithMembers> {
    const [newGroup] = await db.insert(studentGroups).values(group).returning();
    
    // Add members
    if (studentIds.length > 0) {
      await db.insert(studentGroupMembers).values(
        studentIds.map(studentId => ({
          groupId: newGroup.id,
          studentId,
        }))
      );
    }

    const result = await this.getStudentGroup(newGroup.id);
    return result!;
  }

  async updateStudentGroup(id: string, updates: UpdateStudentGroup, studentIds?: string[]): Promise<StudentGroupWithMembers> {
    await db
      .update(studentGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studentGroups.id, id));

    // Update members if provided
    if (studentIds !== undefined) {
      // Remove existing members
      await db.delete(studentGroupMembers).where(eq(studentGroupMembers.groupId, id));
      
      // Add new members
      if (studentIds.length > 0) {
        await db.insert(studentGroupMembers).values(
          studentIds.map(studentId => ({
            groupId: id,
            studentId,
          }))
        );
      }
    }

    const result = await this.getStudentGroup(id);
    return result!;
  }

  async deleteStudentGroup(id: string): Promise<void> {
    // Soft delete by setting isActive to false
    await db
      .update(studentGroups)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(studentGroups.id, id));
  }

  async getStudentGroupsByTutor(tutorId: string): Promise<StudentGroupWithMembers[]> {
    return this.getStudentGroups(tutorId);
  }

  // Group session operations
  async getGroupSessions(tutorId?: string): Promise<GroupSessionWithDetails[]> {
    const condition = tutorId ? eq(groupSessions.tutorId, tutorId) : undefined;
    const sessions = await db
      .select()
      .from(groupSessions)
      .leftJoin(studentGroups, eq(groupSessions.groupId, studentGroups.id))
      .leftJoin(users, eq(groupSessions.tutorId, users.id))
      .where(condition)
      .orderBy(desc(groupSessions.sessionDate));

    const result: GroupSessionWithDetails[] = [];
    for (const row of sessions) {
      if (!row.group_sessions || !row.student_groups || !row.users) continue;

      // Get group members
      const members = await db
        .select()
        .from(studentGroupMembers)
        .leftJoin(students, eq(studentGroupMembers.studentId, students.id))
        .where(eq(studentGroupMembers.groupId, row.student_groups.id));

      const membersList: StudentGroupMemberWithStudent[] = members
        .filter(m => m.student_group_members && m.students)
        .map(m => ({
          ...m.student_group_members!,
          student: m.students!,
        }));

      // Get attendance records
      const attendanceRecords = await db
        .select()
        .from(groupSessionAttendance)
        .leftJoin(students, eq(groupSessionAttendance.studentId, students.id))
        .where(eq(groupSessionAttendance.groupSessionId, row.group_sessions.id));

      const attendanceList: GroupSessionAttendanceWithStudent[] = attendanceRecords
        .filter(a => a.group_session_attendance && a.students)
        .map(a => ({
          ...a.group_session_attendance!,
          student: a.students!,
        }));

      result.push({
        ...row.group_sessions,
        group: {
          ...row.student_groups,
          tutor: row.users,
          members: membersList,
        },
        tutor: row.users,
        attendance: attendanceList,
      });
    }

    return result;
  }

  async getGroupSession(id: string): Promise<GroupSessionWithDetails | undefined> {
    const [row] = await db
      .select()
      .from(groupSessions)
      .leftJoin(studentGroups, eq(groupSessions.groupId, studentGroups.id))
      .leftJoin(users, eq(groupSessions.tutorId, users.id))
      .where(eq(groupSessions.id, id));

    if (!row?.group_sessions || !row?.student_groups || !row?.users) return undefined;

    // Get group members
    const members = await db
      .select()
      .from(studentGroupMembers)
      .leftJoin(students, eq(studentGroupMembers.studentId, students.id))
      .where(eq(studentGroupMembers.groupId, row.student_groups.id));

    const membersList: StudentGroupMemberWithStudent[] = members
      .filter(m => m.student_group_members && m.students)
      .map(m => ({
        ...m.student_group_members!,
        student: m.students!,
      }));

    // Get attendance records
    const attendanceRecords = await db
      .select()
      .from(groupSessionAttendance)
      .leftJoin(students, eq(groupSessionAttendance.studentId, students.id))
      .where(eq(groupSessionAttendance.groupSessionId, row.group_sessions.id));

    const attendanceList: GroupSessionAttendanceWithStudent[] = attendanceRecords
      .filter(a => a.group_session_attendance && a.students)
      .map(a => ({
        ...a.group_session_attendance!,
        student: a.students!,
      }));

    return {
      ...row.group_sessions,
      group: {
        ...row.student_groups,
        tutor: row.users,
        members: membersList,
      },
      tutor: row.users,
      attendance: attendanceList,
    };
  }

  async createGroupSession(
    session: InsertGroupSession, 
    attendance: { studentId: string; present: boolean; chargeType: 'charge' | 'deduct' | 'no_change'; notes?: string }[],
    sessionSubject?: string,
    topicIds?: string[],
    otherTopicsText?: string
  ): Promise<GroupSessionWithDetails> {
    // Create the group session
    const [newSession] = await db.insert(groupSessions).values(session).returning();

    // Get or create the weekly timesheet for this session's week
    const sessionDate = new Date(session.sessionDate);
    const dayOfWeek = sessionDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(sessionDate);
    weekStart.setDate(sessionDate.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const currentWeeklyTimesheet = await this.getOrCreateWeeklyTimesheet(session.tutorId, weekStart, weekEnd);

    // Create attendance records, update student sessions, and create timesheet entries for ALL students
    for (const att of attendance) {
      await db.insert(groupSessionAttendance).values({
        groupSessionId: newSession.id,
        studentId: att.studentId,
        present: att.present,
        chargeType: att.chargeType,
        notes: att.notes,
      });

      // Update student session counts only for charged students
      if (att.chargeType === 'charge' || att.chargeType === 'deduct') {
        const [student] = await db.select().from(students).where(eq(students.id, att.studentId));
        if (student) {
          const newRemaining = Math.max(0, (student.sessionsRemaining || 0) - 1);
          await db.update(students)
            .set({ sessionsRemaining: newRemaining, updatedAt: new Date() })
            .where(eq(students.id, att.studentId));
        }
      }
      
      // Create timesheet entry for ALL students (present or absent) for attendance tracking
      const entryNotes = att.present 
        ? `Group session - Present${att.notes ? `: ${att.notes}` : ''}` 
        : `Group session - Absent${att.notes ? `: ${att.notes}` : ''}`;
      
      // Calculate billing amounts based on allocation rates (preferred) or student rates (only for charged entries)
      const [studentData] = await db.select().from(students).where(eq(students.id, att.studentId));
      const duration = parseFloat(session.duration.toString());
      const shouldCharge = att.chargeType === 'charge' || att.chargeType === 'deduct';
      
      let tutorEarnings = '0';
      let parentBilling = '0';
      
      if (shouldCharge && studentData) {
        // Look up rates from student-tutor allocation first (preferred), then fall back to student record
        const allocation = await db
          .select()
          .from(studentTutors)
          .where(
            and(
              eq(studentTutors.studentId, att.studentId),
              eq(studentTutors.tutorId, session.tutorId),
              eq(studentTutors.isActive, true)
            )
          )
          .limit(1);
        
        let baseTutorRate = 0;
        let baseParentRate = 0;
        
        if (allocation.length > 0 && allocation[0].tutorRate) {
          baseTutorRate = parseFloat(allocation[0].tutorRate.toString());
          baseParentRate = allocation[0].parentRate ? parseFloat(allocation[0].parentRate.toString()) : parseFloat(studentData.parentRate?.toString() || '0');
        } else {
          // Fall back to student record rates
          baseTutorRate = parseFloat(studentData.tutorRate?.toString() || '0');
          baseParentRate = parseFloat(studentData.parentRate?.toString() || '0');
        }
        
        tutorEarnings = (baseTutorRate * duration).toString();
        parentBilling = (baseParentRate * duration).toString();
      }
      
      const [timesheetEntry] = await db.insert(timesheetEntries).values({
        tutorId: session.tutorId,
        studentId: att.studentId,
        date: session.sessionDate,
        duration: session.duration,
        notes: entryNotes,
        status: 'pending',
        sessionType: 'group',
        groupSessionId: newSession.id,
        sessionSubject: sessionSubject,
        otherTopicsText: otherTopicsText,
        tutorEarnings: tutorEarnings,
        parentCharge: parentBilling,
        parentBilling: parentBilling,
        weeklyTimesheetId: currentWeeklyTimesheet.id,
      }).returning();
      
      // Save topics if provided
      if (topicIds && topicIds.length > 0 && sessionSubject !== 'Other') {
        await this.setSessionTopicsCovered(timesheetEntry.id, topicIds);
      }
    }

    // Notify admin about the group session
    const group = await this.getStudentGroup(session.groupId);
    if (group) {
      const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
      for (const admin of adminUsers) {
        await this.createNotification({
          userId: admin.id,
          type: 'group_session_logged',
          title: 'Group Session Logged',
          message: `A group session for "${group.name}" has been logged with ${attendance.length} students.`,
          relatedId: newSession.id,
          relatedType: 'group_session',
        });
      }
    }

    const result = await this.getGroupSession(newSession.id);
    return result!;
  }

  async updateGroupSessionAttendance(
    groupSessionId: string, 
    attendance: { studentId: string; present: boolean; chargeType: 'charge' | 'deduct' | 'no_change'; notes?: string }[]
  ): Promise<GroupSessionWithDetails> {
    // Delete existing attendance records
    await db.delete(groupSessionAttendance).where(eq(groupSessionAttendance.groupSessionId, groupSessionId));

    // Create new attendance records
    for (const att of attendance) {
      await db.insert(groupSessionAttendance).values({
        groupSessionId,
        studentId: att.studentId,
        present: att.present,
        chargeType: att.chargeType,
        notes: att.notes,
      });
    }

    const result = await this.getGroupSession(groupSessionId);
    return result!;
  }

  async deleteGroupSession(id: string): Promise<void> {
    await db.delete(groupSessions).where(eq(groupSessions.id, id));
  }

  async deleteGroupSessionCascade(id: string): Promise<void> {
    // Get attendance records to restore student credits
    const attendanceRecords = await db
      .select()
      .from(groupSessionAttendance)
      .where(eq(groupSessionAttendance.groupSessionId, id));

    // Get all timesheet entries for this group session
    const relatedEntries = await db
      .select()
      .from(timesheetEntries)
      .where(eq(timesheetEntries.groupSessionId, id));

    // Delete session topics covered for each entry
    for (const entry of relatedEntries) {
      await db.delete(sessionTopicsCovered).where(eq(sessionTopicsCovered.timesheetEntryId, entry.id));
    }

    // Restore student session credits for charged attendance
    for (const att of attendanceRecords) {
      if (att.chargeType === 'charge' || att.chargeType === 'deduct') {
        const [student] = await db.select().from(students).where(eq(students.id, att.studentId));
        if (student) {
          await db.update(students)
            .set({ 
              sessionsRemaining: (student.sessionsRemaining || 0) + 1, 
              updatedAt: new Date() 
            })
            .where(eq(students.id, att.studentId));
        }
      }
    }

    // Delete timesheet entries
    await db.delete(timesheetEntries).where(eq(timesheetEntries.groupSessionId, id));

    // Delete attendance records
    await db.delete(groupSessionAttendance).where(eq(groupSessionAttendance.groupSessionId, id));

    // Delete the group session itself
    await db.delete(groupSessions).where(eq(groupSessions.id, id));
  }

  // Curriculum topics operations
  async getCurriculumTopics(subject?: string): Promise<CurriculumTopicWithSubtopics[]> {
    // Get all main topics (parentId is null)
    const condition = subject 
      ? and(sql`${curriculumTopics.parentId} IS NULL`, eq(curriculumTopics.subject, subject), eq(curriculumTopics.isActive, true))
      : and(sql`${curriculumTopics.parentId} IS NULL`, eq(curriculumTopics.isActive, true));
    
    const mainTopics = await db
      .select()
      .from(curriculumTopics)
      .where(condition)
      .orderBy(asc(curriculumTopics.sortOrder), asc(curriculumTopics.name));
    
    // Get all subtopics
    const allSubtopics = await db
      .select()
      .from(curriculumTopics)
      .where(and(sql`${curriculumTopics.parentId} IS NOT NULL`, eq(curriculumTopics.isActive, true)))
      .orderBy(asc(curriculumTopics.sortOrder), asc(curriculumTopics.name));
    
    // Group subtopics by parent
    const subtopicsByParent = allSubtopics.reduce((acc, topic) => {
      const parentId = topic.parentId!;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(topic);
      return acc;
    }, {} as Record<string, CurriculumTopic[]>);
    
    return mainTopics.map(topic => ({
      ...topic,
      subtopics: subtopicsByParent[topic.id] || [],
    }));
  }

  async getCurriculumTopic(id: string): Promise<CurriculumTopic | undefined> {
    const [topic] = await db
      .select()
      .from(curriculumTopics)
      .where(eq(curriculumTopics.id, id));
    return topic;
  }

  async createCurriculumTopic(topic: InsertCurriculumTopic): Promise<CurriculumTopic> {
    const [created] = await db
      .insert(curriculumTopics)
      .values(topic)
      .returning();
    return created;
  }

  async updateCurriculumTopic(id: string, updates: UpdateCurriculumTopic): Promise<CurriculumTopic> {
    const [updated] = await db
      .update(curriculumTopics)
      .set(updates)
      .where(eq(curriculumTopics.id, id))
      .returning();
    return updated;
  }

  async deleteCurriculumTopic(id: string): Promise<void> {
    // Soft delete
    await db
      .update(curriculumTopics)
      .set({ isActive: false })
      .where(eq(curriculumTopics.id, id));
  }

  // Session topics covered operations
  async getSessionTopicsCovered(timesheetEntryId: string): Promise<CurriculumTopic[]> {
    const results = await db
      .select({ topic: curriculumTopics })
      .from(sessionTopicsCovered)
      .innerJoin(curriculumTopics, eq(sessionTopicsCovered.topicId, curriculumTopics.id))
      .where(eq(sessionTopicsCovered.timesheetEntryId, timesheetEntryId));
    
    return results.map(r => r.topic);
  }

  async setSessionTopicsCovered(timesheetEntryId: string, topicIds: string[]): Promise<void> {
    // Delete existing topics for this entry
    await db
      .delete(sessionTopicsCovered)
      .where(eq(sessionTopicsCovered.timesheetEntryId, timesheetEntryId));
    
    // Insert new topics
    if (topicIds.length > 0) {
      await db
        .insert(sessionTopicsCovered)
        .values(topicIds.map(topicId => ({
          timesheetEntryId,
          topicId,
        })));
    }
  }

  // Work types operations
  async getWorkTypes(includeInactive?: boolean): Promise<WorkType[]> {
    const query = includeInactive
      ? db.select().from(workTypes).orderBy(asc(workTypes.sortOrder), asc(workTypes.name))
      : db.select().from(workTypes).where(eq(workTypes.isActive, true)).orderBy(asc(workTypes.sortOrder), asc(workTypes.name));
    
    return await query;
  }

  async getWorkType(id: string): Promise<WorkType | undefined> {
    const result = await db
      .select()
      .from(workTypes)
      .where(eq(workTypes.id, id))
      .limit(1);
    
    return result[0];
  }

  async createWorkType(workType: InsertWorkType): Promise<WorkType> {
    const result = await db
      .insert(workTypes)
      .values(workType)
      .returning();
    
    return result[0];
  }

  async updateWorkType(id: string, updates: UpdateWorkType): Promise<WorkType> {
    const result = await db
      .update(workTypes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workTypes.id, id))
      .returning();
    
    return result[0];
  }

  async deleteWorkType(id: string): Promise<void> {
    await db.delete(workTypes).where(eq(workTypes.id, id));
  }

  // Recurring session template operations
  async getRecurringSessionTemplates(tutorId?: string, studentId?: string, groupId?: string): Promise<(RecurringSessionTemplate & { student?: Student; tutor?: User; group?: StudentGroup })[]> {
    let conditions: any[] = [];
    
    if (tutorId) {
      conditions.push(eq(recurringSessionTemplates.tutorId, tutorId));
    }
    if (studentId) {
      conditions.push(eq(recurringSessionTemplates.studentId, studentId));
    }
    if (groupId) {
      conditions.push(eq(recurringSessionTemplates.groupId, groupId));
    }
    
    const query = db
      .select()
      .from(recurringSessionTemplates)
      .leftJoin(students, eq(recurringSessionTemplates.studentId, students.id))
      .leftJoin(users, eq(recurringSessionTemplates.tutorId, users.id))
      .leftJoin(studentGroups, eq(recurringSessionTemplates.groupId, studentGroups.id));
    
    const results = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;
    
    return results.map(row => ({
      ...row.recurring_session_templates,
      student: row.students || undefined,
      tutor: row.users || undefined,
      group: row.student_groups || undefined,
    }));
  }

  async getRecurringSessionTemplate(id: string): Promise<(RecurringSessionTemplate & { student?: Student; tutor?: User }) | undefined> {
    const results = await db
      .select()
      .from(recurringSessionTemplates)
      .leftJoin(students, eq(recurringSessionTemplates.studentId, students.id))
      .leftJoin(users, eq(recurringSessionTemplates.tutorId, users.id))
      .where(eq(recurringSessionTemplates.id, id));
    
    if (results.length === 0) return undefined;
    const row = results[0];
    return {
      ...row.recurring_session_templates,
      student: row.students || undefined,
      tutor: row.users || undefined,
    };
  }

  async createRecurringSessionTemplate(template: InsertRecurringSessionTemplate): Promise<RecurringSessionTemplate> {
    const [result] = await db
      .insert(recurringSessionTemplates)
      .values(template)
      .returning();
    return result;
  }

  async updateRecurringSessionTemplate(id: string, updates: UpdateRecurringSessionTemplate): Promise<RecurringSessionTemplate> {
    const [result] = await db
      .update(recurringSessionTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(recurringSessionTemplates.id, id))
      .returning();
    return result;
  }

  async deleteRecurringSessionTemplate(id: string): Promise<void> {
    // First delete associated session occurrences
    await db
      .delete(sessionOccurrences)
      .where(eq(sessionOccurrences.templateId, id));
    // Then delete the template
    await db
      .delete(recurringSessionTemplates)
      .where(eq(recurringSessionTemplates.id, id));
  }

  // Session occurrence operations
  async getSessionOccurrences(tutorId?: string, startDate?: Date, endDate?: Date): Promise<(SessionOccurrence & { student?: Student; tutor?: User; group?: StudentGroup; groupMembers?: Student[] })[]> {
    let conditions: any[] = [];
    
    if (tutorId) {
      conditions.push(eq(sessionOccurrences.tutorId, tutorId));
    }
    if (startDate) {
      conditions.push(gte(sessionOccurrences.occurrenceDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(sessionOccurrences.occurrenceDate, endDate));
    }
    
    const query = db
      .select()
      .from(sessionOccurrences)
      .leftJoin(students, eq(sessionOccurrences.studentId, students.id))
      .leftJoin(users, eq(sessionOccurrences.tutorId, users.id))
      .leftJoin(studentGroups, eq(sessionOccurrences.groupId, studentGroups.id));
    
    const results = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;
    
    // For group sessions, fetch group members
    const groupIds = [...new Set(results.filter(r => r.student_groups?.id).map(r => r.student_groups!.id))];
    let groupMembersMap: Record<string, Student[]> = {};
    
    if (groupIds.length > 0) {
      for (const groupId of groupIds) {
        const members = await db
          .select({ student: students })
          .from(studentGroupMembers)
          .leftJoin(students, eq(studentGroupMembers.studentId, students.id))
          .where(eq(studentGroupMembers.groupId, groupId));
        groupMembersMap[groupId] = members.map(m => m.student).filter(Boolean) as Student[];
      }
    }
    
    return results.map(row => ({
      ...row.session_occurrences,
      student: row.students || undefined,
      tutor: row.users || undefined,
      group: row.student_groups || undefined,
      groupMembers: row.student_groups?.id ? groupMembersMap[row.student_groups.id] : undefined,
    }));
  }

  async getSessionOccurrencesByStudentIds(studentIds: string[]): Promise<(SessionOccurrence & { student?: Student; tutor?: User; groupId?: string; groupName?: string })[]> {
    if (studentIds.length === 0) {
      return [];
    }
    
    // Get individual sessions for these students
    const individualResults = await db
      .select()
      .from(sessionOccurrences)
      .leftJoin(students, eq(sessionOccurrences.studentId, students.id))
      .leftJoin(users, eq(sessionOccurrences.tutorId, users.id))
      .where(inArray(sessionOccurrences.studentId, studentIds));
    
    // Find groups that contain these students
    const groupMemberships = await db
      .select({ groupId: studentGroupMembers.groupId })
      .from(studentGroupMembers)
      .where(inArray(studentGroupMembers.studentId, studentIds));
    
    const groupIds = [...new Set(groupMemberships.map(m => m.groupId))];
    
    // Get group sessions for those groups
    let groupResults: any[] = [];
    if (groupIds.length > 0) {
      groupResults = await db
        .select()
        .from(sessionOccurrences)
        .leftJoin(students, eq(sessionOccurrences.studentId, students.id))
        .leftJoin(users, eq(sessionOccurrences.tutorId, users.id))
        .leftJoin(studentGroups, eq(sessionOccurrences.groupId, studentGroups.id))
        .where(inArray(sessionOccurrences.groupId, groupIds));
    }
    
    const individualSessions = individualResults.map(row => ({
      ...row.session_occurrences,
      student: row.students || undefined,
      tutor: row.users || undefined,
    }));
    
    const groupSessions = groupResults.map(row => ({
      ...row.session_occurrences,
      student: row.students || undefined,
      tutor: row.users || undefined,
      groupId: row.student_groups?.id,
      groupName: row.student_groups?.name,
    }));
    
    // Combine and deduplicate by ID
    const seenIds = new Set<string>();
    const allSessions: (SessionOccurrence & { student?: Student; tutor?: User; groupId?: string; groupName?: string })[] = [];
    
    for (const session of [...individualSessions, ...groupSessions]) {
      if (!seenIds.has(session.id)) {
        seenIds.add(session.id);
        allSessions.push(session);
      }
    }
    
    return allSessions;
  }

  async getSessionOccurrence(id: string): Promise<SessionOccurrence | undefined> {
    const [result] = await db
      .select()
      .from(sessionOccurrences)
      .where(eq(sessionOccurrences.id, id));
    return result;
  }

  async createSessionOccurrence(occurrence: InsertSessionOccurrence): Promise<SessionOccurrence> {
    const [result] = await db
      .insert(sessionOccurrences)
      .values(occurrence)
      .returning();
    return result;
  }

  async updateSessionOccurrence(id: string, updates: UpdateSessionOccurrence): Promise<SessionOccurrence> {
    const [result] = await db
      .update(sessionOccurrences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sessionOccurrences.id, id))
      .returning();
    return result;
  }

  async deleteSessionOccurrence(id: string): Promise<void> {
    await db
      .delete(sessionOccurrences)
      .where(eq(sessionOccurrences.id, id));
  }

  async deleteFutureSessionOccurrences(templateId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First get the IDs of session occurrences to be deleted
    const futureOccurrences = await db
      .select({ id: sessionOccurrences.id })
      .from(sessionOccurrences)
      .where(and(
        eq(sessionOccurrences.templateId, templateId),
        gte(sessionOccurrences.occurrenceDate, today)
      ));
    
    if (futureOccurrences.length > 0) {
      const occurrenceIds = futureOccurrences.map(o => o.id);
      
      // Delete related session change requests first
      await db
        .delete(sessionChangeRequests)
        .where(inArray(sessionChangeRequests.sessionOccurrenceId, occurrenceIds));
      
      // Now delete the session occurrences
      await db
        .delete(sessionOccurrences)
        .where(inArray(sessionOccurrences.id, occurrenceIds));
    }
  }

  async generateSessionOccurrences(templateId: string, endDate: Date): Promise<SessionOccurrence[]> {
    const template = await this.getRecurringSessionTemplate(templateId);
    if (!template || !template.isActive) {
      return [];
    }

    const occurrences: SessionOccurrence[] = [];
    const startDate = template.startDate > new Date() ? new Date(template.startDate) : new Date();
    const effectiveEndDate = template.endDate && template.endDate < endDate ? template.endDate : endDate;
    
    // Generate occurrences for each week from startDate to endDate
    let currentDate = new Date(startDate);
    // Find the first occurrence date matching the day of week
    while (currentDate.getDay() !== template.dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    while (currentDate <= effectiveEndDate) {
      // Parse start time
      const [hours, minutes] = template.startTime.split(':').map(Number);
      const startDateTime = new Date(currentDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (template.durationMinutes || 60));
      
      // Check if occurrence already exists for this date
      const existing = await db
        .select()
        .from(sessionOccurrences)
        .where(and(
          eq(sessionOccurrences.templateId, templateId),
          eq(sessionOccurrences.occurrenceDate, currentDate)
        ));
      
      if (existing.length === 0) {
        const [occurrence] = await db
          .insert(sessionOccurrences)
          .values({
            templateId,
            tutorId: template.tutorId,
            studentId: template.studentId,
            groupId: template.groupId, // For group sessions
            occurrenceDate: new Date(currentDate),
            startDateTime,
            endDateTime,
            status: 'scheduled',
            source: 'template',
          })
          .returning();
        occurrences.push(occurrence);
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return occurrences;
  }

  // Tutor availability slot operations
  async getTutorAvailabilitySlots(tutorId?: string): Promise<TutorAvailabilitySlot[]> {
    if (tutorId) {
      return await db
        .select()
        .from(tutorAvailabilitySlots)
        .where(eq(tutorAvailabilitySlots.tutorId, tutorId))
        .orderBy(asc(tutorAvailabilitySlots.dayOfWeek), asc(tutorAvailabilitySlots.startTime));
    }
    return await db
      .select()
      .from(tutorAvailabilitySlots)
      .orderBy(asc(tutorAvailabilitySlots.dayOfWeek), asc(tutorAvailabilitySlots.startTime));
  }

  async getTutorAvailabilitySlot(id: string): Promise<TutorAvailabilitySlot | undefined> {
    const [result] = await db
      .select()
      .from(tutorAvailabilitySlots)
      .where(eq(tutorAvailabilitySlots.id, id));
    return result;
  }

  async createTutorAvailabilitySlot(slot: InsertTutorAvailabilitySlot): Promise<TutorAvailabilitySlot> {
    const [result] = await db
      .insert(tutorAvailabilitySlots)
      .values(slot)
      .returning();
    return result;
  }

  async updateTutorAvailabilitySlot(id: string, updates: UpdateTutorAvailabilitySlot): Promise<TutorAvailabilitySlot> {
    const [result] = await db
      .update(tutorAvailabilitySlots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tutorAvailabilitySlots.id, id))
      .returning();
    return result;
  }

  async deleteTutorAvailabilitySlot(id: string): Promise<void> {
    await db
      .delete(tutorAvailabilitySlots)
      .where(eq(tutorAvailabilitySlots.id, id));
  }

  // Session change request operations
  async getSessionChangeRequests(status?: string): Promise<(SessionChangeRequest & { student?: Student; parent?: User; tutor?: User; sessionOccurrence?: SessionOccurrence; group?: StudentGroup })[]> {
    // Create alias for tutor users since we're joining users table twice
    const tutorUsers = alias(users, 'tutor_users');
    
    const baseQuery = db
      .select({
        session_change_requests: sessionChangeRequests,
        students: students,
        users: users,
        tutor_users: tutorUsers,
        session_occurrences: sessionOccurrences,
        student_groups: studentGroups
      })
      .from(sessionChangeRequests)
      .leftJoin(students, eq(sessionChangeRequests.studentId, students.id))
      .leftJoin(users, eq(sessionChangeRequests.parentId, users.id))
      .leftJoin(tutorUsers, eq(sessionChangeRequests.tutorId, tutorUsers.id))
      .leftJoin(sessionOccurrences, eq(sessionChangeRequests.sessionOccurrenceId, sessionOccurrences.id))
      .leftJoin(studentGroups, eq(sessionChangeRequests.groupId, studentGroups.id));
    
    const results = status 
      ? await baseQuery.where(eq(sessionChangeRequests.status, status as any)).orderBy(desc(sessionChangeRequests.createdAt))
      : await baseQuery.orderBy(desc(sessionChangeRequests.createdAt));
    
    return results.map(row => ({
      ...row.session_change_requests,
      student: row.students || undefined,
      parent: row.users || undefined,
      tutor: row.tutor_users || undefined,
      sessionOccurrence: row.session_occurrences || undefined,
      group: row.student_groups || undefined,
    }));
  }

  async getSessionChangeRequestsByParent(parentId: string): Promise<(SessionChangeRequest & { sessionOccurrence?: SessionOccurrence & { student?: Student } })[]> {
    const results = await db
      .select()
      .from(sessionChangeRequests)
      .leftJoin(sessionOccurrences, eq(sessionChangeRequests.sessionOccurrenceId, sessionOccurrences.id))
      .leftJoin(students, eq(sessionOccurrences.studentId, students.id))
      .where(eq(sessionChangeRequests.parentId, parentId))
      .orderBy(desc(sessionChangeRequests.createdAt));
    
    return results.map(row => ({
      ...row.session_change_requests,
      sessionOccurrence: row.session_occurrences ? {
        ...row.session_occurrences,
        student: row.students || undefined,
      } : undefined,
    }));
  }

  async getSessionChangeRequestsByTutor(tutorId: string): Promise<(SessionChangeRequest & { student?: Student; parent?: User; sessionOccurrence?: SessionOccurrence })[]> {
    const results = await db
      .select()
      .from(sessionChangeRequests)
      .leftJoin(students, eq(sessionChangeRequests.studentId, students.id))
      .leftJoin(users, eq(sessionChangeRequests.parentId, users.id))
      .leftJoin(sessionOccurrences, eq(sessionChangeRequests.sessionOccurrenceId, sessionOccurrences.id))
      .where(eq(sessionOccurrences.tutorId, tutorId))
      .orderBy(desc(sessionChangeRequests.createdAt));
    
    return results.map(row => ({
      ...row.session_change_requests,
      student: row.students || undefined,
      parent: row.users || undefined,
      sessionOccurrence: row.session_occurrences || undefined,
    }));
  }

  async createSessionChangeRequest(request: InsertSessionChangeRequest): Promise<SessionChangeRequest> {
    const [result] = await db
      .insert(sessionChangeRequests)
      .values(request)
      .returning();
    return result;
  }

  async updateSessionChangeRequest(id: string, updates: Partial<SessionChangeRequest>): Promise<SessionChangeRequest> {
    const [result] = await db
      .update(sessionChangeRequests)
      .set(updates)
      .where(eq(sessionChangeRequests.id, id))
      .returning();
    return result;
  }

  // Product operations
  async getProducts(includeInactive: boolean = false): Promise<Product[]> {
    if (includeInactive) {
      return await db.select().from(products).orderBy(asc(products.name));
    }
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Auto-generate unique SKU if not provided or empty
    const productWithSku = {
      ...product,
      sku: product.sku && product.sku.trim() !== '' 
        ? product.sku 
        : `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
    const [result] = await db.insert(products).values(productWithSku).returning();
    return result;
  }

  async updateProduct(id: string, updates: UpdateProduct): Promise<Product> {
    const [result] = await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getLowStockProducts(): Promise<ProductWithInventory[]> {
    const lowStockProducts = await db.select().from(products)
      .where(and(
        eq(products.isActive, true),
        sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
      ));
    return lowStockProducts.map(p => ({ ...p, isLowStock: true }));
  }

  // Mock exam event operations
  async getMockExamEvents(includeCompleted: boolean = false): Promise<MockExamEvent[]> {
    if (includeCompleted) {
      return await db.select().from(mockExamEvents).orderBy(desc(mockExamEvents.examDate));
    }
    return await db.select().from(mockExamEvents)
      .where(not(inArray(mockExamEvents.status, ['completed', 'cancelled'])))
      .orderBy(asc(mockExamEvents.examDate));
  }

  async getMockExamEvent(id: string): Promise<MockExamEventWithBookings | undefined> {
    const [event] = await db.select().from(mockExamEvents).where(eq(mockExamEvents.id, id));
    if (!event) return undefined;
    
    // Use alias for parent from student (fallback when booking doesn't have parentUserId)
    const studentParent = alias(users, "studentParent");
    
    const bookings = await db.select({
      booking: serviceBookings,
      parent: users,
      studentParent: studentParent,
      student: students,
      invoice: adhocInvoices,
    }).from(serviceBookings)
      .leftJoin(users, eq(serviceBookings.parentUserId, users.id))
      .leftJoin(students, eq(serviceBookings.studentId, students.id))
      .leftJoin(studentParent, eq(students.parentUserId, studentParent.id))
      .leftJoin(adhocInvoices, eq(serviceBookings.invoiceId, adhocInvoices.id))
      .where(eq(serviceBookings.mockExamEventId, id));
    
    return {
      ...event,
      bookings: bookings.map(b => ({
        ...b.booking,
        parent: b.parent || b.studentParent || undefined,
        student: b.student || undefined,
        invoice: b.invoice || undefined,
      })),
    };
  }

  async createMockExamEvent(event: InsertMockExamEvent): Promise<MockExamEvent> {
    const [result] = await db.insert(mockExamEvents).values(event).returning();
    return result;
  }

  async updateMockExamEvent(id: string, updates: UpdateMockExamEvent): Promise<MockExamEvent> {
    const [result] = await db.update(mockExamEvents).set({ ...updates, updatedAt: new Date() }).where(eq(mockExamEvents.id, id)).returning();
    return result;
  }

  async deleteMockExamEvent(id: string): Promise<void> {
    await db.delete(mockExamEvents).where(eq(mockExamEvents.id, id));
  }

  // Mock exam expense operations
  async getMockExamExpenses(mockExamEventId: string): Promise<MockExamExpense[]> {
    return await db.select().from(mockExamExpenses)
      .where(eq(mockExamExpenses.mockExamEventId, mockExamEventId))
      .orderBy(desc(mockExamExpenses.createdAt));
  }

  async getMockExamExpense(id: string): Promise<MockExamExpense | undefined> {
    const [result] = await db.select().from(mockExamExpenses).where(eq(mockExamExpenses.id, id));
    return result;
  }

  async createMockExamExpense(expense: InsertMockExamExpense): Promise<MockExamExpense> {
    const [result] = await db.insert(mockExamExpenses).values(expense).returning();
    return result;
  }

  async updateMockExamExpense(id: string, updates: UpdateMockExamExpense): Promise<MockExamExpense> {
    const [result] = await db.update(mockExamExpenses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mockExamExpenses.id, id))
      .returning();
    return result;
  }

  async deleteMockExamExpense(id: string): Promise<void> {
    await db.delete(mockExamExpenses).where(eq(mockExamExpenses.id, id));
  }

  async markMockExamExpensePaid(id: string): Promise<MockExamExpense> {
    const [result] = await db.update(mockExamExpenses)
      .set({ isPaid: true, paidAt: new Date(), updatedAt: new Date() })
      .where(eq(mockExamExpenses.id, id))
      .returning();
    return result;
  }

  // Mock exam paper operations
  async getMockExamPapers(mockExamEventId: string): Promise<MockExamPaper[]> {
    return await db.select().from(mockExamPapers)
      .where(eq(mockExamPapers.mockExamEventId, mockExamEventId))
      .orderBy(asc(mockExamPapers.orderIndex));
  }

  async getMockExamPaper(id: string): Promise<MockExamPaper | undefined> {
    const [result] = await db.select().from(mockExamPapers).where(eq(mockExamPapers.id, id));
    return result;
  }

  async createMockExamPaper(paper: InsertMockExamPaper): Promise<MockExamPaper> {
    const [result] = await db.insert(mockExamPapers).values(paper).returning();
    return result;
  }

  async updateMockExamPaper(id: string, updates: UpdateMockExamPaper): Promise<MockExamPaper> {
    const [result] = await db.update(mockExamPapers)
      .set(updates)
      .where(eq(mockExamPapers.id, id))
      .returning();
    return result;
  }

  async deleteMockExamPaper(id: string): Promise<void> {
    await db.delete(mockExamPapers).where(eq(mockExamPapers.id, id));
  }

  // Mock exam result operations
  async getMockExamResults(mockExamPaperId: string): Promise<MockExamResultWithRelations[]> {
    const results = await db.select({
      result: mockExamResults,
      paper: mockExamPapers,
      booking: serviceBookings,
      student: students,
      parent: users,
    }).from(mockExamResults)
      .leftJoin(mockExamPapers, eq(mockExamResults.mockExamPaperId, mockExamPapers.id))
      .leftJoin(serviceBookings, eq(mockExamResults.serviceBookingId, serviceBookings.id))
      .leftJoin(students, eq(serviceBookings.studentId, students.id))
      .leftJoin(users, eq(serviceBookings.parentUserId, users.id))
      .where(eq(mockExamResults.mockExamPaperId, mockExamPaperId));
    
    return results.map(r => ({
      ...r.result,
      paper: r.paper || undefined,
      booking: r.booking ? {
        ...r.booking,
        student: r.student || undefined,
        parent: r.parent || undefined,
      } : undefined,
    }));
  }

  async getMockExamResultsByBooking(serviceBookingId: string): Promise<MockExamResultWithRelations[]> {
    const results = await db.select({
      result: mockExamResults,
      paper: mockExamPapers,
    }).from(mockExamResults)
      .leftJoin(mockExamPapers, eq(mockExamResults.mockExamPaperId, mockExamPapers.id))
      .where(eq(mockExamResults.serviceBookingId, serviceBookingId))
      .orderBy(asc(mockExamPapers.orderIndex));
    
    return results.map(r => ({
      ...r.result,
      paper: r.paper || undefined,
    }));
  }

  async getMockExamResult(id: string): Promise<MockExamResult | undefined> {
    const [result] = await db.select().from(mockExamResults).where(eq(mockExamResults.id, id));
    return result;
  }

  async createMockExamResult(result: InsertMockExamResult): Promise<MockExamResult> {
    const [created] = await db.insert(mockExamResults).values(result).returning();
    return created;
  }

  async upsertMockExamResult(paperId: string, bookingId: string, score: number | null, isConfirmed: boolean, enteredBy?: string): Promise<MockExamResult> {
    // Check if result exists
    const [existing] = await db.select().from(mockExamResults)
      .where(and(
        eq(mockExamResults.mockExamPaperId, paperId),
        eq(mockExamResults.serviceBookingId, bookingId)
      ));
    
    if (existing) {
      const [updated] = await db.update(mockExamResults)
        .set({ score, isConfirmed, enteredBy, updatedAt: new Date() })
        .where(eq(mockExamResults.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(mockExamResults)
        .values({ mockExamPaperId: paperId, serviceBookingId: bookingId, score, isConfirmed, enteredBy })
        .returning();
      return created;
    }
  }

  async updateMockExamResult(id: string, updates: UpdateMockExamResult): Promise<MockExamResult> {
    const [result] = await db.update(mockExamResults)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mockExamResults.id, id))
      .returning();
    return result;
  }

  async deleteMockExamResult(id: string): Promise<void> {
    await db.delete(mockExamResults).where(eq(mockExamResults.id, id));
  }

  async upsertHistoricalMockExamResult(paperId: string, studentId: string, score: number | null, isConfirmed: boolean, enteredBy?: string): Promise<MockExamResult> {
    const [existing] = await db.select().from(mockExamResults)
      .where(and(
        eq(mockExamResults.mockExamPaperId, paperId),
        eq(mockExamResults.studentId, studentId)
      ));
    
    if (existing) {
      const [updated] = await db.update(mockExamResults)
        .set({ score, isConfirmed, enteredBy, updatedAt: new Date() })
        .where(eq(mockExamResults.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(mockExamResults)
        .values({ mockExamPaperId: paperId, studentId, score, isConfirmed, enteredBy })
        .returning();
      return created;
    }
  }

  async getHistoricalMockExamResults(paperId: string): Promise<(MockExamResult & { student: Student | null })[]> {
    const results = await db.select().from(mockExamResults)
      .where(and(
        eq(mockExamResults.mockExamPaperId, paperId),
        isNotNull(mockExamResults.studentId)
      ));
    
    const enrichedResults = [];
    for (const result of results) {
      let student = null;
      if (result.studentId) {
        const [s] = await db.select().from(students).where(eq(students.id, result.studentId));
        student = s || null;
      }
      enrichedResults.push({ ...result, student });
    }
    return enrichedResults;
  }

  async getMockExamTrendAnalytics(): Promise<{
    examId: string;
    title: string;
    examDate: Date;
    examType: string;
    papers: {
      paperId: string;
      title: string;
      maxScore: number;
      paperYear: number | null;
      stats: {
        highest: number | null;
        lowest: number | null;
        average: number | null;
        median: number | null;
        count: number;
      };
    }[];
  }[]> {
    const allExams = await db.select().from(mockExamEvents)
      .orderBy(desc(mockExamEvents.examDate));
    
    const analytics = [];
    for (const exam of allExams) {
      const papers = await this.getMockExamPapers(exam.id);
      const paperStats = [];
      
      for (const paper of papers) {
        const allResults = await db.select().from(mockExamResults)
          .where(eq(mockExamResults.mockExamPaperId, paper.id));
        
        const scores = allResults
          .filter(r => r.score !== null && r.isConfirmed)
          .map(r => r.score as number)
          .sort((a, b) => a - b);
        
        const count = scores.length;
        const highest = count > 0 ? Math.max(...scores) : null;
        const lowest = count > 0 ? Math.min(...scores) : null;
        const average = count > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / count * 10) / 10 : null;
        const median = count > 0 ? (count % 2 === 0 
          ? (scores[count/2 - 1] + scores[count/2]) / 2 
          : scores[Math.floor(count/2)]) : null;
        
        paperStats.push({
          paperId: paper.id,
          title: paper.title,
          maxScore: paper.maxScore,
          paperYear: paper.paperYear,
          stats: { highest, lowest, average, median, count },
        });
      }
      
      analytics.push({
        examId: exam.id,
        title: exam.title,
        examDate: exam.examDate,
        examType: exam.examType,
        papers: paperStats,
      });
    }
    
    return analytics;
  }

  async confirmMockExamParticipant(bookingId: string, isConfirmed: boolean): Promise<void> {
    // Update all results for this booking to set isConfirmed
    await db.update(mockExamResults)
      .set({ isConfirmed, updatedAt: new Date() })
      .where(eq(mockExamResults.serviceBookingId, bookingId));
  }

  async getMockExamPapersWithResults(mockExamEventId: string): Promise<MockExamPaperWithResults[]> {
    const papers = await this.getMockExamPapers(mockExamEventId);
    
    const papersWithResults: MockExamPaperWithResults[] = [];
    for (const paper of papers) {
      const results = await this.getMockExamResults(paper.id);
      papersWithResults.push({
        ...paper,
        results,
      });
    }
    
    return papersWithResults;
  }

  async getParentMockExamResults(parentUserId: string): Promise<{
    exam: MockExamEvent;
    booking: ServiceBooking;
    papers: MockExamPaperWithResults[];
    statistics: {
      paperId: string;
      paperTitle: string;
      childScore: number | null;
      median: number;
      average: number;
      highest: number;
      lowest: number;
      rank: number;
      totalParticipants: number;
    }[];
  }[]> {
    // Get all bookings for this parent's children
    const bookings = await db.select({
      booking: serviceBookings,
      exam: mockExamEvents,
      student: students,
    }).from(serviceBookings)
      .leftJoin(mockExamEvents, eq(serviceBookings.mockExamEventId, mockExamEvents.id))
      .leftJoin(students, eq(serviceBookings.studentId, students.id))
      .where(and(
        eq(serviceBookings.bookingType, 'mock_exam'),
        eq(students.parentUserId, parentUserId)
      ));
    
    const results: {
      exam: MockExamEvent;
      booking: ServiceBooking;
      papers: MockExamPaperWithResults[];
      statistics: {
        paperId: string;
        paperTitle: string;
        childScore: number | null;
        median: number;
        average: number;
        highest: number;
        lowest: number;
        rank: number;
        totalParticipants: number;
      }[];
    }[] = [];

    for (const b of bookings) {
      if (!b.exam) continue;
      
      const papers = await this.getMockExamPapersWithResults(b.exam.id);
      const statistics: {
        paperId: string;
        paperTitle: string;
        childScore: number | null;
        median: number;
        average: number;
        highest: number;
        lowest: number;
        rank: number;
        totalParticipants: number;
      }[] = [];
      
      for (const paper of papers) {
        // Get all confirmed results with scores
        const confirmedResults = paper.results.filter(r => r.isConfirmed && r.score !== null);
        const scores = confirmedResults.map(r => r.score as number).sort((a, b) => b - a);
        
        // Find child's result
        const childResult = paper.results.find(r => r.serviceBookingId === b.booking.id);
        const childScore = childResult?.score ?? null;
        
        if (scores.length > 0) {
          const median = scores.length % 2 === 0
            ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
            : scores[Math.floor(scores.length / 2)];
          const average = scores.reduce((a, b) => a + b, 0) / scores.length;
          const highest = scores[0];
          const lowest = scores[scores.length - 1];
          
          // Calculate rank properly - find how many scores are greater than child's score + 1
          let rank = 0;
          if (childScore !== null && childResult?.isConfirmed) {
            // Count how many people scored higher
            const higherScores = scores.filter(s => s > childScore).length;
            rank = higherScores + 1;
          }
          
          statistics.push({
            paperId: paper.id,
            paperTitle: paper.title,
            childScore,
            median,
            average,
            highest,
            lowest,
            rank,
            totalParticipants: scores.length,
          });
        }
      }
      
      results.push({
        exam: b.exam,
        booking: b.booking,
        papers,
        statistics,
      });
    }
    
    return results;
  }

  async getTutorMockExamResults(tutorId: string): Promise<{
    exam: MockExamEvent;
    studentName: string;
    studentId: string;
    booking: ServiceBooking;
    papers: MockExamPaperWithResults[];
    statistics: {
      paperId: string;
      paperTitle: string;
      studentScore: number | null;
      median: number;
      average: number;
      highest: number;
      lowest: number;
      rank: number;
      totalParticipants: number;
    }[];
  }[]> {
    // Get all students assigned to this tutor
    const tutorStudentIds = await db.select({ studentId: studentTutors.studentId })
      .from(studentTutors)
      .where(and(
        eq(studentTutors.tutorId, tutorId),
        eq(studentTutors.isActive, true)
      ));
    
    if (tutorStudentIds.length === 0) return [];
    
    const studentIdList = tutorStudentIds.map(s => s.studentId);
    
    // Get all mock exam bookings for these students
    const bookings = await db.select({
      booking: serviceBookings,
      exam: mockExamEvents,
      student: students,
    }).from(serviceBookings)
      .leftJoin(mockExamEvents, eq(serviceBookings.mockExamEventId, mockExamEvents.id))
      .leftJoin(students, eq(serviceBookings.studentId, students.id))
      .where(and(
        eq(serviceBookings.bookingType, 'mock_exam'),
        inArray(serviceBookings.studentId, studentIdList)
      ));
    
    const results: {
      exam: MockExamEvent;
      studentName: string;
      studentId: string;
      booking: ServiceBooking;
      papers: MockExamPaperWithResults[];
      statistics: {
        paperId: string;
        paperTitle: string;
        studentScore: number | null;
        median: number;
        average: number;
        highest: number;
        lowest: number;
        rank: number;
        totalParticipants: number;
      }[];
    }[] = [];

    for (const b of bookings) {
      if (!b.exam || !b.student) continue;
      
      const papers = await this.getMockExamPapersWithResults(b.exam.id);
      const statistics: {
        paperId: string;
        paperTitle: string;
        studentScore: number | null;
        median: number;
        average: number;
        highest: number;
        lowest: number;
        rank: number;
        totalParticipants: number;
      }[] = [];
      
      for (const paper of papers) {
        const confirmedResults = paper.results.filter(r => r.isConfirmed && r.score !== null);
        const scores = confirmedResults.map(r => r.score as number).sort((a, b) => b - a);
        
        const studentResult = paper.results.find(r => r.serviceBookingId === b.booking.id);
        const studentScore = studentResult?.score ?? null;
        
        if (scores.length > 0) {
          const median = scores.length % 2 === 0
            ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
            : scores[Math.floor(scores.length / 2)];
          const average = scores.reduce((a, b) => a + b, 0) / scores.length;
          const highest = scores[0];
          const lowest = scores[scores.length - 1];
          
          let rank = 0;
          if (studentScore !== null && studentResult?.isConfirmed) {
            const higherScores = scores.filter(s => s > studentScore).length;
            rank = higherScores + 1;
          }
          
          statistics.push({
            paperId: paper.id,
            paperTitle: paper.title,
            studentScore,
            median,
            average,
            highest,
            lowest,
            rank,
            totalParticipants: scores.length,
          });
        }
      }
      
      results.push({
        exam: b.exam,
        studentName: b.student.name,
        studentId: b.student.id,
        booking: b.booking,
        papers,
        statistics,
      });
    }
    
    return results;
  }

  // Service booking operations
  async getServiceBookings(parentId?: string, status?: string): Promise<ServiceBookingWithRelations[]> {
    let query = db.select({
      booking: serviceBookings,
      parent: users,
      student: students,
      mockExamEvent: mockExamEvents,
      product: products,
      invoice: adhocInvoices,
    }).from(serviceBookings)
      .leftJoin(users, eq(serviceBookings.parentUserId, users.id))
      .leftJoin(students, eq(serviceBookings.studentId, students.id))
      .leftJoin(mockExamEvents, eq(serviceBookings.mockExamEventId, mockExamEvents.id))
      .leftJoin(products, eq(serviceBookings.productId, products.id))
      .leftJoin(adhocInvoices, eq(serviceBookings.invoiceId, adhocInvoices.id));
    
    const conditions = [];
    if (parentId) conditions.push(eq(serviceBookings.parentUserId, parentId));
    if (status) conditions.push(eq(serviceBookings.status, status as any));
    
    const results = conditions.length > 0 
      ? await query.where(and(...conditions)).orderBy(desc(serviceBookings.createdAt))
      : await query.orderBy(desc(serviceBookings.createdAt));
    
    return results.map(r => ({
      ...r.booking,
      parent: r.parent || undefined,
      student: r.student || undefined,
      mockExamEvent: r.mockExamEvent || undefined,
      product: r.product || undefined,
      invoice: r.invoice || undefined,
    }));
  }

  async getServiceBooking(id: string): Promise<ServiceBookingWithRelations | undefined> {
    const [result] = await db.select({
      booking: serviceBookings,
      parent: users,
      student: students,
      mockExamEvent: mockExamEvents,
      product: products,
      invoice: adhocInvoices,
    }).from(serviceBookings)
      .leftJoin(users, eq(serviceBookings.parentUserId, users.id))
      .leftJoin(students, eq(serviceBookings.studentId, students.id))
      .leftJoin(mockExamEvents, eq(serviceBookings.mockExamEventId, mockExamEvents.id))
      .leftJoin(products, eq(serviceBookings.productId, products.id))
      .leftJoin(adhocInvoices, eq(serviceBookings.invoiceId, adhocInvoices.id))
      .where(eq(serviceBookings.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.booking,
      parent: result.parent || undefined,
      student: result.student || undefined,
      mockExamEvent: result.mockExamEvent || undefined,
      product: result.product || undefined,
      invoice: result.invoice || undefined,
    };
  }

  async createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking> {
    const [result] = await db.insert(serviceBookings).values(booking).returning();
    
    // If booking is for a mock exam, increment the enrollment count
    if (result.mockExamEventId) {
      await db.update(mockExamEvents)
        .set({ currentEnrollments: sql`${mockExamEvents.currentEnrollments} + 1` })
        .where(eq(mockExamEvents.id, result.mockExamEventId));
    }
    
    return result;
  }

  async updateServiceBooking(id: string, updates: UpdateServiceBooking): Promise<ServiceBooking> {
    const [result] = await db.update(serviceBookings).set({ ...updates, updatedAt: new Date() }).where(eq(serviceBookings.id, id)).returning();
    return result;
  }

  async deleteServiceBooking(id: string): Promise<void> {
    const [booking] = await db.select().from(serviceBookings).where(eq(serviceBookings.id, id));
    
    if (booking?.mockExamEventId) {
      await db.update(mockExamEvents)
        .set({ currentEnrollments: sql`GREATEST(${mockExamEvents.currentEnrollments} - 1, 0)` })
        .where(eq(mockExamEvents.id, booking.mockExamEventId));
    }
    
    await db.delete(serviceBookings).where(eq(serviceBookings.id, id));
  }

  // Inventory transaction operations
  async getInventoryTransactions(productId: string): Promise<InventoryTransaction[]> {
    return await db.select().from(inventoryTransactions)
      .where(eq(inventoryTransactions.productId, productId))
      .orderBy(desc(inventoryTransactions.createdAt));
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [result] = await db.insert(inventoryTransactions).values(transaction).returning();
    return result;
  }

  async adjustProductStock(
    productId: string, 
    quantity: number, 
    type: 'stock_in' | 'sale' | 'adjustment' | 'return', 
    notes?: string, 
    createdBy?: string,
    serviceBookingId?: string
  ): Promise<Product> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error('Product not found');
    
    const previousStock = product.stockQuantity;
    const quantityChange = type === 'sale' ? -Math.abs(quantity) : (type === 'stock_in' || type === 'return' ? Math.abs(quantity) : quantity);
    const newStock = Math.max(0, previousStock + quantityChange);
    
    await this.createInventoryTransaction({
      productId,
      transactionType: type,
      quantity: quantityChange,
      previousStock,
      newStock,
      notes,
      createdBy,
      serviceBookingId,
    });
    
    return await this.updateProduct(productId, { stockQuantity: newStock });
  }

  // Parent service notification operations
  async getParentServiceNotifications(parentId: string, unreadOnly: boolean = false): Promise<ParentServiceNotificationWithRelations[]> {
    const conditions = [eq(parentServiceNotifications.parentUserId, parentId)];
    if (unreadOnly) conditions.push(eq(parentServiceNotifications.isRead, false));
    
    const results = await db.select({
      notification: parentServiceNotifications,
      mockExamEvent: mockExamEvents,
      product: products,
    }).from(parentServiceNotifications)
      .leftJoin(mockExamEvents, eq(parentServiceNotifications.mockExamEventId, mockExamEvents.id))
      .leftJoin(products, eq(parentServiceNotifications.productId, products.id))
      .where(and(...conditions))
      .orderBy(desc(parentServiceNotifications.createdAt));
    
    return results.map(r => ({
      ...r.notification,
      mockExamEvent: r.mockExamEvent || undefined,
      product: r.product || undefined,
    }));
  }

  async createParentServiceNotification(notification: InsertParentServiceNotification): Promise<ParentServiceNotification> {
    const [result] = await db.insert(parentServiceNotifications).values(notification).returning();
    return result;
  }

  async markParentServiceNotificationRead(id: string): Promise<ParentServiceNotification> {
    const [result] = await db.update(parentServiceNotifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(parentServiceNotifications.id, id))
      .returning();
    return result;
  }

  async notifyParentsOfMockExam(mockExamEventId: string): Promise<number> {
    const event = await this.getMockExamEvent(mockExamEventId);
    if (!event) throw new Error('Mock exam event not found');
    
    const parents = await this.getParentUsers();
    let notificationCount = 0;
    
    for (const parent of parents) {
      await this.createParentServiceNotification({
        parentUserId: parent.id,
        mockExamEventId,
        notificationType: 'mock_exam_available',
        title: `New Mock Exam: ${event.title}`,
        message: `A new ${event.examType} mock exam is available for ${event.examDate.toLocaleDateString()}. Register now to secure a spot!`,
      });
      notificationCount++;
    }
    
    return notificationCount;
  }

  // Document store operations
  async getDocuments(includeInactive: boolean = false): Promise<DocumentWithUploader[]> {
    const conditions = includeInactive ? [] : [eq(documents.isActive, true)];
    
    const results = await db.select({
      document: documents,
      uploader: users,
    }).from(documents)
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(documents.createdAt));
    
    // Get share counts for each document
    const shareCountsResult = await db
      .select({
        documentId: documentShares.documentId,
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(documentShares)
      .groupBy(documentShares.documentId);
    
    const shareCountMap = new Map(shareCountsResult.map(r => [r.documentId, r.count]));
    
    return results.map(r => ({
      ...r.document,
      uploader: r.uploader!,
      shareCount: shareCountMap.get(r.document.id) || 0,
    }));
  }

  async getDocument(id: string): Promise<DocumentWithUploader | undefined> {
    const [result] = await db.select({
      document: documents,
      uploader: users,
    }).from(documents)
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .where(eq(documents.id, id));
    
    if (!result) return undefined;
    
    // Get share count
    const [shareCountResult] = await db
      .select({ count: sql<number>`count(*)::int`.as('count') })
      .from(documentShares)
      .where(eq(documentShares.documentId, id));
    
    return {
      ...result.document,
      uploader: result.uploader!,
      shareCount: shareCountResult?.count || 0,
    };
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(document).returning();
    return result;
  }

  async updateDocument(id: string, updates: UpdateDocument): Promise<Document> {
    const [result] = await db.update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result;
  }

  async deleteDocument(id: string): Promise<void> {
    // First delete all shares for this document
    await db.delete(documentShares).where(eq(documentShares.documentId, id));
    // Then mark document as inactive (soft delete)
    await db.update(documents)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(documents.id, id));
  }

  // Document share operations
  async getDocumentShares(documentId: string): Promise<DocumentShareWithRelations[]> {
    const sharedByUser = alias(users, 'sharedByUser');
    
    const results = await db.select({
      share: documentShares,
      document: documents,
      parent: users,
      student: students,
      sharedByUser: sharedByUser,
    }).from(documentShares)
      .innerJoin(documents, eq(documentShares.documentId, documents.id))
      .innerJoin(users, eq(documentShares.parentUserId, users.id))
      .leftJoin(students, eq(documentShares.studentId, students.id))
      .innerJoin(sharedByUser, eq(documentShares.sharedBy, sharedByUser.id))
      .where(eq(documentShares.documentId, documentId))
      .orderBy(desc(documentShares.createdAt));
    
    return results.map(r => ({
      ...r.share,
      document: r.document,
      parent: r.parent,
      student: r.student || undefined,
      sharedByUser: r.sharedByUser,
    }));
  }

  async getDocumentSharesForParent(parentId: string, unreadOnly: boolean = false): Promise<DocumentShareWithRelations[]> {
    const conditions = [eq(documentShares.parentUserId, parentId)];
    if (unreadOnly) conditions.push(eq(documentShares.isRead, false));
    
    const sharedByUser = alias(users, 'sharedByUser');
    
    const results = await db.select({
      share: documentShares,
      document: documents,
      parent: users,
      student: students,
      sharedByUser: sharedByUser,
    }).from(documentShares)
      .innerJoin(documents, eq(documentShares.documentId, documents.id))
      .innerJoin(users, eq(documentShares.parentUserId, users.id))
      .leftJoin(students, eq(documentShares.studentId, students.id))
      .innerJoin(sharedByUser, eq(documentShares.sharedBy, sharedByUser.id))
      .where(and(...conditions, eq(documents.isActive, true)))
      .orderBy(desc(documentShares.createdAt));
    
    return results.map(r => ({
      ...r.share,
      document: r.document,
      parent: r.parent,
      student: r.student || undefined,
      sharedByUser: r.sharedByUser,
    }));
  }

  async shareDocument(share: InsertDocumentShare): Promise<DocumentShare> {
    const [result] = await db.insert(documentShares).values(share).returning();
    return result;
  }

  async shareDocumentWithMultipleParents(documentId: string, parentIds: string[], sharedBy: string, message?: string, studentId?: string, tutorVisibleWhenShared: boolean = false): Promise<number> {
    let shareCount = 0;
    for (const parentId of parentIds) {
      await this.shareDocument({
        documentId,
        parentUserId: parentId,
        sharedBy,
        message,
        studentId,
        tutorVisibleWhenShared,
      });
      shareCount++;
    }
    return shareCount;
  }

  async markDocumentShareRead(shareId: string): Promise<DocumentShare> {
    const [result] = await db.update(documentShares)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(documentShares.id, shareId))
      .returning();
    return result;
  }

  async deleteDocumentShare(shareId: string): Promise<void> {
    await db.delete(documentShares).where(eq(documentShares.id, shareId));
  }

  async getDocumentsForTutor(tutorId: string): Promise<DocumentWithUploader[]> {
    const results = await db.select({
      document: documents,
      uploader: users,
    }).from(documents)
      .leftJoin(users, eq(documents.uploadedBy, users.id))
      .where(and(eq(documents.isActive, true), eq(documents.visibleToTutors, true)))
      .orderBy(desc(documents.createdAt));
    
    return results.map(r => ({
      ...r.document,
      uploader: r.uploader!,
      shareCount: 0,
    }));
  }

  async updateDocumentTutorVisibility(id: string, visibleToTutors: boolean): Promise<Document> {
    const [result] = await db.update(documents)
      .set({ visibleToTutors, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result;
  }

  async getDocumentSharesVisibleToTutor(tutorId: string): Promise<DocumentShareWithRelations[]> {
    const sharedByUser = alias(users, 'sharedByUser');
    
    const results = await db.select({
      share: documentShares,
      document: documents,
      parent: users,
      student: students,
      sharedByUser: sharedByUser,
    }).from(documentShares)
      .innerJoin(documents, eq(documentShares.documentId, documents.id))
      .innerJoin(users, eq(documentShares.parentUserId, users.id))
      .leftJoin(students, eq(documentShares.studentId, students.id))
      .innerJoin(sharedByUser, eq(documentShares.sharedBy, sharedByUser.id))
      .where(and(
        eq(documents.isActive, true),
        eq(documentShares.tutorVisibleWhenShared, true)
      ))
      .orderBy(desc(documentShares.createdAt));
    
    return results.map(r => ({
      ...r.share,
      document: r.document,
      parent: r.parent,
      student: r.student || undefined,
      sharedByUser: r.sharedByUser,
    }));
  }

  async getAllDocumentSharesWithParentInfo(): Promise<DocumentShareWithRelations[]> {
    const sharedByUser = alias(users, 'sharedByUser');
    
    const results = await db.select({
      share: documentShares,
      document: documents,
      parent: users,
      student: students,
      sharedByUser: sharedByUser,
    }).from(documentShares)
      .innerJoin(documents, eq(documentShares.documentId, documents.id))
      .innerJoin(users, eq(documentShares.parentUserId, users.id))
      .leftJoin(students, eq(documentShares.studentId, students.id))
      .innerJoin(sharedByUser, eq(documentShares.sharedBy, sharedByUser.id))
      .where(eq(documents.isActive, true))
      .orderBy(desc(documentShares.createdAt));
    
    return results.map(r => ({
      ...r.share,
      document: r.document,
      parent: r.parent,
      student: r.student || undefined,
      sharedByUser: r.sharedByUser,
    }));
  }

  async getShareableRecipients(tutorId?: string, yearGroup?: number): Promise<{
    parentId: string;
    parentName: string;
    parentEmail: string | null;
    studentId: string | null;
    studentName: string | null;
    yearGroup: number | null;
    tutorIds: string[];
    tutorNames: string[];
  }[]> {
    const allStudents = await this.getStudents(false);
    const allParentUsers = await this.getParentUsers();
    const allStudentTutors = await db.select().from(studentTutors).where(eq(studentTutors.isActive, true));
    const allTutors = await this.getTutors(false);
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const academicYearStart = currentMonth >= 9 ? currentYear : currentYear - 1;
    
    const recipients: {
      parentId: string;
      parentName: string;
      parentEmail: string | null;
      studentId: string | null;
      studentName: string | null;
      yearGroup: number | null;
      tutorIds: string[];
      tutorNames: string[];
    }[] = [];
    
    // First, add all students that have a parentUserId linked
    for (const student of allStudents) {
      const parentUser = allParentUsers.find(p => p.id === student.parentUserId);
      if (!parentUser) continue;
      
      const studentTutorAllocations = allStudentTutors.filter(st => st.studentId === student.id);
      const tutorIds = studentTutorAllocations.map(st => st.tutorId);
      const tutorNames = tutorIds.map(tid => {
        const tutor = allTutors.find(t => t.id === tid);
        return tutor ? `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() : 'Unknown';
      });
      
      if (student.tutorId && !tutorIds.includes(student.tutorId)) {
        tutorIds.push(student.tutorId);
        const tutor = allTutors.find(t => t.id === student.tutorId);
        tutorNames.push(tutor ? `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() : 'Unknown');
      }
      
      let studentYearGroup: number | null = null;
      if (student.startYear) {
        studentYearGroup = academicYearStart - student.startYear + 1;
        if (studentYearGroup < 1) studentYearGroup = 1;
        if (studentYearGroup > 13) studentYearGroup = 13;
      }
      
      if (tutorId && !tutorIds.includes(tutorId)) continue;
      if (yearGroup !== undefined && studentYearGroup !== yearGroup) continue;
      
      recipients.push({
        parentId: parentUser.id,
        parentName: `${parentUser.firstName || ''} ${parentUser.lastName || ''}`.trim(),
        parentEmail: parentUser.email,
        studentId: student.id,
        studentName: student.name,
        yearGroup: studentYearGroup,
        tutorIds,
        tutorNames,
      });
    }
    
    // Also add parent users without any linked students (only if no filters applied)
    if (!tutorId && yearGroup === undefined) {
      const parentsWithStudents = new Set(recipients.map(r => r.parentId));
      for (const parent of allParentUsers) {
        if (!parentsWithStudents.has(parent.id)) {
          recipients.push({
            parentId: parent.id,
            parentName: `${parent.firstName || ''} ${parent.lastName || ''}`.trim(),
            parentEmail: parent.email,
            studentId: null,
            studentName: null,
            yearGroup: null,
            tutorIds: [],
            tutorNames: [],
          });
        }
      }
    }
    
    return recipients.sort((a, b) => {
      // Sort by student name if available, otherwise by parent name
      const nameA = a.studentName || a.parentName;
      const nameB = b.studentName || b.parentName;
      return nameA.localeCompare(nameB);
    });
  }

  // Audit log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      action?: string;
      entityType?: string;
      performedBy?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ logs: AuditLogWithUser[]; total: number }> {
    const conditions = [];
    
    if (filters?.action) {
      conditions.push(eq(auditLogs.action, filters.action as any));
    }
    if (filters?.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType as any));
    }
    if (filters?.performedBy) {
      conditions.push(eq(auditLogs.performedBy, filters.performedBy));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLogs.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLogs.createdAt, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause);
    
    const total = Number(countResult?.count || 0);

    // Get paginated logs with user info
    const logsQuery = db
      .select()
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.performedBy, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    if (whereClause) {
      logsQuery.where(whereClause);
    }

    const rows = await logsQuery;

    const logs: AuditLogWithUser[] = rows.map(row => ({
      ...row.audit_logs,
      performedByUser: row.users!,
    }));

    return { logs, total };
  }

  // ============================================================
  // Terms and Conditions Methods
  // ============================================================
  
  async getTermsAndConditions(): Promise<TermsAndConditionsWithCreator[]> {
    const rows = await db.select()
      .from(termsAndConditions)
      .leftJoin(users, eq(termsAndConditions.createdBy, users.id))
      .orderBy(desc(termsAndConditions.createdAt));
    
    return rows.map(row => ({
      ...row.terms_and_conditions,
      creator: row.users || null,
    }));
  }

  async getActiveTermsAndConditions(): Promise<TermsAndConditions | null> {
    const [result] = await db.select().from(termsAndConditions)
      .where(eq(termsAndConditions.isActive, true))
      .limit(1);
    return result || null;
  }

  async getTermsAndConditionsById(id: string): Promise<TermsAndConditions | null> {
    const [result] = await db.select().from(termsAndConditions)
      .where(eq(termsAndConditions.id, id));
    return result || null;
  }

  async createTermsAndConditions(data: InsertTermsAndConditions): Promise<TermsAndConditions> {
    // If this is set as active, deactivate all others first
    if (data.isActive) {
      await db.update(termsAndConditions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(termsAndConditions.isActive, true));
    }
    const [result] = await db.insert(termsAndConditions).values(data).returning();
    return result;
  }

  async updateTermsAndConditions(id: string, updates: UpdateTermsAndConditions): Promise<TermsAndConditions> {
    // If setting as active, deactivate all others first
    if (updates.isActive) {
      await db.update(termsAndConditions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(termsAndConditions.isActive, true), not(eq(termsAndConditions.id, id))));
    }
    const [result] = await db.update(termsAndConditions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(termsAndConditions.id, id))
      .returning();
    return result;
  }

  async deleteTermsAndConditions(id: string): Promise<void> {
    await db.delete(termsAndConditions).where(eq(termsAndConditions.id, id));
  }

  // ============================================================
  // Mock Exam Registration Methods
  // ============================================================

  async getMockExamRegistrations(mockExamEventId?: string): Promise<MockExamRegistrationWithRelations[]> {
    const whereClause = mockExamEventId 
      ? eq(mockExamRegistrations.mockExamEventId, mockExamEventId)
      : undefined;

    const rows = await db.select()
      .from(mockExamRegistrations)
      .leftJoin(mockExamEvents, eq(mockExamRegistrations.mockExamEventId, mockExamEvents.id))
      .leftJoin(students, eq(mockExamRegistrations.studentId, students.id))
      .leftJoin(users, eq(mockExamRegistrations.parentUserId, users.id))
      .leftJoin(adhocInvoices, eq(mockExamRegistrations.invoiceId, adhocInvoices.id))
      .where(whereClause)
      .orderBy(desc(mockExamRegistrations.createdAt));

    // Get exam selections for each registration
    const registrationIds = rows.map(r => r.mock_exam_registrations.id);
    const selections = registrationIds.length > 0 
      ? await db.select()
          .from(registrationExamSelections)
          .leftJoin(mockExamPapers, eq(registrationExamSelections.mockExamPaperId, mockExamPapers.id))
          .where(inArray(registrationExamSelections.registrationId, registrationIds))
      : [];

    // Get terms acceptances
    const acceptanceIds = rows
      .map(r => r.mock_exam_registrations.termsAcceptanceId)
      .filter((id): id is string => id !== null);
    const acceptances = acceptanceIds.length > 0
      ? await db.select().from(termsAcceptances)
          .where(inArray(termsAcceptances.id, acceptanceIds))
      : [];

    return rows.map(row => {
      const regId = row.mock_exam_registrations.id;
      const regSelections = selections
        .filter(s => s.registration_exam_selections.registrationId === regId)
        .map(s => ({
          ...s.registration_exam_selections,
          paper: s.mock_exam_papers!,
        }));
      
      const acceptance = acceptances.find(
        a => a.id === row.mock_exam_registrations.termsAcceptanceId
      );

      return {
        ...row.mock_exam_registrations,
        mockExamEvent: row.mock_exam_events!,
        student: row.students || null,
        parent: row.users || null,
        examSelections: regSelections,
        termsAcceptance: acceptance || null,
        invoice: row.adhoc_invoices || null,
      };
    });
  }

  async getMockExamRegistrationById(id: string): Promise<MockExamRegistrationWithRelations | null> {
    const [row] = await db.select()
      .from(mockExamRegistrations)
      .leftJoin(mockExamEvents, eq(mockExamRegistrations.mockExamEventId, mockExamEvents.id))
      .leftJoin(students, eq(mockExamRegistrations.studentId, students.id))
      .leftJoin(users, eq(mockExamRegistrations.parentUserId, users.id))
      .leftJoin(adhocInvoices, eq(mockExamRegistrations.invoiceId, adhocInvoices.id))
      .where(eq(mockExamRegistrations.id, id));

    if (!row) return null;

    // Get exam selections
    const selections = await db.select()
      .from(registrationExamSelections)
      .leftJoin(mockExamPapers, eq(registrationExamSelections.mockExamPaperId, mockExamPapers.id))
      .where(eq(registrationExamSelections.registrationId, id));

    // Get terms acceptance if exists
    let acceptance: TermsAcceptance | null = null;
    if (row.mock_exam_registrations.termsAcceptanceId) {
      const [acc] = await db.select().from(termsAcceptances)
        .where(eq(termsAcceptances.id, row.mock_exam_registrations.termsAcceptanceId));
      acceptance = acc || null;
    }

    return {
      ...row.mock_exam_registrations,
      mockExamEvent: row.mock_exam_events!,
      student: row.students || null,
      parent: row.users || null,
      examSelections: selections.map(s => ({
        ...s.registration_exam_selections,
        paper: s.mock_exam_papers!,
      })),
      termsAcceptance: acceptance,
      invoice: row.adhoc_invoices || null,
    };
  }

  async createMockExamRegistration(
    data: InsertMockExamRegistration,
    selectedPaperIds: string[]
  ): Promise<MockExamRegistration> {
    const [result] = await db.insert(mockExamRegistrations).values(data).returning();
    
    // Insert exam selections
    if (selectedPaperIds.length > 0) {
      await db.insert(registrationExamSelections).values(
        selectedPaperIds.map(paperId => ({
          registrationId: result.id,
          mockExamPaperId: paperId,
        }))
      );
    }

    // Update enrollment count on the mock exam event
    await db.update(mockExamEvents)
      .set({ 
        currentEnrollments: sql`${mockExamEvents.currentEnrollments} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(mockExamEvents.id, data.mockExamEventId));

    return result;
  }

  async updateMockExamRegistration(id: string, updates: UpdateMockExamRegistration): Promise<MockExamRegistration> {
    const [result] = await db.update(mockExamRegistrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mockExamRegistrations.id, id))
      .returning();
    return result;
  }

  async updateMockExamRegistrationStatus(
    id: string, 
    status: 'pending_tc' | 'awaiting_payment' | 'confirmed' | 'cancelled' | 'refunded'
  ): Promise<MockExamRegistration> {
    const [result] = await db.update(mockExamRegistrations)
      .set({ status, updatedAt: new Date() })
      .where(eq(mockExamRegistrations.id, id))
      .returning();
    return result;
  }

  async deleteMockExamRegistration(id: string): Promise<void> {
    // Get registration to update enrollment count
    const [reg] = await db.select().from(mockExamRegistrations)
      .where(eq(mockExamRegistrations.id, id));
    
    if (reg) {
      await db.update(mockExamEvents)
        .set({ 
          currentEnrollments: sql`GREATEST(${mockExamEvents.currentEnrollments} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(mockExamEvents.id, reg.mockExamEventId));
    }

    await db.delete(mockExamRegistrations).where(eq(mockExamRegistrations.id, id));
  }

  // ============================================================
  // Terms Acceptance Methods
  // ============================================================

  async createTermsAcceptance(data: InsertTermsAcceptance): Promise<TermsAcceptance> {
    const [result] = await db.insert(termsAcceptances).values(data).returning();
    
    // If there's a registration ID, update the registration with this acceptance
    if (data.registrationId) {
      await db.update(mockExamRegistrations)
        .set({ 
          termsAcceptanceId: result.id, 
          status: 'awaiting_payment',
          updatedAt: new Date(),
        })
        .where(eq(mockExamRegistrations.id, data.registrationId));
    }

    return result;
  }

  async getTermsAcceptance(id: string): Promise<TermsAcceptance | null> {
    const [result] = await db.select().from(termsAcceptances)
      .where(eq(termsAcceptances.id, id));
    return result || null;
  }

  async getTermsAcceptancesByRegistration(registrationId: string): Promise<TermsAcceptance[]> {
    return await db.select().from(termsAcceptances)
      .where(eq(termsAcceptances.registrationId, registrationId))
      .orderBy(desc(termsAcceptances.acceptedAt));
  }
}

export const storage = new DatabaseStorage();
