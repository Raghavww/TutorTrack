import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Check, Clock, AlertTriangle, Bell, Flag, MessageSquare, CalendarX, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";
import type { User as UserType, SessionOccurrence, Notification } from "@shared/schema";

interface ParentScheduleProps {
  user: UserType;
}
type SessionWithDetails = SessionOccurrence & { 
  student?: { id: string; name: string }; 
  tutor?: { id: string; firstName: string; lastName: string };
  parentFlagged?: boolean;
  parentFlagComment?: string | null;
  parentFlaggedAt?: Date | null;
  groupId?: string | null;
  groupName?: string | null;
};
type MockExamBooking = {
  id: string;
  studentId: string;
  studentName: string;
  examName: string;
  examDate: string;
  location?: string;
  status: string;
};

export function ParentSchedule({ user }: ParentScheduleProps) {
  const { toast } = useToast();
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [flagComment, setFlagComment] = useState("");
  
  // Change request state
  const [changeRequestDialogOpen, setChangeRequestDialogOpen] = useState(false);
  const [changeRequestSession, setChangeRequestSession] = useState<SessionWithDetails | null>(null);
  const [changeRequestType, setChangeRequestType] = useState<"cancel" | "reschedule">("reschedule");
  const [changeRequestReason, setChangeRequestReason] = useState("");
  const [proposedDateMessage, setProposedDateMessage] = useState("");
  
  const { data: sessionOccurrences = [], isLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/parent/session-occurrences"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Fetch mock exam bookings for calendar blocking
  const { data: mockExamBookings = [] } = useQuery<MockExamBooking[]>({
    queryKey: ["/api/parent/mock-exam-bookings"],
  });

  // Fetch parent's change requests to show which sessions have pending requests
  const { data: changeRequests = [] } = useQuery<{
    id: string;
    sessionOccurrenceId: string;
    requestType: string;
    proposedDateMessage: string | null;
    reason: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
    processedAt: string | null;
    sessionOccurrence?: {
      id: string;
      startDateTime: string;
      endDateTime: string;
      student?: { id: string; name: string };
    };
  }[]>({
    queryKey: ["/api/parent/session-change-requests"],
    refetchInterval: 60000,
  });

  // Get session IDs that have pending change requests
  const pendingChangeRequestSessionIds = new Set(
    changeRequests
      .filter(req => req.status === "pending")
      .map(req => req.sessionOccurrenceId)
  );

  // Filter invoice reminders (unread)
  const invoiceReminders = notifications.filter(
    (n) => n.type === "invoice_reminder" && !n.readAt
  );

  const flagSessionMutation = useMutation({
    mutationFn: async ({ sessionId, comment }: { sessionId: string; comment: string }) => {
      return await apiRequest("POST", `/api/parent/session-occurrences/${sessionId}/flag`, { comment });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Session flagged. The admin has been notified." });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/session-occurrences"] });
      setFlagDialogOpen(false);
      setSelectedSession(null);
      setFlagComment("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to flag session.", variant: "destructive" });
    },
  });

  const changeRequestMutation = useMutation({
    mutationFn: async (data: { sessionOccurrenceId: string; requestType: string; proposedDateMessage: string; reason: string }) => {
      return await apiRequest("POST", "/api/parent/session-change-request", data);
    },
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "Your change request has been sent to the admin and tutor." });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/session-occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/session-change-requests"] });
      setChangeRequestDialogOpen(false);
      setChangeRequestSession(null);
      setChangeRequestType("reschedule");
      setChangeRequestReason("");
      setProposedDateMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit change request.", variant: "destructive" });
    },
  });

  const openChangeRequestDialog = (session: SessionWithDetails) => {
    setChangeRequestSession(session);
    setChangeRequestType("reschedule");
    setChangeRequestReason("");
    setProposedDateMessage("");
    setChangeRequestDialogOpen(true);
  };

  const openFlagDialog = (session: SessionWithDetails) => {
    setSelectedSession(session);
    setFlagComment("");
    setFlagDialogOpen(true);
  };

  const sessionEvents = sessionOccurrences.map((session) => {
    const sessionWithRequest = session as any;
    const pendingRequest = sessionWithRequest.pendingChangeRequest;
    const hasPendingChangeRequest = pendingChangeRequestSessionIds.has(session.id) || !!pendingRequest;
    const isGroupSession = !!session.groupId;
    
    let sessionTitle = isGroupSession 
      ? `${session.groupName || "Group"} (${session.student?.name || "Group Session"})`
      : (session.student?.name || "Lesson");
    
    // Add indicator for pending change requests
    if (pendingRequest) {
      if (pendingRequest.requestType === "cancel") {
        sessionTitle = `⏳ ${sessionTitle} (Pending Cancel)`;
      } else if (pendingRequest.requestType === "reschedule") {
        sessionTitle = `⏳ ${sessionTitle} (Pending Reschedule)`;
      }
    }
    
    // Determine colors based on status and pending requests
    let bgColor = isGroupSession ? "#8b5cf6" : "#3b82f6";
    let borderColor = isGroupSession ? "#7c3aed" : "#2563eb";
    
    if (pendingRequest) {
      if (pendingRequest.requestType === "cancel") {
        bgColor = "#fca5a5";
        borderColor = "#f87171";
      } else if (pendingRequest.requestType === "reschedule") {
        bgColor = "#c4b5fd";
        borderColor = "#a78bfa";
      }
    } else if (session.status === "cancelled") {
      bgColor = "#ef4444";
      borderColor = "#dc2626";
    } else if (session.status === "completed") {
      bgColor = "#22c55e";
      borderColor = "#16a34a";
    } else if (hasPendingChangeRequest) {
      bgColor = "#9ca3af";
      borderColor = "#6b7280";
    }
    
    return {
      id: `session-${session.id}`,
      title: sessionTitle,
      start: new Date(session.startDateTime),
      end: new Date(session.endDateTime),
      backgroundColor: bgColor,
      borderColor: borderColor,
      extendedProps: {
        data: session,
        hasPendingChangeRequest,
        pendingChangeRequest: pendingRequest || null,
        eventType: "session" as const,
        isGroupSession,
      },
    };
  });

  // Create mock exam events for calendar blocking
  const mockExamEvents = mockExamBookings.map((booking) => {
    const examDate = new Date(booking.examDate);
    return {
      id: `mock-exam-${booking.id}`,
      title: `📝 ${booking.examName} - ${booking.studentName}`,
      start: examDate,
      end: examDate,
      allDay: true,
      backgroundColor: "#8b5cf6", // Purple for mock exams
      borderColor: "#7c3aed",
      extendedProps: {
        data: booking,
        eventType: "mock_exam" as const,
      },
    };
  });

  // Combine all events
  const calendarEvents = [...sessionEvents, ...mockExamEvents];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lesson Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invoice Payment Reminders */}
      {invoiceReminders.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Bell className="h-5 w-5" />
              Payment Reminders
              <Badge className="bg-orange-500 text-white">{invoiceReminders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invoiceReminders.map((reminder) => {
              const payload = reminder.payload as { 
                invoiceNumber: string; 
                amount: string; 
                studentName: string; 
                message: string;
                dueIn: number;
              };
              return (
                <div 
                  key={reminder.id} 
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border flex items-start gap-3"
                  data-testid={`reminder-${reminder.id}`}
                >
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">
                      Invoice {payload.invoiceNumber} - £{payload.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payload.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Student: {payload.studentName} • 
                      {payload.dueIn > 0 
                        ? ` Due in ${payload.dueIn} day${payload.dueIn > 1 ? 's' : ''}`
                        : payload.dueIn === 0 
                          ? ' Due TODAY' 
                          : ' OVERDUE'}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Change Request Status Updates */}
      {changeRequests.filter(r => r.status === "approved" || r.status === "rejected").length > 0 && (
        <Card className="border-purple-300 bg-purple-50 dark:bg-purple-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <RefreshCw className="h-5 w-5" />
              Change Request Updates
              <Badge className="bg-purple-500 text-white">{changeRequests.filter(r => r.status === "approved" || r.status === "rejected").length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {changeRequests.filter(r => r.status === "approved" || r.status === "rejected").slice(0, 5).map((request) => (
              <div 
                key={request.id} 
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border flex items-start gap-3"
                data-testid={`change-request-update-${request.id}`}
              >
                {request.status === "approved" ? (
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CalendarX className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {request.requestType === "cancel" ? "Cancel Request" : "Reschedule Request"}
                    </p>
                    <Badge className={request.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {request.status === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.sessionOccurrence?.student?.name} - {request.sessionOccurrence?.startDateTime && 
                      format(new Date(request.sessionOccurrence.startDateTime), "EEE, MMM d 'at' h:mm a")}
                  </p>
                  {request.adminNotes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Admin note: &quot;{request.adminNotes}&quot;
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Processed: {request.processedAt && format(new Date(request.processedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Change Requests */}
      {changeRequests.filter(r => r.status === "pending").length > 0 && (
        <Card className="border-blue-300 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-5 w-5" />
              Pending Change Requests
              <Badge className="bg-blue-500 text-white">{changeRequests.filter(r => r.status === "pending").length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {changeRequests.filter(r => r.status === "pending").map((request) => (
              <div 
                key={request.id} 
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border flex items-start gap-3"
                data-testid={`pending-change-request-${request.id}`}
              >
                <RefreshCw className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {request.requestType === "cancel" ? "Cancel Request" : "Reschedule Request"}
                    </p>
                    <Badge className="bg-yellow-100 text-yellow-700">Pending Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.sessionOccurrence?.student?.name} - {request.sessionOccurrence?.startDateTime && 
                      format(new Date(request.sessionOccurrence.startDateTime), "EEE, MMM d 'at' h:mm a")}
                  </p>
                  {request.reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Reason: &quot;{request.reason}&quot;
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lesson Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek",
              }}
              events={calendarEvents}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              allDaySlot={true}
              weekends={true}
              height="auto"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              eventClick={(info) => {
                const eventType = info.event.extendedProps.eventType;
                if (eventType === "mock_exam") {
                  // Mock exam events are just for viewing - no action needed
                  return;
                }
                const session = info.event.extendedProps.data as SessionWithDetails;
                if (session && !isPast(new Date(session.startDateTime)) && session.status !== "cancelled") {
                  openChangeRequestDialog(session);
                }
              }}
              eventClassNames="cursor-pointer"
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
                <span className="text-sm">Upcoming (click to request change)</span>
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
                <div className="w-3 h-3 rounded bg-gray-800"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-sm">Cancelled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-sm">Mock Exam (Unavailable)</span>
              </div>
            </CardContent>
          </Card>

          {/* Past Sessions with Flag Option */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Past Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {sessionOccurrences
                .filter(s => isPast(new Date(s.endDateTime)) && s.status !== "cancelled")
                .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())
                .slice(0, 10)
                .map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-2 border rounded-lg text-sm"
                    data-testid={`past-session-${session.id}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{session.student?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(session.startDateTime), "EEE, dd MMM yyyy 'at' HH:mm")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tutor: {session.tutor?.firstName} {session.tutor?.lastName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.parentFlagged ? (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                          <Flag className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFlagDialog(session)}
                          data-testid={`btn-flag-session-${session.id}`}
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Flag
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              {sessionOccurrences.filter(s => isPast(new Date(s.endDateTime)) && s.status !== "cancelled").length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">No past sessions yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Flag Session Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-orange-500" />
              Flag Session
            </DialogTitle>
            <DialogDescription>
              Flag this session to notify the admin. You can add a comment to explain any issues or concerns.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{selectedSession.student?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(selectedSession.startDateTime), "EEEE, dd MMMM yyyy 'at' HH:mm")}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tutor: {selectedSession.tutor?.firstName} {selectedSession.tutor?.lastName}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag-comment">Comment (optional)</Label>
                <Textarea
                  id="flag-comment"
                  placeholder="Please describe any issues or concerns about this session..."
                  value={flagComment}
                  onChange={(e) => setFlagComment(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="input-flag-comment"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFlagDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedSession && flagSessionMutation.mutate({ 
                sessionId: selectedSession.id, 
                comment: flagComment 
              })}
              disabled={flagSessionMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="btn-confirm-flag"
            >
              <Flag className="h-4 w-4 mr-2" />
              {flagSessionMutation.isPending ? "Flagging..." : "Flag Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Request Dialog */}
      <Dialog open={changeRequestDialogOpen} onOpenChange={setChangeRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Request Session Change
            </DialogTitle>
            <DialogDescription>
              Request to cancel or reschedule this session. The admin and tutor will be notified.
            </DialogDescription>
          </DialogHeader>
          {changeRequestSession && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{changeRequestSession.student?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(changeRequestSession.startDateTime), "EEEE, dd MMMM yyyy 'at' HH:mm")}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tutor: {changeRequestSession.tutor?.firstName} {changeRequestSession.tutor?.lastName}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="request-type">Request Type</Label>
                <Select
                  value={changeRequestType}
                  onValueChange={(val) => setChangeRequestType(val as "cancel" | "reschedule")}
                >
                  <SelectTrigger data-testid="select-request-type">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reschedule">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reschedule to different time
                      </div>
                    </SelectItem>
                    <SelectItem value="cancel">
                      <div className="flex items-center gap-2">
                        <CalendarX className="h-4 w-4" />
                        Cancel session
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {changeRequestType === "reschedule" && (
                <div className="space-y-2">
                  <Label htmlFor="proposed-date">Suggested Alternative Date/Time</Label>
                  <Textarea
                    id="proposed-date"
                    placeholder="e.g., 'Could we move to Thursday at 4pm?' or 'Any time next week would work'"
                    value={proposedDateMessage}
                    onChange={(e) => setProposedDateMessage(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-proposed-date"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="request-reason">Reason (optional)</Label>
                <Textarea
                  id="request-reason"
                  placeholder="Please explain why you need to change this session..."
                  value={changeRequestReason}
                  onChange={(e) => setChangeRequestReason(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="input-request-reason"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => changeRequestSession && changeRequestMutation.mutate({ 
                sessionOccurrenceId: changeRequestSession.id, 
                requestType: changeRequestType,
                proposedDateMessage: proposedDateMessage,
                reason: changeRequestReason
              })}
              disabled={changeRequestMutation.isPending}
              data-testid="btn-submit-change-request"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {changeRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
