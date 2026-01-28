import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getAvailableFiscalYears, getCurrentFiscalYear } from "./storage";
import { setupAuth, isAuthenticated, seedAdminUser } from "./auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { 
  insertStudentSchema, 
  insertTimesheetEntrySchema, 
  updateStudentSchema, 
  insertUserSchema, 
  updateUserSchema,
  insertTutorTimeSlotSchema,
  updateTutorTimeSlotSchema,
  insertSlotBookingSchema,
  insertNotificationSchema,
  insertWaitlistSchema,
  updateWaitlistSchema,
  insertParentMessageSchema,
  insertParentMessageReplySchema,
  insertStudentTopicSchema,
  updateStudentTopicSchema,
  insertStudentTutorSchema,
  updateStudentTutorSchema,
  type InsertAuditLog
} from "@shared/schema";
import { z } from "zod";

// Helper function to create audit log entries
async function auditLog(
  action: InsertAuditLog['action'],
  entityType: InsertAuditLog['entityType'],
  entityId: string | null,
  performedBy: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await storage.createAuditLog({
      action,
      entityType,
      entityId,
      performedBy,
      details: details || null
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failures shouldn't break the main operation
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session-based auth middleware and routes
  setupAuth(app);
  
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);
  
  // Seed admin user on startup
  await seedAdminUser();
  
  // Start scheduled invoice processor (runs every hour)
  const INVOICE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
  setInterval(async () => {
    try {
      const processedCount = await storage.processScheduledInvoices();
      if (processedCount > 0) {
        console.log(`[Scheduled Job] Processed ${processedCount} scheduled invoice(s)`);
      }
    } catch (error) {
      console.error('[Scheduled Job] Error processing scheduled invoices:', error);
    }
  }, INVOICE_CHECK_INTERVAL);
  
  // Also run immediately on startup to catch any missed invoices
  storage.processScheduledInvoices().then(count => {
    if (count > 0) {
      console.log(`[Startup] Processed ${count} scheduled invoice(s)`);
    }
  }).catch(err => {
    console.error('[Startup] Error processing scheduled invoices:', err);
  });

  // Tutor routes
  app.get("/api/tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutors = await storage.getTutors();
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  app.post("/api/tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertUserSchema.parse(req.body);
      const tutor = await storage.createTutor(validatedData);
      await auditLog('tutor_created', 'user', tutor.id, user.id, {
        tutorName: `${tutor.firstName} ${tutor.lastName}`,
        email: tutor.email
      });
      res.status(201).json(tutor);
    } catch (error) {
      console.error("Error creating tutor:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tutor" });
    }
  });

  app.patch("/api/tutors/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = updateUserSchema.parse(req.body);
      const tutor = await storage.updateTutor(req.params.id, validatedData);
      await auditLog('tutor_updated', 'user', tutor.id, user.id, {
        tutorName: `${tutor.firstName} ${tutor.lastName}`,
        changes: validatedData
      });
      res.json(tutor);
    } catch (error) {
      console.error("Error updating tutor:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tutor" });
    }
  });

  // Archive tutor (soft delete)
  app.patch("/api/tutors/:id/archive", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (req.params.id === user.id) {
        return res.status(400).json({ message: "Cannot archive yourself" });
      }

      const tutor = await storage.archiveTutor(req.params.id);
      await auditLog('tutor_archived', 'user', tutor.id, user.id, {
        tutorName: `${tutor.firstName} ${tutor.lastName}`
      });
      res.json(tutor);
    } catch (error) {
      console.error("Error archiving tutor:", error);
      res.status(500).json({ message: "Failed to archive tutor" });
    }
  });

  // Tutor emergency contact routes
  app.get("/api/tutors/me/emergency-contact", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const emergencyContact = await storage.getTutorEmergencyContact(user.id);
      res.json(emergencyContact);
    } catch (error) {
      console.error("Error fetching emergency contact:", error);
      res.status(500).json({ message: "Failed to fetch emergency contact" });
    }
  });

  app.put("/api/tutors/me/emergency-contact", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const { emergencyContactSchema } = await import("@shared/schema");
      const validatedData = emergencyContactSchema.parse(req.body);
      const updatedUser = await storage.updateTutorEmergencyContact(user.id, validatedData);
      res.json({ 
        success: true, 
        emergencyContact: updatedUser.emergencyContact 
      });
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update emergency contact" });
    }
  });

  // Admin can view tutor emergency contact
  app.get("/api/tutors/:id/emergency-contact", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const emergencyContact = await storage.getTutorEmergencyContact(req.params.id);
      res.json(emergencyContact);
    } catch (error) {
      console.error("Error fetching tutor emergency contact:", error);
      res.status(500).json({ message: "Failed to fetch emergency contact" });
    }
  });

  // Admin notifications route
  app.get("/api/admin/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allNotifications = await storage.getAdminNotifications();
      res.json(allNotifications);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get all parent users (for linking to students)
  app.get("/api/parent-users", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const parentUsers = await storage.getParentUsers();
      res.json(parentUsers);
    } catch (error) {
      console.error("Error fetching parent users:", error);
      res.status(500).json({ message: "Failed to fetch parent users" });
    }
  });

  // Restore tutor
  app.patch("/api/tutors/:id/restore", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutor = await storage.restoreTutor(req.params.id);
      await auditLog('tutor_restored', 'user', tutor.id, user.id, {
        tutorName: `${tutor.firstName} ${tutor.lastName}`
      });
      res.json(tutor);
    } catch (error) {
      console.error("Error restoring tutor:", error);
      res.status(500).json({ message: "Failed to restore tutor" });
    }
  });

  // Get all tutors including inactive (ex-tutors)
  app.get("/api/tutors/all", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutors = await storage.getTutors(true);
      res.json(tutors);
    } catch (error) {
      console.error("Error fetching all tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutors" });
    }
  });

  // Get all additional staff members (admin only)
  app.get("/api/additional-staff", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const staff = await storage.getAdditionalStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching additional staff:", error);
      res.status(500).json({ message: "Failed to fetch additional staff" });
    }
  });

  // Update additional staff hourly rate (admin only)
  app.patch("/api/additional-staff/:id/rate", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { hourlyRate } = req.body;
      const staffId = req.params.id;

      // Validate hourlyRate is a valid non-negative number
      if (hourlyRate !== null && hourlyRate !== undefined && hourlyRate !== "") {
        const rate = parseFloat(hourlyRate);
        if (isNaN(rate)) {
          return res.status(400).json({ message: "Hourly rate must be a valid number" });
        }
        if (rate < 0) {
          return res.status(400).json({ message: "Hourly rate cannot be negative" });
        }
      }

      const updatedStaff = await storage.updateUser(staffId, {
        staffHourlyRate: hourlyRate ? parseFloat(hourlyRate).toFixed(2) : null
      });

      await auditLog('user_updated', 'user', staffId, user.id, {
        staffName: `${updatedStaff.firstName} ${updatedStaff.lastName}`,
        staffHourlyRate: hourlyRate
      });

      res.json(updatedStaff);
    } catch (error) {
      console.error("Error updating staff rate:", error);
      res.status(500).json({ message: "Failed to update staff rate" });
    }
  });

  // Student routes
  app.get("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let students;
      if (user.role === "admin") {
        students = await storage.getStudents();
      } else {
        students = await storage.getStudentsByTutor(user.id);
      }
      
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get only students assigned to the current user (for tutor view)
  app.get("/api/students/my", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Always return only students assigned to this user, regardless of admin status
      const students = await storage.getStudentsByTutor(user.id);
      res.json(students);
    } catch (error) {
      console.error("Error fetching my students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Extract session scheduling fields and invoice settings
      const { sessionDayOfWeek, sessionStartTime, sessionDurationMinutes, sessionSchedules, sendInitialInvoice, invoiceSendDate, recurringInvoiceSendDate, ...studentData } = req.body;

      // Parse recurring invoice send date if provided
      const parsedRecurringSendDate = recurringInvoiceSendDate ? new Date(recurringInvoiceSendDate) : null;
      const isRecurringScheduledForFuture = parsedRecurringSendDate && parsedRecurringSendDate > new Date();

      // Handle multiple session schedules - use first one for student record (backward compat)
      const validSessionSchedules = Array.isArray(sessionSchedules) 
        ? sessionSchedules.filter((s: any) => s.dayOfWeek !== undefined && s.startTime && s.startTime.trim() !== "")
        : [];
      const firstSession = validSessionSchedules[0];

      // Convert numeric rates to strings for database decimal columns
      // tutorId and tutorRate are now optional - tutor assignment is managed via Allocations
      const dataToValidate = {
        ...studentData,
        parentRate: String(studentData.parentRate || 0),
        tutorRate: String(studentData.tutorRate || 0),
        tutorId: studentData.tutorId || null,
        autoInvoiceEnabled: studentData.autoInvoiceEnabled || false,
        defaultSessionPack: studentData.defaultSessionPack || 4,
        recurringInvoiceSendDate: isRecurringScheduledForFuture ? parsedRecurringSendDate : null,
        // Store first session schedule on student record for backward compatibility
        sessionDayOfWeek: firstSession ? firstSession.dayOfWeek : (sessionDayOfWeek !== undefined && sessionDayOfWeek !== "" ? parseInt(sessionDayOfWeek) : null),
        sessionStartTime: firstSession ? firstSession.startTime : (sessionStartTime && sessionStartTime.trim() !== "" ? sessionStartTime : null),
        sessionDurationMinutes: firstSession ? firstSession.durationMinutes : (sessionDurationMinutes ? parseInt(sessionDurationMinutes) : 60),
      };

      const validatedData = insertStudentSchema.parse(dataToValidate);
      const student = await storage.createStudent(validatedData);

      // Get tutorId - first check student, then look for primary allocation
      let effectiveTutorId = student.tutorId;
      if (!effectiveTutorId) {
        const studentTutors = await storage.getStudentTutors(student.id);
        const primaryTutor = studentTutors.find(st => st.isPrimary && st.isActive) || studentTutors.find(st => st.isActive);
        effectiveTutorId = primaryTutor?.tutorId || null;
      }

      // Create recurring session templates for all provided schedules
      if (validSessionSchedules.length > 0) {
        for (const schedule of validSessionSchedules) {
          // Use schedule-specific tutorId if provided, otherwise fall back to effectiveTutorId
          const sessionTutorId = schedule.tutorId || effectiveTutorId;
          
          if (!sessionTutorId) {
            console.log(`Skipping session schedule without tutor for student ${student.id}`);
            continue;
          }
          
          const templateData = {
            tutorId: sessionTutorId,
            studentId: student.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            durationMinutes: schedule.durationMinutes || 60,
            subject: (student.subjects && student.subjects.length > 0) ? student.subjects[0] : undefined,
            classType: student.classType || "individual",
            startDate: new Date(),
            isActive: true,
            createdBy: user.id,
          };

          const template = await storage.createRecurringSessionTemplate(templateData);
          
          // Generate session occurrences for the next 12 months
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          await storage.generateSessionOccurrences(template.id, oneYearFromNow);
        }
      }

      // Create initial invoice if requested
      if (sendInitialInvoice && student.sessionsBooked > 0) {
        try {
          const invoiceNumber = `INV-${Date.now()}-${student.id.slice(-4)}`;
          const parentRate = parseFloat(student.parentRate?.toString() || "0");
          const amount = parentRate * student.sessionsBooked;
          
          // Check if a scheduled send date is provided
          const scheduledDate = invoiceSendDate ? new Date(invoiceSendDate) : null;
          const isScheduledForFuture = scheduledDate && scheduledDate > new Date();
          
          // Due date is 5 days from send date (or scheduled date)
          const baseDate = isScheduledForFuture ? scheduledDate : new Date();
          const dueDate = new Date(baseDate);
          dueDate.setDate(dueDate.getDate() + 5);
          
          await storage.createInvoice({
            invoiceNumber,
            studentId: student.id,
            invoiceType: "manual",
            sessionsIncluded: student.sessionsBooked,
            amount: amount.toFixed(2),
            status: isScheduledForFuture ? "scheduled" : "sent",
            scheduledSendDate: isScheduledForFuture ? scheduledDate : null,
            sentAt: isScheduledForFuture ? null : new Date(),
            dueDate,
            notes: isScheduledForFuture 
              ? `Initial session pack - ${student.sessionsBooked} sessions (scheduled to send on ${scheduledDate.toLocaleDateString()})`
              : `Initial session pack - ${student.sessionsBooked} sessions`,
          });
        } catch (invoiceError) {
          console.error("Error creating initial invoice:", invoiceError);
          // Don't fail the student creation if invoice fails
        }
      }

      await auditLog('student_created', 'student', student.id, user.id, {
        studentName: student.name,
        parentName: studentData.parentName
      });
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.patch("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get current student state before update to check for auto-invoice trigger
      const existingStudent = await storage.getStudent(req.params.id);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Extract session scheduling fields and date fields that need conversion
      const { sessionDayOfWeek, sessionStartTime, sessionDurationMinutes, sessionSchedules, recurringInvoiceSendDate, ...studentData } = req.body;

      // Handle multiple session schedules - use first one for student record (backward compat)
      const validSessionSchedules = Array.isArray(sessionSchedules) 
        ? sessionSchedules.filter((s: any) => s.dayOfWeek !== undefined && s.startTime && s.startTime.trim() !== "")
        : [];
      const firstSession = validSessionSchedules[0];

      // Convert date string to Date object if provided
      const parsedRecurringSendDate = recurringInvoiceSendDate ? new Date(recurringInvoiceSendDate) : undefined;

      // Include session schedule fields in the student update
      const dataWithSchedule = {
        ...studentData,
        sessionDayOfWeek: firstSession ? firstSession.dayOfWeek : (sessionDayOfWeek !== undefined && sessionDayOfWeek !== "" ? parseInt(sessionDayOfWeek) : null),
        sessionStartTime: firstSession ? firstSession.startTime : (sessionStartTime && sessionStartTime.trim() !== "" ? sessionStartTime : null),
        sessionDurationMinutes: firstSession ? firstSession.durationMinutes : (sessionDurationMinutes ? parseInt(sessionDurationMinutes) : 60),
        ...(parsedRecurringSendDate !== undefined && { recurringInvoiceSendDate: parsedRecurringSendDate }),
      };

      const validatedData = updateStudentSchema.parse(dataWithSchedule);
      const student = await storage.updateStudent(req.params.id, validatedData);

      // Check if we need to trigger auto-invoice generation
      // Conditions: auto-invoice enabled, sessions changed to 0 from a higher value
      const previousSessions = existingStudent.sessionsRemaining;
      const newSessions = student.sessionsRemaining;
      const shouldGenerateInvoice = 
        student.autoInvoiceEnabled &&
        previousSessions > 0 &&
        newSessions <= 0 &&
        student.defaultSessionPack &&
        student.defaultSessionPack > 0;

      if (shouldGenerateInvoice) {
        try {
          const invoice = await storage.generateParentInvoiceForStudent(student.id, student.defaultSessionPack!);
          if (invoice) {
            console.log(`[Auto-Invoice] Generated invoice ${invoice.invoiceNumber} for ${student.name} (manual session update)`);
          }
        } catch (invoiceError) {
          console.error("Error generating auto-invoice:", invoiceError);
          // Don't fail the update if invoice generation fails
        }
      }

      // Get tutorId - first check student, then look for primary allocation
      let effectiveTutorId = student.tutorId;
      if (!effectiveTutorId) {
        const studentTutors = await storage.getStudentTutors(student.id);
        const primaryTutor = studentTutors.find(st => st.isPrimary && st.isActive) || studentTutors.find(st => st.isActive);
        effectiveTutorId = primaryTutor?.tutorId || null;
      }

      // Handle multiple session schedules
      // Get existing templates for this student (excluding group sessions)
      const allTemplates = await storage.getRecurringSessionTemplates(undefined, student.id);
      const existingTemplates = allTemplates.filter(t => !t.groupId && t.isActive);
      
      // Check if any sessions have tutorId specified (allow per-session tutors)
      const hasTutorsForSessions = validSessionSchedules.some((s: any) => s.tutorId || effectiveTutorId);
      
      if (validSessionSchedules.length > 0 && hasTutorsForSessions) {
        // Track which existing templates should be kept (by matching id from incoming sessions)
        const incomingTemplateIds = new Set(validSessionSchedules.filter((s: any) => s.id).map((s: any) => s.id));
        
        // Deactivate templates that are no longer in the list and delete their future occurrences
        for (const existing of existingTemplates) {
          if (!incomingTemplateIds.has(existing.id)) {
            await storage.deleteFutureSessionOccurrences(existing.id);
            await storage.updateRecurringSessionTemplate(existing.id, { isActive: false });
          }
        }
        
        // Process each incoming session
        for (const schedule of validSessionSchedules) {
          if (schedule.id) {
            // Updating existing template - preserve existing tutorId if not specified
            const existingTemplate = existingTemplates.find(t => t.id === schedule.id);
            const sessionTutorId = schedule.tutorId || existingTemplate?.tutorId || effectiveTutorId;
            
            if (!sessionTutorId) {
              console.log(`Skipping session schedule without tutor for student ${student.id}`);
              continue;
            }
            
            // Update existing template
            await storage.updateRecurringSessionTemplate(schedule.id, {
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              durationMinutes: schedule.durationMinutes || 60,
              tutorId: sessionTutorId,
              isActive: true,
            });
            
            // Regenerate future occurrences
            await storage.deleteFutureSessionOccurrences(schedule.id);
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            await storage.generateSessionOccurrences(schedule.id, oneYearFromNow);
          } else {
            // Creating new template - use schedule-specific tutorId or fall back to effectiveTutorId
            const newSessionTutorId = schedule.tutorId || effectiveTutorId;
            
            if (!newSessionTutorId) {
              console.log(`Skipping new session schedule without tutor for student ${student.id}`);
              continue;
            }
            
            // Create new template
            const templateData = {
              tutorId: newSessionTutorId,
              studentId: student.id,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              durationMinutes: schedule.durationMinutes || 60,
              subject: (student.subjects && student.subjects.length > 0) ? student.subjects[0] : undefined,
              classType: student.classType || "individual",
              startDate: new Date(),
              isActive: true,
              createdBy: user.id,
            };
            const template = await storage.createRecurringSessionTemplate(templateData);
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            await storage.generateSessionOccurrences(template.id, oneYearFromNow);
          }
        }
      } else {
        // No sessions provided OR no tutor assigned - deactivate all individual recurring templates 
        // and delete their future occurrences to keep calendar clean
        for (const existing of existingTemplates) {
          await storage.deleteFutureSessionOccurrences(existing.id);
          await storage.updateRecurringSessionTemplate(existing.id, { isActive: false });
        }
      }

      await auditLog('student_updated', 'student', student.id, user.id, {
        studentName: student.name,
        changes: studentData
      });
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Archive student (soft delete)
  app.patch("/api/students/:id/archive", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const student = await storage.archiveStudent(req.params.id);
      await auditLog('student_archived', 'student', student.id, user.id, {
        studentName: student.name
      });
      res.json(student);
    } catch (error) {
      console.error("Error archiving student:", error);
      res.status(500).json({ message: "Failed to archive student" });
    }
  });

  // Restore student
  app.patch("/api/students/:id/restore", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const student = await storage.restoreStudent(req.params.id);
      await auditLog('student_restored', 'student', student.id, user.id, {
        studentName: student.name
      });
      res.json(student);
    } catch (error) {
      console.error("Error restoring student:", error);
      res.status(500).json({ message: "Failed to restore student" });
    }
  });

  // Permanently delete archived student
  app.delete("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await auditLog('student_deleted', 'student', req.params.id, user.id, {});
      await storage.deleteStudent(req.params.id);
      res.json({ message: "Student permanently deleted" });
    } catch (error: any) {
      console.error("Error deleting student:", error);
      res.status(400).json({ message: error.message || "Failed to delete student" });
    }
  });

  // Get all students including inactive (ex-students)
  app.get("/api/students/all", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const students = await storage.getStudents(true);
      res.json(students);
    } catch (error) {
      console.error("Error fetching all students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get student invoice summaries (outstanding invoices and unpaid sessions)
  app.get("/api/students/invoice-summaries", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const summaries = await storage.getStudentInvoiceSummaries();
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching student invoice summaries:", error);
      res.status(500).json({ message: "Failed to fetch invoice summaries" });
    }
  });

  // Timesheet routes
  // Get all sessions for the current tutor
  app.get("/api/timesheets/my-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all sessions for this tutor (no date filter)
      const timesheets = await storage.getTimesheetEntries(user.id, undefined, undefined);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching my sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Get all sessions for admin view
  app.get("/api/timesheets/all", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const timesheets = await storage.getTimesheetEntries(undefined, undefined, undefined);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching all timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  // Route for path-based date parameters (used by frontend queryKey)
  app.get("/api/timesheets/:startDate/:endDate", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { startDate, endDate } = req.params;
      const tutorId = user.role === "admin" ? undefined : user.id;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const timesheets = await storage.getTimesheetEntries(tutorId, start, end);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.get("/api/timesheets", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { startDate, endDate, status } = req.query;
      
      let timesheets;
      if (status && user.role === "admin") {
        timesheets = await storage.getTimesheetEntriesByStatus(status as "pending" | "approved" | "rejected");
      } else {
        const tutorId = user.role === "admin" ? undefined : user.id;
        const start = startDate ? new Date(startDate as string) : undefined;
        const end = endDate ? new Date(endDate as string) : undefined;
        timesheets = await storage.getTimesheetEntries(tutorId, start, end);
      }
      
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.post("/api/timesheets", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { 
        studentId, 
        date, 
        duration, 
        notes, 
        sessionSubject, 
        otherTopicsText, 
        sessionOccurrenceId,
        sessionType,
        workTypeId,
        workTypeName,
        weekPeriodStart,
        weekPeriodEnd
      } = req.body;
      
      // For "other" session type, studentId is not required
      const isOtherType = sessionType === "other";
      
      if (!isOtherType && !studentId) {
        return res.status(400).json({ message: "Missing required field: studentId" });
      }
      if (!date || duration === undefined) {
        return res.status(400).json({ message: "Missing required fields: date, duration" });
      }
      
      // Validate "other" type specific fields
      if (isOtherType) {
        if (!workTypeId) {
          return res.status(400).json({ message: "Missing required field for Other type: workTypeId" });
        }
        if (!weekPeriodStart || !weekPeriodEnd) {
          return res.status(400).json({ message: "Missing required fields for Other type: weekPeriodStart, weekPeriodEnd" });
        }
        if (!notes || !notes.trim()) {
          return res.status(400).json({ message: "Notes are required for Other type work entries" });
        }
      }
      
      // Validate sessionType enum
      const validSessionTypes = ["individual", "group", "other"];
      if (sessionType && !validSessionTypes.includes(sessionType)) {
        return res.status(400).json({ message: "Invalid session type. Must be 'individual', 'group', or 'other'" });
      }

      // Validate that the date is not in the future
      const sessionDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (sessionDate > today) {
        return res.status(400).json({ message: "Cannot log sessions for future dates" });
      }

      // Calculate earnings for "other" type based on work type payment method
      let calculatedEarnings = "0";
      if (isOtherType && workTypeId) {
        // Fetch the work type to check payment type
        const workTypeRecord = await storage.getWorkType(workTypeId);
        if (workTypeRecord) {
          if (workTypeRecord.paymentType === "flat_fee" && workTypeRecord.flatFeeAmount) {
            // Flat fee: use the configured flat fee amount regardless of hours
            calculatedEarnings = parseFloat(workTypeRecord.flatFeeAmount).toFixed(2);
          } else if (user.staffHourlyRate) {
            // Hourly: use staff hourly rate × duration
            const hourlyRate = parseFloat(user.staffHourlyRate);
            const durationHours = parseFloat(String(duration));
            if (!isNaN(hourlyRate) && !isNaN(durationHours)) {
              calculatedEarnings = (hourlyRate * durationHours).toFixed(2);
            }
          }
        }
      }

      const timesheet = await storage.createTimesheetEntry({
        tutorId: user.id,
        studentId: isOtherType ? null : String(studentId),
        date: new Date(date),
        duration: String(duration),
        notes: notes || null,
        sessionSubject: sessionSubject || null,
        otherTopicsText: otherTopicsText || null,
        sessionOccurrenceId: sessionOccurrenceId || null,
        sessionType: sessionType || "individual",
        workTypeId: workTypeId || null,
        workTypeName: workTypeName || null,
        weekPeriodStart: weekPeriodStart ? new Date(weekPeriodStart) : null,
        weekPeriodEnd: weekPeriodEnd ? new Date(weekPeriodEnd) : null,
        tutorEarnings: calculatedEarnings, // Calculated from staffHourlyRate if available
        parentBilling: "0", // No parent billing for "other" type
      });
      
      // If linked to a calendar session, mark it as completed
      if (sessionOccurrenceId) {
        try {
          await storage.updateSessionOccurrence(sessionOccurrenceId, { status: "completed" });
        } catch (err) {
          console.error("Error updating session occurrence status:", err);
          // Don't fail the timesheet creation if this fails
        }
      }
      
      res.status(201).json(timesheet);
    } catch (error) {
      console.error("Error creating timesheet:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create timesheet entry" });
    }
  });

  app.patch("/api/timesheets/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const timesheet = await storage.updateTimesheetEntryStatus(req.params.id, status);
      res.json(timesheet);
    } catch (error) {
      console.error("Error updating timesheet status:", error);
      res.status(500).json({ message: "Failed to update timesheet status" });
    }
  });

  // Weekly Timesheet Routes
  // Get current week's timesheet for the logged-in tutor
  app.get("/api/weekly-timesheets/current", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate current week boundaries (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const timesheet = await storage.getOrCreateWeeklyTimesheet(user.id, weekStart, weekEnd);
      const fullTimesheet = await storage.getWeeklyTimesheet(timesheet.id);
      
      res.json(fullTimesheet);
    } catch (error) {
      console.error("Error fetching current weekly timesheet:", error);
      res.status(500).json({ message: "Failed to fetch current weekly timesheet" });
    }
  });

  // Get all weekly timesheets for the logged-in tutor
  app.get("/api/weekly-timesheets/my", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const timesheets = await storage.getWeeklyTimesheetsByTutor(user.id);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching weekly timesheets:", error);
      res.status(500).json({ message: "Failed to fetch weekly timesheets" });
    }
  });

  // Get submitted timesheets for admin review
  app.get("/api/weekly-timesheets/submitted", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const timesheets = await storage.getWeeklyTimesheetsByStatus("submitted");
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching submitted timesheets:", error);
      res.status(500).json({ message: "Failed to fetch submitted timesheets" });
    }
  });

  // Get all weekly timesheets for admin legacy view (includes all statuses)
  app.get("/api/weekly-timesheets/all", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const timesheets = await storage.getAllWeeklyTimesheets();
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching all weekly timesheets:", error);
      res.status(500).json({ message: "Failed to fetch weekly timesheets" });
    }
  });

  // Get a specific weekly timesheet
  app.get("/api/weekly-timesheets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const timesheet = await storage.getWeeklyTimesheet(req.params.id);
      
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }

      // Tutors can only see their own timesheets
      if (user.role !== "admin" && timesheet.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(timesheet);
    } catch (error) {
      console.error("Error fetching weekly timesheet:", error);
      res.status(500).json({ message: "Failed to fetch weekly timesheet" });
    }
  });

  // Submit a weekly timesheet for approval
  app.post("/api/weekly-timesheets/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const timesheet = await storage.getWeeklyTimesheet(req.params.id);
      
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }

      // Only the owner can submit their timesheet
      if (timesheet.tutorId !== user.id) {
        return res.status(403).json({ message: "You can only submit your own timesheets" });
      }

      if (timesheet.status !== "draft" && timesheet.status !== "rejected") {
        return res.status(400).json({ message: "Timesheet has already been submitted or approved" });
      }

      if (timesheet.entries.length === 0) {
        return res.status(400).json({ message: "Cannot submit an empty timesheet" });
      }

      const submitted = await storage.submitWeeklyTimesheet(req.params.id);
      res.json(submitted);
    } catch (error) {
      console.error("Error submitting weekly timesheet:", error);
      res.status(500).json({ message: "Failed to submit weekly timesheet" });
    }
  });

  // Approve or reject a weekly timesheet (admin only)
  app.patch("/api/weekly-timesheets/:id/review", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, notes } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      const timesheet = await storage.getWeeklyTimesheet(req.params.id);
      
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }

      if (timesheet.status !== "submitted") {
        return res.status(400).json({ message: "Only submitted timesheets can be reviewed" });
      }

      const reviewed = await storage.reviewWeeklyTimesheet(req.params.id, user.id, status, notes);
      res.json(reviewed);
    } catch (error) {
      console.error("Error reviewing weekly timesheet:", error);
      res.status(500).json({ message: "Failed to review weekly timesheet" });
    }
  });

  // Update a timesheet entry (admin only)
  app.patch("/api/timesheet-entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { tutorEarnings, parentBilling, duration, notes } = req.body;
      
      const updates: { tutorEarnings?: string; parentBilling?: string; duration?: string; notes?: string } = {};
      if (tutorEarnings !== undefined) updates.tutorEarnings = String(tutorEarnings);
      if (parentBilling !== undefined) updates.parentBilling = String(parentBilling);
      if (duration !== undefined) updates.duration = String(duration);
      if (notes !== undefined) updates.notes = notes;

      const updated = await storage.updateTimesheetEntry(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating timesheet entry:", error);
      res.status(500).json({ message: "Failed to update timesheet entry" });
    }
  });

  // Tutor route to update their own entries in rejected/draft timesheets
  app.patch("/api/timesheet-entries/:id/tutor", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      const { date, duration, notes } = req.body;
      
      const updates: { date?: Date; duration?: number; notes?: string } = {};
      if (date !== undefined) updates.date = new Date(date);
      if (duration !== undefined) updates.duration = Number(duration);
      if (notes !== undefined) updates.notes = notes;

      const updated = await storage.updateTimesheetEntryByTutor(req.params.id, user.id, updates);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating timesheet entry by tutor:", error);
      res.status(error.message?.includes("only edit") || error.message?.includes("only delete") ? 403 : 500)
        .json({ message: error.message || "Failed to update timesheet entry" });
    }
  });

  // Tutor route to delete their own entries in rejected/draft timesheets
  app.delete("/api/timesheet-entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      await storage.deleteTimesheetEntry(req.params.id, user.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting timesheet entry:", error);
      res.status(error.message?.includes("only") ? 403 : 500)
        .json({ message: error.message || "Failed to delete timesheet entry" });
    }
  });

  // Get timesheet status history
  app.get("/api/weekly-timesheets/:id/history", isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getTimesheetStatusHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching timesheet status history:", error);
      res.status(500).json({ message: "Failed to fetch status history" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/tutor-earnings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const earnings = await storage.getTutorWeeklyEarnings(
        user.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json({ earnings });
    } catch (error) {
      console.error("Error fetching tutor earnings:", error);
      res.status(500).json({ message: "Failed to fetch tutor earnings" });
    }
  });

  app.get("/api/analytics/tutor-weeks", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const weeks = await storage.getTutorWeeks(user.id);
      res.json(weeks);
    } catch (error) {
      console.error("Error fetching tutor weeks:", error);
      res.status(500).json({ message: "Failed to fetch tutor weeks" });
    }
  });

  app.get("/api/analytics/admin-stats", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const fiscalYear = req.query.fiscalYear ? parseInt(req.query.fiscalYear as string) : undefined;
      const stats = await storage.getAdminStats(fiscalYear);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get available fiscal years for dropdown filters
  app.get("/api/analytics/fiscal-years", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const fiscalYears = getAvailableFiscalYears();
      const currentFY = getCurrentFiscalYear();
      res.json({ fiscalYears, currentFiscalYear: currentFY });
    } catch (error) {
      console.error("Error fetching fiscal years:", error);
      res.status(500).json({ message: "Failed to fetch fiscal years" });
    }
  });

  // Admin: View a specific tutor's earnings (what the tutor sees)
  app.get("/api/analytics/tutor-earnings/:tutorId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { tutorId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const earnings = await storage.getTutorWeeklyEarnings(
        tutorId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      // Also get the detailed entries so admin can see breakdown
      const entries = await storage.getTimesheetEntries(
        tutorId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json({ earnings, entries });
    } catch (error) {
      console.error("Error fetching tutor earnings for admin:", error);
      res.status(500).json({ message: "Failed to fetch tutor earnings" });
    }
  });

  // Time slot routes
  app.get("/api/slots", isAuthenticated, async (req: any, res) => {
    try {
      const { tutorId, startDate, endDate, subject } = req.query;
      
      const slots = await storage.getAvailableSlots(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        tutorId as string,
        subject as string
      );
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ message: "Failed to fetch available slots" });
    }
  });

  app.get("/api/tutor/slots", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "tutor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      const { startDate, endDate } = req.query;
      const tutorId = user.role === "admin" ? req.query.tutorId : user.id;
      
      const slots = await storage.getTutorTimeSlots(
        tutorId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(slots);
    } catch (error) {
      console.error("Error fetching tutor slots:", error);
      res.status(500).json({ message: "Failed to fetch tutor slots" });
    }
  });

  app.post("/api/tutor/slots", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "tutor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      const validatedData = insertTutorTimeSlotSchema.parse({
        ...req.body,
        tutorId: user.role === "admin" ? req.body.tutorId : user.id
      });
      
      const slot = await storage.createTutorTimeSlot(validatedData);
      res.status(201).json(slot);
    } catch (error) {
      console.error("Error creating time slot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  app.patch("/api/tutor/slots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "tutor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      const validatedData = updateTutorTimeSlotSchema.parse(req.body);
      const slot = await storage.updateTutorTimeSlot(req.params.id, validatedData);
      res.json(slot);
    } catch (error) {
      console.error("Error updating time slot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update time slot" });
    }
  });

  app.delete("/api/tutor/slots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "tutor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      await storage.deleteTutorTimeSlot(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting time slot:", error);
      res.status(500).json({ message: "Failed to delete time slot" });
    }
  });

  // Get tutor annual earnings
  app.get("/api/tutor/earnings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "tutor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const earnings = await storage.getTutorAnnualEarnings(user.id, year);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching tutor earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // Internal admin booking assignment (replaces public booking)
  app.get("/api/admin/slot-assignments", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { studentId, slotId } = req.query;
      const bookings = await storage.getSlotBookings(studentId as string, slotId as string);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching slot assignments:", error);
      res.status(500).json({ message: "Failed to fetch slot assignments" });
    }
  });

  app.post("/api/admin/assign-student", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertSlotBookingSchema.parse(req.body);
      const booking = await storage.createSlotBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error assigning student to slot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to assign student" });
    }
  });

  app.delete("/api/admin/unassign-student/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const booking = await storage.cancelSlotBooking(req.params.id);
      res.json(booking);
    } catch (error) {
      console.error("Error unassigning student:", error);
      res.status(500).json({ message: "Failed to unassign student" });
    }
  });

  // Attendance marking
  app.post("/api/slots/:id/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "tutor" && user.role !== "admin")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      const { presentStudentIds } = req.body;
      if (!Array.isArray(presentStudentIds)) {
        return res.status(400).json({ message: "presentStudentIds must be an array" });
      }

      const timesheetEntries = await storage.markAttendance(req.params.id, presentStudentIds);
      res.json(timesheetEntries);
    } catch (error) {
      console.error("Error marking attendance:", error);
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      const notifications = await storage.getNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Session Logging Alert Routes
  
  // Check for overdue sessions and create alerts (called periodically or manually by admin)
  app.post("/api/session-alerts/check", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Find sessions that are overdue (completed >24h ago, not logged, no existing alert)
      const overdueSessions = await storage.getOverdueSessionsForAlerts();
      
      // Create alerts for each overdue session
      const createdAlerts = [];
      for (const session of overdueSessions) {
        try {
          const alert = await storage.createSessionLoggingAlert({
            sessionOccurrenceId: session.id,
            tutorId: session.tutorId,
            studentId: session.studentId || undefined,
            sessionEndTime: session.endDateTime,
            status: "pending",
          });
          createdAlerts.push(alert);
        } catch (err) {
          console.error(`Failed to create alert for session ${session.id}:`, err);
        }
      }

      res.json({ 
        message: `Created ${createdAlerts.length} new alerts`,
        alertsCreated: createdAlerts.length,
        overdueSessionsFound: overdueSessions.length
      });
    } catch (error) {
      console.error("Error checking for overdue sessions:", error);
      res.status(500).json({ message: "Failed to check for overdue sessions" });
    }
  });

  // Get session logging alerts (for admin or tutor)
  app.get("/api/session-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      const { status } = req.query;
      
      // Tutors only see their own alerts, admins see all
      const tutorId = user.role === "tutor" ? user.id : undefined;
      
      const alerts = await storage.getSessionLoggingAlerts(tutorId, status as string | undefined);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching session alerts:", error);
      res.status(500).json({ message: "Failed to fetch session alerts" });
    }
  });

  // Get tutor compliance metrics
  app.get("/api/session-alerts/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { tutorId } = req.query;
      const metrics = await storage.getTutorComplianceMetrics(tutorId as string | undefined);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching compliance metrics:", error);
      res.status(500).json({ message: "Failed to fetch compliance metrics" });
    }
  });

  // Dismiss an alert (admin only)
  app.post("/api/session-alerts/:id/dismiss", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Dismiss reason is required" });
      }

      const alert = await storage.dismissSessionLoggingAlert(req.params.id, user.id, reason);
      res.json(alert);
    } catch (error) {
      console.error("Error dismissing session alert:", error);
      res.status(500).json({ message: "Failed to dismiss session alert" });
    }
  });

  // Invoice Payment Alert Routes
  
  // Check for overdue invoices and create alerts (admin only)
  app.post("/api/invoice-alerts/check", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Find invoices that are overdue (sent >2 days ago, not paid, no existing alert)
      const overdueInvoices = await storage.getOverdueInvoicesForAlerts();
      
      // Create alerts for each overdue invoice
      const createdAlerts = [];
      for (const invoice of overdueInvoices) {
        try {
          // Get the student to find the parent
          const student = await storage.getStudent(invoice.studentId);
          
          // Calculate due date (5 days from sent date)
          const dueDate = new Date(invoice.sentAt!);
          dueDate.setDate(dueDate.getDate() + 5);
          
          const alert = await storage.createInvoicePaymentAlert({
            invoiceId: invoice.id,
            parentId: student?.parentId || undefined,
            studentId: invoice.studentId,
            invoiceSentAt: invoice.sentAt!,
            dueDate: dueDate,
            status: "pending",
          });
          createdAlerts.push(alert);
        } catch (err) {
          console.error(`Failed to create alert for invoice ${invoice.id}:`, err);
        }
      }

      res.json({ 
        message: `Created ${createdAlerts.length} new invoice alerts`,
        alertsCreated: createdAlerts.length,
        overdueInvoicesFound: overdueInvoices.length
      });
    } catch (error) {
      console.error("Error checking for overdue invoices:", error);
      res.status(500).json({ message: "Failed to check for overdue invoices" });
    }
  });

  // Get invoice payment alerts (for admin or parent)
  app.get("/api/invoice-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      const { status } = req.query;
      
      // Parents only see their own alerts, admins see all
      const parentId = user.role === "parent" ? user.id : undefined;
      
      const alerts = await storage.getInvoicePaymentAlerts(parentId, status as string | undefined);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching invoice payment alerts:", error);
      res.status(500).json({ message: "Failed to fetch invoice payment alerts" });
    }
  });

  // Get parent payment compliance metrics (admin only)
  app.get("/api/invoice-alerts/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const metrics = await storage.getParentPaymentComplianceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching payment compliance metrics:", error);
      res.status(500).json({ message: "Failed to fetch payment compliance metrics" });
    }
  });

  // Dismiss an invoice payment alert (admin only)
  app.post("/api/invoice-alerts/:id/dismiss", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Dismiss reason is required" });
      }

      const alert = await storage.dismissInvoicePaymentAlert(req.params.id, user.id, reason);
      res.json(alert);
    } catch (error) {
      console.error("Error dismissing invoice alert:", error);
      res.status(500).json({ message: "Failed to dismiss invoice alert" });
    }
  });

  // Send invoice payment reminders to parents (admin only)
  app.post("/api/invoice-reminders/send", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = await storage.checkAndSendInvoiceReminders();
      const totalSent = result.reminder2Days + result.reminder4Days + result.reminder5Days;
      
      res.json({
        message: `Sent ${totalSent} invoice reminders`,
        ...result,
        totalSent,
      });
    } catch (error) {
      console.error("Error sending invoice reminders:", error);
      res.status(500).json({ message: "Failed to send invoice reminders" });
    }
  });

  // Parent marks invoice as "I've paid" (parent only)
  app.post("/api/invoices/:id/claim-paid", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      // Verify the invoice belongs to one of the parent's students
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const student = await storage.getStudent(invoice.studentId);
      if (!student || student.parentId !== user.id) {
        return res.status(403).json({ message: "Not authorized to access this invoice" });
      }

      const updated = await storage.markInvoiceAsPaidByParent(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Error marking invoice as paid by parent:", error);
      res.status(500).json({ message: "Failed to mark invoice as paid" });
    }
  });

  // Admin confirms invoice is paid
  app.post("/api/invoices/:id/confirm-paid", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updated = await storage.confirmInvoicePaid(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Error confirming invoice as paid:", error);
      res.status(500).json({ message: "Failed to confirm invoice payment" });
    }
  });

  // Tutor Invoice Routes
  app.get("/api/tutor-invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const invoices = await storage.getTutorInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching tutor invoices:", error);
      res.status(500).json({ message: "Failed to fetch tutor invoices" });
    }
  });

  app.get("/api/tutor-invoices/this-week", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const invoices = await storage.getTutorInvoicesThisWeek();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching tutor invoices this week:", error);
      res.status(500).json({ message: "Failed to fetch tutor invoices" });
    }
  });

  app.post("/api/tutor-invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      // Generate invoice number
      const now = new Date();
      const invoiceNumber = `TI-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const invoice = await storage.createTutorInvoice({
        ...req.body,
        tutorId: user.id,
        invoiceNumber,
      });
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating tutor invoice:", error);
      res.status(500).json({ message: "Failed to create tutor invoice" });
    }
  });

  app.patch("/api/tutor-invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updated = await storage.updateTutorInvoice(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating tutor invoice:", error);
      res.status(500).json({ message: "Failed to update tutor invoice" });
    }
  });

  // Financial Ledger (Legacy tab - all paid invoices in/out)
  app.get("/api/financial-ledger", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const ledger = await storage.getFinancialLedger();
      res.json(ledger);
    } catch (error) {
      console.error("Error fetching financial ledger:", error);
      res.status(500).json({ message: "Failed to fetch financial ledger" });
    }
  });

  // Grouped Financial Ledger (Legacy tab redesign - grouped by parent/tutor)
  app.get("/api/financial-ledger/grouped", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const fiscalYear = req.query.fiscalYear ? parseInt(req.query.fiscalYear as string) : undefined;
      const ledger = await storage.getGroupedFinancialLedger(fiscalYear);
      res.json(ledger);
    } catch (error) {
      console.error("Error fetching grouped financial ledger:", error);
      res.status(500).json({ message: "Failed to fetch grouped financial ledger" });
    }
  });

  // Parent Invoices (for admin view)
  app.get("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { studentId } = req.query;
      const invoices = await storage.getInvoices(studentId as string | undefined);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Generate invoice number
      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const invoice = await storage.createInvoice({
        ...req.body,
        invoiceNumber,
      });
      await auditLog('invoice_created', 'invoice', invoice.id, user.id, {
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        amount: invoice.amount
      });
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get the current invoice to check if status is changing to paid
      const currentInvoice = await storage.getInvoice(req.params.id);
      if (!currentInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const updated = await storage.updateInvoice(req.params.id, req.body);

      // If status changed to "paid", add sessions to the student
      if (req.body.status === "paid" && currentInvoice.status !== "paid") {
        const sessionsToAdd = updated.sessionsIncluded || currentInvoice.sessionsIncluded || 0;
        if (sessionsToAdd > 0) {
          await storage.addSessionsToStudent(currentInvoice.studentId, sessionsToAdd);
        }
        await auditLog('invoice_paid', 'invoice', updated.id, user.id, {
          invoiceNumber: updated.invoiceNumber,
          amount: updated.amount
        });
      } else {
        await auditLog('invoice_updated', 'invoice', updated.id, user.id, {
          invoiceNumber: updated.invoiceNumber,
          changes: req.body
        });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Auto-generate parent invoice when sessions run out (called from session logging)
  app.post("/api/invoices/auto-generate/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const { sessions } = req.body;
      const invoice = await storage.generateParentInvoiceForStudent(req.params.studentId, sessions || 6);
      if (invoice) {
        res.status(201).json(invoice);
      } else {
        res.status(404).json({ message: "Student not found" });
      }
    } catch (error) {
      console.error("Error auto-generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Adhoc Invoices (manual invoices not tied to students)
  app.get("/api/adhoc-invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const invoices = await storage.getAdhocInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching adhoc invoices:", error);
      res.status(500).json({ message: "Failed to fetch adhoc invoices" });
    }
  });

  app.post("/api/adhoc-invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Convert date strings to Date objects for timestamp columns
      const invoiceData = {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        paidAt: req.body.paidAt ? new Date(req.body.paidAt) : null,
      };

      const invoice = await storage.createAdhocInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating adhoc invoice:", error);
      res.status(500).json({ message: "Failed to create adhoc invoice" });
    }
  });

  app.patch("/api/adhoc-invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get current invoice to check status change
      const currentInvoice = await storage.getAdhocInvoice(req.params.id);
      if (!currentInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Convert date strings to Date objects for timestamp columns
      const updateData = { ...req.body };
      if (updateData.dueDate !== undefined) {
        updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      }
      if (updateData.paidAt !== undefined) {
        updateData.paidAt = updateData.paidAt ? new Date(updateData.paidAt) : null;
      }

      const updated = await storage.updateAdhocInvoice(req.params.id, updateData);

      // If status changed to "sent", trigger inventory deduction
      if (updateData.status === "sent" && currentInvoice.status !== "sent") {
        await storage.deductInventoryForAdhocInvoice(req.params.id);
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating adhoc invoice:", error);
      res.status(500).json({ message: "Failed to update adhoc invoice" });
    }
  });

  app.delete("/api/adhoc-invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteAdhocInvoice(req.params.id);
      res.json({ message: "Adhoc invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting adhoc invoice:", error);
      res.status(500).json({ message: "Failed to delete adhoc invoice" });
    }
  });

  // Adhoc Invoice Items (for inventory linking)
  app.get("/api/adhoc-invoices/:id/items", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const items = await storage.getAdhocInvoiceItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching adhoc invoice items:", error);
      res.status(500).json({ message: "Failed to fetch adhoc invoice items" });
    }
  });

  app.post("/api/adhoc-invoices/:id/items", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const item = await storage.createAdhocInvoiceItem({
        adhocInvoiceId: req.params.id,
        productId: req.body.productId,
        quantity: req.body.quantity || 1,
        unitPrice: req.body.unitPrice,
      });
      
      // Check if this is the last item being added (deductOnComplete flag)
      // and invoice is already "sent" - trigger deduction
      if (req.body.deductOnComplete) {
        const invoice = await storage.getAdhocInvoice(req.params.id);
        if (invoice && invoice.status === "sent" && !invoice.inventoryDeducted) {
          await storage.deductInventoryForAdhocInvoice(req.params.id);
        }
      }
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating adhoc invoice item:", error);
      res.status(500).json({ message: "Failed to create adhoc invoice item" });
    }
  });

  app.delete("/api/adhoc-invoices/:id/items", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteAdhocInvoiceItems(req.params.id);
      res.json({ message: "Adhoc invoice items deleted successfully" });
    } catch (error) {
      console.error("Error deleting adhoc invoice items:", error);
      res.status(500).json({ message: "Failed to delete adhoc invoice items" });
    }
  });

  // QuickBooks Export Routes - Replace Excel-to-QuickBooks workflow
  app.get("/api/exports/parent-invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const csvData = await storage.generateParentInvoicesCSV(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="parent-invoices-${startDate}-${endDate}.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error generating parent invoices CSV:", error);
      res.status(500).json({ message: "Failed to generate parent invoices CSV" });
    }
  });

  app.get("/api/exports/tutor-payroll", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const csvData = await storage.generateTutorPayrollCSV(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="tutor-payroll-${startDate}-${endDate}.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error generating tutor payroll CSV:", error);
      res.status(500).json({ message: "Failed to generate tutor payroll CSV" });
    }
  });

  // Archive routes - admin only
  app.get("/api/archive/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const archivedStudents = await storage.getArchivedStudents();
      res.json(archivedStudents);
    } catch (error) {
      console.error("Error fetching archived students:", error);
      res.status(500).json({ message: "Failed to fetch archived students" });
    }
  });

  app.get("/api/archive/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const details = await storage.getArchivedStudentDetails(req.params.id);
      if (!details) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(details);
    } catch (error) {
      console.error("Error fetching archived student details:", error);
      res.status(500).json({ message: "Failed to fetch archived student details" });
    }
  });

  app.get("/api/archive/tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const archivedTutors = await storage.getArchivedTutors();
      res.json(archivedTutors);
    } catch (error) {
      console.error("Error fetching archived tutors:", error);
      res.status(500).json({ message: "Failed to fetch archived tutors" });
    }
  });

  app.get("/api/archive/tutors/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const details = await storage.getArchivedTutorDetails(req.params.id);
      if (!details) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      res.json(details);
    } catch (error) {
      console.error("Error fetching archived tutor details:", error);
      res.status(500).json({ message: "Failed to fetch archived tutor details" });
    }
  });

  // Waitlist routes - admin only
  app.get("/api/waitlist", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const entries = await storage.getWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });

  app.post("/api/waitlist", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertWaitlistSchema.parse(req.body);
      const entry = await storage.createWaitlistEntry(validatedData);
      await auditLog('waitlist_created', 'waitlist', entry.id, user.id, {
        studentName: entry.studentName,
        parentName: entry.parentName
      });
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating waitlist entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create waitlist entry" });
    }
  });

  app.patch("/api/waitlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = updateWaitlistSchema.parse(req.body);
      const entry = await storage.updateWaitlistEntry(req.params.id, validatedData);
      await auditLog('waitlist_updated', 'waitlist', entry.id, user.id, {
        studentName: entry.studentName,
        changes: validatedData
      });
      res.json(entry);
    } catch (error) {
      console.error("Error updating waitlist entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update waitlist entry" });
    }
  });

  app.delete("/api/waitlist/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await auditLog('waitlist_deleted', 'waitlist', req.params.id, user.id, {});
      await storage.deleteWaitlistEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      res.status(500).json({ message: "Failed to delete waitlist entry" });
    }
  });

  app.post("/api/waitlist/:id/convert", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const result = await storage.convertWaitlistToStudent(req.params.id, req.body);
      await auditLog('waitlist_converted', 'waitlist', req.params.id, user.id, {
        studentId: result.student?.id,
        studentName: result.student?.name
      });
      res.json(result);
    } catch (error: any) {
      console.error("Error converting waitlist entry:", error);
      res.status(500).json({ message: error.message || "Failed to convert waitlist entry" });
    }
  });

  // Get matching tutor availability for a waitlist entry's preferred timings
  app.get("/api/waitlist/:id/matching-tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const entry = await storage.getWaitlistEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Waitlist entry not found" });
      }

      const preferredTimings = entry.preferredTimings as Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        notes?: string;
      }> | null;

      if (!preferredTimings || preferredTimings.length === 0) {
        return res.json({ matches: [], message: "No preferred timings set for this entry" });
      }

      // Get all tutor availability slots
      const allSlots = await storage.getTutorAvailabilitySlots();
      
      // Get all tutors to look up tutor info
      const allTutors = await storage.getTutors();
      const tutorMap = new Map(allTutors.map(t => [t.id, t]));
      
      // Find matching slots where tutor availability overlaps with preferred timings
      const matches: Array<{
        tutor: { id: string; firstName: string | null; lastName: string | null; email: string };
        slot: typeof allSlots[0];
        matchedTiming: typeof preferredTimings[0];
        overlapScore: number;
      }> = [];

      for (const slot of allSlots) {
        if (slot.dayOfWeek === null) continue;
        
        // Get tutor info from the map
        const tutor = tutorMap.get(slot.tutorId);
        if (!tutor) continue;
        
        for (const timing of preferredTimings) {
          // Check if day matches
          if (slot.dayOfWeek !== timing.dayOfWeek) continue;
          
          // Check if time ranges overlap
          const slotStart = slot.startTime;
          const slotEnd = slot.endTime;
          const prefStart = timing.startTime;
          const prefEnd = timing.endTime;
          
          // Time overlap: slot overlaps with preferred if slotStart < prefEnd AND slotEnd > prefStart
          if (slotStart < prefEnd && slotEnd > prefStart) {
            // Calculate overlap duration for scoring
            const overlapStart = slotStart > prefStart ? slotStart : prefStart;
            const overlapEnd = slotEnd < prefEnd ? slotEnd : prefEnd;
            
            // Convert to minutes for overlap score
            const toMinutes = (time: string) => {
              const [h, m] = time.split(':').map(Number);
              return h * 60 + m;
            };
            const overlapScore = toMinutes(overlapEnd) - toMinutes(overlapStart);
            
            if (overlapScore > 0) {
              matches.push({
                tutor: {
                  id: tutor.id,
                  firstName: tutor.firstName,
                  lastName: tutor.lastName,
                  email: tutor.email
                },
                slot,
                matchedTiming: timing,
                overlapScore
              });
            }
          }
        }
      }

      // Sort by overlap score (most overlap first)
      matches.sort((a, b) => b.overlapScore - a.overlapScore);

      res.json({ matches });
    } catch (error) {
      console.error("Error finding matching tutors:", error);
      res.status(500).json({ message: "Failed to find matching tutors" });
    }
  });

  // Parent routes - for parents to view their child's data
  app.get("/api/parent/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Admin can view all, parents can only view their linked students
      if (user.role === "admin") {
        // For admin demo view, return first student or empty
        const students = await storage.getStudents();
        res.json(students.slice(0, 1));
      } else if (user.role === "parent") {
        // Find students where parentEmail matches user email
        const students = await storage.getStudentsByParentEmail(user.email || "");
        res.json(students);
      } else {
        return res.status(403).json({ message: "Parent access required" });
      }
    } catch (error) {
      console.error("Error fetching parent students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/parent/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      let studentIds: string[] = [];
      
      if (user.role === "admin") {
        const students = await storage.getStudents();
        studentIds = students.slice(0, 1).map(s => s.id);
      } else if (user.role === "parent") {
        const students = await storage.getStudentsByParentEmail(user.email || "");
        studentIds = students.map(s => s.id);
      } else {
        return res.status(403).json({ message: "Parent access required" });
      }

      if (studentIds.length === 0) {
        return res.json([]);
      }

      const sessions = await storage.getTimesheetEntriesByStudentIds(studentIds);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching parent sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/parent/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      let studentIds: string[] = [];
      
      if (user.role === "admin") {
        const students = await storage.getStudents();
        studentIds = students.slice(0, 1).map(s => s.id);
      } else if (user.role === "parent") {
        const students = await storage.getStudentsByParentEmail(user.email || "");
        studentIds = students.map(s => s.id);
      } else {
        return res.status(403).json({ message: "Parent access required" });
      }

      if (studentIds.length === 0) {
        return res.json([]);
      }

      const invoices = await storage.getInvoicesByStudentIds(studentIds);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching parent invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/parent/payments", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      let studentIds: string[] = [];
      
      if (user.role === "admin") {
        const students = await storage.getStudents();
        studentIds = students.slice(0, 1).map(s => s.id);
      } else if (user.role === "parent") {
        const students = await storage.getStudentsByParentEmail(user.email || "");
        studentIds = students.map(s => s.id);
      } else {
        return res.status(403).json({ message: "Parent access required" });
      }

      if (studentIds.length === 0) {
        return res.json([]);
      }

      const payments = await storage.getPaymentsByStudentIds(studentIds);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching parent payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Parent message routes
  // Parents can send messages
  app.post("/api/parent/messages", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Allow admins (for testing) and parents
      if (user.role !== "admin" && user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const validatedData = insertParentMessageSchema.parse(req.body);
      const message = await storage.createParentMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating parent message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Parents can view session occurrences only for their children
  app.get("/api/parent/session-occurrences", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (user.role !== "admin" && user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      // Get the parent's students first
      const parentStudents = await storage.getStudentsByParentEmail(user.email || "");
      const studentIds = parentStudents.map(s => s.id);

      if (studentIds.length === 0) {
        return res.json([]);
      }

      // Use the scoped storage method that only fetches occurrences for specified student IDs
      const occurrences = await storage.getSessionOccurrencesByStudentIds(studentIds);

      // Fetch pending change requests for these sessions
      const pendingChangeRequests = await storage.getSessionChangeRequests("pending");
      const pendingRequestMap = new Map<string, typeof pendingChangeRequests[number]>();
      for (const request of pendingChangeRequests) {
        // Only include requests for this parent's students
        if (studentIds.includes(request.studentId)) {
          pendingRequestMap.set(request.sessionOccurrenceId, request);
        }
      }

      // Transform to only return necessary information for parents
      const safeOccurrences = occurrences.map((occ: any) => {
        const pendingRequest = pendingRequestMap.get(occ.id);
        return {
          id: occ.id,
          studentId: occ.studentId,
          tutorId: occ.tutorId,
          occurrenceDate: occ.occurrenceDate,
          startDateTime: occ.startDateTime,
          endDateTime: occ.endDateTime,
          status: occ.status,
          notes: occ.notes,
          parentFlagged: occ.parentFlagged,
          parentFlagComment: occ.parentFlagComment,
          parentFlaggedAt: occ.parentFlaggedAt,
          groupId: occ.groupId || null,
          groupName: occ.groupName || null,
          student: occ.student ? { id: occ.student.id, name: occ.student.name } : null,
          tutor: occ.tutor ? { id: occ.tutor.id, firstName: occ.tutor.firstName, lastName: occ.tutor.lastName } : null,
          pendingChangeRequest: pendingRequest ? {
            id: pendingRequest.id,
            requestType: pendingRequest.requestType,
            requesterType: pendingRequest.requesterType,
            reason: pendingRequest.reason,
            proposedStartDateTime: pendingRequest.proposedStartDateTime,
            proposedEndDateTime: pendingRequest.proposedEndDateTime,
            proposedDateMessage: pendingRequest.proposedDateMessage,
            createdAt: pendingRequest.createdAt,
          } : null,
        };
      });

      res.json(safeOccurrences);
    } catch (error) {
      console.error("Error fetching parent session occurrences:", error);
      res.status(500).json({ message: "Failed to fetch session occurrences" });
    }
  });

  // Parents can flag a session with a comment
  app.post("/api/parent/session-occurrences/:id/flag", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const sessionId = req.params.id;
      const { comment } = req.body;

      // Verify this session belongs to one of the parent's students
      const parentStudents = await storage.getStudentsByParentEmail(user.email || "");
      const studentIds = parentStudents.map(s => s.id);

      const session = await storage.getSessionOccurrence(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (!session.studentId || !studentIds.includes(session.studentId)) {
        return res.status(403).json({ message: "You can only flag sessions for your own children" });
      }

      // Update the session with the flag
      const updatedSession = await storage.updateSessionOccurrence(sessionId, {
        parentFlagged: true,
        parentFlagComment: comment || null,
        parentFlaggedAt: new Date(),
      });

      // Notify admins about the flagged session
      const adminUsers = await storage.getUsersByRole("admin");
      const studentName = parentStudents.find(s => s.id === session.studentId)?.name || "Unknown Student";
      for (const admin of adminUsers) {
        await storage.createNotification({
          userId: admin.id,
          type: "session_flagged",
          title: "Session Flagged by Parent",
          message: `A session for ${studentName} on ${new Date(session.startDateTime).toLocaleDateString()} has been flagged: "${comment || 'No comment provided'}"`,
          relatedId: sessionId,
          relatedType: "session_occurrence",
        });
      }

      res.json(updatedSession);
    } catch (error) {
      console.error("Error flagging session:", error);
      res.status(500).json({ message: "Failed to flag session" });
    }
  });

  // Parents can view their children's mock exam bookings for calendar blocking
  app.get("/api/parent/mock-exam-bookings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (user.role !== "admin" && user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      // Get the parent's students
      const parentStudents = await storage.getStudentsByParentEmail(user.email || "");
      const studentIds = parentStudents.map(s => s.id);

      if (studentIds.length === 0) {
        return res.json([]);
      }

      // Get all service bookings and filter to mock exam bookings for parent's children
      const allBookings = await storage.getServiceBookings();
      const mockExamBookings = allBookings.filter(b => 
        b.bookingType === "mock_exam" && 
        b.studentId && 
        studentIds.includes(b.studentId) &&
        b.status !== "cancelled" &&
        b.mockExamEvent
      );

      // Return simplified data for calendar display
      const calendarEvents = mockExamBookings.map(booking => ({
        id: booking.id,
        studentId: booking.studentId,
        studentName: booking.student?.name || "Unknown Student",
        examName: booking.mockExamEvent?.examName || "Mock Exam",
        examDate: booking.mockExamEvent?.examDate,
        location: booking.mockExamEvent?.location,
        status: booking.status,
      }));

      res.json(calendarEvents);
    } catch (error) {
      console.error("Error fetching parent mock exam bookings:", error);
      res.status(500).json({ message: "Failed to fetch mock exam bookings" });
    }
  });

  // Parents can view their sent messages
  app.get("/api/parent/messages", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (user.role !== "admin" && user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const messages = await storage.getParentMessagesByParentEmail(user.email || "");
      res.json(messages);
    } catch (error) {
      console.error("Error fetching parent messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Admin can view all messages
  app.get("/api/messages/admin", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Admin sees ALL messages
      const messages = await storage.getParentMessages("admin");
      res.json(messages);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Tutor can view messages sent to tutors (only for their students)
  // Admins can see all tutor-addressed messages
  app.get("/api/messages/tutor", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (user.role !== "tutor" && user.role !== "admin") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      // Admins see all tutor-addressed messages, tutors only see their own
      if (user.role === "admin") {
        const allMessages = await storage.getParentMessages();
        const tutorMessages = allMessages.filter(msg => msg.recipientType === "tutor");
        res.json(tutorMessages);
      } else {
        // Tutors only see messages with recipientType="tutor" for their students
        const messages = await storage.getParentMessages("tutor", user.id);
        res.json(messages);
      }
    } catch (error) {
      console.error("Error fetching tutor messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Only tutors and admins can mark messages as read
      if (user.role !== "tutor" && user.role !== "admin") {
        return res.status(403).json({ message: "Only tutors and admins can mark messages as read" });
      }

      // Pass tutor ID if the user is a tutor
      const tutorId = user.role === "tutor" ? user.id : undefined;
      const message = await storage.markParentMessageRead(req.params.id, tutorId);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Get single message with replies
  app.get("/api/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      const message = await storage.getParentMessage(req.params.id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Tutors can only see messages for their students
      if (user.role === "tutor" && message.student.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get replies for this message
      const replies = await storage.getParentMessageReplies(req.params.id);
      
      res.json({ ...message, replies });
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  // Create reply to a parent message (tutor/admin only)
  app.post("/api/messages/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (user.role !== "tutor" && user.role !== "admin") {
        return res.status(403).json({ message: "Only tutors and admins can reply to messages" });
      }

      const message = await storage.getParentMessage(req.params.id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // Tutors can only reply to messages for their students
      if (user.role === "tutor" && message.student.tutorId !== user.id) {
        return res.status(403).json({ message: "You can only reply to messages for your students" });
      }

      const { replyContent } = req.body;
      
      if (!replyContent || typeof replyContent !== "string" || replyContent.trim() === "") {
        return res.status(400).json({ message: "Reply content is required" });
      }

      const replyData = insertParentMessageReplySchema.parse({
        messageId: req.params.id,
        replyContent: replyContent.trim(),
        repliedById: user.id,
        repliedByRole: user.role as "admin" | "tutor",
      });

      const reply = await storage.createParentMessageReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating message reply:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Student Topics Routes
  // Get topics for a student (admin or assigned tutor)
  app.get("/api/students/:studentId/topics", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { studentId } = req.params;
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Allow admin or assigned tutor to view topics
      if (user.role !== "admin" && student.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const topics = await storage.getStudentTopics(studentId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching student topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Bulk import topics for a student (admin only)
  app.post("/api/students/:studentId/topics/import", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { studentId } = req.params;
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { topics } = req.body;
      if (!Array.isArray(topics)) {
        return res.status(400).json({ message: "Topics must be an array" });
      }

      const validatedTopics = topics.map((topic, index) => 
        insertStudentTopicSchema.parse({
          studentId,
          title: topic.title,
          description: topic.description || null,
          orderIndex: topic.orderIndex ?? index,
        })
      );

      const created = await storage.replaceStudentTopics(studentId, validatedTopics);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error importing student topics:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid topic data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to import topics" });
    }
  });

  // Add topics for a student (keeps existing topics) - admin only
  app.post("/api/students/:studentId/topics/add", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { studentId } = req.params;
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { topics } = req.body;
      if (!Array.isArray(topics)) {
        return res.status(400).json({ message: "Topics must be an array" });
      }

      const validatedTopics = topics.map((topic, index) => 
        insertStudentTopicSchema.parse({
          studentId,
          title: topic.title,
          description: topic.description || null,
          orderIndex: topic.orderIndex ?? index,
        })
      );

      const created = await storage.addStudentTopics(studentId, validatedTopics);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error adding student topics:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid topic data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add topics" });
    }
  });

  // Update a single topic (admin only)
  app.patch("/api/topics/:topicId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = updateStudentTopicSchema.parse(req.body);
      const updated = await storage.updateStudentTopic(req.params.topicId, validatedData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating topic:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update topic" });
    }
  });

  // Mark topic as covered/uncovered (tutor or admin)
  app.patch("/api/topics/:topicId/covered", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { isCovered, coveredAt } = req.body;
      if (typeof isCovered !== "boolean") {
        return res.status(400).json({ message: "isCovered must be a boolean" });
      }

      // Parse coveredAt date if provided
      const parsedCoveredAt = coveredAt ? new Date(coveredAt) : undefined;
      
      const updated = await storage.markStudentTopicCovered(req.params.topicId, user.id, isCovered, parsedCoveredAt);
      res.json(updated);
    } catch (error) {
      console.error("Error marking topic as covered:", error);
      res.status(500).json({ message: "Failed to update topic" });
    }
  });

  // Rate Configuration Routes (admin only)
  app.get("/api/rate-configurations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const rates = await storage.getRateConfigurations();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching rate configurations:", error);
      res.status(500).json({ message: "Failed to fetch rate configurations" });
    }
  });

  app.post("/api/rate-configurations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertRateConfigurationSchema } = await import("@shared/schema");
      const validatedData = insertRateConfigurationSchema.parse(req.body);
      const rate = await storage.createRateConfiguration(validatedData);
      res.status(201).json(rate);
    } catch (error) {
      console.error("Error creating rate configuration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rate configuration" });
    }
  });

  app.patch("/api/rate-configurations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateRateConfigurationSchema } = await import("@shared/schema");
      const validatedData = updateRateConfigurationSchema.parse(req.body);
      const rate = await storage.updateRateConfiguration(req.params.id, validatedData);
      res.json(rate);
    } catch (error) {
      console.error("Error updating rate configuration:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update rate configuration" });
    }
  });

  app.delete("/api/rate-configurations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteRateConfiguration(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting rate configuration:", error);
      res.status(500).json({ message: "Failed to delete rate configuration" });
    }
  });

  // ============ NEW INDEPENDENT RATE SYSTEM ============
  
  // Tutor Rates (independent - rates paid TO tutors)
  app.get("/api/tutor-rates", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const rates = await storage.getTutorRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching tutor rates:", error);
      res.status(500).json({ message: "Failed to fetch tutor rates" });
    }
  });

  app.post("/api/tutor-rates", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertTutorRateSchema } = await import("@shared/schema");
      const { tutorIds, tutorGroupIds, ...rateData } = req.body;
      const validatedData = insertTutorRateSchema.parse(rateData);
      const rate = await storage.createTutorRate(validatedData);
      
      // Set multi-tutor assignments if provided
      if (tutorIds && Array.isArray(tutorIds) && tutorIds.length > 0) {
        await storage.setTutorRateTutors(rate.id, tutorIds);
      }
      
      // Set tutor group assignments if provided
      if (tutorGroupIds && Array.isArray(tutorGroupIds) && tutorGroupIds.length > 0) {
        await storage.setTutorRateTutorGroups(rate.id, tutorGroupIds);
      }
      
      await auditLog('rate_created', 'rate', rate.id, user.id, {
        name: rate.name,
        hourlyRate: rate.hourlyRate,
        rateType: 'tutor',
        tutorIds,
        tutorGroupIds,
      });
      res.status(201).json(rate);
    } catch (error) {
      console.error("Error creating tutor rate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tutor rate" });
    }
  });

  app.patch("/api/tutor-rates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateTutorRateSchema } = await import("@shared/schema");
      const { tutorIds, tutorGroupIds, ...rateData } = req.body;
      const validatedData = updateTutorRateSchema.parse(rateData);
      const rate = await storage.updateTutorRate(req.params.id, validatedData);
      
      // Update multi-tutor assignments if provided
      if (tutorIds !== undefined && Array.isArray(tutorIds)) {
        await storage.setTutorRateTutors(rate.id, tutorIds);
      }
      
      // Update tutor group assignments if provided
      if (tutorGroupIds !== undefined && Array.isArray(tutorGroupIds)) {
        await storage.setTutorRateTutorGroups(rate.id, tutorGroupIds);
      }
      
      await auditLog('rate_updated', 'rate', rate.id, user.id, {
        name: rate.name,
        changes: validatedData,
        rateType: 'tutor',
        tutorIds,
        tutorGroupIds,
      });
      res.json(rate);
    } catch (error) {
      console.error("Error updating tutor rate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tutor rate" });
    }
  });

  app.delete("/api/tutor-rates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await auditLog('rate_deleted', 'rate', req.params.id, user.id, { rateType: 'tutor' });
      await storage.deleteTutorRate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tutor rate:", error);
      res.status(500).json({ message: "Failed to delete tutor rate" });
    }
  });

  // Get tutors assigned to a specific tutor rate
  app.get("/api/tutor-rates/:id/tutors", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const assignments = await storage.getTutorRateTutors(req.params.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching tutor rate tutors:", error);
      res.status(500).json({ message: "Failed to fetch tutor rate tutors" });
    }
  });

  // Get tutor groups assigned to a specific tutor rate
  app.get("/api/tutor-rates/:id/tutor-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const assignments = await storage.getTutorRateTutorGroups(req.params.id);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching tutor rate tutor groups:", error);
      res.status(500).json({ message: "Failed to fetch tutor rate tutor groups" });
    }
  });

  // Tutor Groups management
  app.get("/api/tutor-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const groups = await storage.getTutorGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching tutor groups:", error);
      res.status(500).json({ message: "Failed to fetch tutor groups" });
    }
  });

  app.post("/api/tutor-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { insertTutorGroupSchema } = await import("@shared/schema");
      const { tutorIds, ...groupData } = req.body;
      const validatedData = insertTutorGroupSchema.parse(groupData);
      const group = await storage.createTutorGroup(validatedData, tutorIds || []);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating tutor group:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tutor group" });
    }
  });

  app.patch("/api/tutor-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { updateTutorGroupSchema } = await import("@shared/schema");
      const { tutorIds, ...groupData } = req.body;
      const validatedData = updateTutorGroupSchema.parse(groupData);
      const group = await storage.updateTutorGroup(req.params.id, validatedData, tutorIds);
      res.json(group);
    } catch (error) {
      console.error("Error updating tutor group:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update tutor group" });
    }
  });

  app.delete("/api/tutor-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      await storage.deleteTutorGroup(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tutor group:", error);
      res.status(500).json({ message: "Failed to delete tutor group" });
    }
  });

  // Parent Rates (independent - rates charged TO parents)
  app.get("/api/parent-rates", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const rates = await storage.getParentRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching parent rates:", error);
      res.status(500).json({ message: "Failed to fetch parent rates" });
    }
  });

  app.post("/api/parent-rates", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertParentRateSchema } = await import("@shared/schema");
      const validatedData = insertParentRateSchema.parse(req.body);
      const rate = await storage.createParentRate(validatedData);
      await auditLog('rate_created', 'rate', rate.id, user.id, {
        name: rate.name,
        hourlyRate: rate.hourlyRate,
        rateType: 'parent'
      });
      res.status(201).json(rate);
    } catch (error) {
      console.error("Error creating parent rate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create parent rate" });
    }
  });

  app.patch("/api/parent-rates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateParentRateSchema } = await import("@shared/schema");
      const validatedData = updateParentRateSchema.parse(req.body);
      const rate = await storage.updateParentRate(req.params.id, validatedData);
      await auditLog('rate_updated', 'rate', rate.id, user.id, {
        name: rate.name,
        changes: validatedData,
        rateType: 'parent'
      });
      res.json(rate);
    } catch (error) {
      console.error("Error updating parent rate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update parent rate" });
    }
  });

  app.delete("/api/parent-rates/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await auditLog('rate_deleted', 'rate', req.params.id, user.id, { rateType: 'parent' });
      await storage.deleteParentRate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting parent rate:", error);
      res.status(500).json({ message: "Failed to delete parent rate" });
    }
  });

  // Rate Links (optional linking for profit margin analysis)
  app.get("/api/rate-links", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const links = await storage.getRateLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching rate links:", error);
      res.status(500).json({ message: "Failed to fetch rate links" });
    }
  });

  app.post("/api/rate-links", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertRateLinkSchema } = await import("@shared/schema");
      const validatedData = insertRateLinkSchema.parse(req.body);
      const link = await storage.createRateLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating rate link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rate link" });
    }
  });

  app.delete("/api/rate-links/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteRateLink(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting rate link:", error);
      res.status(500).json({ message: "Failed to delete rate link" });
    }
  });

  // Curriculum Topics Routes
  app.get("/api/curriculum-topics", isAuthenticated, async (req: any, res) => {
    try {
      const subject = req.query.subject as string | undefined;
      const topics = await storage.getCurriculumTopics(subject);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching curriculum topics:", error);
      res.status(500).json({ message: "Failed to fetch curriculum topics" });
    }
  });

  app.post("/api/curriculum-topics", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertCurriculumTopicSchema } = await import("@shared/schema");
      const validatedData = insertCurriculumTopicSchema.parse(req.body);
      const topic = await storage.createCurriculumTopic(validatedData);
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating curriculum topic:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create curriculum topic" });
    }
  });

  app.patch("/api/curriculum-topics/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateCurriculumTopicSchema } = await import("@shared/schema");
      const validatedData = updateCurriculumTopicSchema.parse(req.body);
      const topic = await storage.updateCurriculumTopic(req.params.id, validatedData);
      res.json(topic);
    } catch (error) {
      console.error("Error updating curriculum topic:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update curriculum topic" });
    }
  });

  app.delete("/api/curriculum-topics/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteCurriculumTopic(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting curriculum topic:", error);
      res.status(500).json({ message: "Failed to delete curriculum topic" });
    }
  });

  // Session Topics Covered Routes
  app.get("/api/timesheet-entries/:id/topics", isAuthenticated, async (req: any, res) => {
    try {
      const topics = await storage.getSessionTopicsCovered(req.params.id);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching session topics:", error);
      res.status(500).json({ message: "Failed to fetch session topics" });
    }
  });

  app.post("/api/timesheet-entries/:id/topics", isAuthenticated, async (req: any, res) => {
    try {
      const { topicIds } = req.body;
      
      if (!Array.isArray(topicIds)) {
        return res.status(400).json({ message: "topicIds must be an array" });
      }

      await storage.setSessionTopicsCovered(req.params.id, topicIds);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error setting session topics:", error);
      res.status(500).json({ message: "Failed to set session topics" });
    }
  });

  // Work Types Routes (admin-configurable work types for "Other" timesheet entries)
  app.get("/api/work-types", isAuthenticated, async (req: any, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const workTypes = await storage.getWorkTypes(includeInactive);
      res.json(workTypes);
    } catch (error) {
      console.error("Error fetching work types:", error);
      res.status(500).json({ message: "Failed to fetch work types" });
    }
  });

  app.post("/api/work-types", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const workType = await storage.createWorkType(req.body);
      res.status(201).json(workType);
    } catch (error) {
      console.error("Error creating work type:", error);
      res.status(500).json({ message: "Failed to create work type" });
    }
  });

  app.patch("/api/work-types/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const workType = await storage.updateWorkType(req.params.id, req.body);
      res.json(workType);
    } catch (error) {
      console.error("Error updating work type:", error);
      res.status(500).json({ message: "Failed to update work type" });
    }
  });

  app.delete("/api/work-types/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteWorkType(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work type:", error);
      res.status(500).json({ message: "Failed to delete work type" });
    }
  });

  // Student Group Routes
  app.get("/api/student-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Admin can see all groups, tutors only see their groups
      const tutorId = user.role === "admin" ? undefined : user.id;
      const groups = await storage.getStudentGroups(tutorId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching student groups:", error);
      res.status(500).json({ message: "Failed to fetch student groups" });
    }
  });

  app.get("/api/student-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const group = await storage.getStudentGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Student group not found" });
      }

      // Check access: admin can view any, tutors only their own groups
      if (user.role !== "admin" && group.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching student group:", error);
      res.status(500).json({ message: "Failed to fetch student group" });
    }
  });

  app.get("/api/student-groups/tutor/:tutorId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Only admin or the tutor themselves can access
      if (user.role !== "admin" && user.id !== req.params.tutorId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const groups = await storage.getStudentGroupsByTutor(req.params.tutorId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching student groups by tutor:", error);
      res.status(500).json({ message: "Failed to fetch student groups" });
    }
  });

  app.post("/api/student-groups", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertStudentGroupSchema } = await import("@shared/schema");
      const { studentIds, ...groupData } = req.body;
      const validatedData = insertStudentGroupSchema.parse(groupData);
      const group = await storage.createStudentGroup(validatedData, studentIds || []);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating student group:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student group" });
    }
  });

  app.put("/api/student-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateStudentGroupSchema } = await import("@shared/schema");
      const { studentIds, ...groupUpdates } = req.body;
      const validatedData = updateStudentGroupSchema.parse(groupUpdates);
      const group = await storage.updateStudentGroup(req.params.id, validatedData, studentIds);
      res.json(group);
    } catch (error) {
      console.error("Error updating student group:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student group" });
    }
  });

  app.delete("/api/student-groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteStudentGroup(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student group:", error);
      res.status(500).json({ message: "Failed to delete student group" });
    }
  });

  // Group Session Routes
  app.get("/api/group-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Admin can see all sessions, tutors only see their sessions
      const tutorId = user.role === "admin" ? undefined : user.id;
      const sessions = await storage.getGroupSessions(tutorId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching group sessions:", error);
      res.status(500).json({ message: "Failed to fetch group sessions" });
    }
  });

  app.get("/api/group-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const session = await storage.getGroupSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Group session not found" });
      }

      // Check access - admin can see all, tutors only their own
      if (user.role !== "admin" && session.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching group session:", error);
      res.status(500).json({ message: "Failed to fetch group session" });
    }
  });

  app.post("/api/group-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      const { insertGroupSessionSchema } = await import("@shared/schema");
      const { attendance, sessionSubject, topicIds, otherTopicsText, ...sessionData } = req.body;
      
      // Set tutor ID to current user if they're a tutor
      // Convert sessionDate from string to Date and duration from number to string
      const finalSessionData = {
        ...sessionData,
        tutorId: user.role === "tutor" ? user.id : sessionData.tutorId,
        sessionDate: sessionData.sessionDate ? new Date(sessionData.sessionDate) : undefined,
        duration: sessionData.duration !== undefined ? String(sessionData.duration) : undefined,
      };
      
      const validatedData = insertGroupSessionSchema.parse(finalSessionData);
      const session = await storage.createGroupSession(
        validatedData, 
        attendance || [],
        sessionSubject,
        topicIds,
        otherTopicsText
      );
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating group session:", error);
      res.status(500).json({ message: "Failed to create group session" });
    }
  });

  app.put("/api/group-sessions/:id/attendance", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      // Check access
      const existingSession = await storage.getGroupSession(req.params.id);
      if (!existingSession) {
        return res.status(404).json({ message: "Group session not found" });
      }

      if (user.role === "tutor" && existingSession.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { attendance } = req.body;
      const session = await storage.updateGroupSessionAttendance(req.params.id, attendance || []);
      res.json(session);
    } catch (error) {
      console.error("Error updating group session attendance:", error);
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  app.delete("/api/group-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Tutor or admin access required" });
      }

      // Check access and get session details
      const existingSession = await storage.getGroupSession(req.params.id);
      if (!existingSession) {
        return res.status(404).json({ message: "Group session not found" });
      }

      // Tutors can only delete their own group sessions
      if (user.role === "tutor" && existingSession.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteGroupSessionCascade(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting group session:", error);
      res.status(500).json({ message: "Failed to delete group session" });
    }
  });

  // System Settings Routes
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const setting = await storage.getSystemSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.put("/api/settings/:key", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { value, description } = req.body;
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      const setting = await storage.upsertSystemSetting(req.params.key, value, description);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Mark overdue invoices (can be called periodically or manually)
  app.post("/api/invoices/mark-overdue", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const count = await storage.markOverdueInvoices();
      res.json({ message: `Marked ${count} invoices as overdue`, count });
    } catch (error) {
      console.error("Error marking overdue invoices:", error);
      res.status(500).json({ message: "Failed to mark overdue invoices" });
    }
  });

  // ==================== SCHEDULING ROUTES ====================

  // Recurring Session Template Routes
  app.get("/api/recurring-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Admin can see all, tutors only their own
      const tutorId = user.role === "admin" ? (req.query.tutorId as string | undefined) : user.id;
      const groupId = req.query.groupId as string | undefined;
      const templates = await storage.getRecurringSessionTemplates(tutorId, undefined, groupId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching recurring sessions:", error);
      res.status(500).json({ message: "Failed to fetch recurring sessions" });
    }
  });

  app.get("/api/recurring-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const template = await storage.getRecurringSessionTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Recurring session not found" });
      }

      // Check access
      if (user.role !== "admin" && template.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching recurring session:", error);
      res.status(500).json({ message: "Failed to fetch recurring session" });
    }
  });

  app.post("/api/recurring-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertRecurringSessionTemplateSchema } = await import("@shared/schema");
      const validatedData = insertRecurringSessionTemplateSchema.parse({
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        createdBy: user.id,
      });
      const template = await storage.createRecurringSessionTemplate(validatedData);
      
      // Optionally generate occurrences for the next 12 months
      if (req.body.generateOccurrences) {
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        await storage.generateSessionOccurrences(template.id, endDate);
      }
      
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating recurring session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recurring session" });
    }
  });

  app.patch("/api/recurring-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateRecurringSessionTemplateSchema } = await import("@shared/schema");
      const validatedData = updateRecurringSessionTemplateSchema.parse(req.body);
      const template = await storage.updateRecurringSessionTemplate(req.params.id, validatedData);
      res.json(template);
    } catch (error) {
      console.error("Error updating recurring session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recurring session" });
    }
  });

  app.delete("/api/recurring-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteRecurringSessionTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recurring session:", error);
      res.status(500).json({ message: "Failed to delete recurring session" });
    }
  });

  // Generate session occurrences from template
  app.post("/api/recurring-sessions/:id/generate", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const endDate = req.body.endDate ? new Date(req.body.endDate) : (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d;
      })();
      
      const occurrences = await storage.generateSessionOccurrences(req.params.id, endDate);
      res.json({ generated: occurrences.length, occurrences });
    } catch (error) {
      console.error("Error generating session occurrences:", error);
      res.status(500).json({ message: "Failed to generate session occurrences" });
    }
  });

  // Session Occurrence Routes - Admin and Tutor only
  // Parents must use /api/parent/session-occurrences for properly scoped access
  app.get("/api/session-occurrences", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Deny parent access - they must use /api/parent/session-occurrences
      if (user.role === "parent") {
        return res.status(403).json({ message: "Please use /api/parent/session-occurrences for parent access" });
      }

      // Only admin and tutor can access this endpoint
      if (user.role !== "admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      let tutorId: string | undefined;
      
      if (user.role === "admin") {
        tutorId = req.query.tutorId as string | undefined;
      } else if (user.role === "tutor") {
        tutorId = user.id;
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const occurrences = await storage.getSessionOccurrences(tutorId, startDate, endDate);
      
      // Fetch all pending change requests to attach to sessions
      const pendingChangeRequests = await storage.getSessionChangeRequests("pending");
      
      // Create a map of session occurrences to their pending change requests
      const pendingRequestMap = new Map<string, typeof pendingChangeRequests[number]>();
      for (const request of pendingChangeRequests) {
        pendingRequestMap.set(request.sessionOccurrenceId, request);
      }
      
      // Attach pending change request info to each occurrence
      const enrichedOccurrences = occurrences.map((occ: any) => {
        const pendingRequest = pendingRequestMap.get(occ.id);
        return {
          ...occ,
          pendingChangeRequest: pendingRequest ? {
            id: pendingRequest.id,
            requestType: pendingRequest.requestType,
            requesterType: pendingRequest.requesterType,
            reason: pendingRequest.reason,
            proposedStartDateTime: pendingRequest.proposedStartDateTime,
            proposedEndDateTime: pendingRequest.proposedEndDateTime,
            proposedDateMessage: pendingRequest.proposedDateMessage,
            createdAt: pendingRequest.createdAt,
          } : null,
        };
      });
      
      res.json(enrichedOccurrences);
    } catch (error) {
      console.error("Error fetching session occurrences:", error);
      res.status(500).json({ message: "Failed to fetch session occurrences" });
    }
  });

  app.get("/api/session-occurrences/:id", isAuthenticated, async (req: any, res) => {
    try {
      const occurrence = await storage.getSessionOccurrence(req.params.id);
      if (!occurrence) {
        return res.status(404).json({ message: "Session occurrence not found" });
      }
      res.json(occurrence);
    } catch (error) {
      console.error("Error fetching session occurrence:", error);
      res.status(500).json({ message: "Failed to fetch session occurrence" });
    }
  });

  // Admin endpoint to get flagged sessions
  app.get("/api/flagged-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all session occurrences that are flagged (includes student/tutor relations)
      const allOccurrences = await storage.getSessionOccurrences();
      const flaggedSessions = allOccurrences
        .filter(occ => occ.parentFlagged === true)
        .map(occ => ({
          ...occ,
          student: occ.student ? { id: occ.student.id, name: occ.student.name } : null,
          tutor: occ.tutor ? { id: occ.tutor.id, firstName: occ.tutor.firstName, lastName: occ.tutor.lastName } : null,
        }));
      res.json(flaggedSessions);
    } catch (error) {
      console.error("Error fetching flagged sessions:", error);
      res.status(500).json({ message: "Failed to fetch flagged sessions" });
    }
  });

  // Admin endpoint to acknowledge a flagged session
  app.post("/api/flagged-sessions/:id/acknowledge", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const sessionId = req.params.id;
      const session = await storage.getSessionOccurrence(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (!session.parentFlagged) {
        return res.status(400).json({ message: "Session is not flagged" });
      }

      // Clear the flag (acknowledge it)
      const updatedSession = await storage.updateSessionOccurrence(sessionId, {
        parentFlagged: false,
        parentFlagComment: null,
        parentFlaggedAt: null,
      });

      res.json(updatedSession);
    } catch (error) {
      console.error("Error acknowledging flagged session:", error);
      res.status(500).json({ message: "Failed to acknowledge flagged session" });
    }
  });

  // Session change request endpoints
  
  // Parent submits a change request (cancel or reschedule)
  app.post("/api/parent/session-change-request", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const { sessionOccurrenceId, requestType, proposedDateMessage, reason } = req.body;

      // Verify the session belongs to one of the parent's children
      const parentStudents = await storage.getStudentsByParentEmail(user.email || "");
      const studentIds = parentStudents.map(s => s.id);

      const session = await storage.getSessionOccurrence(sessionOccurrenceId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (!session.studentId || !studentIds.includes(session.studentId)) {
        return res.status(403).json({ message: "You can only request changes for your own children's sessions" });
      }

      // Create the change request
      const changeRequest = await storage.createSessionChangeRequest({
        sessionOccurrenceId,
        parentId: user.id,
        tutorId: null,
        studentId: session.studentId,
        requesterType: "parent",
        requestType,
        originalDate: session.startDateTime,
        proposedDateMessage: proposedDateMessage || null,
        reason: reason || null,
      });

      // Get student and tutor details for notifications
      const student = parentStudents.find(s => s.id === session.studentId);
      const studentName = student?.name || "Unknown Student";
      const requestTypeText = requestType === "cancel" ? "cancellation" : "rescheduling";
      const dateStr = new Date(session.startDateTime).toLocaleDateString();
      
      // Notify all admin users
      const adminUsers = await storage.getUsersByRole("admin");
      for (const admin of adminUsers) {
        await storage.createNotification({
          userId: admin.id,
          type: "new_change_request",
          payload: {
            title: `Session ${requestTypeText} request`,
            message: `Parent has requested ${requestTypeText} for ${studentName}'s session on ${dateStr}. ${proposedDateMessage ? `Suggested alternative: ${proposedDateMessage}` : ''}`,
            relatedId: changeRequest.id,
            relatedType: "session_change_request",
          },
        });
      }

      // Notify the tutor (include session occurrence ID for calendar navigation)
      if (session.tutorId) {
        await storage.createNotification({
          userId: session.tutorId,
          type: "new_change_request",
          payload: {
            title: `Session ${requestTypeText} request`,
            message: `Parent has requested ${requestTypeText} for ${studentName}'s session on ${dateStr}. ${proposedDateMessage ? `Suggested alternative: ${proposedDateMessage}` : ''}`,
            relatedId: sessionOccurrenceId,
            relatedType: "session_occurrence",
          },
        });
      }

      res.status(201).json(changeRequest);
    } catch (error) {
      console.error("Error creating session change request:", error);
      res.status(500).json({ message: "Failed to create change request" });
    }
  });

  // Parent gets their change requests
  app.get("/api/parent/session-change-requests", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const requests = await storage.getSessionChangeRequestsByParent(user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching parent change requests:", error);
      res.status(500).json({ message: "Failed to fetch change requests" });
    }
  });

  // Admin gets all change requests
  app.get("/api/session-change-requests", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const status = req.query.status as string | undefined;
      const requests = await storage.getSessionChangeRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching change requests:", error);
      res.status(500).json({ message: "Failed to fetch change requests" });
    }
  });

  // Tutor gets change requests for their sessions
  app.get("/api/tutor/session-change-requests", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const requests = await storage.getSessionChangeRequestsByTutor(user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching tutor change requests:", error);
      res.status(500).json({ message: "Failed to fetch change requests" });
    }
  });

  // Tutor submits a reschedule request - creates change request and notifies admin
  app.post("/api/tutor/session-reschedule-request", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const { sessionOccurrenceId, proposedStartDateTime, proposedEndDateTime, reason } = req.body;

      if (!sessionOccurrenceId || !proposedStartDateTime || !proposedEndDateTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get the session occurrence
      const session = await storage.getSessionOccurrence(sessionOccurrenceId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Verify tutor owns this session
      if (session.tutorId !== user.id) {
        return res.status(403).json({ message: "You can only reschedule your own sessions" });
      }

      // Create the change request
      const proposedStart = new Date(proposedStartDateTime);
      const proposedEnd = new Date(proposedEndDateTime);
      
      const changeRequest = await storage.createSessionChangeRequest({
        sessionOccurrenceId,
        tutorId: user.id,
        studentId: session.studentId || null, // Nullable for group sessions
        groupId: session.groupId || null, // For group sessions
        requesterType: "tutor",
        requestType: "reschedule",
        originalDate: session.startDateTime,
        proposedDate: proposedStart,
        proposedStartDateTime: proposedStart,
        proposedEndDateTime: proposedEnd,
        proposedDateMessage: `Proposed new time: ${proposedStart.toLocaleDateString()} ${proposedStart.toLocaleTimeString()} - ${proposedEnd.toLocaleTimeString()}`,
        reason: reason || null,
      });

      // Get student/group info for notification
      let sessionName = "Unknown Session";
      if (session.studentId) {
        const student = await storage.getStudent(session.studentId);
        sessionName = student?.name || "Unknown Student";
      } else if (session.groupId) {
        const group = await storage.getStudentGroup(session.groupId);
        sessionName = group?.name || "Unknown Group";
      }
      const studentName = sessionName;
      const originalDateStr = new Date(session.startDateTime).toLocaleDateString();
      const newDateStr = proposedStart.toLocaleDateString();
      const newTimeStr = `${proposedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${proposedEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // Notify all admins about the pending reschedule
      const admins = await storage.getUsersByRole("admin");
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "new_change_request",
          payload: {
            title: "Session Reschedule Request",
            message: `${user.firstName} ${user.lastName} wants to reschedule ${studentName}'s session from ${originalDateStr} to ${newDateStr} at ${newTimeStr}${reason ? `. Reason: ${reason}` : ''}`,
            relatedId: changeRequest.id,
            relatedType: "session_change_request",
            sessionOccurrenceId: sessionOccurrenceId,
            requestType: "reschedule",
            requesterName: `${user.firstName} ${user.lastName}`,
            studentName,
          },
        });
      }

      res.json(changeRequest);
    } catch (error) {
      console.error("Error creating tutor reschedule request:", error);
      res.status(500).json({ message: "Failed to create reschedule request" });
    }
  });

  // Admin acknowledges a change request (legacy - keeps for backwards compatibility)
  app.post("/api/session-change-requests/:id/acknowledge", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { message } = req.body;

      const updatedRequest = await storage.updateSessionChangeRequest(req.params.id, {
        status: "acknowledged",
        adminNotes: message || null,
        acknowledgedAt: new Date(),
        acknowledgedBy: user.id,
      });

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error acknowledging change request:", error);
      res.status(500).json({ message: "Failed to acknowledge change request" });
    }
  });

  // Admin approves a change request - actually applies the change and notifies requester
  app.post("/api/session-change-requests/:id/approve", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { adminNotes, newDateTime } = req.body;
      const requestId = req.params.id;

      // Get the change request
      const requests = await storage.getSessionChangeRequests();
      const changeRequest = requests.find(r => r.id === requestId);
      if (!changeRequest) {
        return res.status(404).json({ message: "Change request not found" });
      }

      // Apply the change to the session
      const session = await storage.getSessionOccurrence(changeRequest.sessionOccurrenceId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (changeRequest.requestType === "cancel") {
        // Cancel the session
        await storage.updateSessionOccurrence(changeRequest.sessionOccurrenceId, {
          status: "cancelled"
        });
      } else if (changeRequest.requestType === "reschedule") {
        // Reschedule the session - use proposed dates from request if available
        let startTime: Date | null = null;
        let endTime: Date | null = null;
        
        // First check for explicit proposed start/end times on the change request
        if (changeRequest.proposedStartDateTime && changeRequest.proposedEndDateTime) {
          startTime = new Date(changeRequest.proposedStartDateTime);
          endTime = new Date(changeRequest.proposedEndDateTime);
        } else if (newDateTime) {
          // Fallback to admin-provided newDateTime
          const newDate = new Date(newDateTime);
          const originalDuration = session.endDateTime.getTime() - session.startDateTime.getTime();
          startTime = newDate;
          endTime = new Date(newDate.getTime() + originalDuration);
        }
        
        if (startTime && endTime) {
          await storage.updateSessionOccurrence(changeRequest.sessionOccurrenceId, {
            occurrenceDate: startTime,
            startDateTime: startTime,
            endDateTime: endTime,
            source: "rescheduled",
            originalDate: session.occurrenceDate,
          });
        }
      }

      // Update the request status
      const updatedRequest = await storage.updateSessionChangeRequest(requestId, {
        status: "approved",
        adminNotes: adminNotes || null,
        processedAt: new Date(),
        processedBy: user.id,
      });

      // Audit log for session change approval
      const studentName = changeRequest.student?.name || "Unknown";
      const groupName = session.groupId ? "Group Session" : null;
      const sessionDate = new Date(session.startDateTime).toLocaleDateString();
      await auditLog(
        changeRequest.requestType === "cancel" ? 'session_cancelled' : 'session_rescheduled',
        'session_occurrence',
        changeRequest.sessionOccurrenceId,
        user.id,
        {
          changeRequestId: requestId,
          requestType: changeRequest.requestType,
          studentName: groupName || studentName,
          sessionDate,
          requesterType: changeRequest.requesterType,
          adminNotes: adminNotes || null,
          proposedStartDateTime: changeRequest.proposedStartDateTime?.toISOString(),
          proposedEndDateTime: changeRequest.proposedEndDateTime?.toISOString(),
        }
      );

      // Notify the requester
      const requesterId = changeRequest.requesterType === "parent" 
        ? changeRequest.parentId 
        : changeRequest.tutorId;
      
      if (requesterId) {
        const student = changeRequest.student;
        const studentName = student?.name || "Unknown Student";
        const requestTypeText = changeRequest.requestType === "cancel" ? "cancellation" : "rescheduling";
        
        await storage.createNotification({
          userId: requesterId,
          type: "session_change_approved",
          payload: {
            title: `Session ${requestTypeText} approved`,
            message: `Your request for ${studentName}'s session has been approved.${adminNotes ? ` Admin note: ${adminNotes}` : ''}`,
            relatedId: changeRequest.id,
            relatedType: "session_change_request",
          },
        });
      }

      // If parent request, also notify the tutor
      if (changeRequest.requesterType === "parent" && session.tutorId) {
        const student = changeRequest.student;
        const studentName = student?.name || "Unknown Student";
        const requestTypeText = changeRequest.requestType === "cancel" ? "cancelled" : "rescheduled";
        const dateStr = new Date(session.startDateTime).toLocaleDateString();
        
        await storage.createNotification({
          userId: session.tutorId,
          type: "schedule_changed",
          payload: {
            title: `Session ${requestTypeText}`,
            message: `${studentName}'s session on ${dateStr} has been ${requestTypeText} following parent request.`,
            relatedId: changeRequest.sessionOccurrenceId,
            relatedType: "session_occurrence",
          },
        });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error approving change request:", error);
      res.status(500).json({ message: "Failed to approve change request" });
    }
  });

  // Admin rejects a change request - notifies requester with reason
  app.post("/api/session-change-requests/:id/reject", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { adminNotes } = req.body;
      const requestId = req.params.id;

      // Get the change request
      const requests = await storage.getSessionChangeRequests();
      const changeRequest = requests.find(r => r.id === requestId);
      if (!changeRequest) {
        return res.status(404).json({ message: "Change request not found" });
      }

      // Update the request status
      const updatedRequest = await storage.updateSessionChangeRequest(requestId, {
        status: "rejected",
        adminNotes: adminNotes || null,
        processedAt: new Date(),
        processedBy: user.id,
      });

      // Audit log for session change rejection
      const studentName = changeRequest.student?.name || "Unknown";
      const sessionDate = new Date(changeRequest.originalDate).toLocaleDateString();
      await auditLog(
        'session_change_rejected',
        'session_change_request',
        requestId,
        user.id,
        {
          sessionOccurrenceId: changeRequest.sessionOccurrenceId,
          requestType: changeRequest.requestType,
          studentName,
          sessionDate,
          requesterType: changeRequest.requesterType,
          adminNotes: adminNotes || null,
        }
      );

      // Notify the requester
      const requesterId = changeRequest.requesterType === "parent" 
        ? changeRequest.parentId 
        : changeRequest.tutorId;
      
      if (requesterId) {
        const student = changeRequest.student;
        const studentNameForNotify = student?.name || "Unknown Student";
        const requestTypeText = changeRequest.requestType === "cancel" ? "cancellation" : "rescheduling";
        
        await storage.createNotification({
          userId: requesterId,
          type: "session_change_rejected",
          payload: {
            title: `Session ${requestTypeText} request declined`,
            message: `Your request for ${studentNameForNotify}'s session has been declined.${adminNotes ? ` Reason: ${adminNotes}` : ''}`,
            relatedId: changeRequest.id,
            relatedType: "session_change_request",
          },
        });
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error rejecting change request:", error);
      res.status(500).json({ message: "Failed to reject change request" });
    }
  });

  // Tutor submits a change request (cancel or reschedule)
  app.post("/api/tutor/session-change-request", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const { sessionOccurrenceId, requestType, proposedDateMessage, reason } = req.body;

      // Verify the session belongs to this tutor
      const session = await storage.getSessionOccurrence(sessionOccurrenceId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.tutorId !== user.id) {
        return res.status(403).json({ message: "You can only request changes for your own sessions" });
      }

      if (!session.studentId && !session.groupId) {
        return res.status(400).json({ message: "Session must have a student or group assigned" });
      }

      // Create the change request
      const changeRequest = await storage.createSessionChangeRequest({
        sessionOccurrenceId,
        parentId: null,
        tutorId: user.id,
        studentId: session.studentId || null,
        groupId: session.groupId || null,
        requesterType: "tutor",
        requestType,
        originalDate: session.startDateTime,
        proposedDateMessage: proposedDateMessage || null,
        reason: reason || null,
      });

      // Get student/group details for notifications
      let sessionName = "Unknown Session";
      if (session.studentId) {
        const student = await storage.getStudent(session.studentId);
        sessionName = student?.name || "Unknown Student";
      } else if (session.groupId) {
        const group = await storage.getStudentGroup(session.groupId);
        sessionName = group?.name || "Unknown Group";
      }
      const studentName = sessionName;
      const requestTypeText = requestType === "cancel" ? "cancellation" : "rescheduling";
      const dateStr = new Date(session.startDateTime).toLocaleDateString();
      
      // Notify all admin users
      const adminUsers = await storage.getUsersByRole("admin");
      for (const admin of adminUsers) {
        await storage.createNotification({
          userId: admin.id,
          type: "new_change_request",
          payload: {
            title: `Tutor ${requestTypeText} request`,
            message: `${user.firstName} ${user.lastName} has requested ${requestTypeText} for ${studentName}'s session on ${dateStr}. ${reason ? `Reason: ${reason}` : ''}`,
            relatedId: changeRequest.id,
            relatedType: "session_change_request",
          },
        });
      }

      res.status(201).json(changeRequest);
    } catch (error) {
      console.error("Error creating tutor session change request:", error);
      res.status(500).json({ message: "Failed to create change request" });
    }
  });

  app.post("/api/session-occurrences", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const { insertSessionOccurrenceSchema } = await import("@shared/schema");
      const dataToValidate = user.role === "tutor" 
        ? { ...req.body, tutorId: user.id }
        : req.body;
      const validatedData = insertSessionOccurrenceSchema.parse(dataToValidate);
      const occurrence = await storage.createSessionOccurrence(validatedData);
      res.status(201).json(occurrence);
    } catch (error) {
      console.error("Error creating session occurrence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create session occurrence" });
    }
  });

  app.patch("/api/session-occurrences/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      // Get existing occurrence for validation and timesheet creation
      const existing = await storage.getSessionOccurrence(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Session occurrence not found" });
      }

      // Tutors can only update their own occurrences
      if (user.role === "tutor" && existing.tutorId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Convert date strings to Date objects before validation
      const dataToValidate = { ...req.body };
      if (dataToValidate.occurrenceDate) {
        dataToValidate.occurrenceDate = new Date(dataToValidate.occurrenceDate);
      }
      if (dataToValidate.startDateTime) {
        dataToValidate.startDateTime = new Date(dataToValidate.startDateTime);
      }
      if (dataToValidate.endDateTime) {
        dataToValidate.endDateTime = new Date(dataToValidate.endDateTime);
      }

      const { updateSessionOccurrenceSchema } = await import("@shared/schema");
      const validatedData = updateSessionOccurrenceSchema.parse(dataToValidate);
      const occurrence = await storage.updateSessionOccurrence(req.params.id, validatedData);
      
      // If marking as completed and no timesheet exists for this session, create one
      if (validatedData.status === "completed" && existing.status !== "completed" && existing.studentId) {
        // Check if a timesheet entry already exists for this session occurrence
        const existingTimesheet = await storage.getTimesheetEntryBySessionOccurrence(req.params.id);
        
        if (!existingTimesheet) {
          // Calculate session duration in hours
          const startTime = new Date(existing.startDateTime);
          const endTime = new Date(existing.endDateTime);
          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          
          // Get subject from student allocation if available
          let sessionSubject = null;
          const studentTutors = await storage.getStudentTutors(existing.studentId);
          const allocation = studentTutors.find(st => st.tutorId === existing.tutorId && st.isActive);
          if (allocation?.subject) {
            sessionSubject = allocation.subject;
          }
          
          // Create timesheet entry linked to this session
          const timesheetEntry = await storage.createTimesheetEntry({
            tutorId: existing.tutorId,
            studentId: existing.studentId,
            date: new Date(existing.occurrenceDate),
            duration: String(durationHours.toFixed(2)),
            notes: existing.notes || null,
            sessionSubject: sessionSubject,
            otherTopicsText: null,
            sessionOccurrenceId: req.params.id,
          });
          
          // Resolve any pending alerts for this session
          try {
            await storage.resolveSessionLoggingAlert(req.params.id, timesheetEntry.id);
          } catch (e) {
            // Alert might not exist, that's fine
          }
          
          // Return both the occurrence and the created timesheet
          return res.json({ 
            ...occurrence, 
            timesheetCreated: true, 
            timesheetEntry 
          });
        }
      }
      
      // If status changed to cancelled or no_show, dismiss any pending alerts
      if (["cancelled", "no_show"].includes(validatedData.status || "") && 
          existing.status !== validatedData.status) {
        try {
          // Dismiss the alert with the status change as reason
          const alerts = await storage.getSessionLoggingAlerts(undefined, "pending");
          const sessionAlert = alerts.find(a => a.sessionOccurrenceId === req.params.id);
          if (sessionAlert) {
            await storage.dismissSessionLoggingAlert(
              sessionAlert.id, 
              user.id, 
              `Session marked as ${validatedData.status} by ${user.role}`
            );
          }
        } catch (e) {
          console.error("Error dismissing alert:", e);
        }
      }
      
      res.json(occurrence);
    } catch (error) {
      console.error("Error updating session occurrence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update session occurrence" });
    }
  });

  app.delete("/api/session-occurrences/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      // Tutors can only delete their own occurrences
      if (user.role === "tutor") {
        const existing = await storage.getSessionOccurrence(req.params.id);
        if (!existing || existing.tutorId !== user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      await storage.deleteSessionOccurrence(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting session occurrence:", error);
      res.status(500).json({ message: "Failed to delete session occurrence" });
    }
  });

  // Tutor Availability Slot Routes
  app.get("/api/tutor-availability", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Admin can see all or filter by tutor, tutors only see their own
      const tutorId = user.role === "admin" 
        ? (req.query.tutorId as string | undefined)
        : user.id;
      const slots = await storage.getTutorAvailabilitySlots(tutorId);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching tutor availability:", error);
      res.status(500).json({ message: "Failed to fetch tutor availability" });
    }
  });

  // Admin endpoint to get all availability slots with tutor details
  app.get("/api/admin/tutor-availability", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const tutorId = req.query.tutorId as string | undefined;
      const slots = await storage.getTutorAvailabilitySlots(tutorId === "all" ? undefined : tutorId);
      
      // Enrich slots with tutor information
      const tutors = await storage.getTutors();
      const tutorMap = new Map(tutors.map(t => [t.id, t]));
      
      const enrichedSlots = slots.map(slot => ({
        ...slot,
        tutor: tutorMap.get(slot.tutorId),
      }));
      
      res.json(enrichedSlots);
    } catch (error) {
      console.error("Error fetching admin tutor availability:", error);
      res.status(500).json({ message: "Failed to fetch tutor availability" });
    }
  });

  app.get("/api/tutor-availability/:id", isAuthenticated, async (req: any, res) => {
    try {
      const slot = await storage.getTutorAvailabilitySlot(req.params.id);
      if (!slot) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      res.json(slot);
    } catch (error) {
      console.error("Error fetching availability slot:", error);
      res.status(500).json({ message: "Failed to fetch availability slot" });
    }
  });

  app.post("/api/tutor-availability", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const { insertTutorAvailabilitySlotSchema } = await import("@shared/schema");
      // Tutors can only create their own availability
      const dataToValidate = user.role === "tutor" 
        ? { ...req.body, tutorId: user.id }
        : req.body;
      
      // Convert date strings to Date objects for timeframe fields
      if (dataToValidate.timeframeStart) {
        dataToValidate.timeframeStart = new Date(dataToValidate.timeframeStart);
      }
      if (dataToValidate.timeframeEnd) {
        dataToValidate.timeframeEnd = new Date(dataToValidate.timeframeEnd);
      }
      
      const validatedData = insertTutorAvailabilitySlotSchema.parse(dataToValidate);
      const slot = await storage.createTutorAvailabilitySlot(validatedData);
      
      // Notify all admins about the new availability
      if (user.role === "tutor") {
        const admins = await storage.getUsersByRole("admin");
        const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "availability_change",
            payload: {
              action: "created",
              tutorId: user.id,
              tutorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
              dayOfWeek: DAYS[slot.dayOfWeek ?? 0],
              startTime: slot.startTime,
              endTime: slot.endTime,
              availabilityType: slot.availabilityType,
              notes: slot.notes,
            },
          });
        }
      }
      
      res.status(201).json(slot);
    } catch (error) {
      console.error("Error creating availability slot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create availability slot" });
    }
  });

  app.patch("/api/tutor-availability/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      // Tutors can only update their own slots
      if (user.role === "tutor") {
        const existing = await storage.getTutorAvailabilitySlot(req.params.id);
        if (!existing || existing.tutorId !== user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const { updateTutorAvailabilitySlotSchema } = await import("@shared/schema");
      const validatedData = updateTutorAvailabilitySlotSchema.parse(req.body);
      const slot = await storage.updateTutorAvailabilitySlot(req.params.id, validatedData);
      res.json(slot);
    } catch (error) {
      console.error("Error updating availability slot:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update availability slot" });
    }
  });

  app.delete("/api/tutor-availability/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      // Tutors can only delete their own slots
      if (user.role === "tutor") {
        const existing = await storage.getTutorAvailabilitySlot(req.params.id);
        if (!existing || existing.tutorId !== user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      await storage.deleteTutorAvailabilitySlot(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting availability slot:", error);
      res.status(500).json({ message: "Failed to delete availability slot" });
    }
  });

  // Tutors can view their students' mock exam bookings for calendar blocking
  app.get("/api/tutor/mock-exam-bookings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (user.role !== "admin" && user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      // Get tutor's assigned students
      const tutorId = user.role === "tutor" ? user.id : (req.query.tutorId as string);
      if (!tutorId) {
        return res.json([]);
      }

      const students = await storage.getStudentsByTutor(tutorId);
      const studentIds = students.map(s => s.id);

      if (studentIds.length === 0) {
        return res.json([]);
      }

      // Get all service bookings and filter to mock exam bookings for tutor's students
      const allBookings = await storage.getServiceBookings();
      const mockExamBookings = allBookings.filter(b => 
        b.bookingType === "mock_exam" && 
        b.studentId && 
        studentIds.includes(b.studentId) &&
        b.status !== "cancelled" &&
        b.mockExamEvent
      );

      // Return simplified data for calendar display
      const calendarEvents = mockExamBookings.map(booking => ({
        id: booking.id,
        studentId: booking.studentId,
        studentName: booking.student?.name || "Unknown Student",
        examName: booking.mockExamEvent?.examName || "Mock Exam",
        examDate: booking.mockExamEvent?.examDate,
        location: booking.mockExamEvent?.location,
        status: booking.status,
      }));

      res.json(calendarEvents);
    } catch (error) {
      console.error("Error fetching tutor mock exam bookings:", error);
      res.status(500).json({ message: "Failed to fetch mock exam bookings" });
    }
  });

  // === PRODUCT ROUTES ===
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      
      const includeInactive = req.query.includeInactive === 'true' && user.role === 'admin';
      const products = await storage.getProducts(includeInactive);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/low-stock", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Handle empty string numeric fields - convert to valid defaults
      const body = { ...req.body };
      if (body.costPrice === '' || body.costPrice === undefined) {
        body.costPrice = '0';
      }
      if (body.price === '' || body.price === undefined) {
        body.price = '0';
      }
      if (body.stockQuantity === '' || body.stockQuantity === undefined) {
        body.stockQuantity = 0;
      }
      if (body.lowStockThreshold === '' || body.lowStockThreshold === undefined) {
        body.lowStockThreshold = 5;
      }

      const { insertProductSchema } = await import("@shared/schema");
      const validatedData = insertProductSchema.parse(body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateProductSchema } = await import("@shared/schema");
      const validatedData = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Stock adjustment route
  app.post("/api/products/:id/adjust-stock", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { quantity, type, notes } = req.body;
      if (!quantity || !type) {
        return res.status(400).json({ message: "quantity and type are required" });
      }

      // Map stock_out to sale for the storage layer (sale reduces stock)
      const storageType = type === 'stock_out' ? 'sale' : type;

      const product = await storage.adjustProductStock(
        req.params.id, 
        quantity, 
        storageType, 
        notes, 
        user.id
      );
      res.json(product);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      res.status(500).json({ message: "Failed to adjust stock" });
    }
  });

  // Inventory transactions for a product
  app.get("/api/products/:id/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const transactions = await storage.getInventoryTransactions(req.params.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });

  // Get all student-tutor allocations (for admin filtering)
  app.get("/api/student-tutors/all", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      const allocations = await storage.getAllStudentTutorAllocations();
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching student-tutor allocations:", error);
      res.status(500).json({ message: "Failed to fetch allocations" });
    }
  });

  // === MOCK EXAM EVENT ROUTES ===
  app.get("/api/mock-exams", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      
      const includeCompleted = req.query.includeCompleted === 'true' && user.role === 'admin';
      const events = await storage.getMockExamEvents(includeCompleted);
      res.json(events);
    } catch (error) {
      console.error("Error fetching mock exams:", error);
      res.status(500).json({ message: "Failed to fetch mock exams" });
    }
  });

  app.get("/api/mock-exams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const event = await storage.getMockExamEvent(req.params.id);
      if (!event) return res.status(404).json({ message: "Mock exam not found" });
      res.json(event);
    } catch (error) {
      console.error("Error fetching mock exam:", error);
      res.status(500).json({ message: "Failed to fetch mock exam" });
    }
  });

  app.post("/api/mock-exams", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Convert date strings to Date objects for timestamp fields
      const bodyWithDates = {
        ...req.body,
        examDate: req.body.examDate ? new Date(req.body.examDate) : undefined,
        registrationDeadline: req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : undefined,
      };

      const { insertMockExamEventSchema } = await import("@shared/schema");
      const validatedData = insertMockExamEventSchema.parse(bodyWithDates);
      const event = await storage.createMockExamEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating mock exam:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create mock exam" });
    }
  });

  app.patch("/api/mock-exams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Convert date strings to Date objects for timestamp fields
      const bodyWithDates = {
        ...req.body,
        examDate: req.body.examDate ? new Date(req.body.examDate) : undefined,
        registrationDeadline: req.body.registrationDeadline ? new Date(req.body.registrationDeadline) : undefined,
      };

      const { updateMockExamEventSchema } = await import("@shared/schema");
      const validatedData = updateMockExamEventSchema.parse(bodyWithDates);
      const event = await storage.updateMockExamEvent(req.params.id, validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error updating mock exam:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update mock exam" });
    }
  });

  app.delete("/api/mock-exams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMockExamEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mock exam:", error);
      res.status(500).json({ message: "Failed to delete mock exam" });
    }
  });

  // Notify parents about a mock exam
  app.post("/api/mock-exams/:id/notify-parents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const count = await storage.notifyParentsOfMockExam(req.params.id);
      res.json({ message: `Notified ${count} parents`, count });
    } catch (error) {
      console.error("Error notifying parents:", error);
      res.status(500).json({ message: "Failed to notify parents" });
    }
  });

  // Register students for mock exam with auto-invoice generation
  app.post("/api/mock-exams/:id/register-students", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { studentIds, guests } = req.body as { 
        studentIds: string[]; 
        guests: { name: string; email?: string }[] 
      };
      
      const mockExamId = req.params.id;
      const exam = await storage.getMockExamEvent(mockExamId);
      if (!exam) {
        return res.status(404).json({ message: "Mock exam not found" });
      }

      const results: { bookings: any[]; invoices: any[] } = { bookings: [], invoices: [] };

      // Register existing students
      for (const studentId of studentIds || []) {
        const student = await storage.getStudent(studentId);
        if (!student) continue;
        
        // Get parent info if available
        let parent = null;
        if (student.parentUserId) {
          parent = await storage.getUser(student.parentUserId);
        }

        // Create service booking
        const booking = await storage.createServiceBooking({
          studentId,
          parentUserId: student.parentUserId || null,
          bookingType: "mock_exam",
          mockExamEventId: mockExamId,
          quantity: 1,
          unitPrice: exam.price,
          totalAmount: exam.price,
          status: "confirmed",
        });
        results.bookings.push(booking);

        // Create invoice
        const dueDate = new Date(exam.examDate);
        dueDate.setDate(dueDate.getDate() - 7); // Due 7 days before exam

        const invoice = await storage.createAdhocInvoice({
          category: "mock_exam",
          studentId,
          parentUserId: student.parentUserId || null,
          parentFirstName: parent?.firstName || student.name.split(' ')[0] || "Parent",
          parentSurname: parent?.lastName || student.name.split(' ').slice(1).join(' ') || "",
          amount: exam.price,
          reason: `Mock Exam Registration: ${exam.title} - ${student.name}`,
          status: "sent",
          dueDate,
          notes: `Auto-generated for mock exam registration`,
        });
        results.invoices.push(invoice);

        // Link invoice to booking
        await storage.updateServiceBooking(booking.id, { invoiceId: invoice.id });
      }

      // Register guest students
      for (const guest of guests || []) {
        // Create service booking for guest
        const booking = await storage.createServiceBooking({
          guestName: guest.name,
          guestEmail: guest.email || null,
          bookingType: "mock_exam",
          mockExamEventId: mockExamId,
          quantity: 1,
          unitPrice: exam.price,
          totalAmount: exam.price,
          status: "confirmed",
        });
        results.bookings.push(booking);

        // Create invoice for guest
        const nameParts = guest.name.trim().split(' ');
        const firstName = nameParts[0] || "Guest";
        const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "(Guest)";
        
        const dueDate = new Date(exam.examDate);
        dueDate.setDate(dueDate.getDate() - 7);

        const invoice = await storage.createAdhocInvoice({
          category: "mock_exam",
          parentFirstName: firstName,
          parentSurname: surname,
          guestEmail: guest.email || null,
          amount: exam.price,
          reason: `Mock Exam Registration: ${exam.title} - ${guest.name} (Guest)`,
          status: "sent",
          dueDate,
          notes: `Auto-generated for guest mock exam registration`,
        });
        results.invoices.push(invoice);

        // Link invoice to booking
        await storage.updateServiceBooking(booking.id, { invoiceId: invoice.id });
      }

      res.status(201).json({
        message: `Registered ${results.bookings.length} students with invoices`,
        bookings: results.bookings,
        invoices: results.invoices,
      });
    } catch (error) {
      console.error("Error registering students for mock exam:", error);
      res.status(500).json({ message: "Failed to register students" });
    }
  });

  // === MOCK EXAM EXPENSE ROUTES ===
  app.get("/api/mock-exams/:mockExamId/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const expenses = await storage.getMockExamExpenses(req.params.mockExamId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching mock exam expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/mock-exams/:mockExamId/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertMockExamExpenseSchema } = await import("@shared/schema");
      const validatedData = insertMockExamExpenseSchema.parse({
        ...req.body,
        mockExamEventId: req.params.mockExamId
      });
      const expense = await storage.createMockExamExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating mock exam expense:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch("/api/mock-exams/:mockExamId/expenses/:expenseId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateMockExamExpenseSchema } = await import("@shared/schema");
      const validatedData = updateMockExamExpenseSchema.parse(req.body);
      const expense = await storage.updateMockExamExpense(req.params.expenseId, validatedData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating mock exam expense:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/mock-exams/:mockExamId/expenses/:expenseId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMockExamExpense(req.params.expenseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mock exam expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  app.post("/api/mock-exams/:mockExamId/expenses/:expenseId/mark-paid", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const expense = await storage.markMockExamExpensePaid(req.params.expenseId);
      res.json(expense);
    } catch (error) {
      console.error("Error marking expense as paid:", error);
      res.status(500).json({ message: "Failed to mark expense as paid" });
    }
  });

  // === MOCK EXAM PAPER ROUTES ===
  app.get("/api/mock-exams/:mockExamId/papers", isAuthenticated, async (req: any, res) => {
    try {
      const papers = await storage.getMockExamPapers(req.params.mockExamId);
      res.json(papers);
    } catch (error) {
      console.error("Error fetching mock exam papers:", error);
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  app.get("/api/mock-exams/:mockExamId/papers-with-results", isAuthenticated, async (req: any, res) => {
    try {
      const papers = await storage.getMockExamPapersWithResults(req.params.mockExamId);
      res.json(papers);
    } catch (error) {
      console.error("Error fetching papers with results:", error);
      res.status(500).json({ message: "Failed to fetch papers with results" });
    }
  });

  app.post("/api/mock-exams/:mockExamId/papers", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertMockExamPaperSchema } = await import("@shared/schema");
      const paperData = {
        ...req.body,
        mockExamEventId: req.params.mockExamId,
      };
      const validatedData = insertMockExamPaperSchema.parse(paperData);
      const paper = await storage.createMockExamPaper(validatedData);
      res.status(201).json(paper);
    } catch (error) {
      console.error("Error creating mock exam paper:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create paper" });
    }
  });

  app.patch("/api/mock-exams/:mockExamId/papers/:paperId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateMockExamPaperSchema } = await import("@shared/schema");
      const validatedData = updateMockExamPaperSchema.parse(req.body);
      const paper = await storage.updateMockExamPaper(req.params.paperId, validatedData);
      res.json(paper);
    } catch (error) {
      console.error("Error updating mock exam paper:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update paper" });
    }
  });

  app.delete("/api/mock-exams/:mockExamId/papers/:paperId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMockExamPaper(req.params.paperId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mock exam paper:", error);
      res.status(500).json({ message: "Failed to delete paper" });
    }
  });

  // === MOCK EXAM RESULTS ROUTES ===
  app.get("/api/mock-exams/:mockExamId/results", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const papers = await storage.getMockExamPapersWithResults(req.params.mockExamId);
      res.json(papers);
    } catch (error) {
      console.error("Error fetching mock exam results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.post("/api/mock-exams/:mockExamId/results", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { paperId, bookingId, score, isConfirmed } = req.body;
      if (!paperId || !bookingId) {
        return res.status(400).json({ message: "paperId and bookingId are required" });
      }

      const result = await storage.upsertMockExamResult(
        paperId,
        bookingId,
        score !== undefined ? score : null,
        isConfirmed ?? false,
        user.id
      );
      res.json(result);
    } catch (error) {
      console.error("Error saving mock exam result:", error);
      res.status(500).json({ message: "Failed to save result" });
    }
  });

  app.post("/api/mock-exams/:mockExamId/confirm-participant", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { bookingId, isConfirmed } = req.body;
      if (!bookingId) {
        return res.status(400).json({ message: "bookingId is required" });
      }

      await storage.confirmMockExamParticipant(bookingId, isConfirmed ?? true);
      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming participant:", error);
      res.status(500).json({ message: "Failed to confirm participant" });
    }
  });

  app.post("/api/mock-exams/:mockExamId/batch-results", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { results } = req.body; // Array of { paperId, bookingId, score, isConfirmed }
      if (!Array.isArray(results)) {
        return res.status(400).json({ message: "results must be an array" });
      }

      const savedResults = [];
      for (const r of results) {
        const result = await storage.upsertMockExamResult(
          r.paperId,
          r.bookingId,
          r.score !== undefined ? r.score : null,
          r.isConfirmed ?? false,
          user.id
        );
        savedResults.push(result);
      }
      res.json(savedResults);
    } catch (error) {
      console.error("Error saving batch results:", error);
      res.status(500).json({ message: "Failed to save results" });
    }
  });

  // Historical mock exam batch results (using studentId instead of bookingId)
  app.post("/api/mock-exams/:mockExamId/historical-results", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { results } = req.body; // Array of { paperId, studentId, score, isConfirmed }
      if (!Array.isArray(results)) {
        return res.status(400).json({ message: "results must be an array" });
      }

      const savedResults = [];
      for (const r of results) {
        const result = await storage.upsertHistoricalMockExamResult(
          r.paperId,
          r.studentId,
          r.score !== undefined ? r.score : null,
          r.isConfirmed ?? true,
          user.id
        );
        savedResults.push(result);
      }
      res.json(savedResults);
    } catch (error) {
      console.error("Error saving historical results:", error);
      res.status(500).json({ message: "Failed to save historical results" });
    }
  });

  // Mock exam trend analytics
  app.get("/api/mock-exams/trends/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getMockExamTrendAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching mock exam trends:", error);
      res.status(500).json({ message: "Failed to fetch trend analytics" });
    }
  });

  // Parent mock exam results (anonymous rankings)
  app.get("/api/parent/mock-exam-results", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const results = await storage.getParentMockExamResults(user.id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching parent mock exam results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Tutor mock exam results (for their assigned students)
  app.get("/api/tutor/mock-exam-results", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const results = await storage.getTutorMockExamResults(user.id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching tutor mock exam results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Admin mock exam results (non-anonymized with full details)
  app.get("/api/admin/mock-exam-results/:mockExamId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const papers = await storage.getMockExamPapersWithResults(req.params.mockExamId);
      
      // Calculate statistics for each paper
      const statistics = papers.map(paper => {
        const confirmedResults = paper.results.filter(r => r.isConfirmed && r.score !== null);
        const scores = confirmedResults.map(r => r.score as number).sort((a, b) => b - a);
        
        if (scores.length === 0) {
          return {
            paperId: paper.id,
            paperTitle: paper.title,
            maxScore: paper.maxScore,
            totalParticipants: paper.results.length,
            confirmedParticipants: 0,
            median: 0,
            average: 0,
            highest: 0,
            lowest: 0,
          };
        }
        
        const median = scores.length % 2 === 0
          ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
          : scores[Math.floor(scores.length / 2)];
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        return {
          paperId: paper.id,
          paperTitle: paper.title,
          maxScore: paper.maxScore,
          totalParticipants: paper.results.length,
          confirmedParticipants: scores.length,
          median,
          average,
          highest: scores[0],
          lowest: scores[scores.length - 1],
        };
      });
      
      res.json({ papers, statistics });
    } catch (error) {
      console.error("Error fetching admin mock exam results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // === TERMS AND CONDITIONS ROUTES ===
  app.get("/api/terms-and-conditions", async (req: any, res) => {
    try {
      // Public endpoint - can fetch all or just active
      const activeOnly = req.query.active === 'true';
      if (activeOnly) {
        const active = await storage.getActiveTermsAndConditions();
        res.json(active ? [active] : []);
      } else {
        const terms = await storage.getTermsAndConditions();
        res.json(terms);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ message: "Failed to fetch terms and conditions" });
    }
  });

  app.get("/api/terms-and-conditions/active", async (req: any, res) => {
    try {
      const active = await storage.getActiveTermsAndConditions();
      if (!active) {
        return res.status(404).json({ message: "No active terms and conditions" });
      }
      res.json(active);
    } catch (error) {
      console.error("Error fetching active terms:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  app.get("/api/terms-and-conditions/:id", async (req: any, res) => {
    try {
      const terms = await storage.getTermsAndConditionsById(req.params.id);
      if (!terms) {
        return res.status(404).json({ message: "Terms not found" });
      }
      res.json(terms);
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ message: "Failed to fetch terms" });
    }
  });

  app.post("/api/terms-and-conditions", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { insertTermsAndConditionsSchema } = await import("@shared/schema");
      const validatedData = insertTermsAndConditionsSchema.parse({
        ...req.body,
        effectiveDate: req.body.effectiveDate ? new Date(req.body.effectiveDate) : new Date(),
        createdBy: user.id,
      });
      
      const terms = await storage.createTermsAndConditions(validatedData);
      res.json(terms);
    } catch (error) {
      console.error("Error creating terms:", error);
      res.status(500).json({ message: "Failed to create terms" });
    }
  });

  app.patch("/api/terms-and-conditions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateTermsAndConditionsSchema } = await import("@shared/schema");
      const validatedData = updateTermsAndConditionsSchema.parse(req.body);
      
      const terms = await storage.updateTermsAndConditions(req.params.id, validatedData);
      res.json(terms);
    } catch (error) {
      console.error("Error updating terms:", error);
      res.status(500).json({ message: "Failed to update terms" });
    }
  });

  app.delete("/api/terms-and-conditions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteTermsAndConditions(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting terms:", error);
      res.status(500).json({ message: "Failed to delete terms" });
    }
  });

  // === MOCK EXAM REGISTRATION ROUTES ===
  app.get("/api/mock-exam-registrations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const mockExamEventId = req.query.mockExamEventId as string | undefined;
      const registrations = await storage.getMockExamRegistrations(mockExamEventId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get("/api/mock-exam-registrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const registration = await storage.getMockExamRegistrationById(req.params.id);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      res.json(registration);
    } catch (error) {
      console.error("Error fetching registration:", error);
      res.status(500).json({ message: "Failed to fetch registration" });
    }
  });

  // Public registration endpoint (for guests and parents)
  app.post("/api/mock-exam-registrations", async (req: any, res) => {
    try {
      const { insertMockExamRegistrationSchema } = await import("@shared/schema");
      const { selectedPaperIds, ...registrationData } = req.body;

      // Calculate total amount based on mock exam price
      const event = await storage.getMockExamEvent(registrationData.mockExamEventId);
      if (!event) {
        return res.status(404).json({ message: "Mock exam event not found" });
      }

      const totalAmount = event.price;

      const validatedData = insertMockExamRegistrationSchema.parse({
        ...registrationData,
        totalAmount,
      });
      
      const registration = await storage.createMockExamRegistration(
        validatedData, 
        selectedPaperIds || []
      );
      res.json(registration);
    } catch (error) {
      console.error("Error creating registration:", error);
      res.status(500).json({ message: "Failed to create registration" });
    }
  });

  app.patch("/api/mock-exam-registrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateMockExamRegistrationSchema } = await import("@shared/schema");
      const validatedData = updateMockExamRegistrationSchema.parse(req.body);
      
      const registration = await storage.updateMockExamRegistration(req.params.id, validatedData);
      res.json(registration);
    } catch (error) {
      console.error("Error updating registration:", error);
      res.status(500).json({ message: "Failed to update registration" });
    }
  });

  app.patch("/api/mock-exam-registrations/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      if (!['pending_tc', 'awaiting_payment', 'confirmed', 'cancelled', 'refunded'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const registration = await storage.updateMockExamRegistrationStatus(req.params.id, status);
      res.json(registration);
    } catch (error) {
      console.error("Error updating registration status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.delete("/api/mock-exam-registrations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMockExamRegistration(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting registration:", error);
      res.status(500).json({ message: "Failed to delete registration" });
    }
  });

  // === TERMS ACCEPTANCE ROUTES ===
  // Public endpoint for accepting terms
  app.post("/api/terms-acceptances", async (req: any, res) => {
    try {
      const { insertTermsAcceptanceSchema } = await import("@shared/schema");
      
      // Get IP address and user agent
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const validatedData = insertTermsAcceptanceSchema.parse({
        ...req.body,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
        userAgent,
        acceptedAt: new Date(),
      });
      
      const acceptance = await storage.createTermsAcceptance(validatedData);
      res.json(acceptance);
    } catch (error) {
      console.error("Error accepting terms:", error);
      res.status(500).json({ message: "Failed to accept terms" });
    }
  });

  app.get("/api/terms-acceptances/:registrationId", isAuthenticated, async (req: any, res) => {
    try {
      const acceptances = await storage.getTermsAcceptancesByRegistration(req.params.registrationId);
      res.json(acceptances);
    } catch (error) {
      console.error("Error fetching acceptances:", error);
      res.status(500).json({ message: "Failed to fetch acceptances" });
    }
  });

  // Get mock exams available for registration (public endpoint for registration form)
  app.get("/api/public/mock-exams-available", async (req: any, res) => {
    try {
      const exams = await storage.getMockExamEvents(false); // Get non-archived exams
      const now = new Date();
      
      // Filter to only show exams with open registration
      const availableExams = exams.filter(exam => {
        const isOpen = exam.status === 'registration_open';
        const notFull = !exam.maxCapacity || exam.currentEnrollments < exam.maxCapacity;
        const beforeDeadline = !exam.registrationDeadline || new Date(exam.registrationDeadline) > now;
        const beforeExam = new Date(exam.examDate) > now;
        return isOpen && notFull && beforeDeadline && beforeExam;
      });

      // Get papers for each exam
      const examsWithPapers = await Promise.all(
        availableExams.map(async (exam) => {
          const papers = await storage.getMockExamPapers(exam.id);
          return { ...exam, papers };
        })
      );

      res.json(examsWithPapers);
    } catch (error) {
      console.error("Error fetching available exams:", error);
      res.status(500).json({ message: "Failed to fetch available exams" });
    }
  });

  // === SERVICE BOOKING ROUTES ===
  app.get("/api/service-bookings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      
      const parentId = user.role === 'parent' ? user.id : (req.query.parentId as string | undefined);
      const status = req.query.status as string | undefined;
      
      const bookings = await storage.getServiceBookings(parentId, status);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  app.get("/api/service-bookings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.getServiceBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      
      const user = req.dbUser;
      if (user.role === 'parent' && booking.parentUserId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching service booking:", error);
      res.status(500).json({ message: "Failed to fetch service booking" });
    }
  });

  app.post("/api/service-bookings", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const { insertServiceBookingSchema } = await import("@shared/schema");
      const bookingData = {
        ...req.body,
        parentUserId: user.role === 'parent' ? user.id : req.body.parentUserId
      };
      
      const validatedData = insertServiceBookingSchema.parse(bookingData);
      const booking = await storage.createServiceBooking(validatedData);
      
      // If it's a product purchase, reduce stock
      if (booking.productId) {
        await storage.adjustProductStock(
          booking.productId, 
          booking.quantity, 
          'sale', 
          `Service booking ${booking.id}`,
          user.id,
          booking.id
        );
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating service booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  app.patch("/api/service-bookings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { updateServiceBookingSchema } = await import("@shared/schema");
      const validatedData = updateServiceBookingSchema.parse(req.body);
      const booking = await storage.updateServiceBooking(req.params.id, validatedData);
      res.json(booking);
    } catch (error) {
      console.error("Error updating service booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service booking" });
    }
  });

  app.delete("/api/service-bookings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteServiceBooking(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service booking:", error);
      res.status(500).json({ message: "Failed to delete service booking" });
    }
  });

  // === PARENT SERVICE NOTIFICATION ROUTES ===
  app.get("/api/parent-notifications", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await storage.getParentServiceNotifications(user.id, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching parent notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/parent-notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const notification = await storage.markParentServiceNotificationRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  // === DOCUMENT STORE ROUTES ===
  
  // Get all documents (admin/tutor only)
  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const includeInactive = req.query.includeInactive === 'true';
      const documents = await storage.getDocuments(includeInactive);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get shareable recipients with parent-student pairs and tutor/year group info
  // IMPORTANT: This route MUST be before /api/documents/:id to avoid path matching issues
  app.get("/api/documents/shareable-recipients", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const tutorId = req.query.tutorId as string | undefined;
      const yearGroup = req.query.yearGroup ? parseInt(req.query.yearGroup as string) : undefined;
      
      const recipients = await storage.getShareableRecipients(tutorId, yearGroup);
      res.json(recipients);
    } catch (error) {
      console.error("Error fetching shareable recipients:", error);
      res.status(500).json({ message: "Failed to fetch shareable recipients" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Create document (admin/tutor only)
  app.post("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const { insertDocumentSchema } = await import("@shared/schema");
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        uploadedBy: user.id,
      });
      const document = await storage.createDocument(validatedData);
      await auditLog('document_created', 'document', document.id, user.id, {
        name: document.name,
        fileType: document.fileType
      });
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Update document (admin/tutor only)
  app.patch("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const { updateDocumentSchema } = await import("@shared/schema");
      const validatedData = updateDocumentSchema.parse(req.body);
      const document = await storage.updateDocument(req.params.id, validatedData);
      await auditLog('document_updated', 'document', req.params.id, user.id, {
        changes: req.body
      });
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document (admin only)
  app.delete("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await auditLog('document_deleted', 'document', req.params.id, user.id, {});
      await storage.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Get shares for a document
  app.get("/api/documents/:id/shares", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const shares = await storage.getDocumentShares(req.params.id);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching document shares:", error);
      res.status(500).json({ message: "Failed to fetch document shares" });
    }
  });

  // Share document with a parent
  app.post("/api/documents/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || (user.role !== "admin" && user.role !== "tutor")) {
        return res.status(403).json({ message: "Admin or tutor access required" });
      }

      const { parentIds, message, studentId, tutorVisibleWhenShared } = req.body;
      
      if (!parentIds || !Array.isArray(parentIds) || parentIds.length === 0) {
        return res.status(400).json({ message: "At least one parent ID is required" });
      }

      const shareCount = await storage.shareDocumentWithMultipleParents(
        req.params.id,
        parentIds,
        user.id,
        message,
        studentId,
        tutorVisibleWhenShared || false
      );
      
      await auditLog('document_shared', 'document', req.params.id, user.id, {
        recipientCount: shareCount,
        parentIds: parentIds.slice(0, 5) // Log first 5 parent IDs
      });
      res.status(201).json({ message: `Document shared with ${shareCount} parent(s)`, shareCount });
    } catch (error) {
      console.error("Error sharing document:", error);
      res.status(500).json({ message: "Failed to share document" });
    }
  });

  // Update document tutor visibility (admin only)
  app.patch("/api/documents/:id/tutor-visibility", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { visibleToTutors } = req.body;
      if (typeof visibleToTutors !== 'boolean') {
        return res.status(400).json({ message: "visibleToTutors must be a boolean" });
      }

      const document = await storage.updateDocumentTutorVisibility(req.params.id, visibleToTutors);
      await auditLog('document_updated', 'document', req.params.id, user.id, {
        tutorVisibilityChanged: visibleToTutors
      });
      res.json(document);
    } catch (error) {
      console.error("Error updating document tutor visibility:", error);
      res.status(500).json({ message: "Failed to update document tutor visibility" });
    }
  });

  // Get documents visible to tutor
  app.get("/api/tutor-documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const documents = await storage.getDocumentsForTutor(user.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching tutor documents:", error);
      res.status(500).json({ message: "Failed to fetch tutor documents" });
    }
  });

  // Get document shares visible to tutor (where tutorVisibleWhenShared is true)
  app.get("/api/tutor-document-shares", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "tutor") {
        return res.status(403).json({ message: "Tutor access required" });
      }

      const shares = await storage.getDocumentSharesVisibleToTutor(user.id);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching tutor document shares:", error);
      res.status(500).json({ message: "Failed to fetch tutor document shares" });
    }
  });

  // Get all document shares with parent info (admin only - for filtering)
  app.get("/api/all-document-shares", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const shares = await storage.getAllDocumentSharesWithParentInfo();
      res.json(shares);
    } catch (error) {
      console.error("Error fetching all document shares:", error);
      res.status(500).json({ message: "Failed to fetch all document shares" });
    }
  });

  // Delete document share (admin only)
  app.delete("/api/document-shares/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteDocumentShare(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document share:", error);
      res.status(500).json({ message: "Failed to delete document share" });
    }
  });

  // Get shared documents for parent
  app.get("/api/my-documents", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const unreadOnly = req.query.unreadOnly === 'true';
      const shares = await storage.getDocumentSharesForParent(user.id, unreadOnly);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching shared documents:", error);
      res.status(500).json({ message: "Failed to fetch shared documents" });
    }
  });

  // Mark document share as read
  app.patch("/api/document-shares/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "parent") {
        return res.status(403).json({ message: "Parent access required" });
      }

      const share = await storage.markDocumentShareRead(req.params.id);
      res.json(share);
    } catch (error) {
      console.error("Error marking document share as read:", error);
      res.status(500).json({ message: "Failed to mark document as read" });
    }
  });

  // ========== Tutor/Student Allocation Routes ==========

  // Get all allocations (admin only)
  app.get("/api/allocations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allocations = await storage.getAllAllocations();
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      res.status(500).json({ message: "Failed to fetch allocations" });
    }
  });

  // Get allocations by tutor (admin only)
  app.get("/api/allocations/by-tutor/:tutorId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allocations = await storage.getAllocationsByTutor(req.params.tutorId);
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching tutor allocations:", error);
      res.status(500).json({ message: "Failed to fetch tutor allocations" });
    }
  });

  // Get allocations by student (admin only)
  app.get("/api/allocations/by-student/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allocations = await storage.getAllocationsByStudent(req.params.studentId);
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching student allocations:", error);
      res.status(500).json({ message: "Failed to fetch student allocations" });
    }
  });

  // Get profit summary per tutor (admin only)
  app.get("/api/allocations/profit-summary", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const summary = await storage.getTutorProfitSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching profit summary:", error);
      res.status(500).json({ message: "Failed to fetch profit summary" });
    }
  });

  // Get single allocation (admin only)
  app.get("/api/allocations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allocation = await storage.getAllocation(req.params.id);
      if (!allocation) {
        return res.status(404).json({ message: "Allocation not found" });
      }
      res.json(allocation);
    } catch (error) {
      console.error("Error fetching allocation:", error);
      res.status(500).json({ message: "Failed to fetch allocation" });
    }
  });

  // Create allocation (admin only)
  app.post("/api/allocations", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertStudentTutorSchema.parse(req.body);
      const allocation = await storage.createAllocation(validatedData);
      await auditLog('allocation_created', 'allocation', allocation.id, user.id, {
        studentId: allocation.studentId,
        tutorId: allocation.tutorId,
        subject: allocation.subject
      });
      res.status(201).json(allocation);
    } catch (error: any) {
      console.error("Error creating allocation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      if (error.message?.includes("already exists")) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create allocation" });
    }
  });

  // Update allocation (admin only)
  app.patch("/api/allocations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = updateStudentTutorSchema.parse(req.body);
      const allocation = await storage.updateAllocation(req.params.id, validatedData);
      await auditLog('allocation_updated', 'allocation', allocation.id, user.id, {
        changes: validatedData
      });
      res.json(allocation);
    } catch (error) {
      console.error("Error updating allocation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update allocation" });
    }
  });

  // Delete allocation (admin only)
  app.delete("/api/allocations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await auditLog('allocation_deleted', 'allocation', req.params.id, user.id, {});
      await storage.deleteAllocation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting allocation:", error);
      res.status(500).json({ message: "Failed to delete allocation" });
    }
  });

  // ================ AUDIT LOG ROUTES ================

  // Get audit logs (admin only)
  app.get("/api/audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const filters: any = {};
      
      if (req.query.action) filters.action = req.query.action;
      if (req.query.entityType) filters.entityType = req.query.entityType;
      if (req.query.performedBy) filters.performedBy = req.query.performedBy;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const result = await storage.getAuditLogs(limit, offset, filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
