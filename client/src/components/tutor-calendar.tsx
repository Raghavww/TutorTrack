import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Calendar, Clock, Trash2, Undo2, MessageSquare, RefreshCw, CalendarX } from "lucide-react";
import type { User, SessionOccurrence, TutorAvailabilitySlot, Student, TimesheetEntry } from "@shared/schema";

interface TutorCalendarProps {
  user: User;
  onBack?: () => void;
  initialDate?: Date;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function TutorCalendar({ user, onBack, initialDate }: TutorCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: true,
    availabilityType: "weekly" as "weekly" | "seasonal",
    timeframeStart: "",
    timeframeEnd: "",
    notes: "",
  });
  const [lastReschedule, setLastReschedule] = useState<{
    sessionId: string;
    originalDate: Date;
    originalStartTime: Date;
    originalEndTime: Date;
    studentName: string;
  } | null>(null);
  const [isChangeRequestDialogOpen, setIsChangeRequestDialogOpen] = useState(false);
  const [changeRequestData, setChangeRequestData] = useState({
    requestType: "reschedule" as "cancel" | "reschedule",
    reason: "",
    proposedDateMessage: "",
  });

  const { data: sessionOccurrences = [], isLoading: isLoadingSessions } = useQuery<(SessionOccurrence & { student?: Student; tutor?: User })[]>({
    queryKey: ["/api/session-occurrences"],
  });

  const { data: availabilitySlots = [], isLoading: isLoadingAvailability } = useQuery<TutorAvailabilitySlot[]>({
    queryKey: ["/api/tutor-availability"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students/my"],
  });

  // Fetch student groups to display group session info
  const { data: studentGroups = [] } = useQuery<any[]>({
    queryKey: ["/api/student-groups"],
  });

  // Fetch timesheet entries to check which sessions have been logged
  const { data: timesheetEntries = [] } = useQuery<(TimesheetEntry & { sessionOccurrenceId?: string })[]>({
    queryKey: ["/api/timesheets/my-sessions"],
  });

  // Fetch mock exam bookings for students to show blocked dates
  const { data: mockExamBookings = [] } = useQuery<{
    id: string;
    studentId: string;
    studentName: string;
    examName: string;
    examDate: string;
    location?: string;
    status: string;
  }[]>({
    queryKey: ["/api/tutor/mock-exam-bookings"],
  });

  // Fetch pending change requests to show grey placeholders for pending reschedules
  const { data: pendingChangeRequests = [] } = useQuery<{
    id: string;
    sessionOccurrenceId: string;
    requestType: string;
    status: string;
    proposedStartDateTime?: string;
    proposedEndDateTime?: string;
    proposedDateMessage?: string;
    student?: { id: string; name: string };
    sessionOccurrence?: { id: string; studentId: string; startDateTime: string };
  }[]>({
    queryKey: ["/api/tutor/session-change-requests"],
  });

  // Create a set of logged session occurrence IDs for quick lookup
  const loggedSessionIds = new Set(
    timesheetEntries
      .filter((entry) => entry.sessionOccurrenceId)
      .map((entry) => entry.sessionOccurrenceId)
  );

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: typeof newAvailability) => {
      const response = await apiRequest("POST", "/api/tutor-availability", {
        tutorId: user.id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isRecurring: data.isRecurring,
        availabilityType: data.availabilityType,
        timeframeStart: data.availabilityType === "seasonal" && data.timeframeStart ? new Date(data.timeframeStart) : undefined,
        timeframeEnd: data.availabilityType === "seasonal" && data.timeframeEnd ? new Date(data.timeframeEnd) : undefined,
        notes: data.notes || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Availability slot added!" });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-availability"] });
      setIsAvailabilityDialogOpen(false);
      setNewAvailability({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
        availabilityType: "weekly",
        timeframeStart: "",
        timeframeEnd: "",
        notes: "",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create availability slot.", variant: "destructive" });
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tutor-availability/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Availability slot removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-availability"] });
      setSelectedEvent(null);
      setIsEventDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to delete availability slot.", variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates, isReschedule, originalData }: { 
      id: string; 
      updates: any; 
      isReschedule?: boolean;
      originalData?: { date: Date; startTime: Date; endTime: Date; studentName: string };
    }) => {
      const response = await apiRequest("PATCH", `/api/session-occurrences/${id}`, updates);
      return { result: await response.json(), isReschedule, originalData, sessionId: id };
    },
    onSuccess: (data) => {
      if (data.isReschedule && data.originalData) {
        setLastReschedule({
          sessionId: data.sessionId,
          originalDate: data.originalData.date,
          originalStartTime: data.originalData.startTime,
          originalEndTime: data.originalData.endTime,
          studentName: data.originalData.studentName,
        });
        toast({ title: "Session Rescheduled", description: "You can undo this change using the button below the calendar." });
      } else if (data.result?.timesheetCreated) {
        toast({ 
          title: "Session Completed", 
          description: "A timesheet entry has been automatically created for this session. You can edit it in your timesheet." 
        });
        queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
      } else {
        toast({ title: "Updated", description: "Session updated successfully." });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setIsEventDialogOpen(false);
      setIsRescheduling(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to update session.", variant: "destructive" });
    },
  });

  const undoRescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!lastReschedule) return;
      const response = await apiRequest("PATCH", `/api/session-occurrences/${lastReschedule.sessionId}`, {
        occurrenceDate: lastReschedule.originalDate,
        startDateTime: lastReschedule.originalStartTime,
        endDateTime: lastReschedule.originalEndTime,
        source: 'manual',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Undone", description: "Session restored to original time." });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setLastReschedule(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to undo reschedule.", variant: "destructive" });
    },
  });

  const createChangeRequestMutation = useMutation({
    mutationFn: async (data: { sessionOccurrenceId: string; requestType: "cancel" | "reschedule"; reason: string; proposedDateMessage?: string; isGroupSession?: boolean; groupSessions?: any[] }) => {
      // For group sessions, create change requests for all sessions in the group
      if (data.isGroupSession && data.groupSessions && data.groupSessions.length > 0) {
        const results = await Promise.all(
          data.groupSessions.map((session: any) =>
            apiRequest("POST", "/api/tutor/session-change-request", {
              sessionOccurrenceId: session.id,
              requestType: data.requestType,
              reason: data.reason,
              proposedDateMessage: data.proposedDateMessage,
            }).then(res => res.json())
          )
        );
        return results;
      }
      // For individual sessions, just create one request
      const response = await apiRequest("POST", "/api/tutor/session-change-request", {
        sessionOccurrenceId: data.sessionOccurrenceId,
        requestType: data.requestType,
        reason: data.reason,
        proposedDateMessage: data.proposedDateMessage,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "Your change request has been submitted to the admin." });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/session-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setIsChangeRequestDialogOpen(false);
      setIsEventDialogOpen(false);
      setChangeRequestData({ requestType: "reschedule", reason: "", proposedDateMessage: "" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to submit change request.", variant: "destructive" });
    },
  });

  // Mutation for reschedule requests with specific dates - creates change request for admin approval
  const createRescheduleRequestMutation = useMutation({
    mutationFn: async (data: { sessionOccurrenceId: string; proposedStartDateTime: Date; proposedEndDateTime: Date; reason?: string; isGroupSession?: boolean; groupSessions?: any[] }) => {
      // For group sessions, create reschedule requests for all sessions in the group
      if (data.isGroupSession && data.groupSessions && data.groupSessions.length > 0) {
        const results = await Promise.all(
          data.groupSessions.map((session: any) =>
            apiRequest("POST", "/api/tutor/session-reschedule-request", {
              sessionOccurrenceId: session.id,
              proposedStartDateTime: data.proposedStartDateTime,
              proposedEndDateTime: data.proposedEndDateTime,
              reason: data.reason,
            }).then(res => res.json())
          )
        );
        return results;
      }
      // For individual sessions, just create one request
      const response = await apiRequest("POST", "/api/tutor/session-reschedule-request", {
        sessionOccurrenceId: data.sessionOccurrenceId,
        proposedStartDateTime: data.proposedStartDateTime,
        proposedEndDateTime: data.proposedEndDateTime,
        reason: data.reason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Reschedule Request Submitted", 
        description: "Your reschedule request has been sent to the admin for approval. The session will be updated once approved." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/session-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setIsEventDialogOpen(false);
      setIsRescheduling(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to submit reschedule request.", variant: "destructive" });
    },
  });

  const getNextDateForDay = (dayOfWeek: number): Date => {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate;
  };

  // Helper to determine session color based on status, pending requests, and whether it's been logged
  const getSessionColors = (session: SessionOccurrence & { student?: Student; tutor?: User; pendingChangeRequest?: any }) => {
    const sessionDate = new Date(session.endDateTime);
    const now = new Date();
    const isPast = sessionDate < now;
    const isLogged = loggedSessionIds.has(session.id);
    const sessionWithRequest = session as any;
    
    // Check for pending change requests - show as tentative
    if (sessionWithRequest.pendingChangeRequest) {
      if (sessionWithRequest.pendingChangeRequest.requestType === "cancel") {
        return { bg: "#fca5a5", border: "#f87171", pattern: "striped" }; // Light red striped for tentative cancel
      }
      if (sessionWithRequest.pendingChangeRequest.requestType === "reschedule") {
        return { bg: "#c4b5fd", border: "#a78bfa", pattern: "striped" }; // Light purple striped for tentative reschedule
      }
    }
    
    if (session.status === "cancelled") {
      return { bg: "#ef4444", border: "#dc2626" }; // Red for cancelled
    }
    if (session.status === "no_show") {
      return { bg: "#f97316", border: "#ea580c" }; // Orange for no-show
    }
    if (session.status === "completed" || isLogged) {
      return { bg: "#22c55e", border: "#16a34a" }; // Green for completed/logged
    }
    if (isPast && (session.status === "scheduled" || session.status === "confirmed")) {
      return { bg: "#eab308", border: "#ca8a04" }; // Yellow/Amber for past unactioned - needs attention
    }
    if (session.status === "confirmed") {
      return { bg: "#8b5cf6", border: "#7c3aed" }; // Purple for confirmed
    }
    return { bg: "#3b82f6", border: "#2563eb" }; // Blue for upcoming scheduled
  };

  const processedSessionEvents = (() => {
    const individualSessions: typeof sessionOccurrences = [];
    const groupSessionsByKey: Map<string, typeof sessionOccurrences> = new Map();
    
    sessionOccurrences.forEach(session => {
      const sessionWithGroup = session as any;
      if (sessionWithGroup.groupId) {
        const startStr = new Date(session.startDateTime).toISOString();
        const endStr = new Date(session.endDateTime).toISOString();
        const key = `${sessionWithGroup.groupId}-${startStr}-${endStr}`;
        const existing = groupSessionsByKey.get(key) || [];
        existing.push(session);
        groupSessionsByKey.set(key, existing);
      } else {
        individualSessions.push(session);
      }
    });

    const individualEvents = individualSessions.map((session) => {
      const colors = getSessionColors(session as any);
      const sessionWithRequest = session as any;
      const pendingRequest = sessionWithRequest.pendingChangeRequest;
      
      // Add indicator to title if there's a pending request
      let title = session.student?.name || "Session";
      if (pendingRequest) {
        if (pendingRequest.requestType === "cancel") {
          title = `⏳ ${title} (Pending Cancel)`;
        } else if (pendingRequest.requestType === "reschedule") {
          title = `⏳ ${title} (Pending Reschedule)`;
        }
      }
      
      return {
        id: `session-${session.id}`,
        title,
        start: new Date(session.startDateTime),
        end: new Date(session.endDateTime),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        extendedProps: {
          type: "session",
          data: session,
          isLogged: loggedSessionIds.has(session.id),
          isGroupSession: false,
          pendingChangeRequest: pendingRequest || null,
        },
      };
    });

    const groupEvents = Array.from(groupSessionsByKey.entries()).map(([key, sessions]) => {
      const firstSession = sessions[0] as any;
      // Try to find the group from the studentGroups query, or use the group from the session
      const groupFromQuery = studentGroups.find((g: any) => g.id === firstSession.groupId);
      const groupFromSession = firstSession.group;
      const group = groupFromQuery || groupFromSession;
      
      // Get student names - try multiple sources
      let studentNames = "";
      let groupMembersList: any[] = [];
      
      // 1. First check groupMembers on the session (returned by backend getSessionOccurrences)
      if (firstSession.groupMembers && firstSession.groupMembers.length > 0) {
        groupMembersList = firstSession.groupMembers;
        studentNames = firstSession.groupMembers.map((s: any) => s.name).filter(Boolean).join(", ");
      } 
      // 2. Check if group from query has members
      else if (groupFromQuery?.members && groupFromQuery.members.length > 0) {
        groupMembersList = groupFromQuery.members.map((m: any) => m.student).filter(Boolean);
        studentNames = groupMembersList.map((s: any) => s.name).filter(Boolean).join(", ");
      }
      // 3. Fallback: collect student names from all sessions in the group
      else {
        const studentsFromSessions = sessions
          .map(s => s.student)
          .filter(Boolean);
        if (studentsFromSessions.length > 0) {
          groupMembersList = studentsFromSessions;
          studentNames = studentsFromSessions.map((s: any) => s.name).filter(Boolean).join(", ");
        } else {
          studentNames = "No students assigned";
        }
      }
      const groupName = group?.name || firstSession.group?.name || "Group Session";
      
      const allLogged = sessions.every(s => loggedSessionIds.has(s.id));
      const colors = getSessionColors(firstSession);
      
      return {
        id: `group-${key}`,
        title: `${groupName}: ${studentNames}`,
        start: new Date(firstSession.startDateTime),
        end: new Date(firstSession.endDateTime),
        backgroundColor: allLogged ? "#1f2937" : colors.bg,
        borderColor: allLogged ? "#111827" : colors.border,
        extendedProps: {
          type: "session",
          data: firstSession,
          isLogged: allLogged,
          isGroupSession: true,
          groupId: firstSession.groupId,
          groupName,
          groupSessions: sessions,
          groupMembers: groupMembersList,
          studentNames,
        },
      };
    });

    return [...individualEvents, ...groupEvents];
  })();

  const calendarEvents = [
    ...processedSessionEvents,
    ...availabilitySlots.flatMap((slot) => {
      if (slot.isRecurring && slot.dayOfWeek !== null) {
        const events = [];
        for (let week = 0; week < 8; week++) {
          const baseDate = getNextDateForDay(slot.dayOfWeek);
          const eventDate = new Date(baseDate);
          eventDate.setDate(eventDate.getDate() + (week * 7) - 7);
          
          if (eventDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
            const [startHour, startMin] = slot.startTime.split(":").map(Number);
            const [endHour, endMin] = slot.endTime.split(":").map(Number);
            
            const startDateTime = new Date(eventDate);
            startDateTime.setHours(startHour, startMin, 0, 0);
            
            const endDateTime = new Date(eventDate);
            endDateTime.setHours(endHour, endMin, 0, 0);
            
            events.push({
              id: `availability-${slot.id}-${week}`,
              title: "Available",
              start: startDateTime,
              end: endDateTime,
              backgroundColor: "#22c55e33",
              borderColor: "#22c55e",
              textColor: "#166534",
              extendedProps: {
                type: "availability",
                data: slot,
              },
            });
          }
        }
        return events;
      }
      return [];
    }),
    // Add mock exam bookings as blocked dates
    ...mockExamBookings.map((booking) => {
      const examDate = new Date(booking.examDate);
      return {
        id: `mock-exam-${booking.id}`,
        title: `📝 ${booking.studentName} - ${booking.examName}`,
        start: examDate,
        end: examDate,
        allDay: true,
        backgroundColor: "#8b5cf6", // Purple for mock exams
        borderColor: "#7c3aed",
        extendedProps: {
          type: "mock_exam",
          data: booking,
        },
      };
    }),
  ];

  const handleEventClick = (info: any) => {
    const eventData = info.event.extendedProps;
    // Mock exam events are for display only - no dialog needed
    if (eventData.type === "mock_exam") {
      return;
    }
    setSelectedEvent({
      ...eventData,
      calendarEvent: info.event,
    });
    setIsEventDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-gray-200 text-gray-800",
      no_show: "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
  };

  // Find past sessions that need action (still scheduled/confirmed but past the end time)
  const sessionsNeedingAction = sessionOccurrences.filter((session) => {
    const sessionEndTime = new Date(session.endDateTime);
    const now = new Date();
    const isPast = sessionEndTime < now;
    const isUnactioned = session.status === "scheduled" || session.status === "confirmed";
    const isNotLogged = !loggedSessionIds.has(session.id);
    return isPast && isUnactioned && isNotLogged;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} data-testid="back-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            My Calendar
          </h1>
        </div>
        <Button onClick={() => setIsAvailabilityDialogOpen(true)} data-testid="add-availability-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500"></div> Scheduled</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-500"></div> Confirmed</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500"></div> Completed</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500"></div> Past - Action Needed</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500"></div> No Show</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500"></div> Cancelled</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-300 border border-red-400"></div> Pending Cancel</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-purple-300 border border-purple-400"></div> Pending Reschedule</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-200 border border-green-400"></div> Your Availability</div>
      </div>

      {/* Alert for sessions needing action */}
      {sessionsNeedingAction.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sessions Requiring Your Action ({sessionsNeedingAction.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              Please either mark these sessions as completed (creates a timesheet) or update their status (cancelled, no-show).
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {sessionsNeedingAction.slice(0, 5).map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSelectedEvent({
                      type: "session",
                      data: session,
                      isLogged: false,
                    });
                    setIsEventDialogOpen(true);
                  }}
                  data-testid={`action-needed-session-${session.id}`}
                >
                  <div>
                    <span className="font-medium text-sm">{session.student?.name || "Session"}</span>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(session.startDateTime), "EEE, MMM d 'at' h:mm a")}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Take Action
                  </Button>
                </div>
              ))}
              {sessionsNeedingAction.length > 5 && (
                <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                  +{sessionsNeedingAction.length - 5} more sessions need attention
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              initialDate={initialDate}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={true}
              weekends={true}
              height="auto"
              nowIndicator={true}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
            />
          </CardContent>
        </Card>

        {/* Undo Reschedule Card */}
        {lastReschedule && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Undo2 className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Session with <strong>{lastReschedule.studentName}</strong> was rescheduled from{" "}
                    {format(new Date(lastReschedule.originalStartTime), "MMM d 'at' h:mm a")}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => undoRescheduleMutation.mutate()}
                  disabled={undoRescheduleMutation.isPending}
                  data-testid="undo-reschedule"
                >
                  {undoRescheduleMutation.isPending ? "Undoing..." : "Undo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-sm">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-sm">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm">Completed/Logged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-sm">Past - Needs Action</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-sm">No Show</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-sm">Cancelled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-300 border border-red-400"></div>
                <span className="text-sm">Pending Cancel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-300 border border-purple-400"></div>
                <span className="text-sm">Pending Reschedule</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20"></div>
                <span className="text-sm">Available Slot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-sm">Mock Exam (Student Unavailable)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Your Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availabilitySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No availability slots set</p>
              ) : (
                availabilitySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div>
                      <span className="font-medium">{DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label}</span>
                      <br />
                      <span className="text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAvailabilityMutation.mutate(slot.id)}
                      data-testid={`delete-availability-${slot.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.type === "session" ? "Session Details" : "Availability Slot"}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent?.type === "session" && (
            <div className="space-y-4">
              <div>
                <Label>{selectedEvent.isGroupSession ? "Group" : "Student"}</Label>
                {selectedEvent.isGroupSession ? (
                  <div>
                    <p className="text-lg font-medium">{selectedEvent.groupName || "Group Session"}</p>
                    <div className="mt-2">
                      <Label className="text-sm text-muted-foreground">Students</Label>
                      <ul className="mt-1 space-y-1">
                        {selectedEvent.groupMembers && selectedEvent.groupMembers.length > 0 ? (
                          selectedEvent.groupMembers.map((student: any, index: number) => (
                            <li key={student.id || index} className="text-sm">
                              {student.name || "Unknown Student"}
                            </li>
                          ))
                        ) : selectedEvent.studentNames ? (
                          <li className="text-sm">{selectedEvent.studentNames}</li>
                        ) : (
                          <li className="text-sm text-muted-foreground">No students assigned</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-medium">{selectedEvent.data.student?.name || "N/A"}</p>
                )}
              </div>
              <div>
                <Label>Date & Time</Label>
                {isRescheduling ? (
                  <div className="space-y-2 mt-1">
                    <Input
                      type="date"
                      value={rescheduleData.date}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                      data-testid="reschedule-date"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={rescheduleData.startTime}
                        onChange={(e) => setRescheduleData({...rescheduleData, startTime: e.target.value})}
                        data-testid="reschedule-start-time"
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={rescheduleData.endTime}
                        onChange={(e) => setRescheduleData({...rescheduleData, endTime: e.target.value})}
                        data-testid="reschedule-end-time"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const startDateTime = new Date(`${rescheduleData.date}T${rescheduleData.startTime}`);
                          const endDateTime = new Date(`${rescheduleData.date}T${rescheduleData.endTime}`);
                          // Create a reschedule request instead of directly updating
                          createRescheduleRequestMutation.mutate({
                            sessionOccurrenceId: selectedEvent.data.id,
                            proposedStartDateTime: startDateTime,
                            proposedEndDateTime: endDateTime,
                            isGroupSession: selectedEvent.isGroupSession,
                            groupSessions: selectedEvent.groupSessions,
                          });
                        }}
                        disabled={!rescheduleData.date || !rescheduleData.startTime || !rescheduleData.endTime || createRescheduleRequestMutation.isPending}
                        data-testid="save-reschedule"
                      >
                        {createRescheduleRequestMutation.isPending ? "Submitting..." : "Request Reschedule"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsRescheduling(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p>{format(new Date(selectedEvent.data.startDateTime), "EEEE, MMMM d, yyyy")}</p>
                      <p>{format(new Date(selectedEvent.data.startDateTime), "h:mm a")} - {format(new Date(selectedEvent.data.endDateTime), "h:mm a")}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const start = new Date(selectedEvent.data.startDateTime);
                        const end = new Date(selectedEvent.data.endDateTime);
                        setRescheduleData({
                          date: format(start, "yyyy-MM-dd"),
                          startTime: format(start, "HH:mm"),
                          endTime: format(end, "HH:mm"),
                        });
                        setIsRescheduling(true);
                      }}
                      data-testid="reschedule-button"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedEvent.data.status)}
                  {selectedEvent.isLogged && (
                    <Badge className="bg-green-100 text-green-800">Logged in Timesheet</Badge>
                  )}
                </div>
              </div>
              {selectedEvent.data.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.data.notes}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Change Session Status</Label>
                <Select
                  defaultValue={selectedEvent.data.status}
                  onValueChange={(value) => {
                    updateSessionMutation.mutate({
                      id: selectedEvent.data.id,
                      updates: { status: value },
                    });
                  }}
                >
                  <SelectTrigger data-testid="session-status-select">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed (Creates Timesheet)</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                {selectedEvent.data.status !== "completed" && !selectedEvent.isLogged && (
                  <p className="text-xs text-muted-foreground">
                    Selecting "Completed" will automatically create a timesheet entry for this session.
                  </p>
                )}
              </div>
              {/* Show pending change request status if exists */}
              {selectedEvent.pendingChangeRequest && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedEvent.pendingChangeRequest.requestType === "cancel" 
                        ? "Cancellation Pending Approval" 
                        : "Reschedule Pending Approval"}
                    </span>
                  </div>
                  {selectedEvent.pendingChangeRequest.reason && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Reason: {selectedEvent.pendingChangeRequest.reason}
                    </p>
                  )}
                  {selectedEvent.pendingChangeRequest.proposedStartDateTime && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Proposed time: {format(new Date(selectedEvent.pendingChangeRequest.proposedStartDateTime), "EEEE, MMMM d, yyyy h:mm a")}
                    </p>
                  )}
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    Waiting for admin approval. The session will be updated once approved.
                  </p>
                </div>
              )}
              {selectedEvent.data.status !== "cancelled" && selectedEvent.data.status !== "completed" && !selectedEvent.pendingChangeRequest && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    Submit a change request for admin approval:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setChangeRequestData({
                          requestType: "cancel",
                          reason: "",
                          proposedDateMessage: "",
                        });
                        setIsChangeRequestDialogOpen(true);
                      }}
                      data-testid="request-cancel-button"
                    >
                      <CalendarX className="h-4 w-4 mr-2" />
                      Request Cancellation
                    </Button>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Note: Rescheduling this session only affects this individual occurrence, not future sessions.
              </p>
            </div>
          )}
          {selectedEvent?.type === "availability" && (
            <div className="space-y-4">
              <div>
                <Label>Day</Label>
                <p className="text-lg font-medium">
                  {DAYS_OF_WEEK.find(d => d.value === selectedEvent.data.dayOfWeek)?.label}
                </p>
              </div>
              <div>
                <Label>Time</Label>
                <p>{selectedEvent.data.startTime} - {selectedEvent.data.endTime}</p>
              </div>
              <div>
                <Label>Type</Label>
                <Badge variant="outline">
                  {selectedEvent.data.isRecurring ? "Recurring Weekly" : "One-time"}
                </Badge>
              </div>
              <Button
                variant="destructive"
                onClick={() => deleteAvailabilityMutation.mutate(selectedEvent.data.id)}
                data-testid="delete-availability-dialog"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Availability
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={String(newAvailability.dayOfWeek)}
                onValueChange={(val) => setNewAvailability({ ...newAvailability, dayOfWeek: parseInt(val) })}
              >
                <SelectTrigger data-testid="day-of-week-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  type="time"
                  id="startTime"
                  value={newAvailability.startTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
                  data-testid="start-time-input"
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  type="time"
                  id="endTime"
                  value={newAvailability.endTime}
                  onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
                  data-testid="end-time-input"
                />
              </div>
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <Label className="text-base font-medium">Availability Type</Label>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="weekly-availability"
                  checked={newAvailability.availabilityType === "weekly"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewAvailability({ ...newAvailability, availabilityType: "weekly", timeframeStart: "", timeframeEnd: "" });
                    }
                  }}
                  data-testid="weekly-availability-checkbox"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="weekly-availability"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I confirm this slot is available weekly
                  </label>
                  <p className="text-sm text-muted-foreground">
                    This time slot is available every week on a recurring basis
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="seasonal-availability"
                  checked={newAvailability.availabilityType === "seasonal"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewAvailability({ ...newAvailability, availabilityType: "seasonal" });
                    }
                  }}
                  data-testid="seasonal-availability-checkbox"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="seasonal-availability"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    This slot is only available for a certain timeframe
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Seasonal or temporary availability (e.g., during summer, school holidays)
                  </p>
                </div>
              </div>

              {newAvailability.availabilityType === "seasonal" && (
                <div className="space-y-3 mt-3 pl-6 border-l-2 border-orange-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeframeStart">Available From</Label>
                      <Input
                        type="date"
                        id="timeframeStart"
                        value={newAvailability.timeframeStart}
                        onChange={(e) => setNewAvailability({ ...newAvailability, timeframeStart: e.target.value })}
                        data-testid="timeframe-start-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeframeEnd">Available Until</Label>
                      <Input
                        type="date"
                        id="timeframeEnd"
                        value={newAvailability.timeframeEnd}
                        onChange={(e) => setNewAvailability({ ...newAvailability, timeframeEnd: e.target.value })}
                        data-testid="timeframe-end-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="seasonal-notes" className="text-orange-700">
                      Notes (required for seasonal availability)
                    </Label>
                    <Textarea
                      id="seasonal-notes"
                      value={newAvailability.notes}
                      onChange={(e) => setNewAvailability({ ...newAvailability, notes: e.target.value })}
                      placeholder="e.g., During summer holidays, School term break only..."
                      className="border-orange-300"
                      data-testid="seasonal-notes"
                    />
                  </div>
                </div>
              )}
            </div>

            {newAvailability.availabilityType === "weekly" && (
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={newAvailability.notes}
                  onChange={(e) => setNewAvailability({ ...newAvailability, notes: e.target.value })}
                  placeholder="Any notes about this availability..."
                  data-testid="availability-notes"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createAvailabilityMutation.mutate(newAvailability)}
              disabled={
                createAvailabilityMutation.isPending || 
                (newAvailability.availabilityType === "seasonal" && !newAvailability.notes.trim())
              }
              data-testid="save-availability-button"
            >
              {createAvailabilityMutation.isPending ? "Saving..." : "Save Availability"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Request Dialog */}
      <Dialog open={isChangeRequestDialogOpen} onOpenChange={setIsChangeRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Session Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Session</Label>
              <p className="text-lg font-medium">
                {selectedEvent?.data?.student?.name || "Session"} - {selectedEvent?.data?.startDateTime && format(new Date(selectedEvent.data.startDateTime), "EEE, MMM d 'at' h:mm a")}
              </p>
            </div>
            <div>
              <Label>Request Type</Label>
              <Select
                value={changeRequestData.requestType}
                onValueChange={(val) => setChangeRequestData({...changeRequestData, requestType: val as "cancel" | "reschedule"})}
              >
                <SelectTrigger data-testid="change-request-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cancel">
                    <div className="flex items-center gap-2">
                      <CalendarX className="h-4 w-4 text-red-500" />
                      Cancel Session
                    </div>
                  </SelectItem>
                  <SelectItem value="reschedule">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                      Reschedule Session
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                value={changeRequestData.reason}
                onChange={(e) => setChangeRequestData({...changeRequestData, reason: e.target.value})}
                placeholder="Please explain why you're requesting this change..."
                data-testid="change-request-reason"
              />
            </div>
            {changeRequestData.requestType === "reschedule" && (
              <div>
                <Label>Proposed Alternative Time/Date (optional)</Label>
                <Textarea
                  value={changeRequestData.proposedDateMessage}
                  onChange={(e) => setChangeRequestData({...changeRequestData, proposedDateMessage: e.target.value})}
                  placeholder="e.g., 'Can we move to Tuesday at 4pm instead?'"
                  data-testid="change-request-proposed-date"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedEvent?.data?.id) {
                  createChangeRequestMutation.mutate({
                    sessionOccurrenceId: selectedEvent.data.id,
                    requestType: changeRequestData.requestType,
                    reason: changeRequestData.reason,
                    proposedDateMessage: changeRequestData.proposedDateMessage || undefined,
                    isGroupSession: selectedEvent.isGroupSession,
                    groupSessions: selectedEvent.groupSessions,
                  });
                }
              }}
              disabled={createChangeRequestMutation.isPending || !changeRequestData.reason.trim()}
              data-testid="submit-change-request-button"
            >
              {createChangeRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
