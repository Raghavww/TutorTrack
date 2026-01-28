import { useState, useEffect, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfWeek, endOfWeek } from "date-fns";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  DollarSign,
  Users,
  PlusCircle,
  History,
  BarChart3,
  Save,
  AlertTriangle,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  BookOpen,
  Check,
  CheckCheck,
  MessageSquare,
  Mail,
  Reply,
  Edit,
  Trash2,
  Calendar,
  Phone,
  UserPlus,
  RefreshCw,
  CalendarX,
  X,
  Bell,
  User as UserIcon,
  Briefcase,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { User, StudentWithTutor, TimesheetEntryWithRelations, WeeklyTimesheetWithRelations, StudentTopic, ParentMessageWithRelations, ParentMessageReplyWithRelations, StudentGroupWithMembers, CurriculumTopicWithSubtopics, EmergencyContact, SessionOccurrence, Student, TimesheetEntry } from "@shared/schema";
import { emergencyContactSchema } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { TutorCalendar } from "./tutor-calendar";
import { TutorDocuments } from "./tutor-documents";
import { TutorMockExamResults } from "./tutor-mock-exam-results";

const timesheetSchema = z.object({
  studentId: z.string().optional(), // Made optional to support group sessions
  date: z.string().min(1, "Please select a date").refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selectedDate <= today;
  }, "Cannot log sessions for future dates"),
  duration: z.coerce.number().min(0.25, "Duration must be at least 15 minutes").max(8, "Duration cannot exceed 8 hours"),
  notes: z.string().optional(),
});

type TimesheetFormData = z.infer<typeof timesheetSchema>;

// Helper to group timesheet entries - group sessions shown together, individual sessions shown separately
interface GroupedEntry {
  type: 'individual' | 'group';
  id: string; // For individual: entry id, for group: groupSessionId
  date: Date;
  entries: TimesheetEntryWithRelations[];
  totalDuration: number;
  totalEarnings: number;
}

function groupTimesheetEntries(entries: TimesheetEntryWithRelations[]): GroupedEntry[] {
  const groups: Map<string, GroupedEntry> = new Map();
  const individuals: GroupedEntry[] = [];

  for (const entry of entries) {
    if (entry.sessionType === 'group' && entry.groupSessionId) {
      const existing = groups.get(entry.groupSessionId);
      if (existing) {
        existing.entries.push(entry);
        existing.totalDuration += Number(entry.duration);
        existing.totalEarnings += Number(entry.tutorEarnings);
      } else {
        groups.set(entry.groupSessionId, {
          type: 'group',
          id: entry.groupSessionId,
          date: new Date(entry.date),
          entries: [entry],
          totalDuration: Number(entry.duration),
          totalEarnings: Number(entry.tutorEarnings),
        });
      }
    } else {
      individuals.push({
        type: 'individual',
        id: entry.id,
        date: new Date(entry.date),
        entries: [entry],
        totalDuration: Number(entry.duration),
        totalEarnings: Number(entry.tutorEarnings),
      });
    }
  }

  // Combine and sort by date
  return [...individuals, ...Array.from(groups.values())]
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface TutorDashboardProps {
  user: User;
}

// Session card component with expandable topics
function SessionCard({ 
  session, 
  isExpanded, 
  onToggle 
}: { 
  session: TimesheetEntryWithRelations; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Fetch topics when expanded
  const { data: topics = [], isLoading: topicsLoading } = useQuery<{ id: string; name: string; subject: string }[]>({
    queryKey: ["/api/timesheet-entries", session.id, "topics"],
    enabled: isExpanded,
    retry: false,
  });

  return (
    <div
      className="p-3 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/40 transition-colors"
      onClick={onToggle}
      data-testid={`session-${session.id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="font-medium text-foreground">
            {session.student.name} - {session.student.subject}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(session.date), "MMM dd, yyyy")} - {session.duration} hours
          </p>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <p className="font-medium text-chart-2">
              £{parseFloat(session.tutorEarnings.toString()).toFixed(2)}
            </p>
            <Badge
              variant={
                session.status === "approved"
                  ? "default"
                  : session.status === "rejected"
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs"
            >
              {session.status === "pending" ? "Pending" : session.status}
            </Badge>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-2">
          {session.notes && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Notes:</span> {session.notes}
            </p>
          )}
          
          <div className="text-sm">
            <span className="font-medium flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3" /> Topics Covered:
            </span>
            {topicsLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : topics.length === 0 ? (
              <span className="text-muted-foreground italic">No topics recorded</span>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {topics.map((topic) => (
                  <Badge key={topic.id} variant="outline" className="text-xs">
                    {topic.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorDashboard({ user }: TutorDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if user is additional staff (not a tutor) - they can only log "Other" work
  const isStaffOnly = user.role === "additional_staff";
  
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isCurrentWeekExpanded, setIsCurrentWeekExpanded] = useState(false);
  const [selectedStudentForTopics, setSelectedStudentForTopics] = useState<StudentWithTutor | null>(null);
  const [isTopicsDialogOpen, setIsTopicsDialogOpen] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [expandedHistoryTimesheetId, setExpandedHistoryTimesheetId] = useState<string | null>(null);
  const [statusHistoryExpanded, setStatusHistoryExpanded] = useState(true);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntryWithRelations | null>(null);
  const [isEditEntryDialogOpen, setIsEditEntryDialogOpen] = useState(false);
  const [editEntryForm, setEditEntryForm] = useState({ date: "", duration: 1, notes: "" });
  const [selectedEarningsYear, setSelectedEarningsYear] = useState(new Date().getFullYear());
  const [showAllTimesheetHistory, setShowAllTimesheetHistory] = useState(false);
  const [earningsPeriod, setEarningsPeriod] = useState<"weekly" | "monthly" | "annual">("weekly");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarInitialDate, setCalendarInitialDate] = useState<Date | undefined>(undefined);
  
  // Session type state (individual, group, or other for non-tutoring work)
  // Staff members default to "other" since they can only log non-tutoring work
  const [sessionType, setSessionType] = useState<"individual" | "group" | "other">(isStaffOnly ? "other" : "individual");
  
  // "Other" session type state
  const [selectedWorkTypeId, setSelectedWorkTypeId] = useState<string>("");
  const [weekPeriodStart, setWeekPeriodStart] = useState<Date | null>(null);
  const [otherNotes, setOtherNotes] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedGroupStudentIds, setSelectedGroupStudentIds] = useState<string[]>([]);
  
  // Group session attendance tracking: { studentId: { present: boolean, chargeType: 'charge' | 'deduct' | 'no_change' } }
  const [groupAttendance, setGroupAttendance] = useState<Record<string, { present: boolean; chargeType: 'charge' | 'deduct' | 'no_change'; notes?: string }>>({});
  
  // Topics covered state
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [expandedTopicParents, setExpandedTopicParents] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [otherTopicsText, setOtherTopicsText] = useState<string>("");
  
  // Selected notification for details modal
  const [selectedNotification, setSelectedNotification] = useState<{
    id: string;
    type: string;
    payload: { title?: string; message?: string; relatedId?: string; relatedType?: string };
    readAt: Date | null;
    createdAt: Date;
  } | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Selected change request for details modal
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<{
    id: string;
    sessionOccurrenceId: string;
    parentId: string;
    requestType: string;
    originalDate: Date | null;
    proposedDate: Date | null;
    proposedStartDateTime: Date | null;
    proposedEndDateTime: Date | null;
    proposedDateMessage: string | null;
    reason: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: Date;
    reviewedAt: Date | null;
    sessionOccurrence?: { 
      id: string; 
      startDateTime: Date; 
      endDateTime: Date;
      student?: { id: string; name: string };
    };
    parent?: { id: string; firstName: string; lastName: string };
  } | null>(null);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);

  // Dismissed change request IDs (persisted to localStorage)
  const [dismissedChangeRequestIds, setDismissedChangeRequestIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('dismissedChangeRequestIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  
  // Persist dismissed IDs to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('dismissedChangeRequestIds', JSON.stringify(Array.from(dismissedChangeRequestIds)));
    } catch {
      // Ignore localStorage errors
    }
  }, [dismissedChangeRequestIds]);
  
  // Section collapse states
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    currentTimesheet: false,
    pastTimesheets: false,
    logSession: false,
    recentSessions: false,
    weeklySummary: false,
    myStudents: false,
    messages: false,
    annualEarnings: false,
    emergencyContact: false,
  });
  
  const toggleSection = (section: keyof typeof sectionsCollapsed) => {
    setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

  // Calculate date range based on earnings period
  const getEarningsDateRange = (period: "weekly" | "monthly" | "annual") => {
    const now = new Date();
    let start: Date;
    let end: Date;
    
    if (period === "weekly") {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (period === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
  };
  
  const earningsDateRange = getEarningsDateRange(earningsPeriod);

  // Fetch students for this tutor (only students assigned to them)
  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery<StudentWithTutor[]>({
    queryKey: ["/api/students/my"],
    retry: false,
  });

  // Fetch work types for "Other" session type
  const { data: workTypes = [] } = useQuery<{ id: string; name: string; description: string | null; paymentType: string | null; flatFeeAmount: string | null }[]>({
    queryKey: ["/api/work-types"],
  });

  // Fetch timesheet entries for current week
  const {
    data: timesheetEntries = [],
    isLoading: timesheetsLoading,
  } = useQuery<TimesheetEntryWithRelations[]>({
    queryKey: ["/api/timesheets", weekStart.toISOString(), weekEnd.toISOString()],
    retry: false,
  });

  // Fetch all timesheet entries (for recent sessions including older ones)
  const {
    data: allTimesheetEntries = [],
    isLoading: allTimesheetsLoading,
  } = useQuery<TimesheetEntryWithRelations[]>({
    queryKey: ["/api/timesheets/my-sessions"],
    retry: false,
  });

  // Fetch earnings based on selected period
  const { data: earnings, isLoading: earningsLoading } = useQuery<{ earnings: number }>({
    queryKey: ["/api/analytics/tutor-earnings", { startDate: earningsDateRange.start.toISOString(), endDate: earningsDateRange.end.toISOString() }],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/tutor-earnings?startDate=${earningsDateRange.start.toISOString()}&endDate=${earningsDateRange.end.toISOString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch earnings");
      return res.json();
    },
    retry: false,
  });

  // Fetch annual earnings
  const { data: annualEarnings, isLoading: annualEarningsLoading } = useQuery<{ totalEarnings: number; approvedSessions: number; year: number }>({
    queryKey: ["/api/tutor/earnings", selectedEarningsYear],
    queryFn: async () => {
      const res = await fetch(`/api/tutor/earnings?year=${selectedEarningsYear}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch annual earnings");
      return res.json();
    },
    retry: false,
  });

  // Fetch current week's timesheet
  const {
    data: currentWeeklyTimesheet,
    isLoading: weeklyTimesheetLoading,
  } = useQuery<WeeklyTimesheetWithRelations>({
    queryKey: ["/api/weekly-timesheets/current"],
    retry: false,
  });

  // Fetch all weekly timesheets for this tutor
  const {
    data: myWeeklyTimesheets = [],
    isLoading: myTimesheetsLoading,
  } = useQuery<WeeklyTimesheetWithRelations[]>({
    queryKey: ["/api/weekly-timesheets/my"],
    retry: false,
  });

  // Fetch topics for selected student
  const { data: studentTopics = [], isLoading: topicsLoading } = useQuery<StudentTopic[]>({
    queryKey: ["/api/students", selectedStudentForTopics?.id, "topics"],
    queryFn: async () => {
      if (!selectedStudentForTopics) return [];
      const res = await fetch(`/api/students/${selectedStudentForTopics.id}/topics`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
    enabled: !!selectedStudentForTopics && isTopicsDialogOpen,
    retry: false,
  });

  // Fetch student groups for this tutor
  const { data: myGroups = [], isLoading: groupsLoading } = useQuery<StudentGroupWithMembers[]>({
    queryKey: ["/api/student-groups"],
    retry: false,
  });

  // Fetch curriculum topics for session logging
  const { data: curriculumTopics = [], isLoading: curriculumTopicsLoading } = useQuery<CurriculumTopicWithSubtopics[]>({
    queryKey: ["/api/curriculum-topics"],
    retry: false,
  });

  // Fetch all weeks the tutor has taught
  const { data: tutorWeeks = [] } = useQuery<{ weekStart: string; weekEnd: string }[]>({
    queryKey: ["/api/analytics/tutor-weeks"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/tutor-weeks", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tutor weeks");
      return res.json();
    },
    retry: false,
  });

  // Fetch parent messages for this tutor
  const { data: parentMessages = [], isLoading: messagesLoading } = useQuery<ParentMessageWithRelations[]>({
    queryKey: ["/api/messages/tutor"],
    retry: false,
  });

  // Fetch single message with replies when expanded
  const { data: expandedMessage } = useQuery<ParentMessageWithRelations & { replies: ParentMessageReplyWithRelations[] }>({
    queryKey: ["/api/messages", expandedMessageId],
    enabled: !!expandedMessageId,
    retry: false,
  });

  // Fetch emergency contact for this tutor
  const { data: emergencyContact, isLoading: emergencyContactLoading } = useQuery<EmergencyContact | null>({
    queryKey: ["/api/tutors/me/emergency-contact"],
    retry: false,
  });

  // Fetch session logging alerts (pending) for this tutor
  const { data: sessionAlerts = [] } = useQuery<{
    id: string;
    sessionOccurrenceId: string;
    tutorId: string;
    studentId: string | null;
    sessionEndTime: string;
    alertCreatedAt: string;
    status: string;
    tutorName: string;
    studentName: string;
  }[]>({
    queryKey: ["/api/session-alerts", { status: "pending" }],
    queryFn: async () => {
      const res = await fetch("/api/session-alerts?status=pending", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch session alerts");
      return res.json();
    },
    retry: false,
    refetchInterval: 60000, // Refetch every minute
  });

  // Session change requests from parents (for this tutor's sessions)
  const { data: changeRequests = [], isLoading: changeRequestsLoading } = useQuery<{
    id: string;
    sessionOccurrenceId: string;
    parentId: string;
    requestType: string;
    originalDate: Date | null;
    proposedDate: Date | null;
    proposedStartDateTime: Date | null;
    proposedEndDateTime: Date | null;
    proposedDateMessage: string | null;
    reason: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: Date;
    reviewedAt: Date | null;
    sessionOccurrence?: { 
      id: string; 
      startDateTime: Date; 
      endDateTime: Date;
      student?: { id: string; name: string };
    };
    parent?: { id: string; firstName: string; lastName: string };
  }[]>({
    queryKey: ["/api/tutor/session-change-requests"],
    retry: false,
    refetchInterval: 60000,
  });

  // System notifications for tutor (change request updates, etc.)
  const { data: tutorNotifications = [] } = useQuery<{
    id: string;
    type: string;
    payload: { title?: string; message?: string; relatedId?: string; relatedType?: string };
    readAt: Date | null;
    createdAt: Date;
  }[]>({
    queryKey: ["/api/notifications"],
    retry: false,
    refetchInterval: 60000,
  });

  // Fetch session occurrences for this tutor (for calendar-timesheet integration)
  const { data: sessionOccurrences = [] } = useQuery<(SessionOccurrence & { student?: Student; tutor?: User })[]>({
    queryKey: ["/api/session-occurrences"],
    retry: false,
  });

  // Fetch timesheet entries to check which sessions have been logged
  const { data: timesheetEntriesForSessions = [] } = useQuery<(TimesheetEntry & { sessionOccurrenceId?: string })[]>({
    queryKey: ["/api/timesheets/my-sessions"],
    retry: false,
  });

  // Create a set of logged session occurrence IDs for quick lookup
  const loggedSessionIds = new Set(
    timesheetEntriesForSessions
      .filter((entry) => entry.sessionOccurrenceId)
      .map((entry) => entry.sessionOccurrenceId)
  );

  // Find past sessions that need action (still scheduled/confirmed but past the end time)
  const sessionsNeedingAction = sessionOccurrences.filter((session) => {
    const sessionEndTime = new Date(session.endDateTime);
    const now = new Date();
    const isPast = sessionEndTime < now;
    const isUnactioned = session.status === "scheduled" || session.status === "confirmed";
    const isNotLogged = !loggedSessionIds.has(session.id);
    return isPast && isUnactioned && isNotLogged;
  });

  // State for linking session occurrence to timesheet entry
  const [selectedSessionOccurrenceId, setSelectedSessionOccurrenceId] = useState<string>("");

  // Emergency contact form state
  const [emergencyContactForm, setEmergencyContactForm] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Sync form with fetched data
  useEffect(() => {
    if (emergencyContact) {
      setEmergencyContactForm({
        name: emergencyContact.name || "",
        relationship: emergencyContact.relationship || "",
        phone: emergencyContact.phone || "",
        email: emergencyContact.email || "",
        notes: emergencyContact.notes || "",
      });
    }
  }, [emergencyContact]);

  // Update emergency contact mutation
  const updateEmergencyContactMutation = useMutation({
    mutationFn: async (data: Omit<EmergencyContact, "lastUpdatedAt">) => {
      const response = await apiRequest("PUT", "/api/tutors/me/emergency-contact", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutors/me/emergency-contact"] });
      toast({
        title: "Emergency Contact Updated",
        description: "Your emergency contact has been saved and admin has been notified.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update emergency contact",
        variant: "destructive",
      });
    },
  });

  // Fetch status history for expanded timesheet
  interface StatusHistoryItem {
    id: string;
    weeklyTimesheetId: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string;
    notes: string | null;
    createdAt: string;
    changedByName?: string;
  }
  const { data: statusHistory = [] } = useQuery<StatusHistoryItem[]>({
    queryKey: ["/api/weekly-timesheets", expandedHistoryTimesheetId, "history"],
    queryFn: async () => {
      if (!expandedHistoryTimesheetId) return [];
      const res = await fetch(`/api/weekly-timesheets/${expandedHistoryTimesheetId}/history`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status history");
      return res.json();
    },
    enabled: !!expandedHistoryTimesheetId,
    retry: false,
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async ({ messageId, replyContent }: { messageId: string; replyContent: string }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/replies`, { replyContent });
      return response.json();
    },
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", expandedMessageId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/tutor"] });
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send reply.",
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/tutor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", expandedMessageId] });
      toast({
        title: "Message Marked as Read",
        description: "The message has been marked as read.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive",
      });
    },
  });

  // Mark topic as covered mutation
  const markTopicCoveredMutation = useMutation({
    mutationFn: async ({ topicId, isCovered, coveredAt }: { topicId: string; isCovered: boolean; coveredAt?: string }) => {
      const response = await apiRequest("PATCH", `/api/topics/${topicId}/covered`, { isCovered, coveredAt });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedStudentForTopics?.id, "topics"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update topic status.",
        variant: "destructive",
      });
    },
  });

  // Open topics dialog for a student
  const openTopicsDialog = (student: StudentWithTutor) => {
    setSelectedStudentForTopics(student);
    setIsTopicsDialogOpen(true);
  };

  // Form setup
  const form = useForm<TimesheetFormData>({
    resolver: zodResolver(timesheetSchema),
    defaultValues: {
      studentId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      duration: 1,
      notes: "",
    },
  });

  // Create timesheet entry mutation (individual sessions and "other" work type)
  const createTimesheetMutation = useMutation({
    mutationFn: async (data: TimesheetFormData & { 
      topicIds: string[]; 
      subject: string; 
      otherTopicsText?: string; 
      sessionOccurrenceId?: string;
      sessionType?: "individual" | "group" | "other";
      workTypeId?: string;
      workTypeName?: string;
      weekPeriodStart?: string;
      weekPeriodEnd?: string;
    }) => {
      const response = await apiRequest("POST", "/api/timesheets", {
        studentId: data.studentId || undefined,
        date: new Date(data.date).toISOString(),
        duration: data.duration,
        notes: data.notes,
        sessionSubject: data.subject,
        otherTopicsText: data.otherTopicsText,
        sessionOccurrenceId: data.sessionOccurrenceId || undefined,
        sessionType: data.sessionType || "individual",
        workTypeId: data.workTypeId,
        workTypeName: data.workTypeName,
        weekPeriodStart: data.weekPeriodStart ? new Date(data.weekPeriodStart).toISOString() : undefined,
        weekPeriodEnd: data.weekPeriodEnd ? new Date(data.weekPeriodEnd).toISOString() : undefined,
      });
      const entry = await response.json();
      
      // Save topics covered for this session (only if not "Other" session type)
      if (data.topicIds.length > 0 && data.subject !== "Other" && data.sessionType !== "other") {
        await apiRequest("POST", `/api/timesheet-entries/${entry.id}/topics`, {
          topicIds: data.topicIds,
        });
      }
      
      return entry;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: variables.sessionType === "other" 
          ? "Work entry logged successfully!" 
          : "Teaching session logged successfully!",
      });
      form.reset({
        studentId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        duration: 1,
        notes: "",
      });
      setSelectedTopicIds([]);
      setExpandedTopicParents([]);
      setSelectedSubject("");
      setOtherTopicsText("");
      setSelectedSessionOccurrenceId("");
      setSessionType("individual");
      setSelectedWorkTypeId("");
      setWeekPeriodStart(null);
      setOtherNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/tutor-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log teaching session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create group session with attendance tracking (logs attendance and handles billing)
  const createGroupTimesheetMutation = useMutation({
    mutationFn: async (data: { 
      date: string; 
      duration: number; 
      notes: string; 
      groupId: string; 
      topicIds: string[]; 
      subject: string; 
      otherTopicsText?: string;
      attendance: { studentId: string; present: boolean; chargeType: 'charge' | 'deduct' | 'no_change'; notes?: string }[];
    }) => {
      // Create the group session with attendance, subject, and topics
      const response = await apiRequest("POST", "/api/group-sessions", {
        groupId: data.groupId,
        sessionDate: new Date(data.date).toISOString(),
        duration: data.duration,
        notes: data.notes,
        attendance: data.attendance,
        sessionSubject: data.subject,
        topicIds: data.topicIds,
        otherTopicsText: data.otherTopicsText,
      });
      
      return response.json();
    },
    onSuccess: (result) => {
      const presentCount = result.attendance?.filter((a: any) => a.present).length || 0;
      const absentCount = result.attendance?.filter((a: any) => !a.present).length || 0;
      toast({
        title: "Success",
        description: `Group session logged! ${presentCount} present, ${absentCount} absent.`,
      });
      form.reset({
        studentId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        duration: 1,
        notes: "",
      });
      setSessionType("individual");
      setSelectedGroupId("");
      setSelectedGroupStudentIds([]);
      setGroupAttendance({});
      setSelectedTopicIds([]);
      setExpandedTopicParents([]);
      setSelectedSubject("");
      setOtherTopicsText("");
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/group-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/tutor-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to log group session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit weekly timesheet mutation
  const submitTimesheetMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      const response = await apiRequest("POST", `/api/weekly-timesheets/${timesheetId}/submit`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly timesheet submitted for approval!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to submit timesheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for editing timesheet entry (for tutors)
  const updateEntryMutation = useMutation({
    mutationFn: async (data: { id: string; date?: string; duration?: number; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/timesheet-entries/${data.id}/tutor`, {
        date: data.date,
        duration: data.duration,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Session entry updated successfully!",
      });
      setIsEditEntryDialogOpen(false);
      setEditingEntry(null);
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to update entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting timesheet entry (for tutors)
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/timesheet-entries/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Session entry deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting entire group session
  const deleteGroupSessionMutation = useMutation({
    mutationFn: async (groupSessionId: string) => {
      const response = await apiRequest("DELETE", `/api/group-sessions/${groupSessionId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group session deleted successfully! Student credits have been restored.",
      });
      setExpandedSessionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets/my-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/group-sessions"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error?.message || "Failed to delete group session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for marking notification as read
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Handle unauthorized error for students
  useEffect(() => {
    if (studentsError && isUnauthorizedError(studentsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [studentsError, toast]);

  const onSubmit = (data: TimesheetFormData) => {
    // Handle "Other" session type (non-tutoring work)
    if (sessionType === "other") {
      if (!selectedWorkTypeId) {
        toast({
          title: "No work type selected",
          description: "Please select a work type for this entry.",
          variant: "destructive",
        });
        return;
      }
      if (!weekPeriodStart) {
        toast({
          title: "No week period selected",
          description: "Please select a week period for this work.",
          variant: "destructive",
        });
        return;
      }
      if (!otherNotes.trim()) {
        toast({
          title: "No description provided",
          description: "Please describe the work you performed.",
          variant: "destructive",
        });
        return;
      }
      
      // Get the work type name for historical record
      const workType = workTypes.find(wt => wt.id === selectedWorkTypeId);
      const weekEndDate = new Date(weekPeriodStart);
      weekEndDate.setDate(weekPeriodStart.getDate() + 6);
      
      // Submit "Other" timesheet entry
      createTimesheetMutation.mutate({
        ...data,
        studentId: undefined, // No student for "Other" type
        topicIds: [],
        subject: "Other Work",
        sessionType: "other",
        workTypeId: selectedWorkTypeId,
        workTypeName: workType?.name || "",
        weekPeriodStart: weekPeriodStart.toISOString(),
        weekPeriodEnd: weekEndDate.toISOString(),
        notes: otherNotes,
        date: weekPeriodStart.toISOString().split('T')[0], // Use Monday as the date
      });
      return;
    }

    // Validate subject is selected for tutoring sessions
    if (!selectedSubject) {
      toast({
        title: "No subject selected",
        description: "Please select a subject for this session.",
        variant: "destructive",
      });
      return;
    }

    // Validate topics based on subject
    if (selectedSubject === "Other") {
      if (otherTopicsText.trim().length === 0) {
        toast({
          title: "No topics described",
          description: "Please describe what topics were covered in this session.",
          variant: "destructive",
        });
        return;
      }
    } else if (selectedSubject === "Maths") {
      if (selectedTopicIds.length === 0) {
        toast({
          title: "No topics selected",
          description: "Please select at least one topic covered in this session.",
          variant: "destructive",
        });
        return;
      }
    }
    // Verbal Reasoning, Non Verbal Reasoning, and English don't require topic selection
    
    if (sessionType === "group") {
      if (!selectedGroupId) {
        toast({
          title: "No group selected",
          description: "Please select a group first.",
          variant: "destructive",
        });
        return;
      }
      
      if (Object.keys(groupAttendance).length === 0) {
        toast({
          title: "No students in group",
          description: "Please select a group with students first.",
          variant: "destructive",
        });
        return;
      }
      
      // Convert attendance state to array format for API
      const attendanceArray = Object.entries(groupAttendance).map(([studentId, att]) => ({
        studentId,
        present: att.present,
        chargeType: att.chargeType,
      }));
      
      createGroupTimesheetMutation.mutate({
        date: data.date,
        duration: data.duration,
        notes: data.notes || "",
        groupId: selectedGroupId,
        topicIds: selectedTopicIds,
        subject: selectedSubject,
        otherTopicsText: selectedSubject === "Other" ? otherTopicsText : undefined,
        attendance: attendanceArray,
      });
    } else {
      // Validate studentId for individual sessions
      if (!data.studentId) {
        toast({
          title: "No student selected",
          description: "Please select a student for the session.",
          variant: "destructive",
        });
        return;
      }
      createTimesheetMutation.mutate({ 
        ...data, 
        studentId: data.studentId, 
        topicIds: selectedTopicIds,
        subject: selectedSubject,
        otherTopicsText: selectedSubject === "Other" ? otherTopicsText : undefined,
        sessionOccurrenceId: selectedSessionOccurrenceId && selectedSessionOccurrenceId !== "none" ? selectedSessionOccurrenceId : undefined,
      });
    }
  };

  // Handle group selection
  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    const group = myGroups.find(g => g.id === groupId);
    if (group) {
      // Pre-select all students and initialize attendance tracking
      setSelectedGroupStudentIds(group.members.map(m => m.studentId));
      
      // Initialize attendance for all members (default: present, charge)
      const initialAttendance: Record<string, { present: boolean; chargeType: 'charge' | 'deduct' | 'no_change' }> = {};
      group.members.forEach(m => {
        initialAttendance[m.studentId] = { present: true, chargeType: 'charge' };
      });
      setGroupAttendance(initialAttendance);
    } else {
      setSelectedGroupStudentIds([]);
      setGroupAttendance({});
    }
  };

  // Toggle student presence in group session
  const toggleGroupStudentPresence = (studentId: string) => {
    setGroupAttendance(prev => {
      const current = prev[studentId] || { present: true, chargeType: 'charge' as const };
      return {
        ...prev,
        [studentId]: {
          ...current,
          present: !current.present,
          // If marking absent, default to deduct; if marking present, default to charge
          chargeType: current.present ? 'deduct' : 'charge',
        },
      };
    });
  };

  // Update charge type for a student
  // 'charge' = present (student attended)
  // 'deduct' = absent but charged (absent fee)
  // 'no_change' = absent and not charged
  const updateStudentChargeType = (studentId: string, chargeType: 'charge' | 'deduct' | 'no_change') => {
    setGroupAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        chargeType,
        // Set present based on charge type: 'charge' means present, 'deduct' or 'no_change' means absent
        present: chargeType === 'charge',
      },
    }));
  };

  // Toggle student in group selection (for including/excluding from session)
  const toggleGroupStudent = (studentId: string) => {
    setSelectedGroupStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Calculate stats
  const weeklyEarnings = earnings?.earnings || 0;
  const weeklyLessons = timesheetEntries.length;
  const activeStudents = students.filter((student) => student.sessionsRemaining > 0).length;
  
  // Calculate total earnings from all sessions shown in weekly summary (including pending)
  const totalWeeklySessionEarnings = timesheetEntries.reduce((sum, entry) => 
    sum + parseFloat(entry.tutorEarnings.toString()), 0
  );

  // Recent sessions (last 5)
  // Use all sessions for recent display, sorted by date descending, limit to 10
  const recentSessions = [...allTimesheetEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Show calendar view if toggled
  if (showCalendar) {
    return <TutorCalendar user={user} onBack={() => { setShowCalendar(false); setCalendarInitialDate(undefined); }} initialDate={calendarInitialDate} />;
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {tutorNotifications.filter(n => !n.readAt).length > 0 && (
            <Badge className="bg-red-500 text-white">
              <Bell className="h-3 w-3 mr-1" />
              {tutorNotifications.filter(n => !n.readAt).length} new
            </Badge>
          )}
        </div>
{!isStaffOnly && (
          <Button
            variant="outline"
            onClick={() => setShowCalendar(true)}
            data-testid="open-calendar-button"
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Calendar
          </Button>
        )}
      </div>

      {/* System Notifications Banner */}
      {tutorNotifications.filter(n => !n.readAt).length > 0 && (
        <Card className="border-purple-500 bg-purple-50 dark:bg-purple-950/20" data-testid="notifications-banner">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  Notifications
                </h3>
                <div className="space-y-2">
                  {tutorNotifications.filter(n => !n.readAt).slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between bg-white dark:bg-background/50 rounded-md p-2 text-sm cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      onClick={() => {
                        setSelectedNotification(notification);
                        setIsNotificationModalOpen(true);
                      }}
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{notification.payload?.title || "Notification"}</p>
                        <p className="text-muted-foreground text-xs">{notification.payload?.message || ""}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.createdAt), "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotification(notification);
                            setIsNotificationModalOpen(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                          data-testid={`btn-view-notification-${notification.id}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationReadMutation.mutate(notification.id);
                          }}
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                          data-testid={`btn-dismiss-notification-${notification.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Logging Alerts Banner */}
      {sessionAlerts.length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20" data-testid="session-alerts-banner">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                  Overdue Session Logging
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-300 mb-3">
                  You have {sessionAlerts.length} session{sessionAlerts.length === 1 ? '' : 's'} that need to be logged.
                  Please log your sessions within 24 hours of completion.
                </p>
                <div className="space-y-2">
                  {sessionAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between bg-white dark:bg-background/50 rounded-md p-2 text-sm"
                      data-testid={`session-alert-${alert.id}`}
                    >
                      <div>
                        <span className="font-medium">{alert.studentName}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span className="text-muted-foreground">
                          {format(new Date(alert.sessionEndTime), "EEE, MMM d 'at' h:mm a")}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        Overdue
                      </Badge>
                    </div>
                  ))}
                  {sessionAlerts.length > 3 && (
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      + {sessionAlerts.length - 3} more session{sessionAlerts.length - 3 === 1 ? '' : 's'} to log
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Change Requests Banner - Pending requests always show until admin approves/rejects */}
      {changeRequests.filter(r => r.status === "pending").length > 0 && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20" data-testid="change-requests-banner">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                    Session Change Requests
                  </h3>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Awaiting Admin Review
                  </Badge>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                  Parents have requested changes to {changeRequests.filter(r => r.status === "pending").length} upcoming session{changeRequests.filter(r => r.status === "pending").length === 1 ? '' : 's'}.
                  The admin will review and respond.
                </p>
                <div className="space-y-2">
                  {changeRequests.filter(r => r.status === "pending").slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between bg-white dark:bg-background/50 rounded-md p-2 text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      onClick={() => {
                        setSelectedChangeRequest(request);
                        setIsChangeRequestModalOpen(true);
                      }}
                      data-testid={`change-request-${request.id}`}
                    >
                      <div className="flex-1">
                        <span className="font-medium">{request.sessionOccurrence?.student?.name || "Student"}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        {request.requestType === "reschedule" ? (
                          <>
                            <span className="text-red-600 dark:text-red-400 line-through">
                              {request.originalDate && format(new Date(request.originalDate), "EEE, MMM d")}
                            </span>
                            <span className="text-muted-foreground mx-1">→</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {request.proposedStartDateTime && format(new Date(request.proposedStartDateTime), "EEE, MMM d 'at' h:mm a")}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            {request.originalDate && format(new Date(request.originalDate), "EEE, MMM d 'at' h:mm a")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={request.requestType === "cancel" ? "bg-red-100 text-red-700 border-red-300" : "bg-blue-100 text-blue-700 border-blue-300"}>
                          {request.requestType === "cancel" ? <CalendarX className="h-3 w-3 mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                          {request.requestType === "cancel" ? "Cancel" : "Reschedule"}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  ))}
                  {changeRequests.filter(r => r.status === "pending").length > 3 && (
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      + {changeRequests.filter(r => r.status === "pending").length - 3} more request{changeRequests.filter(r => r.status === "pending").length - 3 === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Sessions Needing Action Banner (Yellow) - Hidden for staff */}
      {!isStaffOnly && sessionsNeedingAction.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20" data-testid="sessions-needing-action-banner">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Calendar Sessions Requiring Your Action ({sessionsNeedingAction.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              These past sessions need to be logged or their status updated. You can log them using the form below and select the calendar session to link them.
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {sessionsNeedingAction.slice(0, 5).map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setShowCalendar(true)}
                  data-testid={`action-needed-session-${session.id}`}
                >
                  <div>
                    <span className="font-medium text-sm">{session.student?.name || "Session"}</span>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(session.startDateTime), "EEE, MMM d 'at' h:mm a")}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    View Calendar
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card data-testid="card-weekly-earnings" className="sm:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                <Button
                  variant={earningsPeriod === "weekly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEarningsPeriod("weekly")}
                  data-testid="button-tutor-earnings-weekly"
                  className="text-xs px-2 h-7"
                >
                  Weekly
                </Button>
                <Button
                  variant={earningsPeriod === "monthly" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEarningsPeriod("monthly")}
                  data-testid="button-tutor-earnings-monthly"
                  className="text-xs px-2 h-7"
                >
                  Monthly
                </Button>
                <Button
                  variant={earningsPeriod === "annual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEarningsPeriod("annual")}
                  data-testid="button-tutor-earnings-annual"
                  className="text-xs px-2 h-7"
                >
                  Annual
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">
                  {earningsPeriod === "weekly" ? "This Week's" : earningsPeriod === "monthly" ? "This Month's" : "This Year's"} Earnings
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-weekly-earnings">
                  £{earningsLoading ? "..." : weeklyEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(earningsDateRange.start, "MMM dd")} - {format(earningsDateRange.end, "MMM dd, yyyy")}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {!isStaffOnly && (
          <Card data-testid="card-weekly-lessons">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Sessions This Week</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-weekly-lessons">
                    {weeklyLessons}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isStaffOnly && (
          <Card data-testid="card-active-students">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Students</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-active-students">
                    {activeStudents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Current Week Timesheet Status */}
      <Card data-testid="card-weekly-timesheet-status">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('currentTimesheet')}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-primary mr-2" />
              Current Week Timesheet
            </div>
            {sectionsCollapsed.currentTimesheet ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        {!sectionsCollapsed.currentTimesheet && <CardContent>
          {weeklyTimesheetLoading ? (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : currentWeeklyTimesheet ? (
            <div className="space-y-4">
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => currentWeeklyTimesheet.entries.length > 0 && setIsCurrentWeekExpanded(!isCurrentWeekExpanded)}
                data-testid="toggle-current-week-expand"
              >
                <div className="flex items-center gap-2">
                  {currentWeeklyTimesheet.entries.length > 0 && (
                    isCurrentWeekExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      Week of {format(new Date(currentWeeklyTimesheet.weekStart), "MMM dd")} - {format(new Date(currentWeeklyTimesheet.weekEnd), "MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentWeeklyTimesheet.entries.length} session(s) logged
                      {currentWeeklyTimesheet.entries.length > 0 && (
                        <span className="ml-2 font-medium text-chart-2">
                          • £{currentWeeklyTimesheet.entries.reduce((sum, e) => sum + Number(e.tutorEarnings), 0).toFixed(2)} earnings
                        </span>
                      )}
                      {currentWeeklyTimesheet.entries.length > 0 && !isCurrentWeekExpanded && (
                        <span className="ml-2 text-xs">(click to view details)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <Badge
                    variant={
                      currentWeeklyTimesheet.status === "approved"
                        ? "default"
                        : currentWeeklyTimesheet.status === "rejected"
                        ? "destructive"
                        : currentWeeklyTimesheet.status === "submitted"
                        ? "secondary"
                        : "outline"
                    }
                    className="flex items-center gap-1"
                    data-testid="badge-timesheet-status"
                  >
                    {currentWeeklyTimesheet.status === "approved" && <CheckCircle className="w-3 h-3" />}
                    {currentWeeklyTimesheet.status === "rejected" && <XCircle className="w-3 h-3" />}
                    {currentWeeklyTimesheet.status === "submitted" && <Clock className="w-3 h-3" />}
                    {currentWeeklyTimesheet.status === "draft" ? "Draft" : currentWeeklyTimesheet.status}
                  </Badge>
                  {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && currentWeeklyTimesheet.entries.length > 0 && (
                    <Button
                      onClick={() => submitTimesheetMutation.mutate(currentWeeklyTimesheet.id)}
                      disabled={submitTimesheetMutation.isPending}
                      data-testid="button-submit-timesheet"
                    >
                      {submitTimesheetMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {currentWeeklyTimesheet.status === "rejected" ? "Resubmit" : "Submit for Approval"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Sessions List */}
              {isCurrentWeekExpanded && currentWeeklyTimesheet.entries.length > 0 && (
                <div className="border rounded-lg overflow-hidden" data-testid="current-week-sessions-list">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                        <TableHead>Notes</TableHead>
                        {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && (
                          <TableHead className="text-right">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupTimesheetEntries(currentWeeklyTimesheet.entries).map((grouped) => {
                        if (grouped.type === 'individual') {
                          const entry = grouped.entries[0];
                          return (
                            <TableRow key={entry.id} data-testid={`session-row-${entry.id}`}>
                              <TableCell className="font-medium">
                                {format(new Date(entry.date), "EEE, MMM dd")}
                              </TableCell>
                              <TableCell>{entry.student?.name || "Unknown"}</TableCell>
                              <TableCell>{entry.student?.subject || "-"}</TableCell>
                              <TableCell className="text-right">{entry.duration}h</TableCell>
                              <TableCell className="text-right font-medium text-chart-2">
                                £{Number(entry.tutorEarnings).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                {entry.notes || "-"}
                              </TableCell>
                              {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingEntry(entry);
                                        setEditEntryForm({
                                          date: format(new Date(entry.date), "yyyy-MM-dd"),
                                          duration: Number(entry.duration),
                                          notes: entry.notes || "",
                                        });
                                        setIsEditEntryDialogOpen(true);
                                      }}
                                      data-testid={`button-edit-current-entry-${entry.id}`}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => {
                                        if (confirm("Are you sure you want to delete this session entry?")) {
                                          deleteEntryMutation.mutate(entry.id);
                                        }
                                      }}
                                      disabled={deleteEntryMutation.isPending}
                                      data-testid={`button-delete-current-entry-${entry.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        } else {
                          // Group session - show consolidated row with expandable attendance
                          const presentStudents = grouped.entries.filter(e => e.notes?.includes('Present'));
                          const absentStudents = grouped.entries.filter(e => e.notes?.includes('Absent'));
                          const firstEntry = grouped.entries[0];
                          return (
                            <Fragment key={`group-${grouped.id}`}>
                              <TableRow 
                                className="bg-primary/5 cursor-pointer hover:bg-primary/10"
                                onClick={() => setExpandedSessionId(expandedSessionId === grouped.id ? null : grouped.id)}
                                data-testid={`group-session-row-${grouped.id}`}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {expandedSessionId === grouped.id ? (
                                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    {format(grouped.date, "EEE, MMM dd")}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" />
                                    <span className="font-medium">Group Session</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {grouped.entries.length} students
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>{firstEntry.sessionSubject || firstEntry.student?.subject || "-"}</TableCell>
                                <TableCell className="text-right">{firstEntry.duration}h</TableCell>
                                <TableCell className="text-right font-medium text-chart-2">
                                  £{grouped.totalEarnings.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-600">{presentStudents.length} present</span>
                                    {absentStudents.length > 0 && (
                                      <span className="text-orange-500">{absentStudents.length} absent</span>
                                    )}
                                  </div>
                                </TableCell>
                                {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && (
                                  <TableCell></TableCell>
                                )}
                              </TableRow>
                              {expandedSessionId === grouped.id && (
                                <TableRow className="bg-muted/30">
                                  <TableCell colSpan={7} className="p-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-muted-foreground">Student Attendance:</p>
                                        {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && grouped.id && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (confirm("Are you sure you want to delete this entire group session? This will remove all entries and restore student session credits.")) {
                                                deleteGroupSessionMutation.mutate(grouped.id!);
                                              }
                                            }}
                                            disabled={deleteGroupSessionMutation.isPending}
                                            data-testid={`button-delete-group-session-${grouped.id}`}
                                          >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            Delete Group Session
                                          </Button>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-1 gap-2">
                                        {grouped.entries.map((entry) => {
                                          const isPresent = entry.notes?.includes('Present');
                                          return (
                                            <div 
                                              key={entry.id}
                                              className={`flex items-center gap-2 p-2 rounded-md ${isPresent ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}
                                            >
                                              {isPresent ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                              ) : (
                                                <XCircle className="w-4 h-4 text-orange-500" />
                                              )}
                                              <span className="font-medium">{entry.student?.name}</span>
                                              <span className="text-sm text-muted-foreground">
                                                {isPresent ? 'Present' : 'Absent'}
                                              </span>
                                              <span className="text-sm text-chart-2 ml-auto mr-2">
                                                £{Number(entry.tutorEarnings).toFixed(2)}
                                              </span>
                                              {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && (
                                                <div className="flex gap-1">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingEntry(entry);
                                                      setEditEntryForm({
                                                        date: format(new Date(entry.date), "yyyy-MM-dd"),
                                                        duration: Number(entry.duration),
                                                        notes: entry.notes || "",
                                                      });
                                                      setIsEditEntryDialogOpen(true);
                                                    }}
                                                    data-testid={`button-edit-group-entry-${entry.id}`}
                                                  >
                                                    <Edit className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (confirm("Are you sure you want to delete this entry?")) {
                                                        deleteEntryMutation.mutate(entry.id);
                                                      }
                                                    }}
                                                    disabled={deleteEntryMutation.isPending}
                                                    data-testid={`button-delete-group-entry-${entry.id}`}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          );
                        }
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-medium">Total</TableCell>
                        <TableCell className="text-right font-medium">
                          {currentWeeklyTimesheet.entries.reduce((sum, e) => sum + Number(e.duration), 0)}h
                        </TableCell>
                        <TableCell className="text-right font-bold text-chart-2">
                          £{currentWeeklyTimesheet.entries.reduce((sum, e) => sum + Number(e.tutorEarnings), 0).toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                        {(currentWeeklyTimesheet.status === "draft" || currentWeeklyTimesheet.status === "rejected") && (
                          <TableCell></TableCell>
                        )}
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}

              {currentWeeklyTimesheet.reviewNotes && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm">
                    <span className="font-medium text-destructive">Admin Notes:</span>{" "}
                    {currentWeeklyTimesheet.reviewNotes}
                  </p>
                </div>
              )}
              {currentWeeklyTimesheet.status === "draft" && currentWeeklyTimesheet.entries.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Log your teaching sessions below to include them in this week's timesheet.
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No timesheet data available</p>
          )}
        </CardContent>}
      </Card>

      {/* Timesheet History */}
      <Card data-testid="card-timesheet-history">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('pastTimesheets')}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <History className="w-5 h-5 text-primary mr-2" />
              Timesheet History
            </div>
            {sectionsCollapsed.pastTimesheets ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        {!sectionsCollapsed.pastTimesheets && <CardContent>
          {myTimesheetsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : myWeeklyTimesheets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No timesheet history available</p>
          ) : (() => {
            const filteredTimesheets = myWeeklyTimesheets
              .filter(ts => {
                const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
                const isPastWeek = new Date(ts.weekStart).getTime() < currentWeekStart.getTime();
                const isSubmitted = ts.status === "submitted" || ts.status === "approved" || ts.status === "rejected";
                return isPastWeek || isSubmitted;
              })
              .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
            const displayedTimesheets = showAllTimesheetHistory ? filteredTimesheets : filteredTimesheets.slice(0, 2);
            const hasMore = filteredTimesheets.length > 2;
            
            return (
            <div className="space-y-3">
              {displayedTimesheets.map((timesheet) => (
                  <div
                    key={timesheet.id}
                    className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden"
                    data-testid={`timesheet-history-${timesheet.id}`}
                  >
                    <div
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedHistoryTimesheetId(expandedHistoryTimesheetId === timesheet.id ? null : timesheet.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {expandedHistoryTimesheetId === timesheet.id ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">
                            {format(new Date(timesheet.weekStart), "MMM dd")} - {format(new Date(timesheet.weekEnd), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {timesheet.entries.length} session(s) • £{timesheet.entries.reduce((sum, e) => sum + Number(e.tutorEarnings), 0).toFixed(2)} earnings
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          variant={
                            timesheet.status === "approved"
                              ? "default"
                              : timesheet.status === "rejected"
                              ? "destructive"
                              : timesheet.status === "submitted"
                              ? "secondary"
                              : "outline"
                          }
                          className="flex items-center gap-1"
                          data-testid={`badge-status-${timesheet.id}`}
                        >
                          {timesheet.status === "approved" && <CheckCircle className="w-3 h-3" />}
                          {timesheet.status === "rejected" && <XCircle className="w-3 h-3" />}
                          {timesheet.status === "submitted" && <Clock className="w-3 h-3" />}
                          {timesheet.status === "approved" ? "Approved" : 
                           timesheet.status === "submitted" ? "Pending" : 
                           timesheet.status === "rejected" ? "Rejected" : "Draft"}
                        </Badge>
                        {(timesheet.status === "draft" || timesheet.status === "rejected") && timesheet.entries.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => submitTimesheetMutation.mutate(timesheet.id)}
                            disabled={submitTimesheetMutation.isPending}
                            data-testid={`button-submit-${timesheet.id}`}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            {timesheet.status === "rejected" ? "Resubmit" : "Submit"}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {expandedHistoryTimesheetId === timesheet.id && (
                      <div className="border-t border-border/50 p-4 space-y-4">
                        {timesheet.reviewNotes && (
                          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                            <p className="text-sm">
                              <span className="font-medium text-destructive">Admin Feedback:</span>{" "}
                              {timesheet.reviewNotes}
                            </p>
                          </div>
                        )}

                        {/* Status History Timeline */}
                        {statusHistory.length > 0 && (
                          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                            <button 
                              className="w-full text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors"
                              onClick={() => setStatusHistoryExpanded(!statusHistoryExpanded)}
                              data-testid="button-toggle-status-history"
                            >
                              {statusHistoryExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <History className="w-4 h-4" />
                              Status History ({statusHistory.length})
                            </button>
                            {statusHistoryExpanded && (
                              <div className="space-y-3 mt-3">
                                {statusHistory.map((item) => (
                                  <div key={item.id} className="text-sm">
                                    <div className="flex items-start gap-2">
                                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                        item.toStatus === "rejected" ? "bg-destructive" : 
                                        item.toStatus === "approved" ? "bg-green-500" : "bg-primary"
                                      }`} />
                                      <div className="flex-1">
                                        <span className="font-medium">
                                          {item.fromStatus ? `${item.fromStatus} → ` : ""}{item.toStatus}
                                        </span>
                                        <div className="text-xs text-muted-foreground">
                                          by {item.changedByName || "Unknown"} on {format(new Date(item.createdAt), "MMM dd, yyyy h:mm a")}
                                        </div>
                                      </div>
                                    </div>
                                    {item.notes && (
                                      <div className={`ml-4 mt-1 p-2 rounded text-sm ${
                                        item.toStatus === "rejected" 
                                          ? "bg-destructive/10 border border-destructive/20 text-destructive" 
                                          : "bg-muted/50 border border-border/50"
                                      }`}>
                                        <span className="font-medium">
                                          {item.toStatus === "rejected" ? "Reason: " : "Notes: "}
                                        </span>
                                        {item.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {timesheet.entries.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No sessions in this timesheet</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Student</TableHead>
                                  <TableHead>Subject</TableHead>
                                  <TableHead className="text-right">Duration</TableHead>
                                  <TableHead className="text-right">Earnings</TableHead>
                                  <TableHead>Notes</TableHead>
                                  {(timesheet.status === "draft" || timesheet.status === "rejected") && (
                                    <TableHead className="text-right">Actions</TableHead>
                                  )}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {timesheet.entries
                                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                  .map((entry) => (
                                    <TableRow key={entry.id}>
                                      <TableCell className="font-medium">
                                        {format(new Date(entry.date), "EEE, MMM dd")}
                                      </TableCell>
                                      <TableCell>{entry.student?.name || "Unknown"}</TableCell>
                                      <TableCell>{entry.student?.subject || "-"}</TableCell>
                                      <TableCell className="text-right">{entry.duration}h</TableCell>
                                      <TableCell className="text-right font-medium text-chart-2">
                                        £{Number(entry.tutorEarnings).toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                                        {entry.notes || "-"}
                                      </TableCell>
                                      {(timesheet.status === "draft" || timesheet.status === "rejected") && (
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setEditingEntry(entry);
                                                setEditEntryForm({
                                                  date: format(new Date(entry.date), "yyyy-MM-dd"),
                                                  duration: Number(entry.duration),
                                                  notes: entry.notes || "",
                                                });
                                                setIsEditEntryDialogOpen(true);
                                              }}
                                              data-testid={`button-edit-entry-${entry.id}`}
                                            >
                                              <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => {
                                                if (confirm("Are you sure you want to delete this session entry?")) {
                                                  deleteEntryMutation.mutate(entry.id);
                                                }
                                              }}
                                              disabled={deleteEntryMutation.isPending}
                                              data-testid={`button-delete-entry-${entry.id}`}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  ))}
                              </TableBody>
                              <TableFooter>
                                <TableRow>
                                  <TableCell colSpan={3} className="font-medium">Total</TableCell>
                                  <TableCell className="text-right font-medium">
                                    {timesheet.entries.reduce((sum, e) => sum + Number(e.duration), 0)}h
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-chart-2">
                                    £{timesheet.entries.reduce((sum, e) => sum + Number(e.tutorEarnings), 0).toFixed(2)}
                                  </TableCell>
                                  <TableCell></TableCell>
                                  {(timesheet.status === "draft" || timesheet.status === "rejected") && <TableCell></TableCell>}
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        )}
                        
                        {(timesheet.status === "draft" || timesheet.status === "rejected") && (
                          <p className="text-sm text-muted-foreground">
                            You can log additional sessions for this week using the form below. Select a date within this week's range.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              {filteredTimesheets.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No past timesheets yet</p>
              )}
              {hasMore && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAllTimesheetHistory(!showAllTimesheetHistory)}
                  data-testid="button-show-more-timesheets"
                >
                  {showAllTimesheetHistory ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show {filteredTimesheets.length - 2} More
                    </>
                  )}
                </Button>
              )}
            </div>
          );
          })()}
        </CardContent>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Timesheet Entry Form */}
        <Card data-testid="card-log-session">
          <CardHeader 
            className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('logSession')}
          >
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center">
                <PlusCircle className="w-5 h-5 text-primary mr-2" />
                Log Teaching Session
              </div>
              {sectionsCollapsed.logSession ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          {!sectionsCollapsed.logSession && <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Session Type Selector - Staff only see "Other" option */}
                <div className="space-y-2">
                  <Label>Session Type</Label>
                  {isStaffOnly ? (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">Work Entry</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        As additional staff, you can log non-tutoring work hours.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant={sessionType === "individual" ? "default" : "outline"}
                        className="flex-1 min-w-[100px]"
                        onClick={() => {
                          setSessionType("individual");
                          setSelectedGroupId("");
                          setSelectedGroupStudentIds([]);
                          setSelectedWorkTypeId("");
                          setWeekPeriodStart(null);
                          setOtherNotes("");
                        }}
                        data-testid="button-session-type-individual"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        1-to-1
                      </Button>
                      <Button
                        type="button"
                        variant={sessionType === "group" ? "default" : "outline"}
                        className="flex-1 min-w-[100px]"
                        onClick={() => {
                          setSessionType("group");
                          setSelectedWorkTypeId("");
                          setWeekPeriodStart(null);
                          setOtherNotes("");
                        }}
                        data-testid="button-session-type-group"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Group
                      </Button>
                      <Button
                        type="button"
                        variant={sessionType === "other" ? "default" : "outline"}
                        className="flex-1 min-w-[100px]"
                        onClick={() => {
                          setSessionType("other");
                          setSelectedGroupId("");
                          setSelectedGroupStudentIds([]);
                          form.setValue("studentId", "");
                        }}
                        data-testid="button-session-type-other"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Other
                      </Button>
                    </div>
                  )}
                  {!isStaffOnly && sessionType === "group" && myGroups.length === 0 && (
                    <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">No groups available. Please ask your admin to create groups and assign you as the tutor.</p>
                  )}
                  {sessionType === "other" && workTypes.length === 0 && (
                    <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">No work types configured. Please ask your admin to set them up in the Work Types Manager.</p>
                  )}
                </div>

                {/* Individual Session: Student Selection */}
                {sessionType === "individual" && (
                  <>
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-student">
                                <SelectValue placeholder="Select a student..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {studentsLoading ? (
                                <div className="p-2">Loading students...</div>
                              ) : (
                                students.map((student) => (
                                  <SelectItem
                                    key={student.id}
                                    value={student.id}
                                    data-testid={`option-student-${student.id}`}
                                  >
                                    {student.name} - {student.subject} ({student.sessionsRemaining} sessions left)
                                    {student.sessionsRemaining <= 5 && student.sessionsRemaining > 0 && (
                                      <AlertTriangle className="w-4 h-4 text-destructive inline ml-2" />
                                    )}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Link to Calendar Session (optional) - Hidden for staff */}
                    {!isStaffOnly && sessionsNeedingAction.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Link to Calendar Session (optional)
                        </Label>
                        <Select 
                          value={selectedSessionOccurrenceId} 
                          onValueChange={(value) => {
                            setSelectedSessionOccurrenceId(value);
                            // Auto-fill student and date from the selected session
                            const session = sessionsNeedingAction.find(s => s.id === value);
                            if (session) {
                              if (session.studentId) {
                                form.setValue("studentId", session.studentId);
                              }
                              form.setValue("date", format(new Date(session.startDateTime), "yyyy-MM-dd"));
                              // Calculate duration from session
                              const start = new Date(session.startDateTime);
                              const end = new Date(session.endDateTime);
                              const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                              form.setValue("duration", Math.round(durationHours * 4) / 4); // Round to nearest 15 min
                            }
                          }}
                        >
                          <SelectTrigger data-testid="select-calendar-session">
                            <SelectValue placeholder="Select a calendar session to mark as completed..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (log without linking)</SelectItem>
                            {sessionsNeedingAction.map((session) => (
                              <SelectItem
                                key={session.id}
                                value={session.id}
                                data-testid={`option-session-${session.id}`}
                              >
                                {session.student?.name || "Unknown"} - {format(new Date(session.startDateTime), "EEE, MMM d 'at' h:mm a")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Linking will mark the calendar session as completed and clear the notification.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Group Session: Group Selection and Student Checkboxes */}
                {sessionType === "group" && (
                  <>
                    <div className="space-y-2">
                      <Label>Select Group</Label>
                      <Select value={selectedGroupId} onValueChange={handleGroupSelect}>
                        <SelectTrigger data-testid="select-group">
                          <SelectValue placeholder="Select a group..." />
                        </SelectTrigger>
                        <SelectContent>
                          {groupsLoading ? (
                            <div className="p-2">Loading groups...</div>
                          ) : (
                            myGroups.map((group) => (
                              <SelectItem
                                key={group.id}
                                value={group.id}
                                data-testid={`option-group-${group.id}`}
                              >
                                {group.name} ({group.members.length} students)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedGroupId && (
                      <div className="space-y-2">
                        <Label>Student Attendance</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Mark each student as Present or Absent. All students are charged by default. Admin can toggle off billing for absent students during review.
                        </p>
                        <div className="border rounded-md p-3 max-h-64 overflow-y-auto space-y-3">
                          {(() => {
                            const selectedGroup = myGroups.find(g => g.id === selectedGroupId);
                            if (!selectedGroup) return null;
                            return selectedGroup.members.map(member => {
                              const student = students.find(s => s.id === member.studentId);
                              const attendance = groupAttendance[member.studentId] || { present: true, chargeType: 'charge' };
                              return (
                                <div key={member.studentId} className="border rounded-lg p-3 bg-muted/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-sm">
                                        {student?.name || member.student?.name || "Unknown"}
                                      </span>
                                      {student && (
                                        <span className="text-xs text-muted-foreground">
                                          ({student.sessionsRemaining} sessions left)
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Label className="text-xs text-muted-foreground">Attendance:</Label>
                                      <Select
                                        value={attendance.present ? 'present' : 'absent'}
                                        onValueChange={(val: 'present' | 'absent') => {
                                          setGroupAttendance(prev => ({
                                            ...prev,
                                            [member.studentId]: {
                                              ...prev[member.studentId],
                                              present: val === 'present',
                                              chargeType: 'charge', // All students charged by default, admin can toggle off for absent
                                            },
                                          }));
                                        }}
                                      >
                                        <SelectTrigger className="h-8 w-28" data-testid={`select-attendance-${member.studentId}`}>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="present">
                                            <span className="flex items-center">
                                              <Check className="w-3 h-3 mr-1 text-green-600" />
                                              Present
                                            </span>
                                          </SelectItem>
                                          <SelectItem value="absent">
                                            <span className="flex items-center">
                                              <XCircle className="w-3 h-3 mr-1 text-orange-600" />
                                              Absent
                                            </span>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                                                          </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span>
                            {Object.values(groupAttendance).filter(a => a.present).length} present, {Object.values(groupAttendance).filter(a => !a.present).length} absent
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Other Session Type: Work type, week period, and notes */}
                {sessionType === "other" && (
                  <>
                    <div className="space-y-2">
                      <Label>Work Type <span className="text-destructive">*</span></Label>
                      <Select value={selectedWorkTypeId} onValueChange={setSelectedWorkTypeId}>
                        <SelectTrigger data-testid="select-work-type">
                          <SelectValue placeholder="Select work type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {workTypes.map((workType) => (
                            <SelectItem
                              key={workType.id}
                              value={workType.id}
                              data-testid={`option-work-type-${workType.id}`}
                            >
                              {workType.name}
                              {workType.paymentType === "flat_fee" && (
                                <span className="text-purple-600 ml-2">(£{parseFloat(workType.flatFeeAmount || "0").toFixed(2)} flat fee)</span>
                              )}
                              {workType.description && (
                                <span className="text-muted-foreground ml-2">- {workType.description}</span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedWorkTypeId && (() => {
                        const selectedWorkType = workTypes.find(wt => wt.id === selectedWorkTypeId);
                        if (selectedWorkType?.paymentType === "flat_fee") {
                          return (
                            <p className="text-sm text-purple-600 bg-purple-50 p-2 rounded">
                              This work type pays a flat fee of £{parseFloat(selectedWorkType.flatFeeAmount || "0").toFixed(2)} per submission. Hours are still recorded for tracking purposes.
                            </p>
                          );
                        } else if (user?.staffHourlyRate) {
                          return (
                            <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                              This work type is paid at your hourly rate of £{parseFloat(user.staffHourlyRate).toFixed(2)}/hour.
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <div className="space-y-2">
                      <Label>Week Period <span className="text-destructive">*</span></Label>
                      <p className="text-xs text-muted-foreground">Select the Monday of the week you performed this work</p>
                      <Select
                        value={weekPeriodStart ? format(weekPeriodStart, "yyyy-MM-dd") : ""}
                        onValueChange={(value) => setWeekPeriodStart(value ? new Date(value) : null)}
                      >
                        <SelectTrigger data-testid="select-week-period">
                          <SelectValue placeholder="Select week..." />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Generate last 8 weeks of Mondays */}
                          {(() => {
                            const weeks = [];
                            const today = new Date();
                            const dayOfWeek = today.getDay();
                            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                            const currentMonday = new Date(today);
                            currentMonday.setDate(today.getDate() + mondayOffset);
                            currentMonday.setHours(0, 0, 0, 0);
                            
                            for (let i = 0; i < 8; i++) {
                              const monday = new Date(currentMonday);
                              monday.setDate(currentMonday.getDate() - (i * 7));
                              const sunday = new Date(monday);
                              sunday.setDate(monday.getDate() + 6);
                              weeks.push({
                                value: format(monday, "yyyy-MM-dd"),
                                label: `${format(monday, "MMM dd")} - ${format(sunday, "MMM dd, yyyy")}`,
                                monday
                              });
                            }
                            return weeks.map(week => (
                              <SelectItem key={week.value} value={week.value}>
                                {week.label}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherNotes">Work Description / Notes <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="otherNotes"
                        value={otherNotes}
                        onChange={(e) => setOtherNotes(e.target.value)}
                        placeholder="Describe the work you performed during this week..."
                        className="min-h-[100px]"
                        data-testid="textarea-other-notes"
                      />
                      {!otherNotes.trim() && (
                        <p className="text-xs text-destructive">Notes are required for "Other" work type</p>
                      )}
                    </div>
                  </>
                )}

                {/* Date field - only show for individual and group sessions */}
                {sessionType !== "other" && (
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Taught</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{sessionType === "other" ? "Hours Worked" : "Duration (hours)"} <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          min="0.25"
                          max="8"
                          {...field}
                          data-testid="input-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes field - only show for individual and group sessions */}
                {sessionType !== "other" && (
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes, homework assigned..."
                            className="h-20"
                            {...field}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Subject and Topics Covered Selection (Required) - only show for individual and group sessions */}
                {sessionType !== "other" && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Subject & Topics Covered <span className="text-destructive">*</span>
                  </Label>
                  
                  {/* Subject Dropdown */}
                  <Select
                    value={selectedSubject}
                    onValueChange={(value) => {
                      setSelectedSubject(value);
                      setSelectedTopicIds([]);
                      setExpandedTopicParents([]);
                      setOtherTopicsText("");
                    }}
                  >
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maths">Maths</SelectItem>
                      <SelectItem value="Verbal Reasoning">Verbal Reasoning</SelectItem>
                      <SelectItem value="Non Verbal Reasoning">Non Verbal Reasoning</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Topics Selection - only show for Maths which has topics */}
                  {selectedSubject === "Maths" && (
                    <>
                      {curriculumTopicsLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Loading topics...
                        </div>
                      ) : curriculumTopics.filter(t => t.subject === selectedSubject).length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground border rounded-md">
                          No curriculum topics available for {selectedSubject}
                        </div>
                      ) : (
                        <div className="border rounded-md p-3 max-h-64 overflow-y-auto" data-testid="topics-selection">
                          {curriculumTopics
                            .filter(topic => topic.subject === selectedSubject)
                            .map((topic) => (
                            <div key={topic.id} className="mb-2">
                              {/* Main topic with expand/collapse */}
                              <div className="flex items-center gap-2 py-1">
                                {topic.subtopics && topic.subtopics.length > 0 ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-6 w-6"
                                    onClick={() => {
                                      setExpandedTopicParents(prev =>
                                        prev.includes(topic.id)
                                          ? prev.filter(id => id !== topic.id)
                                          : [...prev, topic.id]
                                      );
                                    }}
                                    data-testid={`button-expand-topic-${topic.id}`}
                                  >
                                    {expandedTopicParents.includes(topic.id) ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </Button>
                                ) : (
                                  <div className="w-6" />
                                )}
                                <Checkbox
                                  id={`topic-${topic.id}`}
                                  checked={selectedTopicIds.includes(topic.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTopicIds(prev => [...prev, topic.id]);
                                    } else {
                                      setSelectedTopicIds(prev => prev.filter(id => id !== topic.id));
                                    }
                                  }}
                                  data-testid={`checkbox-topic-${topic.id}`}
                                />
                                <label
                                  htmlFor={`topic-${topic.id}`}
                                  className="text-sm font-medium cursor-pointer flex-1"
                                >
                                  {topic.name}
                                </label>
                              </div>
                              
                              {/* Subtopics (collapsed by default) */}
                              {topic.subtopics && topic.subtopics.length > 0 && expandedTopicParents.includes(topic.id) && (
                                <div className="ml-8 border-l-2 border-muted pl-3 mt-1">
                                  {topic.subtopics.map((subtopic) => (
                                    <div key={subtopic.id} className="flex items-center gap-2 py-1">
                                      <Checkbox
                                        id={`topic-${subtopic.id}`}
                                        checked={selectedTopicIds.includes(subtopic.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedTopicIds(prev => [...prev, subtopic.id]);
                                          } else {
                                            setSelectedTopicIds(prev => prev.filter(id => id !== subtopic.id));
                                          }
                                        }}
                                        data-testid={`checkbox-topic-${subtopic.id}`}
                                      />
                                      <label
                                        htmlFor={`topic-${subtopic.id}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        {subtopic.name}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedTopicIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {selectedTopicIds.length} topic{selectedTopicIds.length !== 1 ? 's' : ''} selected
                        </p>
                      )}
                      {selectedTopicIds.length === 0 && (
                        <p className="text-xs text-destructive">
                          Please select at least one topic covered in this session
                        </p>
                      )}
                    </>
                  )}

                  {/* Other - Free text input */}
                  {selectedSubject === "Other" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe the topics covered in this session..."
                        className="h-24"
                        value={otherTopicsText}
                        onChange={(e) => setOtherTopicsText(e.target.value)}
                        data-testid="textarea-other-topics"
                      />
                      {otherTopicsText.trim().length === 0 && (
                        <p className="text-xs text-destructive">
                          Please describe what topics were covered in this session
                        </p>
                      )}
                    </div>
                  )}

                  {!selectedSubject && (
                    <p className="text-xs text-destructive">
                      Please select a subject first
                    </p>
                  )}
                </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={
                    createTimesheetMutation.isPending || 
                    createGroupTimesheetMutation.isPending ||
                    (sessionType === "individual" && !form.getValues("studentId")) ||
                    (sessionType === "group" && selectedGroupStudentIds.length === 0) ||
                    (sessionType === "other" && (!selectedWorkTypeId || !weekPeriodStart || !otherNotes.trim())) ||
                    (sessionType !== "other" && !selectedSubject) ||
                    (sessionType !== "other" && selectedSubject === "Maths" && selectedTopicIds.length === 0) ||
                    (sessionType !== "other" && selectedSubject === "Other" && otherTopicsText.trim().length === 0)
                  }
                  data-testid="button-submit-session"
                >
                  {(createTimesheetMutation.isPending || createGroupTimesheetMutation.isPending) ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Logging...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {sessionType === "group" 
                        ? `Log Group Session (${selectedGroupStudentIds.length} students)` 
                        : sessionType === "other"
                        ? "Log Other Work"
                        : "Log Session"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>}
        </Card>

        {/* Recent Sessions - Hidden for staff */}
        {!isStaffOnly && (
          <Card data-testid="card-recent-sessions">
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection('recentSessions')}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <History className="w-5 h-5 text-primary mr-2" />
                  My Recent Sessions
                </span>
                {sectionsCollapsed.recentSessions ? (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {!sectionsCollapsed.recentSessions && <CardContent>
              {allTimesheetsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No sessions logged yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      isExpanded={expandedSessionId === session.id}
                      onToggle={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>}
          </Card>
        )}
      </div>

      {/* Weekly Summary */}
      <Card data-testid="card-weekly-summary">
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('weeklySummary')}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="w-5 h-5 text-primary mr-2" />
              Weekly Summary
            </span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Select
                value={format(selectedWeek, "yyyy-MM-dd")}
                onValueChange={(value) => setSelectedWeek(new Date(value))}
              >
                <SelectTrigger className="w-full sm:w-auto" data-testid="select-week">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={format(new Date(), "yyyy-MM-dd")}>
                    Current Week ({format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM dd")} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), "MMM dd, yyyy")})
                  </SelectItem>
                  {tutorWeeks.map((week) => {
                    const weekStartDate = new Date(week.weekStart);
                    const weekEndDate = new Date(week.weekEnd);
                    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
                    if (weekStartDate.toDateString() === currentWeekStart.toDateString()) {
                      return null;
                    }
                    return (
                      <SelectItem 
                        key={week.weekStart} 
                        value={format(weekStartDate, "yyyy-MM-dd")}
                      >
                        {format(weekStartDate, "MMM dd")} - {format(weekEndDate, "MMM dd, yyyy")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {sectionsCollapsed.weeklySummary ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {!sectionsCollapsed.weeklySummary && <CardContent>
          <div className="overflow-x-auto mobile-scroll">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheetsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : timesheetEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No sessions logged for this week
                    </TableCell>
                  </TableRow>
                ) : (
                  timesheetEntries.map((entry) => (
                    <Fragment key={entry.id}>
                      <TableRow 
                        data-testid={`row-timesheet-${entry.id}`}
                        className={`cursor-pointer hover:bg-muted/50 transition-colors ${expandedSessionId === entry.id ? 'bg-muted/50' : ''}`}
                        onClick={() => setExpandedSessionId(expandedSessionId === entry.id ? null : entry.id)}
                      >
                        <TableCell className="flex items-center gap-2">
                          {expandedSessionId === entry.id ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          {format(new Date(entry.date), "MMM dd")}
                        </TableCell>
                        <TableCell>{entry.student.name}</TableCell>
                        <TableCell>{entry.student.subject}</TableCell>
                        <TableCell className="text-right">{entry.duration}h</TableCell>
                        <TableCell className="text-right font-medium">
                          £{parseFloat(entry.tutorEarnings.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              entry.status === "approved"
                                ? "default"
                                : entry.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expandedSessionId === entry.id && (
                        <TableRow key={`${entry.id}-notes`} className="bg-muted/30">
                          <TableCell colSpan={6} className="py-4">
                            <div className="pl-6 space-y-2">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Session Notes</p>
                                  <p className="text-sm mt-1" data-testid={`text-notes-${entry.id}`}>
                                    {entry.notes || <span className="text-muted-foreground italic">No notes recorded for this session</span>}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
              {timesheetEntries.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-semibold">
                      Total Earnings This Week
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary" data-testid="text-total-earnings">
                      £{totalWeeklySessionEarnings.toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>}
      </Card>

      {/* Annual Earnings Widget */}
      <Card data-testid="card-annual-earnings">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('annualEarnings')}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              Annual Earnings
            </span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Select
                value={selectedEarningsYear.toString()}
                onValueChange={(val) => setSelectedEarningsYear(parseInt(val))}
              >
                <SelectTrigger className="w-[120px]" data-testid="select-earnings-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {sectionsCollapsed.annualEarnings ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        {!sectionsCollapsed.annualEarnings && <CardContent>
          {annualEarningsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings ({selectedEarningsYear})</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-annual-earnings-amount">
                    £{annualEarnings?.totalEarnings?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Approved Sessions</p>
                  <p className="text-2xl font-semibold" data-testid="text-annual-sessions-count">
                    {annualEarnings?.approvedSessions || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Earnings are calculated from approved timesheets only
              </p>
            </div>
          )}
        </CardContent>}
      </Card>

      {/* My Students - Topics Access - Hidden for staff */}
      {!isStaffOnly && (
        <Card data-testid="card-my-students">
          <CardHeader 
            className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('myStudents')}
          >
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary mr-2" />
                My Students - Topics
              </div>
              {sectionsCollapsed.myStudents ? (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          {!sectionsCollapsed.myStudents && <CardContent>
            {studentsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No students assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    data-testid={`student-topics-row-${student.id}`}
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.subject}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTopicsDialog(student)}
                      data-testid={`button-view-topics-${student.id}`}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Topics
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>}
        </Card>
      )}

      {/* Parent Messages - Hidden for staff */}
      {!isStaffOnly && <Card data-testid="card-parent-messages">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('messages')}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-primary mr-2" />
              Messages from Parents
              {parentMessages.filter(m => !m.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {parentMessages.filter(m => !m.isRead).length} new
                </Badge>
              )}
            </div>
            {sectionsCollapsed.messages ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        {!sectionsCollapsed.messages && <CardContent>
          {messagesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : parentMessages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No messages from parents yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border ${
                    message.isRead 
                      ? "bg-muted/30 border-border" 
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  }`}
                  data-testid={`message-${message.id}`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedMessageId(expandedMessageId === message.id ? null : message.id)}
                    data-testid={`message-header-${message.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {expandedMessageId === message.id ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {message.student?.name || "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.createdAt ? format(new Date(message.createdAt), "MMM dd, yyyy 'at' h:mm a") : "Unknown date"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {message.replies && message.replies.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {message.replies.length} {message.replies.length === 1 ? "reply" : "replies"}
                          </Badge>
                        )}
                        {!message.isRead && (
                          <Badge variant="secondary" className="text-xs">Unread</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap ml-6">{message.message}</p>
                  </div>
                  
                  {expandedMessageId === message.id && (
                    <div className="border-t px-4 py-3 bg-background/50">
                      {/* Mark as Read button */}
                      {!message.isRead && (
                        <div className="mb-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(message.id);
                            }}
                            disabled={markAsReadMutation.isPending}
                            data-testid={`button-mark-read-${message.id}`}
                          >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            {markAsReadMutation.isPending ? "Marking..." : "Mark as Read"}
                          </Button>
                        </div>
                      )}
                      
                      {expandedMessage?.replies && expandedMessage.replies.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <p className="text-sm font-medium text-muted-foreground">Conversation</p>
                          {expandedMessage.replies.map((reply) => (
                            <div 
                              key={reply.id} 
                              className="ml-6 p-3 bg-primary/5 rounded-lg border-l-2 border-primary"
                              data-testid={`reply-${reply.id}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {reply.repliedByRole}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {reply.createdAt ? format(new Date(reply.createdAt), "MMM dd, yyyy 'at' h:mm a") : ""}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{reply.replyContent}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Write a reply</p>
                        <Textarea
                          placeholder="Type your reply here..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[80px]"
                          data-testid={`reply-textarea-${message.id}`}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (replyContent.trim()) {
                                createReplyMutation.mutate({
                                  messageId: message.id,
                                  replyContent: replyContent.trim(),
                                });
                              }
                            }}
                            disabled={!replyContent.trim() || createReplyMutation.isPending}
                            data-testid={`button-send-reply-${message.id}`}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            {createReplyMutation.isPending ? "Sending..." : "Send Reply"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>}
      </Card>}

      {/* Emergency Contact Section */}
      <Card data-testid="card-emergency-contact">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection('emergencyContact')}
        >
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-primary mr-2" />
              Emergency Contact
            </div>
            {sectionsCollapsed.emergencyContact ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        {!sectionsCollapsed.emergencyContact && <CardContent>
          {emergencyContactLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide your emergency contact details. Admin will be notified when you update this information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-name">Contact Name *</Label>
                  <Input
                    id="emergency-name"
                    value={emergencyContactForm.name}
                    onChange={(e) => setEmergencyContactForm({ ...emergencyContactForm, name: e.target.value })}
                    placeholder="Full name of emergency contact"
                    data-testid="input-emergency-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-relationship">Relationship</Label>
                  <Input
                    id="emergency-relationship"
                    value={emergencyContactForm.relationship}
                    onChange={(e) => setEmergencyContactForm({ ...emergencyContactForm, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Friend"
                    data-testid="input-emergency-relationship"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-phone">Phone Number *</Label>
                  <Input
                    id="emergency-phone"
                    value={emergencyContactForm.phone}
                    onChange={(e) => setEmergencyContactForm({ ...emergencyContactForm, phone: e.target.value })}
                    placeholder="Contact phone number"
                    data-testid="input-emergency-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-email">Email (optional)</Label>
                  <Input
                    id="emergency-email"
                    type="email"
                    value={emergencyContactForm.email}
                    onChange={(e) => setEmergencyContactForm({ ...emergencyContactForm, email: e.target.value })}
                    placeholder="Contact email address"
                    data-testid="input-emergency-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-notes">Additional Notes</Label>
                <Textarea
                  id="emergency-notes"
                  value={emergencyContactForm.notes}
                  onChange={(e) => setEmergencyContactForm({ ...emergencyContactForm, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={2}
                  data-testid="input-emergency-notes"
                />
              </div>
              
              {emergencyContact?.lastUpdatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {format(new Date(emergencyContact.lastUpdatedAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              )}
              
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (emergencyContactForm.name && emergencyContactForm.phone) {
                      updateEmergencyContactMutation.mutate(emergencyContactForm);
                    } else {
                      toast({
                        title: "Missing Information",
                        description: "Please provide at least a name and phone number.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={updateEmergencyContactMutation.isPending}
                  data-testid="button-save-emergency-contact"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateEmergencyContactMutation.isPending ? "Saving..." : "Save Emergency Contact"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>}
      </Card>

      {/* Documents Section */}
      <TutorDocuments />

      {/* Mock Exam Results Section - Hidden for staff */}
      {!isStaffOnly && <TutorMockExamResults />}

      {/* Topics Dialog */}
      <Dialog open={isTopicsDialogOpen} onOpenChange={setIsTopicsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Topics for {selectedStudentForTopics?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {topicsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : studentTopics.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No topics have been added for this student yet.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Check off topics as you cover them with the student.
                </p>
                {studentTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-lg ${
                      topic.isCovered ? "bg-green-50 dark:bg-green-900/20" : "bg-muted/30"
                    }`}
                    data-testid={`topic-checkbox-item-${topic.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`topic-${topic.id}`}
                        checked={topic.isCovered}
                        onCheckedChange={(checked) => {
                          markTopicCoveredMutation.mutate({
                            topicId: topic.id,
                            isCovered: !!checked,
                            coveredAt: checked ? new Date().toISOString() : undefined,
                          });
                        }}
                        data-testid={`checkbox-topic-${topic.id}`}
                      />
                      <label
                        htmlFor={`topic-${topic.id}`}
                        className={`flex-1 cursor-pointer ${topic.isCovered ? "line-through text-muted-foreground" : ""}`}
                      >
                        <span className="text-muted-foreground text-sm mr-2">{index + 1}.</span>
                        {topic.title}
                      </label>
                    </div>
                    {topic.isCovered && (
                      <div className="flex items-center gap-2 mt-2 ml-7">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Completed:</span>
                        <Input
                          type="date"
                          value={topic.coveredAt ? format(new Date(topic.coveredAt), "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              markTopicCoveredMutation.mutate({
                                topicId: topic.id,
                                isCovered: true,
                                coveredAt: new Date(e.target.value).toISOString(),
                              });
                            }
                          }}
                          className="h-7 w-36 text-xs"
                          data-testid={`input-topic-date-${topic.id}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-3 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Progress: {studentTopics.filter(t => t.isCovered).length} / {studentTopics.length} topics covered
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditEntryDialogOpen} onOpenChange={setIsEditEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={editEntryForm.date}
                onChange={(e) => setEditEntryForm({ ...editEntryForm, date: e.target.value })}
                data-testid="input-edit-entry-date"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (hours)</label>
              <Select
                value={String(editEntryForm.duration)}
                onValueChange={(value) => setEditEntryForm({ ...editEntryForm, duration: Number(value) })}
              >
                <SelectTrigger data-testid="select-edit-entry-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">15 minutes</SelectItem>
                  <SelectItem value="0.5">30 minutes</SelectItem>
                  <SelectItem value="0.75">45 minutes</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="1.25">1 hour 15 minutes</SelectItem>
                  <SelectItem value="1.5">1 hour 30 minutes</SelectItem>
                  <SelectItem value="1.75">1 hour 45 minutes</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="2.5">2 hours 30 minutes</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editEntryForm.notes}
                onChange={(e) => setEditEntryForm({ ...editEntryForm, notes: e.target.value })}
                placeholder="Session notes..."
                rows={3}
                data-testid="input-edit-entry-notes"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditEntryDialogOpen(false);
                  setEditingEntry(null);
                }}
                data-testid="button-cancel-edit-entry"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingEntry) {
                    updateEntryMutation.mutate({
                      id: editingEntry.id,
                      date: editEntryForm.date,
                      duration: editEntryForm.duration,
                      notes: editEntryForm.notes,
                    });
                  }
                }}
                disabled={updateEntryMutation.isPending}
                data-testid="button-save-edit-entry"
              >
                {updateEntryMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Details Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="max-w-md" data-testid="notification-details-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              Notification Details
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">
                  {selectedNotification.payload?.title || "Notification"}
                </h4>
                <p className="text-muted-foreground">
                  {selectedNotification.payload?.message || "No additional details available."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Received: {format(new Date(selectedNotification.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              {/* Notification Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {selectedNotification.type.replace(/_/g, ' ')}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {selectedNotification.payload?.relatedType === "session_occurrence" && selectedNotification.payload?.relatedId && (
                  <Button
                    onClick={() => {
                      // Find the session occurrence to get its date
                      const sessionId = selectedNotification.payload?.relatedId;
                      const session = sessionOccurrences.find(s => s.id === sessionId);
                      if (session) {
                        setCalendarInitialDate(new Date(session.startDateTime));
                      }
                      setIsNotificationModalOpen(false);
                      markNotificationReadMutation.mutate(selectedNotification.id);
                      setShowCalendar(true);
                    }}
                    className="w-full"
                    data-testid="btn-view-session-calendar"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View in Calendar
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    markNotificationReadMutation.mutate(selectedNotification.id);
                    setIsNotificationModalOpen(false);
                  }}
                  className="w-full"
                  data-testid="btn-dismiss-close-notification"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Read & Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Request Details Modal */}
      <Dialog open={isChangeRequestModalOpen} onOpenChange={setIsChangeRequestModalOpen}>
        <DialogContent className="max-w-md" data-testid="change-request-details-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Session Change Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedChangeRequest && (
            <div className="space-y-4">
              {/* Student & Session Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Student:</span>
                  <span>{selectedChangeRequest.sessionOccurrence?.student?.name || "Unknown Student"}</span>
                </div>
                {/* Original Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Original Date:</span>
                  <span className="text-red-600 dark:text-red-400">
                    {selectedChangeRequest.originalDate && 
                      format(new Date(selectedChangeRequest.originalDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {/* Proposed New Date (for reschedule) */}
                {selectedChangeRequest.requestType === "reschedule" && selectedChangeRequest.proposedStartDateTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Proposed New Date:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {format(new Date(selectedChangeRequest.proposedStartDateTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      {selectedChangeRequest.proposedEndDateTime && (
                        <> - {format(new Date(selectedChangeRequest.proposedEndDateTime), "h:mm a")}</>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Request Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Request Type:</span>
                <Badge className={selectedChangeRequest.requestType === "cancel" ? "bg-red-100 text-red-700 border-red-300" : "bg-blue-100 text-blue-700 border-blue-300"}>
                  {selectedChangeRequest.requestType === "cancel" ? <CalendarX className="h-3 w-3 mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                  {selectedChangeRequest.requestType === "cancel" ? "Cancellation" : "Reschedule"}
                </Badge>
              </div>

              {/* Parent Info */}
              <div className="space-y-1">
                <span className="text-sm font-medium">Requested By:</span>
                <p className="text-muted-foreground">
                  {selectedChangeRequest.parent?.firstName} {selectedChangeRequest.parent?.lastName}
                </p>
              </div>

              {/* Proposed Date/Message (for reschedule) */}
              {selectedChangeRequest.proposedDateMessage && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Proposed Alternative:</span>
                  <p className="text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                    {selectedChangeRequest.proposedDateMessage}
                  </p>
                </div>
              )}

              {/* Reason */}
              {selectedChangeRequest.reason && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Reason:</span>
                  <p className="text-muted-foreground bg-gray-50 dark:bg-gray-900/30 p-2 rounded">
                    {selectedChangeRequest.reason}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="outline" className="capitalize">
                  {selectedChangeRequest.status}
                </Badge>
              </div>

              {/* Submitted Date */}
              <p className="text-sm text-muted-foreground">
                Submitted: {format(new Date(selectedChangeRequest.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    // Navigate to the week of the session
                    if (selectedChangeRequest.sessionOccurrence?.startDateTime) {
                      setCalendarInitialDate(new Date(selectedChangeRequest.sessionOccurrence.startDateTime));
                    }
                    setIsChangeRequestModalOpen(false);
                    setShowCalendar(true);
                  }}
                  className="w-full"
                  data-testid="btn-view-change-request-calendar"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View in Calendar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangeRequestModalOpen(false);
                  }}
                  className="w-full"
                  data-testid="btn-close-change-request"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
