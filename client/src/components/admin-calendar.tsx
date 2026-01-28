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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Calendar, Clock, Trash2, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { User, SessionOccurrence, TutorAvailabilitySlot, Student, RecurringSessionTemplate } from "@shared/schema";

interface AdminCalendarProps {
  onBack?: () => void;
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

export function AdminCalendar({ onBack }: AdminCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTutorId, setSelectedTutorId] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] = useState(false);
  const [newRecurringSession, setNewRecurringSession] = useState({
    tutorId: "",
    studentId: "",
    dayOfWeek: 1,
    startTime: "14:00",
    durationMinutes: 60,
    subject: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    generateOccurrences: true,
  });

  const { data: tutors = [] } = useQuery<User[]>({
    queryKey: ["/api/tutors"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: studentGroups = [] } = useQuery<any[]>({
    queryKey: ["/api/student-groups"],
  });

  const { data: sessionOccurrences = [], isLoading: isLoadingSessions } = useQuery<(SessionOccurrence & { student?: Student; tutor?: User })[]>({
    queryKey: ["/api/session-occurrences", selectedTutorId !== "all" ? selectedTutorId : undefined],
    queryFn: async () => {
      const url = selectedTutorId !== "all" 
        ? `/api/session-occurrences?tutorId=${selectedTutorId}`
        : "/api/session-occurrences";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
  });

  const { data: availabilitySlots = [] } = useQuery<TutorAvailabilitySlot[]>({
    queryKey: ["/api/tutor-availability", selectedTutorId !== "all" ? selectedTutorId : undefined],
    queryFn: async () => {
      const url = selectedTutorId !== "all" 
        ? `/api/tutor-availability?tutorId=${selectedTutorId}`
        : "/api/tutor-availability";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    },
  });

  const { data: recurringTemplates = [] } = useQuery<(RecurringSessionTemplate & { student?: Student; tutor?: User })[]>({
    queryKey: ["/api/recurring-sessions", selectedTutorId !== "all" ? selectedTutorId : undefined],
    queryFn: async () => {
      const url = selectedTutorId !== "all" 
        ? `/api/recurring-sessions?tutorId=${selectedTutorId}`
        : "/api/recurring-sessions";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recurring sessions");
      return res.json();
    },
  });

  // Query for pending change requests
  const { data: pendingChangeRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/session-change-requests"],
    queryFn: async () => {
      const res = await fetch("/api/session-change-requests?status=pending", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch change requests");
      return res.json();
    },
  });

  const createRecurringSessionMutation = useMutation({
    mutationFn: async (data: typeof newRecurringSession) => {
      const response = await apiRequest("POST", "/api/recurring-sessions", {
        tutorId: data.tutorId,
        studentId: data.studentId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        subject: data.subject || undefined,
        startDate: new Date(data.startDate).toISOString(),
        generateOccurrences: data.generateOccurrences,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Recurring session created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setIsCreateSessionDialogOpen(false);
      setNewRecurringSession({
        tutorId: "",
        studentId: "",
        dayOfWeek: 1,
        startTime: "14:00",
        durationMinutes: 60,
        subject: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        generateOccurrences: true,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create recurring session.", variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/session-occurrences/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Session updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setIsEventDialogOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to update session.", variant: "destructive" });
    },
  });

  const deleteRecurringTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/recurring-sessions/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Recurring session template and all occurrences removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to delete recurring session.", variant: "destructive" });
    },
  });

  // Approve change request mutation
  const approveChangeRequestMutation = useMutation({
    mutationFn: async ({ id, adminNotes, newDateTime }: { id: string; adminNotes?: string; newDateTime?: string }) => {
      const response = await apiRequest("POST", `/api/session-change-requests/${id}/approve`, { adminNotes, newDateTime });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Approved", description: "Change request has been approved and applied." });
      queryClient.invalidateQueries({ queryKey: ["/api/session-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to approve change request.", variant: "destructive" });
    },
  });

  // Reject change request mutation
  const rejectChangeRequestMutation = useMutation({
    mutationFn: async ({ id, adminNotes }: { id: string; adminNotes?: string }) => {
      const response = await apiRequest("POST", `/api/session-change-requests/${id}/reject`, { adminNotes });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Rejected", description: "Change request has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/session-change-requests"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "Please log in again.", variant: "destructive" });
        return;
      }
      toast({ title: "Error", description: "Failed to reject change request.", variant: "destructive" });
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

  const getTutorColor = (tutorId: string): string => {
    const colors = [
      "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", 
      "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
    ];
    const tutorIndex = tutors.findIndex(t => t.id === tutorId);
    return colors[tutorIndex % colors.length];
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
      const sessionWithRequest = session as any;
      const pendingRequest = sessionWithRequest.pendingChangeRequest;
      
      // Determine colors based on pending request or status
      let bgColor = "#3b82f6";
      let borderColor = "#2563eb";
      let title = `${session.student?.name || "Session"} (${session.tutor?.firstName || "Tutor"})`;
      
      if (pendingRequest) {
        if (pendingRequest.requestType === "cancel") {
          bgColor = "#fca5a5";
          borderColor = "#f87171";
          title = `⏳ ${title} (Pending Cancel)`;
        } else if (pendingRequest.requestType === "reschedule") {
          bgColor = "#c4b5fd";
          borderColor = "#a78bfa";
          title = `⏳ ${title} (Pending Reschedule)`;
        }
      } else if (session.status === "cancelled") {
        bgColor = "#ef4444";
        borderColor = "#dc2626";
      } else if (session.status === "completed") {
        bgColor = "#22c55e";
        borderColor = "#16a34a";
      }
      
      return {
        id: `session-${session.id}`,
        title,
        start: new Date(session.startDateTime),
        end: new Date(session.endDateTime),
        backgroundColor: bgColor,
        borderColor: borderColor,
        extendedProps: {
          type: "session",
          data: session,
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
      const tutorName = firstSession.tutor?.firstName || "Tutor";
      
      const allCompleted = sessions.every(s => s.status === "completed");
      const anyCancelled = sessions.some(s => s.status === "cancelled");
      
      return {
        id: `group-${key}`,
        title: `${groupName}: ${studentNames} (${tutorName})`,
        start: new Date(firstSession.startDateTime),
        end: new Date(firstSession.endDateTime),
        backgroundColor: anyCancelled ? "#ef4444" : 
                         allCompleted ? "#1f2937" : "#8b5cf6",
        borderColor: anyCancelled ? "#dc2626" : 
                     allCompleted ? "#111827" : "#7c3aed",
        extendedProps: {
          type: "session",
          data: firstSession,
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
            
            const tutor = tutors.find(t => t.id === slot.tutorId);
            events.push({
              id: `availability-${slot.id}-${week}`,
              title: `Available (${tutor?.firstName || "Tutor"})`,
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
  ];

  const handleEventClick = (info: any) => {
    const eventData = info.event.extendedProps;
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
            Schedule Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Filter by Tutor:</Label>
            <Select value={selectedTutorId} onValueChange={setSelectedTutorId}>
              <SelectTrigger className="w-[200px]" data-testid="tutor-filter-select">
                <SelectValue placeholder="All Tutors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tutors</SelectItem>
                {tutors.map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id}>
                    {tutor.firstName} {tutor.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateSessionDialogOpen(true)} data-testid="create-recurring-session-button">
            <Plus className="h-4 w-4 mr-2" />
            Create Recurring Session
          </Button>
        </div>
      </div>

      {/* Pending Change Requests Alert */}
      {pendingChangeRequests.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Session Change Requests ({pendingChangeRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              Tutors have requested the following session changes. Please review and approve or reject.
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {pendingChangeRequests.map((request: any) => (
                <div key={request.id} className="p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={request.requestType === "cancel" ? "destructive" : "default"}>
                          {request.requestType === "cancel" ? "Cancel" : "Reschedule"}
                        </Badge>
                        <span className="font-medium text-sm">
                          {request.group?.name || request.student?.name || "Unknown"}
                        </span>
                        {request.group && (
                          <Badge variant="outline" className="text-xs">Group</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {request.sessionOccurrence && format(new Date(request.sessionOccurrence.startDateTime), "EEE, MMM d 'at' h:mm a")}
                        {" • "}Requested by {request.tutor?.firstName || "Tutor"}
                      </p>
                      {request.reason && (
                        <p className="text-xs mt-1">Reason: {request.reason}</p>
                      )}
                      {request.proposedStartDateTime && (
                        <p className="text-xs text-blue-600 mt-1">
                          Proposed: {format(new Date(request.proposedStartDateTime), "EEE, MMM d 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => {
                          approveChangeRequestMutation.mutate({
                            id: request.id,
                            newDateTime: request.proposedStartDateTime || undefined,
                          });
                        }}
                        disabled={approveChangeRequestMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          rejectChangeRequestMutation.mutate({ id: request.id });
                        }}
                        disabled={rejectChangeRequestMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={false}
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

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-sm">Upcoming Session</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm">Completed Session</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-sm">Cancelled Session</span>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recurring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {recurringTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recurring sessions set up</p>
              ) : (
                recurringTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <div>
                      <span className="font-medium">{template.student?.name || "Student"}</span>
                      <br />
                      <span className="text-muted-foreground">
                        {DAYS_OF_WEEK.find(d => d.value === template.dayOfWeek)?.label} {template.startTime}
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Tutor: {template.tutor?.firstName || "N/A"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecurringTemplateMutation.mutate(template.id)}
                      data-testid={`delete-recurring-${template.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {availabilitySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No availability slots set up</p>
              ) : (
                (() => {
                  // Group slots by tutor
                  const slotsByTutor: Record<string, typeof availabilitySlots> = {};
                  availabilitySlots.forEach(slot => {
                    const tutorId = slot.tutorId;
                    if (!slotsByTutor[tutorId]) slotsByTutor[tutorId] = [];
                    slotsByTutor[tutorId].push(slot);
                  });
                  
                  return Object.entries(slotsByTutor).map(([tutorId, slots]) => {
                    const tutor = tutors.find(t => t.id === tutorId);
                    return (
                      <div key={tutorId} className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {tutor?.firstName} {tutor?.lastName}
                        </p>
                        {slots.map(slot => (
                          <div key={slot.id} className="flex items-center justify-between text-sm p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded bg-green-500"></div>
                              <div>
                                <span className="font-medium">
                                  {DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label}
                                </span>
                                <span className="text-muted-foreground ml-2">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {slot.availabilityType === "seasonal" && (
                                  <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                    Seasonal
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()
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
              {selectedEvent.isGroupSession && selectedEvent.groupName && (
                <div>
                  <Label>Group</Label>
                  <p className="text-lg font-medium">{selectedEvent.groupName}</p>
                </div>
              )}
              <div>
                <Label>{selectedEvent.isGroupSession ? "Students" : "Student"}</Label>
                {selectedEvent.isGroupSession ? (
                  <div className="mt-1">
                    <ul className="space-y-1">
                      {selectedEvent.groupMembers && selectedEvent.groupMembers.length > 0 ? (
                        selectedEvent.groupMembers.map((student: any, idx: number) => (
                          <li key={student?.id || idx} className="text-sm">
                            {student?.name || "Unknown Student"}
                          </li>
                        ))
                      ) : selectedEvent.groupSessions && selectedEvent.groupSessions.length > 0 ? (
                        selectedEvent.groupSessions
                          .filter((s: any) => s.student?.name)
                          .map((s: any, idx: number) => (
                            <li key={s.id || idx} className="text-sm">{s.student.name}</li>
                          ))
                      ) : selectedEvent.studentNames ? (
                        <li className="text-sm">{selectedEvent.studentNames}</li>
                      ) : (
                        <li className="text-sm text-muted-foreground">No students assigned</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-lg font-medium">{selectedEvent.data.student?.name || "N/A"}</p>
                )}
              </div>
              <div>
                <Label>Tutor</Label>
                <p>{selectedEvent.data.tutor?.firstName} {selectedEvent.data.tutor?.lastName}</p>
              </div>
              <div>
                <Label>Date & Time</Label>
                <p>{format(new Date(selectedEvent.data.startDateTime), "EEEE, MMMM d, yyyy")}</p>
                <p>{format(new Date(selectedEvent.data.startDateTime), "h:mm a")} - {format(new Date(selectedEvent.data.endDateTime), "h:mm a")}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">{getStatusBadge(selectedEvent.data.status)}</div>
              </div>
              <div className="flex gap-2">
                <Select
                  defaultValue={selectedEvent.data.status}
                  onValueChange={(value) => {
                    updateSessionMutation.mutate({
                      id: selectedEvent.data.id,
                      updates: { status: value },
                    });
                  }}
                >
                  <SelectTrigger data-testid="admin-session-status-select">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {selectedEvent?.type === "availability" && (
            <div className="space-y-4">
              <div>
                <Label>Tutor</Label>
                <p className="text-lg font-medium">
                  {tutors.find(t => t.id === selectedEvent.data.tutorId)?.firstName || "Tutor"}
                </p>
              </div>
              <div>
                <Label>Day</Label>
                <p>
                  {DAYS_OF_WEEK.find(d => d.value === selectedEvent.data.dayOfWeek)?.label}
                </p>
              </div>
              <div>
                <Label>Time</Label>
                <p>{selectedEvent.data.startTime} - {selectedEvent.data.endTime}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateSessionDialogOpen} onOpenChange={setIsCreateSessionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Recurring Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tutorId">Tutor</Label>
              <Select
                value={newRecurringSession.tutorId}
                onValueChange={(val) => setNewRecurringSession({ ...newRecurringSession, tutorId: val })}
              >
                <SelectTrigger data-testid="select-tutor">
                  <SelectValue placeholder="Select tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.firstName} {tutor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="studentId">Student</Label>
              <Select
                value={newRecurringSession.studentId}
                onValueChange={(val) => setNewRecurringSession({ ...newRecurringSession, studentId: val })}
              >
                <SelectTrigger data-testid="select-student">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select
                value={String(newRecurringSession.dayOfWeek)}
                onValueChange={(val) => setNewRecurringSession({ ...newRecurringSession, dayOfWeek: parseInt(val) })}
              >
                <SelectTrigger data-testid="select-day">
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
                  value={newRecurringSession.startTime}
                  onChange={(e) => setNewRecurringSession({ ...newRecurringSession, startTime: e.target.value })}
                  data-testid="input-start-time"
                />
              </div>
              <div>
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input
                  type="number"
                  id="durationMinutes"
                  value={newRecurringSession.durationMinutes}
                  onChange={(e) => setNewRecurringSession({ ...newRecurringSession, durationMinutes: parseInt(e.target.value) || 60 })}
                  data-testid="input-duration"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                id="startDate"
                value={newRecurringSession.startDate}
                onChange={(e) => setNewRecurringSession({ ...newRecurringSession, startDate: e.target.value })}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                value={newRecurringSession.subject}
                onChange={(e) => setNewRecurringSession({ ...newRecurringSession, subject: e.target.value })}
                placeholder="e.g., Maths, English"
                data-testid="input-subject"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createRecurringSessionMutation.mutate(newRecurringSession)}
              disabled={createRecurringSessionMutation.isPending || !newRecurringSession.tutorId || !newRecurringSession.studentId}
              data-testid="save-recurring-session-button"
            >
              {createRecurringSessionMutation.isPending ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
