import { useState, useEffect, Fragment, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  GraduationCap,
  Users,
  User as UserIcon,
  AlertTriangle,
  DollarSign,
  ClipboardList,
  File,
  Plus,
  Check,
  X,
  Edit,
  PlusCircle,
  Save,
  Download,
  HandHeart,
  PieChart,
  Calendar,
  FileText,
  Archive,
  RotateCcw,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  UserPlus,
  Phone,
  Mail,
  History,
  Trash2,
  MessageSquare,
  Reply,
  Link2,
  Link2Off,
  Percent,
  Bell,
  BarChart3,
  Receipt,
  Clock,
  Flag,
  RefreshCw,
  CalendarX,
  CheckCircle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
} from "lucide-react";
import type { User, StudentWithTutor, TimesheetEntryWithRelations, WeeklyTimesheetWithRelations, ArchivedStudentSummary, ArchivedTutorSummary, WaitlistEntry, InsertWaitlistEntry, ParentMessageWithRelations, StudentTopic, ParentMessageReplyWithRelations, RateConfiguration, TutorRate, ParentRate, RateLink, Invoice, TutorInvoice, InvoiceWithRelations, AdhocInvoice, StudentGroupWithMembers, Notification, EmergencyContact, TutorAvailabilitySlot, AllocationWithRelations, TutorProfitSummary, Product, CurriculumTopic, WorkType, RecurringSessionTemplate } from "@shared/schema";
import { insertWaitlistSchema } from "@shared/schema";
import { BookOpen, Package, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { AdminCalendar } from "./admin-calendar";
import { AdminInventory } from "./admin-inventory";
import { AdminMockExams } from "./admin-mock-exams";
import AdminDocuments from "./admin-documents";
import AdminAuditLog from "./admin-audit-log";
import { FolderOpen } from "lucide-react";

// Subject options for multi-select
const SUBJECT_OPTIONS = [
  "11+ Maths",
  "Verbal Reasoning",
  "Non-Verbal Reasoning",
  "11+ English",
  "GCSE Maths",
  "GCSE English",
];

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentName: z.string().optional(),
  parentSurname: z.string().optional(),
  parentEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  parentPhone: z.string().optional(),
  parentUserId: z.string().optional(),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  examType: z.string().optional(),
  classType: z.enum(["individual", "group"]),
  sessionsBooked: z.coerce.number().min(0, "Sessions booked must be 0 or more"),
  sessionsRemaining: z.coerce.number().min(0, "Sessions remaining must be 0 or more"),
  parentRate: z.coerce.number().min(0, "Parent rate must be positive"),
  autoInvoiceEnabled: z.boolean().optional(),
  defaultSessionPack: z.coerce.number().min(1).max(50).optional(),
  startYear: z.coerce.number().optional(),
  examMonth: z.coerce.number().min(1).max(12).optional(),
  examYear: z.coerce.number().optional(),
  examBoard: z.string().optional(),
  targetSchools: z.string().optional(),
  primarySchool: z.string().optional(),
  sessionDayOfWeek: z.coerce.number().min(0).max(6).optional(),
  sessionStartTime: z.string().optional(),
  sessionDurationMinutes: z.coerce.number().min(15).max(240).optional(),
});

const dayOfWeekOptions = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const tutorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "tutor", "additional_staff"]).default("tutor"),
  phone: z.string().optional(),
  description: z.string().optional(),
  startYear: z.coerce.number().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

const parentAccountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ParentAccountFormData = z.infer<typeof parentAccountSchema>;


const rateConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  classType: z.enum(["individual", "group"]),
  subject: z.string().optional(),
  rateType: z.enum(["tutor", "parent", "combined"]).optional(),
  tutorRate: z.coerce.number().min(0, "Rate must be positive"),
  parentRate: z.coerce.number().min(0, "Rate must be positive"),
  linkedRateId: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;
type TutorFormData = z.infer<typeof tutorSchema>;
type WaitlistFormData = z.infer<typeof insertWaitlistSchema>;
type RateConfigFormData = z.infer<typeof rateConfigSchema>;

// Helper to group timesheet entries - group sessions shown together, individual sessions shown separately
interface GroupedEntry {
  type: 'individual' | 'group';
  id: string; // For individual: entry id, for group: groupSessionId
  date: Date;
  entries: TimesheetEntryWithRelations[];
  totalDuration: number;
  totalTutorEarnings: number;
  totalParentBilling: number;
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
        existing.totalTutorEarnings += parseFloat(entry.tutorEarnings.toString());
        existing.totalParentBilling += parseFloat(entry.parentBilling.toString());
      } else {
        groups.set(entry.groupSessionId, {
          type: 'group',
          id: entry.groupSessionId,
          date: new Date(entry.date),
          entries: [entry],
          totalDuration: Number(entry.duration),
          totalTutorEarnings: parseFloat(entry.tutorEarnings.toString()),
          totalParentBilling: parseFloat(entry.parentBilling.toString()),
        });
      }
    } else {
      individuals.push({
        type: 'individual',
        id: entry.id,
        date: new Date(entry.date),
        entries: [entry],
        totalDuration: Number(entry.duration),
        totalTutorEarnings: parseFloat(entry.tutorEarnings.toString()),
        totalParentBilling: parseFloat(entry.parentBilling.toString()),
      });
    }
  }

  // Combine and sort by date
  return [...individuals, ...Array.from(groups.values())]
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

interface AdminDashboardProps {
  user: User;
}

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

function StatusHistorySection({ 
  timesheetId, 
  isExpanded, 
  onToggle 
}: { 
  timesheetId: string; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) {
  const { data: history = [], isLoading } = useQuery<StatusHistoryItem[]>({
    queryKey: ["/api/weekly-timesheets", timesheetId, "history"],
    queryFn: async () => {
      const res = await fetch(`/api/weekly-timesheets/${timesheetId}/history`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch status history");
      return res.json();
    },
    enabled: isExpanded,
    retry: false,
  });

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        onClick={onToggle}
        data-testid={`button-toggle-history-${timesheetId}`}
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <History className="w-4 h-4" />
        Status History
      </Button>
      
      {isExpanded && (
        <div className="mt-2 ml-6 p-3 bg-muted/50 rounded-lg border border-border/50">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status history yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
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
    </div>
  );
}

function CurriculumTopicsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTopic, setEditingTopic] = useState<CurriculumTopic | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddTopicsOpen, setIsAddTopicsOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [bulkTopicsText, setBulkTopicsText] = useState("");
  const [selectedSubjectForTopics, setSelectedSubjectForTopics] = useState("");
  const [editTopicName, setEditTopicName] = useState("");
  const [editTopicSubject, setEditTopicSubject] = useState("");
  const [editTopicSortOrder, setEditTopicSortOrder] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [addingTopicsCount, setAddingTopicsCount] = useState(0);

  const { data: topics = [], isLoading } = useQuery<CurriculumTopic[]>({
    queryKey: ["/api/curriculum-topics"],
  });

  const createTopicMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string; sortOrder: number }) => {
      return await apiRequest("POST", "/api/curriculum-topics", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum-topics"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create topic", description: error.message, variant: "destructive" });
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; subject: string; sortOrder: number }) => {
      return await apiRequest("PATCH", `/api/curriculum-topics/${data.id}`, { name: data.name, subject: data.subject, sortOrder: data.sortOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum-topics"] });
      toast({ title: "Topic updated successfully" });
      setIsEditTopicOpen(false);
      setEditingTopic(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update topic", description: error.message, variant: "destructive" });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/curriculum-topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curriculum-topics"] });
      toast({ title: "Topic deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete topic", description: error.message, variant: "destructive" });
    },
  });

  const subjects = [...new Set(topics.map(t => t.subject))].sort();
  const filteredTopics = subjectFilter === "all" ? topics : topics.filter(t => t.subject === subjectFilter);
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const subject = topic.subject;
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(topic);
    return acc;
  }, {} as Record<string, CurriculumTopic[]>);

  Object.keys(groupedTopics).forEach(subject => {
    groupedTopics[subject].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  });

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    const subjectNames = newSubjectName.split("\n").map(s => s.trim()).filter(s => s.length > 0);
    let successCount = 0;
    for (const name of subjectNames) {
      try {
        await createTopicMutation.mutateAsync({ name: `${name} - General`, subject: name, sortOrder: 0 });
        successCount++;
      } catch (e) {
        // Error already handled in mutation
      }
    }
    if (successCount > 0) {
      toast({ title: `${successCount} subject(s) created successfully` });
      setNewSubjectName("");
      setIsAddSubjectOpen(false);
    }
  };

  const handleAddTopicsToSubject = async () => {
    if (!bulkTopicsText.trim() || !selectedSubjectForTopics) return;
    const topicNames = bulkTopicsText.split("\n").map(t => t.trim()).filter(t => t.length > 0);
    const existingTopicsInSubject = topics.filter(t => t.subject === selectedSubjectForTopics);
    const maxSortOrder = Math.max(0, ...existingTopicsInSubject.map(t => t.sortOrder || 0));
    
    setAddingTopicsCount(topicNames.length);
    let successCount = 0;
    for (let i = 0; i < topicNames.length; i++) {
      try {
        await createTopicMutation.mutateAsync({ 
          name: topicNames[i], 
          subject: selectedSubjectForTopics, 
          sortOrder: maxSortOrder + i + 1 
        });
        successCount++;
      } catch (e) {
        // Error already handled in mutation
      }
    }
    setAddingTopicsCount(0);
    if (successCount > 0) {
      toast({ title: `${successCount} topic(s) added to ${selectedSubjectForTopics}` });
      setBulkTopicsText("");
      setIsAddTopicsOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Curriculum Topics</h2>
          <p className="text-muted-foreground">Manage subjects and topics that tutors can select when logging sessions</p>
        </div>
        <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-subject">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject(s)</DialogTitle>
              <DialogDescription>Create new subject categories. Enter one subject per line to add multiple at once.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Name(s)</Label>
                <Textarea
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Enter subject names, one per line:&#10;GCSE Chemistry&#10;A-Level Physics&#10;KS3 Biology"
                  className="min-h-[120px]"
                  data-testid="input-new-subjects"
                />
                <p className="text-xs text-muted-foreground">
                  Each subject will be created with a default "General" topic. You can add more topics to each subject afterwards.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSubjectOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim() || createTopicMutation.isPending}
                data-testid="button-submit-subjects"
              >
                {createTopicMutation.isPending ? "Creating..." : "Create Subject(s)"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Label>Filter by Subject:</Label>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-48" data-testid="select-subject-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredTopics.length} topics</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Subjects Yet</h3>
            <p className="text-muted-foreground mb-4">Add subject categories first, then add topics to each subject</p>
            <Button onClick={() => setIsAddSubjectOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTopics).sort(([a], [b]) => a.localeCompare(b)).map(([subject, subjectTopics]) => (
            <Card key={subject}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {subject}
                    <Badge variant="secondary" className="ml-2">{subjectTopics.length} topics</Badge>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSubjectForTopics(subject);
                      setBulkTopicsText("");
                      setIsAddTopicsOpen(true);
                    }}
                    data-testid={`button-add-topics-${subject}`}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Topics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {subjectTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      data-testid={`topic-item-${topic.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">{topic.sortOrder || 0}</Badge>
                        <span className="font-medium">{topic.name}</span>
                        {!topic.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTopic(topic);
                            setEditTopicName(topic.name);
                            setEditTopicSubject(topic.subject);
                            setEditTopicSortOrder(topic.sortOrder || 0);
                            setIsEditTopicOpen(true);
                          }}
                          data-testid={`button-edit-topic-${topic.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-testid={`button-delete-topic-${topic.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{topic.name}"? This action cannot be undone and will remove the topic from all sessions where it was used.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTopicMutation.mutate(topic.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Topics to Subject Dialog */}
      <Dialog open={isAddTopicsOpen} onOpenChange={setIsAddTopicsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Topics to {selectedSubjectForTopics}</DialogTitle>
            <DialogDescription>Enter one topic per line to add multiple topics at once</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topics</Label>
              <Textarea
                value={bulkTopicsText}
                onChange={(e) => setBulkTopicsText(e.target.value)}
                placeholder="Enter topics, one per line:&#10;Fractions&#10;Decimals&#10;Percentages&#10;Ratio"
                className="min-h-[150px]"
                data-testid="input-bulk-topics"
              />
              <p className="text-xs text-muted-foreground">
                {bulkTopicsText.split("\n").filter(t => t.trim()).length} topic(s) will be added
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTopicsOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddTopicsToSubject}
              disabled={!bulkTopicsText.trim() || addingTopicsCount > 0}
              data-testid="button-submit-bulk-topics"
            >
              {addingTopicsCount > 0 ? `Adding ${addingTopicsCount} topics...` : "Add Topics"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog open={isEditTopicOpen} onOpenChange={setIsEditTopicOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>Update the topic details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic Name</Label>
              <Input
                value={editTopicName}
                onChange={(e) => setEditTopicName(e.target.value)}
                data-testid="input-edit-topic-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={editTopicSubject}
                onChange={(e) => setEditTopicSubject(e.target.value)}
                placeholder="Subject name"
                list="edit-subject-suggestions"
                data-testid="input-edit-topic-subject"
              />
              <datalist id="edit-subject-suggestions">
                {subjects.map(subject => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>Sort Order (lower = appears first)</Label>
              <Input
                type="number"
                value={editTopicSortOrder}
                onChange={(e) => setEditTopicSortOrder(parseInt(e.target.value) || 0)}
                data-testid="input-edit-topic-sort-order"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTopicOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (editingTopic) {
                  updateTopicMutation.mutate({
                    id: editingTopic.id,
                    name: editTopicName,
                    subject: editTopicSubject,
                    sortOrder: editTopicSortOrder,
                  });
                }
              }}
              disabled={!editTopicName.trim() || !editTopicSubject.trim() || updateTopicMutation.isPending}
              data-testid="button-save-topic"
            >
              {updateTopicMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkTypesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPaymentType, setNewPaymentType] = useState<"hourly" | "flat_fee">("hourly");
  const [newFlatFeeAmount, setNewFlatFeeAmount] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPaymentType, setEditPaymentType] = useState<"hourly" | "flat_fee">("hourly");
  const [editFlatFeeAmount, setEditFlatFeeAmount] = useState("");

  const { data: workTypes = [], isLoading } = useQuery<WorkType[]>({
    queryKey: ["/api/work-types", { includeInactive: true }],
    queryFn: async () => {
      const res = await fetch("/api/work-types?includeInactive=true");
      if (!res.ok) throw new Error("Failed to fetch work types");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; paymentType: "hourly" | "flat_fee"; flatFeeAmount?: string }) => {
      return await apiRequest("POST", "/api/work-types", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-types"] });
      toast({ title: "Work type created successfully" });
      setNewName("");
      setNewDescription("");
      setNewPaymentType("hourly");
      setNewFlatFeeAmount("");
      setIsAddOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create work type", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; sortOrder: number; isActive: boolean; paymentType: "hourly" | "flat_fee"; flatFeeAmount?: string }) => {
      return await apiRequest("PATCH", `/api/work-types/${data.id}`, { 
        name: data.name, 
        description: data.description, 
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        paymentType: data.paymentType,
        flatFeeAmount: data.paymentType === "flat_fee" ? data.flatFeeAmount : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-types"] });
      toast({ title: "Work type updated successfully" });
      setIsEditOpen(false);
      setEditingWorkType(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update work type", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/work-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-types"] });
      toast({ title: "Work type deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete work type", description: error.message, variant: "destructive" });
    },
  });

  const openEdit = (workType: WorkType) => {
    setEditingWorkType(workType);
    setEditName(workType.name);
    setEditDescription(workType.description || "");
    setEditSortOrder(workType.sortOrder || 0);
    setEditIsActive(workType.isActive);
    setEditPaymentType((workType.paymentType as "hourly" | "flat_fee") || "hourly");
    setEditFlatFeeAmount(workType.flatFeeAmount || "");
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Work Types</h2>
          <p className="text-muted-foreground">Manage work types for "Other" timesheet entries (non-tutoring work)</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Work Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Work Type</DialogTitle>
              <DialogDescription>Create a new work type for staff to select when logging non-tutoring work</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Admin Tasks, Marketing, Training"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of this work type"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select value={newPaymentType} onValueChange={(v) => setNewPaymentType(v as "hourly" | "flat_fee")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly Rate (uses staff hourly rate)</SelectItem>
                    <SelectItem value="flat_fee">Flat Fee (fixed amount per submission)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {newPaymentType === "hourly" 
                    ? "Staff will be paid based on their hourly rate × hours worked" 
                    : "Staff will receive a fixed amount regardless of hours worked (hours still recorded for tracking)"}
                </p>
              </div>
              {newPaymentType === "flat_fee" && (
                <div className="space-y-2">
                  <Label>Flat Fee Amount (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newFlatFeeAmount}
                    onChange={(e) => setNewFlatFeeAmount(e.target.value)}
                    placeholder="e.g., 50.00"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate({ 
                  name: newName, 
                  description: newDescription,
                  paymentType: newPaymentType,
                  flatFeeAmount: newPaymentType === "flat_fee" ? newFlatFeeAmount : undefined
                })}
                disabled={!newName.trim() || createMutation.isPending || (newPaymentType === "flat_fee" && !newFlatFeeAmount)}
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : workTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No work types configured yet. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workTypes
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((workType) => (
                    <TableRow key={workType.id} className={!workType.isActive ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{workType.name}</TableCell>
                      <TableCell className="text-muted-foreground">{workType.description || "-"}</TableCell>
                      <TableCell>
                        {workType.paymentType === "flat_fee" ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Flat £{parseFloat(workType.flatFeeAmount || "0").toFixed(2)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Hourly
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{workType.sortOrder}</TableCell>
                      <TableCell>
                        <Badge variant={workType.isActive ? "default" : "secondary"}>
                          {workType.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(workType)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Work Type</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{workType.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(workType.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Work Type Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Work Type</DialogTitle>
            <DialogDescription>Update the work type details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description of this work type"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select value={editPaymentType} onValueChange={(v) => setEditPaymentType(v as "hourly" | "flat_fee")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly Rate (uses staff hourly rate)</SelectItem>
                  <SelectItem value="flat_fee">Flat Fee (fixed amount per submission)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {editPaymentType === "hourly" 
                  ? "Staff will be paid based on their hourly rate × hours worked" 
                  : "Staff will receive a fixed amount regardless of hours worked (hours still recorded for tracking)"}
              </p>
            </div>
            {editPaymentType === "flat_fee" && (
              <div className="space-y-2">
                <Label>Flat Fee Amount (£)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFlatFeeAmount}
                  onChange={(e) => setEditFlatFeeAmount(e.target.value)}
                  placeholder="e.g., 50.00"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Sort Order (lower = appears first)</Label>
              <Input
                type="number"
                value={editSortOrder}
                onChange={(e) => setEditSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label>Active (visible to staff)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (editingWorkType) {
                  updateMutation.mutate({
                    id: editingWorkType.id,
                    name: editName,
                    description: editDescription,
                    sortOrder: editSortOrder,
                    isActive: editIsActive,
                    paymentType: editPaymentType,
                    flatFeeAmount: editPaymentType === "flat_fee" ? editFlatFeeAmount : undefined,
                  });
                }
              }}
              disabled={!editName.trim() || updateMutation.isPending || (editPaymentType === "flat_fee" && !editFlatFeeAmount)}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTutorOpen, setIsAddTutorOpen] = useState(false);
  const [isAddParentAccountOpen, setIsAddParentAccountOpen] = useState(false);
  const [parentAccountMode, setParentAccountMode] = useState<"none" | "existing" | "new">("none");
  const [selectedParentUserId, setSelectedParentUserId] = useState<string>("");
  const [newParentPassword, setNewParentPassword] = useState("");
  const [sendInitialInvoice, setSendInitialInvoice] = useState(false);
  const [invoiceSendDate, setInvoiceSendDate] = useState<string>("");
  const [recurringInvoiceSendDate, setRecurringInvoiceSendDate] = useState<string>("");
  
  // Multiple session schedules for new student
  const [newStudentSessions, setNewStudentSessions] = useState<Array<{
    dayOfWeek: number | undefined;
    startTime: string;
    durationMinutes: number;
    tutorId?: string;
  }>>([{ dayOfWeek: undefined, startTime: "", durationMinutes: 60, tutorId: undefined }]);
  
  // Multiple session schedules for editing student
  const [editStudentSessions, setEditStudentSessions] = useState<Array<{
    id?: string;
    dayOfWeek: number | undefined;
    startTime: string;
    durationMinutes: number;
    tutorId?: string;
  }>>([]);
  const [editingStudent, setEditingStudent] = useState<StudentWithTutor | null>(null);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState({
    name: "",
    parentName: "",
    parentSurname: "",
    parentEmail: "",
    parentPhone: "",
    subjects: [],
    examType: "",
    classType: "individual" as "individual" | "group",
    sessionsBooked: 0,
    sessionsRemaining: 0,
    parentRate: 0,
    autoInvoiceEnabled: false,
    defaultSessionPack: 4,
    recurringInvoiceSendDate: "",
    parentContactInfo: "",
    startYear: undefined as number | undefined,
    endYear: undefined as number | undefined,
    examMonth: undefined as number | undefined,
    examYear: undefined as number | undefined,
    examBoard: "",
    targetSchools: "",
    primarySchool: "",
    sessionDayOfWeek: undefined as number | undefined,
    sessionStartTime: "",
    sessionDurationMinutes: 60,
  });
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState(false);
  const [editStaffData, setEditStaffData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
    startYear: undefined as number | undefined,
    endYear: undefined as number | undefined,
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [sessionView, setSessionView] = useState<"week" | "all">("week");
  const [sessionTutorFilter, setSessionTutorFilter] = useState<string>("all");
  const [sessionSortOrder, setSessionSortOrder] = useState<"desc" | "asc">("desc");
  const [sessionDateFilter, setSessionDateFilter] = useState<string>("");
  const [availabilityTutorFilter, setAvailabilityTutorFilter] = useState<string>("all");
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [expandedArchivedStudents, setExpandedArchivedStudents] = useState<Set<string>>(new Set());
  const [viewingTutorEarnings, setViewingTutorEarnings] = useState<User | null>(null);
  const [isTutorEarningsOpen, setIsTutorEarningsOpen] = useState(false);
  const [earningsPeriod, setEarningsPeriod] = useState<"weekly" | "monthly" | "annual">("weekly");
  const [isAddWaitlistOpen, setIsAddWaitlistOpen] = useState(false);
  const [waitlistPreferredTimings, setWaitlistPreferredTimings] = useState<Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    notes: string;
  }>>([]);
  const [viewingMatchingTutors, setViewingMatchingTutors] = useState<string | null>(null);
  const [matchingTutorsData, setMatchingTutorsData] = useState<any>(null);
  const [matchingTutorsLoading, setMatchingTutorsLoading] = useState(false);
  const [editingWaitlist, setEditingWaitlist] = useState<WaitlistEntry | null>(null);
  const [isEditWaitlistOpen, setIsEditWaitlistOpen] = useState(false);
  const [editWaitlistData, setEditWaitlistData] = useState({
    studentName: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    subjects: [] as string[],
    sessionTypePreference: "no_preference" as "in_person_group" | "online_1_1" | "no_preference",
    notes: "",
    depositPaid: false,
    depositAmount: "" as string,
    sessionDurationMinutes: undefined as number | undefined,
    status: "new" as "new" | "contacted" | "scheduled" | "converted" | "declined",
    preferredTimings: [] as Array<{ dayOfWeek: number; startTime: string; endTime: string; notes: string }>,
  });
  const [convertingWaitlist, setConvertingWaitlist] = useState<WaitlistEntry | null>(null);
  const [isConvertWaitlistOpen, setIsConvertWaitlistOpen] = useState(false);
  const [convertWaitlistData, setConvertWaitlistData] = useState({
    subjects: [],
    examType: "",
    classType: "individual" as "individual" | "group",
    parentRate: 0,
    sessionsBooked: 1,
    startYear: new Date().getFullYear(),
    examMonth: undefined as number | undefined,
    examYear: undefined as number | undefined,
    parentAccountMode: "none" as "none" | "existing" | "new",
    selectedParentUserId: "",
    newParentPassword: "",
  });

  // Topics management state
  const [selectedStudentForTopics, setSelectedStudentForTopics] = useState<StudentWithTutor | null>(null);
  const [isTopicsDialogOpen, setIsTopicsDialogOpen] = useState(false);
  const [bulkTopicsText, setBulkTopicsText] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [messageRecipientFilter, setMessageRecipientFilter] = useState<"all" | "admin" | "tutor">("all");
  const [legacyStatusFilter, setLegacyStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [legacyTutorFilter, setLegacyTutorFilter] = useState<string>("all");
  const [expandedLegacyTutor, setExpandedLegacyTutor] = useState<string | null>(null);
  const [expandedLegacyWeek, setExpandedLegacyWeek] = useState<string | null>(null);
  const [expandedLegacyGroupSession, setExpandedLegacyGroupSession] = useState<string | null>(null);
  const [expandedLedgerParent, setExpandedLedgerParent] = useState<string | null>(null);
  const [expandedLedgerTutor, setExpandedLedgerTutor] = useState<string | null>(null);

  // Rate configuration management state (NEW INDEPENDENT SYSTEM)
  const [isAddTutorRateOpen, setIsAddTutorRateOpen] = useState(false);
  const [isAddParentRateOpen, setIsAddParentRateOpen] = useState(false);
  const [editingTutorRate, setEditingTutorRate] = useState<TutorRate | null>(null);
  const [editingParentRate, setEditingParentRate] = useState<ParentRate | null>(null);
  const [isEditTutorRateOpen, setIsEditTutorRateOpen] = useState(false);
  const [isLoadingTutorRateAssignments, setIsLoadingTutorRateAssignments] = useState(false);
  const [isEditParentRateOpen, setIsEditParentRateOpen] = useState(false);
  const [isLinkRateOpen, setIsLinkRateOpen] = useState(false);
  const [linkingTutorRateId, setLinkingTutorRateId] = useState<string>("");
  const [linkingParentRateId, setLinkingParentRateId] = useState<string>("");
  const [tutorRateFormData, setTutorRateFormData] = useState({
    name: "",
    description: "",
    tutorId: "" as string | null, // Optional: assign to specific tutor (legacy single tutor)
    tutorIds: [] as string[], // Multi-tutor selection
    tutorGroupIds: [] as string[], // Tutor group selection
    tutorAssignmentsLoaded: true, // Track if assignments were loaded for edit
    classType: "individual" as "individual" | "group",
    subjects: [],
    rate: 0,
    isDefault: false,
    isActive: true,
  });
  const [parentRateFormData, setParentRateFormData] = useState({
    name: "",
    description: "",
    classType: "individual" as "individual" | "group",
    subjects: [],
    rate: 0,
    isDefault: false,
    isActive: true,
  });

  // Allocation management state
  const [isAddAllocationOpen, setIsAddAllocationOpen] = useState(false);
  const [isEditAllocationOpen, setIsEditAllocationOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<AllocationWithRelations | null>(null);
  // Fixed list of available subjects for allocations
  const ALLOCATION_SUBJECTS = [
    "11+ Maths",
    "Verbal Reasoning",
    "Non-Verbal Reasoning",
    "11+ English",
    "GCSE Maths",
    "GCSE English",
  ];

  const [allocationFormData, setAllocationFormData] = useState({
    studentId: "",
    tutorId: "",
    subjects: [] as string[],
    parentRate: 0,
    tutorRate: 0,
    isPrimary: false,
    isActive: true,
    notes: "",
  });
  
  // Parent invoice editing state
  const [editingParentInvoice, setEditingParentInvoice] = useState<Invoice | null>(null);
  const [isEditParentInvoiceOpen, setIsEditParentInvoiceOpen] = useState(false);
  const [parentInvoiceFormData, setParentInvoiceFormData] = useState({
    amount: "",
    sessionsIncluded: 0,
    selectedRateId: "",
    status: "draft" as "draft" | "sent" | "approved" | "paid" | "partial" | "overdue" | "cancelled",
    notes: "",
  });

  // Adhoc invoice state
  const [isCreateAdhocInvoiceOpen, setIsCreateAdhocInvoiceOpen] = useState(false);
  const [isEditAdhocInvoiceOpen, setIsEditAdhocInvoiceOpen] = useState(false);
  const [editingAdhocInvoice, setEditingAdhocInvoice] = useState<AdhocInvoice | null>(null);
  const [adhocInvoiceFormData, setAdhocInvoiceFormData] = useState({
    category: "other" as "lesson" | "textbook_maths" | "textbook_vr" | "textbook_bundle" | "mock_exam" | "mathz_skillz" | "other",
    studentId: "" as string, // Optional student link
    parentFirstName: "",
    parentSurname: "",
    amount: "",
    reason: "",
    dueDate: "",
    status: "draft" as "draft" | "sent" | "approved" | "paid" | "partial" | "overdue" | "cancelled",
    notes: "",
  });
  // Selected products for adhoc invoice (for inventory linking)
  const [selectedInvoiceProducts, setSelectedInvoiceProducts] = useState<{productId: string; quantity: number; unitPrice: string}[]>([]);

  // Student group management state
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroupWithMembers | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    tutorId: "",
    selectedStudentIds: [] as string[],
  });
  
  // Group session scheduling state
  const [isGroupScheduleOpen, setIsGroupScheduleOpen] = useState(false);
  const [schedulingGroup, setSchedulingGroup] = useState<StudentGroupWithMembers | null>(null);
  const [groupScheduleFormData, setGroupScheduleFormData] = useState({
    dayOfWeek: 1 as number, // 0=Sunday through 6=Saturday
    startTime: "15:00",
    durationMinutes: 60,
    subject: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  // Parent invoice view state (outstanding vs paid)
  const [parentInvoiceView, setParentInvoiceView] = useState<"outstanding" | "paid">("outstanding");
  
  // Tutor invoice view state (awaiting vs paid)
  const [tutorInvoiceView, setTutorInvoiceView] = useState<"awaiting" | "paid">("awaiting");
  const [paidInvoiceFilters, setPaidInvoiceFilters] = useState({
    studentName: "",
    parentName: "",
    tutorName: "",
    month: "",
    year: "",
    minAmount: "",
    maxAmount: "",
  });

  // Legacy state (keeping for backward compatibility)
  const [editingRate, setEditingRate] = useState<RateConfiguration | null>(null);
  const [isEditRateOpen, setIsEditRateOpen] = useState(false);
  const [rateFormData, setRateFormData] = useState<RateConfigFormData>({
    name: "",
    description: "",
    classType: "individual",
    subjects: [],
    tutorRate: 0,
    parentRate: 0,
    isDefault: false,
    isActive: true,
  });

  // Toggle student expansion
  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Toggle archived student expansion
  const toggleArchivedStudentExpand = (studentId: string) => {
    setExpandedArchivedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Date helpers for session filtering
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0); // Reset to midnight
    return start;
  };
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Calculate date range based on earnings period
  const getEarningsDateRange = (period: "weekly" | "monthly" | "annual") => {
    const now = new Date();
    let start: Date;
    let end: Date;
    
    if (period === "weekly") {
      start = getWeekStart();
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
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

  // Fetch admin stats
  const { data: stats } = useQuery<{
    bookedRevenue: number;
    paidRevenue: number;
    bookedExpenditure: number;
    paidExpenditure: number;
    activeStudents: number;
    activeTutors: number;
    lowBalanceAlerts: number;
    weeklyOutgoings: number;
    monthlyIncome: number;
    monthlyExpenditure: number;
    fiscalYearLabel: string;
    studentsPerTutor: Array<{ tutorId: string; tutorName: string; studentCount: number }>;
    studentsPerSubject: Array<{ subject: string; studentCount: number }>;
  }>({
    queryKey: ["/api/analytics/admin-stats"],
    retry: false,
  });

  // Fetch active students
  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery<StudentWithTutor[]>({
    queryKey: ["/api/students"],
    retry: false,
  });

  // Fetch all students including inactive (ex-students)
  const { data: allStudents = [] } = useQuery<StudentWithTutor[]>({
    queryKey: ["/api/students/all"],
    retry: false,
  });

  // Fetch active tutors
  const { data: tutors = [] } = useQuery<User[]>({
    queryKey: ["/api/tutors"],
    retry: false,
  });

  // Fetch tutor availability slots for admin viewer
  const { data: tutorAvailabilitySlots = [] } = useQuery<(TutorAvailabilitySlot & { tutor?: User })[]>({
    queryKey: ["/api/admin/tutor-availability", availabilityTutorFilter],
    queryFn: async () => {
      const url = availabilityTutorFilter === "all" 
        ? "/api/admin/tutor-availability" 
        : `/api/admin/tutor-availability?tutorId=${availabilityTutorFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    },
  });

  // Fetch all tutors including inactive (ex-tutors)
  const { data: allTutors = [] } = useQuery<User[]>({
    queryKey: ["/api/tutors/all"],
    retry: false,
  });

  // Fetch parent users (for linking to students)
  const { data: parentUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/parent-users"],
    retry: false,
  });

  // Fetch pending timesheets
  const { data: pendingTimesheets = [] } = useQuery<TimesheetEntryWithRelations[]>({
    queryKey: ["/api/timesheets", "pending"],
    retry: false,
  });

  // Fetch all sessions for admin view
  const { data: allSessions = [] } = useQuery<TimesheetEntryWithRelations[]>({
    queryKey: ["/api/timesheets/all"],
    retry: false,
  });

  // Fetch submitted weekly timesheets for admin review
  const { data: submittedWeeklyTimesheets = [] } = useQuery<WeeklyTimesheetWithRelations[]>({
    queryKey: ["/api/weekly-timesheets/submitted"],
    retry: false,
  });

  // Fetch all weekly timesheets for legacy view (includes approved, rejected, and all statuses)
  const { data: allWeeklyTimesheets = [] } = useQuery<WeeklyTimesheetWithRelations[]>({
    queryKey: ["/api/weekly-timesheets/all"],
    retry: false,
  });


  // State for active tab
  const [activeTab, setActiveTab] = useState("home");

  // State for weekly timesheet review
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [expandedStatusHistoryId, setExpandedStatusHistoryId] = useState<string | null>(null);
  const [expandedGroupSessionId, setExpandedGroupSessionId] = useState<string | null>(null);
  const [rejectingTimesheetId, setRejectingTimesheetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [editEntryDialogOpen, setEditEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    id: string;
    duration: string;
    tutorEarnings: string;
    parentBilling: string;
    studentName: string;
  } | null>(null);

  // State for archive view
  const [archiveView, setArchiveView] = useState<"students" | "tutors">("students");
  const [selectedArchivedStudent, setSelectedArchivedStudent] = useState<ArchivedStudentSummary | null>(null);
  const [selectedArchivedTutor, setSelectedArchivedTutor] = useState<ArchivedTutorSummary | null>(null);

  // Fetch student invoice summaries (outstanding invoices, paid/unpaid sessions, awaiting invoice)
  const { data: invoiceSummaries = [] } = useQuery<{ studentId: string; outstandingInvoices: number; paidSessionsDelivered: number; unpaidSessionsDelivered: number; awaitingInvoice: number; hasPendingInvoice: boolean }[]>({
    queryKey: ["/api/students/invoice-summaries"],
    retry: false,
    staleTime: 30000,
  });

  // Create a lookup map for invoice summaries
  const invoiceSummaryMap = new Map(invoiceSummaries.map(s => [s.studentId, s]));

  // Fetch archived students with financial summaries
  const { data: archivedStudents = [], isLoading: archivedStudentsLoading } = useQuery<ArchivedStudentSummary[]>({
    queryKey: ["/api/archive/students"],
    retry: false,
  });

  // Fetch archived tutors with financial summaries
  const { data: archivedTutors = [], isLoading: archivedTutorsLoading } = useQuery<ArchivedTutorSummary[]>({
    queryKey: ["/api/archive/tutors"],
    retry: false,
  });

  // Fetch waitlist entries
  const { data: waitlistEntries = [], isLoading: waitlistLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
    retry: false,
  });

  // Fetch parent messages for admin
  const { data: parentMessages = [], isLoading: parentMessagesLoading } = useQuery<ParentMessageWithRelations[]>({
    queryKey: ["/api/messages/admin"],
    retry: false,
  });

  // Fetch admin notifications (for emergency contact updates, etc.)
  const { data: adminNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/admin/notifications"],
    retry: false,
  });

  // Filter unread emergency contact notifications
  const unreadEmergencyContactNotifications = adminNotifications.filter(
    n => n.type === "emergency_contact_updated" && !n.readAt
  );

  // Fetch rate configurations (legacy - deprecated)
  const { data: rateConfigurations = [], isLoading: ratesLoading } = useQuery<RateConfiguration[]>({
    queryKey: ["/api/rate-configurations"],
    retry: false,
  });

  // Fetch tutor rates (NEW INDEPENDENT SYSTEM)
  const { data: tutorRatesData = [], isLoading: tutorRatesLoading } = useQuery<TutorRate[]>({
    queryKey: ["/api/tutor-rates"],
    retry: false,
  });

  // Fetch additional staff members (for Staff Rates section)
  const { data: additionalStaffData = [], isLoading: additionalStaffLoading } = useQuery<User[]>({
    queryKey: ["/api/additional-staff"],
    retry: false,
  });

  // Fetch parent rates (NEW INDEPENDENT SYSTEM)
  const { data: parentRatesData = [], isLoading: parentRatesLoading } = useQuery<ParentRate[]>({
    queryKey: ["/api/parent-rates"],
    retry: false,
  });

  // Fetch rate links (for profit margin analysis)
  const { data: rateLinksData = [], isLoading: rateLinksLoading } = useQuery<(RateLink & { tutorRate: TutorRate; parentRate: ParentRate })[]>({
    queryKey: ["/api/rate-links"],
    retry: false,
  });

  // Fetch tutor groups (for rate assignment)
  const { data: tutorGroupsData = [] } = useQuery<any[]>({
    queryKey: ["/api/tutor-groups"],
    retry: false,
  });

  // Fetch tutor/student allocations
  const { data: allocations = [], isLoading: allocationsLoading } = useQuery<AllocationWithRelations[]>({
    queryKey: ["/api/allocations"],
    retry: false,
  });

  // Fetch tutor profit summary
  const { data: profitSummary = [], isLoading: profitSummaryLoading } = useQuery<TutorProfitSummary[]>({
    queryKey: ["/api/allocations/profit-summary"],
    retry: false,
  });

  // Fetch student groups for group sessions
  const { data: studentGroups = [], isLoading: studentGroupsLoading } = useQuery<StudentGroupWithMembers[]>({
    queryKey: ["/api/student-groups"],
    retry: false,
  });

  // Fetch recurring session templates for schedule display
  const { data: recurringSessionTemplates = [] } = useQuery<RecurringSessionTemplate[]>({
    queryKey: ["/api/recurring-sessions"],
    retry: false,
  });

  // Build a map from studentId to their session schedule(s) - from student record, templates, and groups
  const studentSessionScheduleMap = useMemo(() => {
    const map = new Map<string, Array<{ label: string; dayOfWeek: number; startTime: string; isGroup: boolean }>>();
    const seenSchedules = new Set<string>(); // Track unique schedules by content (studentId-day-time-label)
    
    // First, add schedules from the student record itself (sessionDayOfWeek, sessionStartTime)
    for (const student of students) {
      if (student.sessionDayOfWeek !== null && student.sessionDayOfWeek !== undefined && student.sessionStartTime) {
        const label = (student.subjects && student.subjects.length > 0) ? student.subjects[0] : "1-to-1";
        const key = `${student.id}-${student.sessionDayOfWeek}-${student.sessionStartTime}-${label}`;
        if (!seenSchedules.has(key)) {
          seenSchedules.add(key);
          const existing = map.get(student.id) || [];
          existing.push({
            label,
            dayOfWeek: student.sessionDayOfWeek,
            startTime: student.sessionStartTime,
            isGroup: false,
          });
          map.set(student.id, existing);
        }
      }
    }
    
    // Add individual recurring sessions (directly assigned to students)
    for (const template of recurringSessionTemplates) {
      if (template.isActive && template.studentId && !template.groupId) {
        const label = template.subject || "1-to-1";
        const key = `${template.studentId}-${template.dayOfWeek}-${template.startTime}-${label}`;
        if (seenSchedules.has(key)) continue;
        seenSchedules.add(key);
        
        const existing = map.get(template.studentId) || [];
        existing.push({
          label,
          dayOfWeek: template.dayOfWeek,
          startTime: template.startTime,
          isGroup: false,
        });
        map.set(template.studentId, existing);
      }
    }
    
    // Add group sessions - deduplicated by content (day + time + group name)
    for (const group of studentGroups) {
      const groupTemplates = recurringSessionTemplates.filter(t => t.groupId === group.id && t.isActive);
      
      if (groupTemplates.length > 0 && group.members) {
        for (const member of group.members) {
          const existing = map.get(member.studentId) || [];
          for (const template of groupTemplates) {
            const key = `${member.studentId}-${template.dayOfWeek}-${template.startTime}-${group.name}`;
            if (seenSchedules.has(key)) continue;
            seenSchedules.add(key);
            
            existing.push({
              label: group.name,
              dayOfWeek: template.dayOfWeek,
              startTime: template.startTime,
              isGroup: true,
            });
          }
          map.set(member.studentId, existing);
        }
      }
    }
    
    return map;
  }, [students, studentGroups, recurringSessionTemplates]);

  // Helper to format day of week
  const formatDayOfWeek = (day: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day] || "";
  };

  // Fetch tutor invoices (invoices sent from tutors to admin this week)
  const { data: tutorInvoicesThisWeek = [], isLoading: tutorInvoicesLoading } = useQuery<(TutorInvoice & { tutor: User })[]>({
    queryKey: ["/api/tutor-invoices/this-week"],
    retry: false,
  });

  // Fetch all tutor invoices
  const { data: allTutorInvoices = [] } = useQuery<(TutorInvoice & { tutor: User })[]>({
    queryKey: ["/api/tutor-invoices"],
    retry: false,
  });

  // Fetch parent invoices (for parents) - includes student info
  const { data: parentInvoices = [], isLoading: parentInvoicesLoading } = useQuery<InvoiceWithRelations[]>({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  // Fetch adhoc invoices (manual invoices not tied to students)
  const { data: adhocInvoices = [], isLoading: adhocInvoicesLoading } = useQuery<AdhocInvoice[]>({
    queryKey: ["/api/adhoc-invoices"],
    retry: false,
  });

  // Fetch financial ledger for Legacy tab (all paid invoices in/out)
  type FinancialLedger = {
    moneyIn: Array<{
      id: string;
      type: 'parent_invoice' | 'adhoc_invoice';
      invoiceNumber: string;
      description: string;
      amount: string;
      paidAt: string;
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
      paidAt: string;
    }>;
    totalIn: number;
    totalOut: number;
    netProfit: number;
  };
  const { data: financialLedger, isLoading: financialLedgerLoading } = useQuery<FinancialLedger>({
    queryKey: ["/api/financial-ledger"],
    retry: false,
  });

  // Fetch grouped financial ledger for Legacy tab (grouped by parent/tutor)
  type GroupedFinancialLedger = {
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
        sentAt: string | null;
        paidAt: string | null;
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
        submittedAt: string | null;
        approvedAt: string | null;
        paidAt: string | null;
        notes: string | null;
        weekStart?: string;
        weekEnd?: string;
        rejectionReason?: string;
        statusHistory: Array<{
          status: string;
          changedAt: string;
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
  };
  
  // Fiscal year state for Legacy tab
  const [legacyFiscalYear, setLegacyFiscalYear] = useState<number | undefined>(undefined);
  
  // Fetch available fiscal years
  const { data: fiscalYearsData } = useQuery<{ fiscalYears: { year: number; label: string }[]; currentFiscalYear: number }>({
    queryKey: ["/api/analytics/fiscal-years"],
    retry: false,
  });
  
  const { data: groupedLedger, isLoading: groupedLedgerLoading } = useQuery<GroupedFinancialLedger>({
    queryKey: ["/api/financial-ledger/grouped", legacyFiscalYear],
    queryFn: async () => {
      const url = legacyFiscalYear 
        ? `/api/financial-ledger/grouped?fiscalYear=${legacyFiscalYear}` 
        : "/api/financial-ledger/grouped";
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch grouped ledger");
      return res.json();
    },
    retry: false,
  });

  // Fetch products for inventory linking with adhoc invoices
  const { data: inventoryProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Fetch single message with replies when expanded
  const { data: expandedMessage } = useQuery<ParentMessageWithRelations & { replies: ParentMessageReplyWithRelations[] }>({
    queryKey: ["/api/messages", expandedMessageId],
    enabled: !!expandedMessageId,
    retry: false,
  });

  // Session logging alerts for compliance tracking
  const { data: sessionAlerts = [], isLoading: sessionAlertsLoading } = useQuery<{
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
    queryKey: ["/api/session-alerts"],
    retry: false,
    refetchInterval: 60000,
  });

  // Tutor compliance metrics
  const { data: complianceMetrics = [], isLoading: complianceMetricsLoading } = useQuery<{
    tutorId: string;
    tutorName: string;
    totalSessions: number;
    lateLogged: number;
    latePercentage: number;
    avgHoursLate: number;
    pendingAlerts: number;
  }[]>({
    queryKey: ["/api/session-alerts/metrics"],
    retry: false,
  });

  // Invoice payment alerts for compliance tracking
  const { data: invoiceAlerts = [], isLoading: invoiceAlertsLoading } = useQuery<{
    id: string;
    invoiceId: string;
    parentId: string;
    studentId: string | null;
    invoiceSentAt: string;
    dueDate: string;
    alertCreatedAt: string;
    status: string;
    parentName: string;
    studentName: string;
    invoiceNumber: string;
    amount: string;
  }[]>({
    queryKey: ["/api/invoice-alerts"],
    retry: false,
    refetchInterval: 60000,
  });

  // Parent payment compliance metrics
  const { data: paymentMetrics = [], isLoading: paymentMetricsLoading } = useQuery<{
    parentId: string;
    parentName: string;
    totalInvoices: number;
    latePaid: number;
    latePercentage: number;
    pendingAlerts: number;
  }[]>({
    queryKey: ["/api/invoice-alerts/metrics"],
    retry: false,
  });

  // Flagged sessions - parent feedback
  const { data: flaggedSessions = [], isLoading: flaggedSessionsLoading } = useQuery<{
    id: string;
    studentId: string | null;
    tutorId: string | null;
    occurrenceDate: Date;
    startDateTime: Date;
    endDateTime: Date;
    parentFlagged: boolean;
    parentFlagComment: string | null;
    parentFlaggedAt: Date | null;
    student?: { id: string; name: string };
    tutor?: { id: string; firstName: string; lastName: string };
  }[]>({
    queryKey: ["/api/flagged-sessions"],
    retry: false,
    refetchInterval: 60000,
  });

  // Session change requests from parents
  const { data: changeRequests = [], isLoading: changeRequestsLoading } = useQuery<{
    id: string;
    sessionOccurrenceId: string;
    parentId: string;
    requestType: string;
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
      tutor?: { id: string; firstName: string; lastName: string };
    };
    parent?: { id: string; firstName: string; lastName: string };
  }[]>({
    queryKey: ["/api/session-change-requests"],
    retry: false,
    refetchInterval: 60000,
  });

  // State for responding to change requests
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [changeRequestResponse, setChangeRequestResponse] = useState("");
  const [changeRequestAction, setChangeRequestAction] = useState<"approved" | "declined">("approved");
  const [newRescheduleDateTime, setNewRescheduleDateTime] = useState("");
  
  // State for dismissed session change request notifications
  const [dismissedChangeRequestAlertIds, setDismissedChangeRequestAlertIds] = useState<Set<string>>(new Set());

  // State for dismissing alerts
  const [dismissingAlertId, setDismissingAlertId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState("");

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async ({ messageId, replyContent }: { messageId: string; replyContent: string }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/replies`, { replyContent });
      return response.json();
    },
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", expandedMessageId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/admin"] });
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

  // Dismiss session alert mutation
  const dismissAlertMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/session-alerts/${id}/dismiss`, { reason });
      return response.json();
    },
    onSuccess: () => {
      setDismissingAlertId(null);
      setDismissReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/session-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-alerts/metrics"] });
      toast({
        title: "Alert Dismissed",
        description: "The session logging alert has been dismissed.",
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
        description: "Failed to dismiss alert.",
        variant: "destructive",
      });
    },
  });

  // Check for overdue sessions mutation
  const checkOverdueSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/session-alerts/check", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-alerts/metrics"] });
      toast({
        title: "Alerts Checked",
        description: `Found ${data.overdueSessionsFound} overdue sessions, created ${data.alertsCreated} new alerts.`,
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
        description: "Failed to check for overdue sessions.",
        variant: "destructive",
      });
    },
  });

  // State for dismissing invoice alerts
  const [dismissingInvoiceAlertId, setDismissingInvoiceAlertId] = useState<string | null>(null);
  const [invoiceAlertDismissReason, setInvoiceAlertDismissReason] = useState("");

  // Check for overdue invoices mutation
  const checkOverdueInvoicesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/invoice-alerts/check", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-alerts/metrics"] });
      toast({
        title: "Alerts Checked",
        description: `Found ${data.overdueInvoicesFound} overdue invoices, created ${data.alertsCreated} new alerts.`,
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
        description: "Failed to check for overdue invoices.",
        variant: "destructive",
      });
    },
  });

  // Send invoice reminders mutation
  const sendInvoiceRemindersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/invoice-reminders/send", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Reminders Sent",
        description: `Sent ${data.totalSent} reminders (2-day: ${data.reminder2Days}, 4-day: ${data.reminder4Days}, 5-day: ${data.reminder5Days}).`,
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
        description: "Failed to send invoice reminders.",
        variant: "destructive",
      });
    },
  });

  // Dismiss invoice payment alert mutation
  const dismissInvoiceAlertMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/invoice-alerts/${id}/dismiss`, { reason });
      return response.json();
    },
    onSuccess: () => {
      setDismissingInvoiceAlertId(null);
      setInvoiceAlertDismissReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-alerts/metrics"] });
      toast({
        title: "Alert Dismissed",
        description: "The invoice payment alert has been dismissed.",
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
        description: "Failed to dismiss alert.",
        variant: "destructive",
      });
    },
  });

  // Acknowledge flagged session mutation
  const acknowledgeFlaggedSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/flagged-sessions/${sessionId}/acknowledge`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flagged-sessions"] });
      toast({
        title: "Session Acknowledged",
        description: "The flagged session has been acknowledged.",
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
        description: "Failed to acknowledge flagged session.",
        variant: "destructive",
      });
    },
  });

  // Acknowledge session change request mutation (legacy - kept for backwards compatibility)
  const acknowledgeChangeRequestMutation = useMutation({
    mutationFn: async ({ requestId, message }: { requestId: string; message?: string }) => {
      const response = await apiRequest("POST", `/api/session-change-requests/${requestId}/acknowledge`, { 
        message: message?.trim() || null 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-change-requests"] });
      setRespondingRequestId(null);
      setChangeRequestResponse("");
      toast({
        title: "Request Acknowledged",
        description: "The change request has been acknowledged and logged.",
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
        description: "Failed to acknowledge change request.",
        variant: "destructive",
      });
    },
  });

  // Approve session change request mutation
  const approveChangeRequestMutation = useMutation({
    mutationFn: async ({ requestId, adminNotes, newDateTime }: { requestId: string; adminNotes?: string; newDateTime?: string }) => {
      const response = await apiRequest("POST", `/api/session-change-requests/${requestId}/approve`, { 
        adminNotes: adminNotes?.trim() || null,
        newDateTime: newDateTime || null
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      setRespondingRequestId(null);
      setChangeRequestResponse("");
      setNewRescheduleDateTime("");
      toast({
        title: "Request Approved",
        description: "The change request has been approved and the session has been updated.",
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
        description: "Failed to approve change request.",
        variant: "destructive",
      });
    },
  });

  // Reject session change request mutation
  const rejectChangeRequestMutation = useMutation({
    mutationFn: async ({ requestId, adminNotes }: { requestId: string; adminNotes?: string }) => {
      const response = await apiRequest("POST", `/api/session-change-requests/${requestId}/reject`, { 
        adminNotes: adminNotes?.trim() || null 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-change-requests"] });
      setRespondingRequestId(null);
      setChangeRequestResponse("");
      toast({
        title: "Request Rejected",
        description: "The change request has been declined and the requester has been notified.",
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
        description: "Failed to reject change request.",
        variant: "destructive",
      });
    },
  });

  // Confirm invoice paid mutation
  const confirmInvoicePaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/confirm-paid`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-alerts/metrics"] });
      toast({
        title: "Payment Confirmed",
        description: "The invoice has been marked as paid.",
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
        description: "Failed to confirm payment.",
        variant: "destructive",
      });
    },
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

  // Add topics mutation (keeps existing topics)
  const addTopicsMutation = useMutation({
    mutationFn: async ({ studentId, topics }: { studentId: string; topics: { title: string; orderIndex: number }[] }) => {
      const response = await apiRequest("POST", `/api/students/${studentId}/topics/add`, { topics });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Topics added successfully!",
      });
      setBulkTopicsText("");
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
        description: "Failed to add topics.",
        variant: "destructive",
      });
    },
  });

  // Update topic mutation
  const updateTopicMutation = useMutation({
    mutationFn: async ({ topicId, title }: { topicId: string; title: string }) => {
      const response = await apiRequest("PATCH", `/api/topics/${topicId}`, { title });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Topic updated!",
      });
      setEditingTopicId(null);
      setEditingTopicTitle("");
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
        description: "Failed to update topic.",
        variant: "destructive",
      });
    },
  });

  // Mark parent message as read mutation
  const markMessageReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("PATCH", `/api/messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/admin"] });
      toast({
        title: "Success",
        description: "Message marked as read.",
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

  // Mark notification as read mutation
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
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
        description: "Failed to dismiss notification.",
        variant: "destructive",
      });
    },
  });

  // Fetch selected tutor's earnings view (what the tutor sees)
  const { data: tutorEarningsData, isLoading: tutorEarningsLoading } = useQuery<{
    earnings: number;
    entries: TimesheetEntryWithRelations[];
  }>({
    queryKey: [`/api/analytics/tutor-earnings/${viewingTutorEarnings?.id}?startDate=${earningsDateRange.start.toISOString()}&endDate=${earningsDateRange.end.toISOString()}`],
    enabled: !!viewingTutorEarnings && isTutorEarningsOpen,
    retry: false,
  });

  // Student form
  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      parentName: "",
      parentSurname: "",
      parentEmail: "",
      parentPhone: "",
      subjects: [],
      examType: "",
      classType: "individual",
      sessionsBooked: 1,
      sessionsRemaining: 1,
      parentRate: 0,
      autoInvoiceEnabled: false,
      defaultSessionPack: 4,
      startYear: undefined,
      examMonth: undefined,
      examYear: undefined,
      examBoard: "",
      targetSchools: "",
      primarySchool: "",
      sessionDayOfWeek: undefined,
      sessionStartTime: "",
      sessionDurationMinutes: 60,
    },
  });

  // Tutor form
  const tutorForm = useForm<TutorFormData>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "tutor",
      phone: "",
      description: "",
      startYear: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  // Parent account form
  const parentAccountForm = useForm<ParentAccountFormData>({
    resolver: zodResolver(parentAccountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // Waitlist form
  const waitlistForm = useForm<WaitlistFormData>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      studentName: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      subjects: [],
      sessionTypePreference: "no_preference",
      notes: "",
      depositPaid: false,
      depositAmount: undefined,
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const response = await apiRequest("POST", "/api/students", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student created successfully!",
      });
      studentForm.reset();
      setIsAddStudentOpen(false);
      setParentAccountMode("none");
      setSelectedParentUserId("");
      setNewParentPassword("");
      setSendInitialInvoice(false);
      setInvoiceSendDate("");
      setRecurringInvoiceSendDate("");
      setNewStudentSessions([{ dayOfWeek: undefined, startTime: "", durationMinutes: 60 }]);
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/session-occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
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
        description: "Failed to create student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create tutor mutation
  const createTutorMutation = useMutation({
    mutationFn: async (data: TutorFormData) => {
      const response = await apiRequest("POST", "/api/admin/create-tutor", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member created successfully!",
      });
      tutorForm.reset();
      setIsAddTutorOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
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
        description: "Failed to create staff member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create parent account mutation
  const createParentAccountMutation = useMutation({
    mutationFn: async (data: ParentAccountFormData) => {
      const response = await apiRequest("POST", "/api/admin/create-parent", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Parent account created successfully!",
      });
      parentAccountForm.reset();
      setIsAddParentAccountOpen(false);
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
        description: error?.message || "Failed to create parent account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update tutor role mutation
  const updateTutorRoleMutation = useMutation({
    mutationFn: async ({ tutorId, role }: { tutorId: string; role: "admin" | "tutor" | "additional_staff" }) => {
      const response = await apiRequest("PATCH", `/api/tutors/${tutorId}`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff role updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
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
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ studentId, updates }: { studentId: string; updates: Record<string, any> }) => {
      const response = await apiRequest("PATCH", `/api/students/${studentId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student updated successfully!",
      });
      setIsEditStudentOpen(false);
      setEditingStudent(null);
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/session-occurrences"] });
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
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ staffId, updates }: { staffId: string; updates: { firstName?: string; lastName?: string; email?: string; phone?: string; emergencyContact?: { name: string; phone: string } } }) => {
      const response = await apiRequest("PATCH", `/api/tutors/${staffId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member updated successfully!",
      });
      setIsEditStaffOpen(false);
      setEditingStaff(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
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
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Open edit dialog for a student
  const openEditDialog = (student: StudentWithTutor) => {
    setEditingStudent(student);
    setEditStudentData({
      name: student.name,
      parentName: student.parentName || "",
      parentSurname: (student as any).parentSurname || "",
      parentEmail: (student as any).parentEmail || "",
      parentPhone: student.parentPhone || "",
      subjects: (student as any).subjects || [],
      examType: (student as any).examType || "",
      classType: student.classType as "individual" | "group",
      sessionsBooked: student.sessionsBooked,
      sessionsRemaining: student.sessionsRemaining,
      parentRate: parseFloat((student.parentRate || 0).toString()),
      autoInvoiceEnabled: (student as any).autoInvoiceEnabled || false,
      defaultSessionPack: (student as any).defaultSessionPack || 4,
      recurringInvoiceSendDate: (student as any).recurringInvoiceSendDate ? new Date((student as any).recurringInvoiceSendDate).toISOString().split('T')[0] : "",
      parentContactInfo: student.parentContactInfo || "",
      startYear: student.startYear ?? undefined,
      endYear: student.endYear ?? undefined,
      examMonth: student.examMonth ?? undefined,
      examYear: student.examYear ?? undefined,
      examBoard: (student as any).examBoard || "",
      targetSchools: (student as any).targetSchools || "",
      primarySchool: (student as any).primarySchool || "",
      sessionDayOfWeek: (student as any).sessionDayOfWeek ?? undefined,
      sessionStartTime: (student as any).sessionStartTime || "",
      sessionDurationMinutes: (student as any).sessionDurationMinutes || 60,
    });
    
    // Load existing recurring sessions for this student
    const existingSessions = recurringSessionTemplates
      .filter(t => t.studentId === student.id && !t.groupId && t.isActive)
      .map(t => ({
        id: t.id,
        dayOfWeek: t.dayOfWeek as number | undefined,
        startTime: t.startTime,
        durationMinutes: t.durationMinutes || 60,
        tutorId: t.tutorId || undefined,
      }));
    
    // If no recurring sessions exist, check if there's a schedule on the student record
    if (existingSessions.length === 0 && (student as any).sessionDayOfWeek !== null && (student as any).sessionDayOfWeek !== undefined && (student as any).sessionStartTime) {
      setEditStudentSessions([{
        dayOfWeek: (student as any).sessionDayOfWeek,
        startTime: (student as any).sessionStartTime,
        durationMinutes: (student as any).sessionDurationMinutes || 60,
        tutorId: student.tutorId || undefined,
      }]);
    } else if (existingSessions.length > 0) {
      setEditStudentSessions(existingSessions);
    } else {
      setEditStudentSessions([{ dayOfWeek: undefined, startTime: "", durationMinutes: 60, tutorId: undefined }]);
    }
    
    setIsEditStudentOpen(true);
  };

  // Handle save student updates
  const handleSaveStudent = () => {
    if (!editingStudent) return;
    
    // Filter out empty session schedules
    const validSessions = editStudentSessions.filter(s => 
      s.dayOfWeek !== undefined && s.startTime && s.startTime.trim() !== ""
    );
    const firstSession = validSessions[0];
    
    updateStudentMutation.mutate({
      studentId: editingStudent.id,
      updates: {
        name: editStudentData.name,
        parentName: editStudentData.parentName,
        parentSurname: editStudentData.parentSurname,
        parentEmail: editStudentData.parentEmail,
        parentPhone: editStudentData.parentPhone,
        subjects: editStudentData.subjects,
        examType: editStudentData.examType || null,
        classType: editStudentData.classType,
        sessionsBooked: editStudentData.sessionsBooked,
        sessionsRemaining: editStudentData.sessionsRemaining,
        parentRate: String(editStudentData.parentRate),
        autoInvoiceEnabled: editStudentData.autoInvoiceEnabled,
        defaultSessionPack: editStudentData.defaultSessionPack,
        recurringInvoiceSendDate: editStudentData.recurringInvoiceSendDate || null,
        parentContactInfo: editStudentData.parentContactInfo,
        startYear: editStudentData.startYear || null,
        endYear: editStudentData.endYear || null,
        examMonth: editStudentData.examMonth || null,
        examYear: editStudentData.examYear || null,
        examBoard: editStudentData.examBoard || null,
        targetSchools: editStudentData.targetSchools || null,
        primarySchool: editStudentData.primarySchool || null,
        // Store first session on student record for backward compatibility
        sessionDayOfWeek: firstSession?.dayOfWeek,
        sessionStartTime: firstSession?.startTime || null,
        sessionDurationMinutes: firstSession?.durationMinutes || 60,
        // Pass all session schedules for managing recurring templates
        sessionSchedules: validSessions,
      },
    });
  };

  // Open edit dialog for staff
  const openEditStaffDialog = (staff: User) => {
    setEditingStaff(staff);
    const ec = staff.emergencyContact as { name?: string; phone?: string } | null;
    setEditStaffData({
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      email: staff.email || "",
      phone: (staff as any).phone || "",
      description: (staff as any).description || "",
      startYear: staff.startYear ?? undefined,
      endYear: staff.endYear ?? undefined,
      emergencyContactName: ec?.name || "",
      emergencyContactPhone: ec?.phone || "",
    });
    setIsEditStaffOpen(true);
  };

  // Handle save staff updates
  const handleSaveStaff = () => {
    if (!editingStaff) return;
    const { emergencyContactName, emergencyContactPhone, phone, description, ...basicData } = editStaffData;
    
    // Build updates object, only including phone if it has a value or was explicitly cleared
    const updates: Record<string, any> = { ...basicData };
    
    // Include phone only if it's different from original (handles empty -> value and value -> empty)
    const originalPhone = (editingStaff as any).phone || "";
    if (phone !== originalPhone) {
      updates.phone = phone || null; // null to clear, otherwise the new value
    }
    
    // Include description
    updates.description = description || null;
    
    // Handle emergency contact - use the form values directly (they were populated on open)
    // If both fields are empty, clear the emergency contact entirely
    // Otherwise, use whatever values are in the form fields
    if (emergencyContactName || emergencyContactPhone) {
      updates.emergencyContact = {
        name: emergencyContactName,
        phone: emergencyContactPhone,
      };
    } else {
      // Both fields empty - clear emergency contact
      updates.emergencyContact = null;
    }
    
    updateStaffMutation.mutate({
      staffId: editingStaff.id,
      updates,
    });
  };

  // Open topics dialog for a student
  const openTopicsDialog = (student: StudentWithTutor) => {
    setSelectedStudentForTopics(student);
    setBulkTopicsText("");
    setEditingTopicId(null);
    setEditingTopicTitle("");
    setIsTopicsDialogOpen(true);
  };

  // Handle adding new topics (keeps existing topics)
  const handleAddTopics = () => {
    if (!selectedStudentForTopics || !bulkTopicsText.trim()) return;
    const lines = bulkTopicsText.split("\n").filter(line => line.trim());
    const topics = lines.map((title, index) => ({
      title: title.trim(),
      orderIndex: index,
    }));
    addTopicsMutation.mutate({ studentId: selectedStudentForTopics.id, topics });
  };

  // Archive student mutation
  const archiveStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/students/${id}/archive`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student archived and moved to Ex-Students.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive/students"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive student.",
        variant: "destructive",
      });
    },
  });

  // Restore student mutation
  const restoreStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/students/${id}/restore`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student restored successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive/students"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore student.",
        variant: "destructive",
      });
    },
  });

  // Permanently delete archived student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/students/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student permanently deleted from the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive/students"] });
      setSelectedArchivedStudent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student.",
        variant: "destructive",
      });
    },
  });

  // Archive tutor mutation
  const archiveTutorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/tutors/${id}/archive`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member archived and moved to Ex-Tutors.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive/tutors"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive staff member.",
        variant: "destructive",
      });
    },
  });

  // Restore tutor mutation
  const restoreTutorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/tutors/${id}/restore`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member restored successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutors/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive/tutors"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore staff member.",
        variant: "destructive",
      });
    },
  });

  // Create waitlist mutation
  const createWaitlistMutation = useMutation({
    mutationFn: async (data: WaitlistFormData) => {
      const dataWithTimings = {
        ...data,
        preferredTimings: waitlistPreferredTimings.length > 0 ? waitlistPreferredTimings : undefined,
      };
      const response = await apiRequest("POST", "/api/waitlist", dataWithTimings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Waitlist entry created successfully!",
      });
      waitlistForm.reset();
      setWaitlistPreferredTimings([]);
      setIsAddWaitlistOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
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
        description: "Failed to create waitlist entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update waitlist mutation
  const updateWaitlistMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WaitlistFormData> }) => {
      const response = await apiRequest("PATCH", `/api/waitlist/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Waitlist entry updated successfully!",
      });
      setIsEditWaitlistOpen(false);
      setEditingWaitlist(null);
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
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
        description: "Failed to update waitlist entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete waitlist mutation
  const deleteWaitlistMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/waitlist/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Waitlist entry deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
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
        description: "Failed to delete waitlist entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Convert waitlist to student mutation
  const convertWaitlistMutation = useMutation({
    mutationFn: async (data: { id: string; additionalInfo: typeof convertWaitlistData }) => {
      const response = await apiRequest("POST", `/api/waitlist/${data.id}/convert`, data.additionalInfo);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Waitlist entry converted to student successfully!",
      });
      setIsConvertWaitlistOpen(false);
      setConvertingWaitlist(null);
      setConvertWaitlistData({
        subjects: [],
        examType: "",
        classType: "individual",
        parentRate: 0,
        sessionsBooked: 1,
        startYear: new Date().getFullYear(),
        examMonth: undefined,
        examYear: undefined,
        parentAccountMode: "none",
        selectedParentUserId: "",
        newParentPassword: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
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
        description: error.message || "Failed to convert waitlist entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Rate configuration mutations
  const createRateMutation = useMutation({
    mutationFn: async (data: RateConfigFormData) => {
      const payload = {
        ...data,
        tutorRate: data.tutorRate.toString(),
        parentRate: data.parentRate.toString(),
      };
      const response = await apiRequest("POST", "/api/rate-configurations", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rate configuration created successfully!",
      });
      setIsAddRateOpen(false);
      setRateFormData({
        name: "",
        description: "",
        classType: "individual",
        subjects: [],
        tutorRate: 0,
        parentRate: 0,
        isDefault: false,
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-configurations"] });
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
        description: "Failed to create rate configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RateConfigFormData }) => {
      const payload = {
        ...data,
        tutorRate: data.tutorRate.toString(),
        parentRate: data.parentRate.toString(),
      };
      const response = await apiRequest("PATCH", `/api/rate-configurations/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rate configuration updated successfully!",
      });
      setIsEditRateOpen(false);
      setEditingRate(null);
      queryClient.invalidateQueries({ queryKey: ["/api/rate-configurations"] });
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
        description: "Failed to update rate configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRateMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, find if this rate is linked to another
      const rate = rateConfigurations.find(r => r.id === id);
      if (rate?.linkedRateId) {
        // Clear the linkedRateId on the partner rate (don't delete it)
        await apiRequest("PATCH", `/api/rate-configurations/${rate.linkedRateId}`, { linkedRateId: null });
      }
      // Then delete the rate
      await apiRequest("DELETE", `/api/rate-configurations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rate configuration deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-configurations"] });
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
        description: "Failed to delete rate configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const linkRateMutation = useMutation({
    mutationFn: async ({ tutorRateId, parentRateId }: { tutorRateId: string; parentRateId: string }) => {
      // Update both rates to link to each other
      await apiRequest("PATCH", `/api/rate-configurations/${tutorRateId}`, { linkedRateId: parentRateId });
      await apiRequest("PATCH", `/api/rate-configurations/${parentRateId}`, { linkedRateId: tutorRateId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rates linked successfully!",
      });
      setIsLinkRateOpen(false);
      setLinkingTutorRate(null);
      setSelectedParentRateId("");
      queryClient.invalidateQueries({ queryKey: ["/api/rate-configurations"] });
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
        description: "Failed to link rates. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unlinkRateMutation = useMutation({
    mutationFn: async (rateId: string) => {
      const rate = rateConfigurations.find(r => r.id === rateId);
      if (rate?.linkedRateId) {
        // Unlink both rates
        await apiRequest("PATCH", `/api/rate-configurations/${rateId}`, { linkedRateId: null });
        await apiRequest("PATCH", `/api/rate-configurations/${rate.linkedRateId}`, { linkedRateId: null });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rates unlinked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-configurations"] });
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
        description: "Failed to unlink rates. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ============ NEW INDEPENDENT RATE SYSTEM MUTATIONS ============
  
  // Create tutor rate mutation
  const createTutorRateMutation = useMutation({
    mutationFn: async (data: typeof tutorRateFormData) => {
      const payload = {
        name: data.name,
        description: data.description,
        rate: data.rate.toString(),
        tutorId: data.tutorId || null, // null means global rate (legacy single tutor)
        tutorIds: data.tutorIds, // Multi-tutor selection
        tutorGroupIds: data.tutorGroupIds, // Tutor group selection
        classType: data.classType,
        subject: data.subject,
        isDefault: data.isDefault,
        isActive: data.isActive,
      };
      const response = await apiRequest("POST", "/api/tutor-rates", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor rate created successfully!",
      });
      setIsAddTutorRateOpen(false);
      setTutorRateFormData({
        name: "",
        description: "",
        tutorId: "",
        tutorIds: [],
        tutorGroupIds: [],
        tutorAssignmentsLoaded: true,
        classType: "individual",
        subjects: [],
        rate: 0,
        isDefault: false,
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-rates"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create tutor rate. Please try again.", variant: "destructive" });
    },
  });

  // Update tutor rate mutation
  const updateTutorRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof tutorRateFormData }) => {
      const payload: any = {
        name: data.name,
        description: data.description,
        rate: data.rate.toString(),
        tutorId: data.tutorId || null, // null means global rate (legacy single tutor)
        classType: data.classType,
        subject: data.subject,
        isDefault: data.isDefault,
        isActive: data.isActive,
      };
      // Only include tutor assignments if they were successfully loaded
      // This prevents accidental clearing of assignments if fetch failed
      if (data.tutorAssignmentsLoaded) {
        payload.tutorIds = data.tutorIds;
        payload.tutorGroupIds = data.tutorGroupIds;
      }
      const response = await apiRequest("PATCH", `/api/tutor-rates/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tutor rate updated successfully!" });
      setIsEditTutorRateOpen(false);
      setEditingTutorRate(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-rates"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update tutor rate. Please try again.", variant: "destructive" });
    },
  });

  // Delete tutor rate mutation
  const deleteTutorRateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tutor-rates/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tutor rate deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-rates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-links"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete tutor rate. Please try again.", variant: "destructive" });
    },
  });

  // State for editing additional staff rates
  const [editingStaffRateId, setEditingStaffRateId] = useState<string | null>(null);
  const [editingStaffRate, setEditingStaffRate] = useState<string>("");

  // Update additional staff hourly rate mutation
  const updateStaffRateMutation = useMutation({
    mutationFn: async ({ staffId, hourlyRate }: { staffId: string; hourlyRate: string }) => {
      const response = await apiRequest("PATCH", `/api/additional-staff/${staffId}/rate`, { hourlyRate });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Staff rate updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/additional-staff"] });
      setEditingStaffRateId(null);
      setEditingStaffRate("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update staff rate. Please try again.", variant: "destructive" });
    },
  });

  // Create parent rate mutation
  const createParentRateMutation = useMutation({
    mutationFn: async (data: typeof parentRateFormData) => {
      const payload = {
        ...data,
        rate: data.rate.toString(),
      };
      const response = await apiRequest("POST", "/api/parent-rates", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Parent rate created successfully!",
      });
      setIsAddParentRateOpen(false);
      setParentRateFormData({
        name: "",
        description: "",
        classType: "individual",
        subjects: [],
        rate: 0,
        isDefault: false,
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parent-rates"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create parent rate. Please try again.", variant: "destructive" });
    },
  });

  // Update parent rate mutation
  const updateParentRateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof parentRateFormData }) => {
      const payload = {
        ...data,
        rate: data.rate.toString(),
      };
      const response = await apiRequest("PATCH", `/api/parent-rates/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Parent rate updated successfully!" });
      setIsEditParentRateOpen(false);
      setEditingParentRate(null);
      queryClient.invalidateQueries({ queryKey: ["/api/parent-rates"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update parent rate. Please try again.", variant: "destructive" });
    },
  });

  // Delete parent rate mutation
  const deleteParentRateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/parent-rates/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Parent rate deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/parent-rates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-links"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete parent rate. Please try again.", variant: "destructive" });
    },
  });

  // Create rate link mutation
  const createRateLinkMutation = useMutation({
    mutationFn: async ({ tutorRateId, parentRateId }: { tutorRateId: string; parentRateId: string }) => {
      const response = await apiRequest("POST", "/api/rate-links", { tutorRateId, parentRateId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Rates linked successfully!" });
      setIsLinkRateOpen(false);
      setLinkingTutorRateId("");
      setLinkingParentRateId("");
      queryClient.invalidateQueries({ queryKey: ["/api/rate-links"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to link rates. Please try again.", variant: "destructive" });
    },
  });

  // Delete rate link mutation
  const deleteRateLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/rate-links/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Rate link removed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/rate-links"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to remove rate link. Please try again.", variant: "destructive" });
    },
  });

  // ============ ALLOCATION MUTATIONS ============

  // Create allocation mutation
  const createAllocationMutation = useMutation({
    mutationFn: async (data: typeof allocationFormData) => {
      const payload = {
        studentId: data.studentId,
        tutorId: data.tutorId,
        subject: data.subjects.length > 0 ? data.subjects.join(", ") : null,
        parentRate: data.parentRate.toString(),
        tutorRate: data.tutorRate.toString(),
        isPrimary: data.isPrimary,
        isActive: data.isActive,
        notes: data.notes || null,
      };
      const response = await apiRequest("POST", "/api/allocations", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Allocation created successfully!" });
      setIsAddAllocationOpen(false);
      setAllocationFormData({
        studentId: "",
        tutorId: "",
        subjects: [],
        parentRate: 0,
        tutorRate: 0,
        isPrimary: false,
        isActive: true,
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/profit-summary"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      const message = error.message?.includes("already exists") 
        ? "This student-tutor allocation already exists."
        : "Failed to create allocation. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  // Update allocation mutation
  const updateAllocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof allocationFormData }) => {
      const payload = {
        subject: data.subjects.length > 0 ? data.subjects.join(", ") : null,
        parentRate: data.parentRate.toString(),
        tutorRate: data.tutorRate.toString(),
        isPrimary: data.isPrimary,
        isActive: data.isActive,
        notes: data.notes || null,
      };
      const response = await apiRequest("PATCH", `/api/allocations/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Allocation updated successfully!" });
      setIsEditAllocationOpen(false);
      setEditingAllocation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/profit-summary"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update allocation. Please try again.", variant: "destructive" });
    },
  });

  // Delete allocation mutation
  const deleteAllocationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/allocations/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Allocation deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/allocations/profit-summary"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete allocation. Please try again.", variant: "destructive" });
    },
  });

  // Create student group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; tutorId: string; studentIds: string[] }) => {
      const response = await apiRequest("POST", "/api/student-groups", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student group created successfully!" });
      setIsAddGroupOpen(false);
      setGroupFormData({ name: "", description: "", tutorId: "", selectedStudentIds: [] });
      queryClient.invalidateQueries({ queryKey: ["/api/student-groups"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create student group. Please try again.", variant: "destructive" });
    },
  });

  // Update student group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string; tutorId: string; studentIds: string[] } }) => {
      const response = await apiRequest("PUT", `/api/student-groups/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student group updated successfully!" });
      setIsEditGroupOpen(false);
      setEditingGroup(null);
      setGroupFormData({ name: "", description: "", tutorId: "", selectedStudentIds: [] });
      queryClient.invalidateQueries({ queryKey: ["/api/student-groups"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to update student group. Please try again.", variant: "destructive" });
    },
  });

  // Delete student group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/student-groups/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Student group deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/student-groups"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to delete student group. Please try again.", variant: "destructive" });
    },
  });

  // Create group session schedule mutation
  const createGroupScheduleMutation = useMutation({
    mutationFn: async (data: {
      tutorId: string;
      groupId: string;
      dayOfWeek: number;
      startTime: string;
      durationMinutes: number;
      subject?: string;
      startDate: Date;
      classType: string;
      generateOccurrences: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/recurring-sessions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Group session schedule created successfully!" });
      setIsGroupScheduleOpen(false);
      setSchedulingGroup(null);
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-occurrences"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Unauthorized", description: "You are logged out. Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create group session schedule. Please try again.", variant: "destructive" });
    },
  });

  // Open schedule group dialog
  const openGroupScheduleDialog = (group: StudentGroupWithMembers) => {
    setSchedulingGroup(group);
    setGroupScheduleFormData({
      dayOfWeek: 1,
      startTime: "15:00",
      durationMinutes: 60,
      subject: group.subject || "",
      startDate: new Date().toISOString().split("T")[0],
    });
    setIsGroupScheduleOpen(true);
  };

  // Handle save group schedule
  const handleSaveGroupSchedule = () => {
    if (!schedulingGroup) return;
    
    createGroupScheduleMutation.mutate({
      tutorId: schedulingGroup.tutorId,
      groupId: schedulingGroup.id,
      dayOfWeek: groupScheduleFormData.dayOfWeek,
      startTime: groupScheduleFormData.startTime,
      durationMinutes: groupScheduleFormData.durationMinutes,
      subject: groupScheduleFormData.subject || undefined,
      startDate: new Date(groupScheduleFormData.startDate),
      classType: "group",
      generateOccurrences: true,
    });
  };

  // Open edit group dialog
  const openEditGroupDialog = (group: StudentGroupWithMembers) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      tutorId: group.tutorId,
      selectedStudentIds: group.members.map(m => m.studentId),
    });
    setIsEditGroupOpen(true);
  };

  // Open add group dialog
  const openAddGroupDialog = () => {
    setGroupFormData({ name: "", description: "", tutorId: "", selectedStudentIds: [] });
    setIsAddGroupOpen(true);
  };

  // Handle save group (create or update)
  const handleSaveGroup = () => {
    const data = {
      name: groupFormData.name,
      description: groupFormData.description,
      tutorId: groupFormData.tutorId,
      studentIds: groupFormData.selectedStudentIds,
    };
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data });
    } else {
      createGroupMutation.mutate(data);
    }
  };

  // Toggle student selection for group
  const toggleStudentInGroup = (studentId: string) => {
    setGroupFormData(prev => ({
      ...prev,
      selectedStudentIds: prev.selectedStudentIds.includes(studentId)
        ? prev.selectedStudentIds.filter(id => id !== studentId)
        : [...prev.selectedStudentIds, studentId],
    }));
  };

  // Open edit waitlist dialog
  const openEditWaitlistDialog = (entry: WaitlistEntry) => {
    setEditingWaitlist(entry);
    const timings = entry.preferredTimings as Array<{ dayOfWeek: number; startTime: string; endTime: string; notes?: string }> | null;
    setEditWaitlistData({
      studentName: entry.studentName,
      parentName: entry.parentName || "",
      parentEmail: entry.parentEmail || "",
      parentPhone: entry.parentPhone || "",
      subjects: entry.subjects || [],
      sessionTypePreference: (entry.sessionTypePreference || "no_preference") as "in_person_group" | "online_1_1" | "no_preference",
      notes: entry.notes || "",
      depositPaid: entry.depositPaid || false,
      depositAmount: entry.depositAmount ? String(entry.depositAmount) : "",
      sessionDurationMinutes: entry.sessionDurationMinutes || undefined,
      status: entry.status as "new" | "contacted" | "scheduled" | "converted" | "declined",
      preferredTimings: timings?.map(t => ({ ...t, notes: t.notes || "" })) || [],
    });
    setIsEditWaitlistOpen(true);
  };

  const fetchMatchingTutors = async (entryId: string) => {
    setViewingMatchingTutors(entryId);
    setMatchingTutorsLoading(true);
    try {
      const response = await fetch(`/api/waitlist/${entryId}/matching-tutors`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMatchingTutorsData(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch matching tutors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching matching tutors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matching tutors",
        variant: "destructive",
      });
    } finally {
      setMatchingTutorsLoading(false);
    }
  };

  // Handle save waitlist updates
  const handleSaveWaitlist = () => {
    if (!editingWaitlist) return;
    const updates = {
      ...editWaitlistData,
      depositAmount: editWaitlistData.depositAmount === "" ? null : editWaitlistData.depositAmount,
      preferredTimings: editWaitlistData.preferredTimings.length > 0 ? editWaitlistData.preferredTimings : null,
    };
    updateWaitlistMutation.mutate({
      id: editingWaitlist.id,
      updates,
    });
  };

  // Get waitlist status badge variant
  const getWaitlistStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      case "contacted":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">{status}</Badge>;
      case "scheduled":
        return <Badge className="bg-purple-500 hover:bg-purple-600">{status}</Badge>;
      case "converted":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case "declined":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Derived data for ex-students and ex-tutors
  const exStudents = allStudents.filter((s: StudentWithTutor) => !s.isActive);
  const exTutors = allTutors.filter((t: User) => !t.isActive);

  // Approve timesheet mutation
  const approveTimesheetMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/timesheets/${id}/status`, {
        status: "approved",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timesheet approved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
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
        description: "Failed to approve timesheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject timesheet mutation
  const rejectTimesheetMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/timesheets/${id}/status`, {
        status: "rejected",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timesheet rejected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
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
        description: "Failed to reject timesheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Approve weekly timesheet mutation
  const approveWeeklyTimesheetMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/weekly-timesheets/${id}/review`, {
        status: "approved",
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly timesheet approved!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/submitted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
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
        description: "Failed to approve weekly timesheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject weekly timesheet mutation
  const rejectWeeklyTimesheetMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/weekly-timesheets/${id}/review`, {
        status: "rejected",
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Weekly timesheet rejected!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/submitted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
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
        description: "Failed to reject weekly timesheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const markTutorInvoicePaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PATCH", `/api/tutor-invoices/${id}`, {
        status: "paid",
        paidAt: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tutor invoice marked as paid!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tutor-invoices/this-week"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-ledger"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-ledger/grouped"] });
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
        description: "Failed to mark invoice as paid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTimesheetEntryMutation = useMutation({
    mutationFn: async ({ id, tutorEarnings, parentBilling, duration }: { id: string; tutorEarnings: number; parentBilling: number; duration: number }) => {
      const response = await apiRequest("PATCH", `/api/timesheet-entries/${id}`, {
        tutorEarnings,
        parentBilling,
        duration,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Session entry updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-timesheets/submitted"] });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      setEditEntryDialogOpen(false);
      setEditingEntry(null);
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
        description: "Failed to update session entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Parent invoice mutations
  const updateParentInvoiceMutation = useMutation({
    mutationFn: async ({ id, amount, sessionsIncluded, status, notes }: { id: string; amount: string; sessionsIncluded: number; status: string; notes: string }) => {
      const response = await apiRequest("PATCH", `/api/invoices/${id}`, {
        amount,
        sessionsIncluded,
        status,
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Parent invoice updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsEditParentInvoiceOpen(false);
      setEditingParentInvoice(null);
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
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create adhoc invoice mutation
  const createAdhocInvoiceMutation = useMutation({
    mutationFn: async (data: { category: string; studentId?: string; parentUserId?: string | null; parentFirstName: string; parentSurname: string; amount: string; reason: string; dueDate?: string; status: string; notes?: string; products?: {productId: string; quantity: number; unitPrice: string}[] }) => {
      
      const response = await apiRequest("POST", "/api/adhoc-invoices", {
        category: data.category,
        studentId: data.studentId || null,
        parentUserId: data.parentUserId || null,
        parentFirstName: data.parentFirstName,
        parentSurname: data.parentSurname,
        amount: data.amount,
        reason: data.reason,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status,
        notes: data.notes,
      });
      const invoice = await response.json();
      
      // If products are selected, create invoice items to link them
      if (data.products && data.products.length > 0) {
        for (let i = 0; i < data.products.length; i++) {
          const product = data.products[i];
          const isLastItem = i === data.products.length - 1;
          await apiRequest("POST", `/api/adhoc-invoices/${invoice.id}/items`, {
            productId: product.productId,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            // On the last item, trigger inventory deduction if invoice is already "sent"
            deductOnComplete: isLastItem,
          });
        }
      }
      
      return invoice;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Adhoc invoice created!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/adhoc-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsCreateAdhocInvoiceOpen(false);
      setAdhocInvoiceFormData({
        category: "other",
        studentId: "",
        parentFirstName: "",
        parentSurname: "",
        amount: "",
        reason: "",
        dueDate: "",
        status: "draft",
        notes: "",
      });
      setSelectedInvoiceProducts([]);
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
        description: "Failed to create adhoc invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update adhoc invoice mutation
  const updateAdhocInvoiceMutation = useMutation({
    mutationFn: async (data: { id: string; parentFirstName?: string; parentSurname?: string; amount?: string; reason?: string; dueDate?: string | null; status?: string; paidAt?: string | null; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/adhoc-invoices/${data.id}`, {
        parentFirstName: data.parentFirstName,
        parentSurname: data.parentSurname,
        amount: data.amount,
        reason: data.reason,
        dueDate: data.dueDate,
        status: data.status,
        paidAt: data.paidAt,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/adhoc-invoices"] });
      setIsEditAdhocInvoiceOpen(false);
      setEditingAdhocInvoice(null);
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
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle unauthorized error
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

  const onSubmitStudent = async (data: StudentFormData) => {
    try {
      let parentUserId: string | undefined = undefined;

      // Handle parent account creation or selection
      if (parentAccountMode === "new") {
        // Validate password
        if (!newParentPassword || newParentPassword.length < 6) {
          toast({
            title: "Error",
            description: "Parent password must be at least 6 characters",
            variant: "destructive",
          });
          return;
        }
        // Create parent account first
        const parentResponse = await apiRequest("POST", "/api/admin/create-parent", {
          firstName: data.parentName || "",
          lastName: data.parentSurname || "",
          email: data.parentEmail || "",
          password: newParentPassword,
        });
        if (!parentResponse.ok) {
          const errorData = await parentResponse.json();
          throw new Error(errorData.message || "Failed to create parent account");
        }
        const parentUser = await parentResponse.json();
        parentUserId = parentUser.id;
        queryClient.invalidateQueries({ queryKey: ["/api/parent-users"] });
      } else if (parentAccountMode === "existing" && selectedParentUserId) {
        parentUserId = selectedParentUserId;
      }

      // Create student with parent user ID
      // Sessions remaining must equal sessions booked for new students
      // Filter out empty session schedules
      const validSessions = newStudentSessions.filter(s => 
        s.dayOfWeek !== undefined && s.startTime && s.startTime.trim() !== ""
      );
      
      createStudentMutation.mutate({ 
        ...data, 
        parentUserId,
        sessionsRemaining: data.sessionsBooked,
        autoInvoiceEnabled: data.autoInvoiceEnabled || false,
        defaultSessionPack: data.defaultSessionPack || 4,
        sendInitialInvoice,
        invoiceSendDate: invoiceSendDate || undefined,
        recurringInvoiceSendDate: recurringInvoiceSendDate || undefined,
        sessionSchedules: validSessions,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    }
  };

  const onSubmitTutor = (data: TutorFormData) => {
    createTutorMutation.mutate(data);
  };

  // Calculate low balance students (including those needing invoices)
  const lowBalanceStudents = students.filter((student) => 
    student.sessionsRemaining <= 5
  );

  // Navigation items for sidebar
  const navItems = [
    { id: "home", label: "Home", icon: TrendingUp },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "waitlist", label: "Waitlist", icon: UserPlus },
    { id: "tutors", label: "Staff", icon: Users },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "groups", label: "Groups", icon: Users },
    { id: "rates", label: "Staff Rates", icon: DollarSign },
    { id: "allocations", label: "Allocations", icon: Link2 },
    { id: "weekly-timesheets", label: "Weekly", icon: FileText, badge: submittedWeeklyTimesheets.length > 0 ? submittedWeeklyTimesheets.length : undefined },
    { id: "timesheets", label: "Legacy", icon: ClipboardList },
    { id: "invoices", label: "Invoices", icon: File },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "mock-exams", label: "Mock Exams", icon: FileCheck },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "archive", label: "Archive", icon: Archive },
    { id: "feedback", label: "Feedback", icon: MessageSquare, badge: parentMessages.filter(m => !m.isRead).length > 0 ? parentMessages.filter(m => !m.isRead).length : undefined },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "compliance", label: "Compliance", icon: AlertTriangle, badge: sessionAlerts.filter(a => a.status === "pending").length > 0 ? sessionAlerts.filter(a => a.status === "pending").length : undefined },
    { id: "log", label: "Session Change Requests", icon: FileText },
    { id: "audit", label: "Audit", icon: History },
    { id: "curriculum-topics", label: "Topics", icon: BookOpen },
    { id: "work-types", label: "Work Types", icon: Briefcase },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar Navigation */}
      <aside className="w-56 border-r border-border bg-card flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Admin Panel</h2>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 overflow-x-auto">
        <div className="flex p-2 gap-1">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors min-w-[60px] ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground"
                }`}
                data-testid={`mobile-nav-${item.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-[60px] h-auto flex flex-col items-center gap-1 px-3 py-2 border-0">
              <ChevronDown className="w-4 h-4" />
              <span className="text-xs">More</span>
            </SelectTrigger>
            <SelectContent>
              {navItems.slice(6).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 overflow-auto">
        {/* Home View - Widgets and Notifications */}
        {activeTab === "home" && (
          <div className="space-y-8">
            {/* Admin Notifications - Emergency Contact Updates */}
      {unreadEmergencyContactNotifications.length > 0 && (
        <div className="space-y-3" data-testid="admin-notifications-section">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Notifications ({unreadEmergencyContactNotifications.length})
          </h3>
          <div className="grid gap-3">
            {unreadEmergencyContactNotifications.map((notification) => {
              const payload = notification.payload as { tutorId: string; tutorName: string; tutorEmail: string; contactName: string; contactPhone: string; updatedAt: string } | null;
              const displayName = payload?.tutorName || payload?.tutorEmail || "A tutor";
              return (
                <Card key={notification.id} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800" data-testid={`notification-${notification.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800 dark:text-orange-200">
                            Emergency Contact Updated
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>{displayName}</strong> has updated their emergency contact information.
                        </p>
                        {payload && (
                          <div className="text-sm bg-background/50 p-2 rounded border">
                            <p><strong>Name:</strong> {payload.contactName}</p>
                            <p><strong>Phone:</strong> {payload.contactPhone}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Recently"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markNotificationReadMutation.mutate(notification.id)}
                        disabled={markNotificationReadMutation.isPending}
                        data-testid={`dismiss-notification-${notification.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Change Request Notifications */}
      {(() => {
        const pendingRequests = changeRequests.filter(r => r.status === "pending" && !dismissedChangeRequestAlertIds.has(r.id));
        if (pendingRequests.length === 0) return null;
        
        return (
          <div className="mb-4">
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                          Session Change Requests
                        </h4>
                        <Badge className="bg-blue-500 text-white">
                          {pendingRequests.length} pending
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        Parents and tutors have requested changes to scheduled sessions. Please review and respond.
                      </p>
                      <div className="space-y-2">
                        {pendingRequests.slice(0, 3).map((request) => (
                          <div 
                            key={request.id}
                            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-blue-900/40 rounded p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/60 transition-colors"
                            onClick={() => {
                              setActiveTab("calendar");
                              setTimeout(() => {
                                document.querySelector('[data-testid="tab-calendar"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }}
                            data-testid={`change-request-alert-${request.id}`}
                          >
                            <Badge 
                              variant="outline" 
                              className={request.requestType === "cancel" ? "border-red-300 text-red-600" : "border-orange-300 text-orange-600"}
                            >
                              {request.requestType === "cancel" ? "Cancel" : "Reschedule"}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={(request as any).requesterType === "tutor" ? "bg-purple-100 text-purple-700 border-purple-300" : "bg-green-100 text-green-700 border-green-300"}
                            >
                              {(request as any).requesterType === "tutor" ? "Tutor" : "Parent"}
                            </Badge>
                            <span className="font-medium">
                              {request.sessionOccurrence?.student?.name || "Student"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              by {(request as any).requesterType === "tutor" 
                                ? ((request as any).tutor ? `${(request as any).tutor.firstName} ${(request as any).tutor.lastName}` : "Tutor")
                                : (request.parent ? `${request.parent.firstName} ${request.parent.lastName}` : "Parent")}
                            </span>
                            <span className="text-muted-foreground">
                              - {request.sessionOccurrence?.startDateTime 
                                ? format(new Date(request.sessionOccurrence.startDateTime), "EEE, MMM d 'at' h:mm a")
                                : "Unknown date"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissedChangeRequestAlertIds(new Set([...dismissedChangeRequestAlertIds, request.id]));
                              }}
                              data-testid={`dismiss-change-request-${request.id}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {pendingRequests.length > 3 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            + {pendingRequests.length - 3} more request{pendingRequests.length - 3 === 1 ? '' : 's'}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        onClick={() => {
                          setActiveTab("calendar");
                          setTimeout(() => {
                            document.querySelector('[data-testid="tab-calendar"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }}
                        data-testid="button-view-change-requests"
                      >
                        View All Requests
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const pendingIds = pendingRequests.map(r => r.id);
                        setDismissedChangeRequestAlertIds(new Set([...dismissedChangeRequestAlertIds, ...pendingIds]));
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      data-testid="button-dismiss-change-request-alerts"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
        <Card data-testid="card-yearly-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Revenue ({stats?.fiscalYearLabel || 'FY'})</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Booked:</span>
                    <span className="text-lg font-bold text-foreground" data-testid="text-booked-revenue">
                      £{(stats?.bookedRevenue || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Paid:</span>
                    <span className="text-lg font-bold text-chart-2" data-testid="text-paid-revenue">
                      £{(stats?.paidRevenue || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-students-admin">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Students</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-students-admin">
                  {stats?.activeStudents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-tutors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Tutors</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-tutors">
                  {stats?.activeTutors || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-1/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-low-balance-alerts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Low Balance Alerts</p>
                <p className="text-2xl font-bold text-destructive" data-testid="text-low-balance-alerts">
                  {stats?.lowBalanceAlerts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-weekly-outgoings">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Weekly Outgoings</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-weekly-outgoings">
                  £{(stats?.weeklyOutgoings || 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <HandHeart className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-yearly-expenditure">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Expenditure ({stats?.fiscalYearLabel || 'FY'})</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Booked:</span>
                    <span className="text-lg font-bold text-foreground" data-testid="text-booked-expenditure">
                      £{(stats?.bookedExpenditure || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Paid:</span>
                    <span className="text-lg font-bold text-red-500" data-testid="text-paid-expenditure">
                      £{(stats?.paidExpenditure || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-income">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Monthly Income</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-income">
                  £{(stats?.monthlyIncome || 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <PieChart className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-expenditure">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Monthly Expenditure</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-monthly-expenditure">
                  £{(stats?.monthlyExpenditure || 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
        )}

        {/* Admin Tabs */}
        <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Students & Sessions Tab */}
          <TabsContent value="students" className="p-4 sm:p-6">
            {/* Student Distribution Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Students Per Tutor Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Students Per Tutor
                  </CardTitle>
                  <CardDescription>Active student allocations by tutor</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.studentsPerTutor && stats.studentsPerTutor.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {stats.studentsPerTutor.map((item) => (
                        <div key={item.tutorId} className="flex items-center justify-between py-1 border-b border-border last:border-0" data-testid={`tutor-count-${item.tutorId}`}>
                          <span className="text-sm font-medium truncate max-w-[70%]">{item.tutorName}</span>
                          <Badge variant="secondary" className="ml-2">{item.studentCount} student{item.studentCount !== 1 ? 's' : ''}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tutor allocations found</p>
                  )}
                </CardContent>
              </Card>

              {/* Students Per Subject Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Students Per Subject
                  </CardTitle>
                  <CardDescription>Active student count by subject area</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.studentsPerSubject && stats.studentsPerSubject.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {stats.studentsPerSubject.map((item) => (
                        <div key={item.subject} className="flex items-center justify-between py-1 border-b border-border last:border-0" data-testid={`subject-count-${item.subject}`}>
                          <span className="text-sm font-medium truncate max-w-[70%]">{item.subject}</span>
                          <Badge variant="outline" className="ml-2">{item.studentCount} student{item.studentCount !== 1 ? 's' : ''}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Students & Session Management</h3>
              <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-student">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <Form {...studentForm}>
                    <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-4">
                      <FormField
                        control={studentForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-student-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent First Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-parent-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="parentSurname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Surname</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-parent-surname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Optional" data-testid="input-parent-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-parent-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Parent Account Section */}
                      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                        <div>
                          <Label className="text-sm font-medium">Parent Portal Account</Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Create or link a parent login account for the parent portal
                          </p>
                          <Select 
                            value={parentAccountMode} 
                            onValueChange={(v: "none" | "existing" | "new") => {
                              setParentAccountMode(v);
                              setSelectedParentUserId("");
                              setNewParentPassword("");
                            }}
                          >
                            <SelectTrigger data-testid="select-parent-account-mode">
                              <SelectValue placeholder="Select option..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No parent account</SelectItem>
                              <SelectItem value="existing">Link to existing parent</SelectItem>
                              <SelectItem value="new">Create new parent account</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {parentAccountMode === "existing" && (
                          <div>
                            <Label>Select Existing Parent</Label>
                            <Select value={selectedParentUserId} onValueChange={setSelectedParentUserId}>
                              <SelectTrigger data-testid="select-existing-parent">
                                <SelectValue placeholder="Select a parent..." />
                              </SelectTrigger>
                              <SelectContent>
                                {parentUsers.length === 0 ? (
                                  <SelectItem value="no-parents" disabled>No parent accounts found</SelectItem>
                                ) : (
                                  parentUsers.map((parent) => (
                                    <SelectItem key={parent.id} value={parent.id}>
                                      {parent.firstName && parent.lastName
                                        ? `${parent.firstName} ${parent.lastName}`
                                        : parent.email} ({parent.email})
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {parentAccountMode === "new" && (
                          <div>
                            <Label>Parent Account Password</Label>
                            <Input
                              type="password"
                              placeholder="Min 6 characters"
                              value={newParentPassword}
                              onChange={(e) => setNewParentPassword(e.target.value)}
                              data-testid="input-new-parent-password"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              A parent account will be created using the parent name and email above
                            </p>
                          </div>
                        )}
                      </div>

                      <FormField
                        control={studentForm.control}
                        name="classType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-class-type">
                                  <SelectValue placeholder="Select class type..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="individual">Individual (1-on-1)</SelectItem>
                                <SelectItem value="group">Group Class</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="sessionsBooked"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sessions Booked</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-sessions-booked">
                                  <SelectValue placeholder="Select sessions..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 Session</SelectItem>
                                <SelectItem value="4">4 Sessions</SelectItem>
                                <SelectItem value="6">6 Sessions</SelectItem>
                                <SelectItem value="12">12 Sessions</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Sessions remaining will be set to this value</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Invoice Settings Section */}
                      <div className="border rounded-lg p-4 space-y-4 bg-blue-50/30 dark:bg-blue-950/20">
                        <div>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            Invoice Settings
                          </Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Configure billing and invoice preferences for this student
                          </p>
                        </div>

                        <FormField
                          control={studentForm.control}
                          name="parentRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent Rate (£/hr) *</FormLabel>
                              <Select 
                                onValueChange={(v) => field.onChange(parseFloat(v))} 
                                value={field.value > 0 ? field.value.toString() : ""}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-student-parent-rate">
                                    <SelectValue placeholder="Select rate...">
                                      {field.value > 0 ? `£${field.value.toFixed(2)}/hr` : "Select rate..."}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {parentRatesData.filter((r: ParentRate) => r.isActive).map((rate: ParentRate) => (
                                    <SelectItem key={rate.id} value={parseFloat(rate.rate).toString()}>
                                      £{parseFloat(rate.rate).toFixed(2)} - {rate.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                This rate will be used for invoicing and pulled through to allocations
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="sendInitialInvoice"
                              checked={sendInitialInvoice}
                              onCheckedChange={(checked) => {
                                setSendInitialInvoice(!!checked);
                                if (!checked) setInvoiceSendDate("");
                              }}
                              data-testid="checkbox-send-initial-invoice"
                            />
                            <div>
                              <Label htmlFor="sendInitialInvoice" className="text-sm font-medium cursor-pointer">
                                Send Initial Invoice
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Create an invoice for the initial session pack
                              </p>
                            </div>
                          </div>
                          
                          {sendInitialInvoice && (
                            <div className="ml-6 space-y-2">
                              <Label htmlFor="invoiceSendDate" className="text-sm font-medium">
                                Invoice Send Date
                              </Label>
                              <Input
                                id="invoiceSendDate"
                                type="date"
                                value={invoiceSendDate}
                                onChange={(e) => setInvoiceSendDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                data-testid="input-invoice-send-date"
                              />
                              <p className="text-xs text-muted-foreground">
                                {invoiceSendDate 
                                  ? `Invoice will be scheduled to send on ${new Date(invoiceSendDate).toLocaleDateString()}. Student can have lessons before this date.`
                                  : "Leave empty to send immediately, or select a future date to schedule the invoice."}
                              </p>
                            </div>
                          )}
                        </div>

                        <FormField
                          control={studentForm.control}
                          name="autoInvoiceEnabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-auto-invoice"
                                />
                              </FormControl>
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium cursor-pointer">
                                  Enable Recurring Invoices
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Automatically create an invoice when sessions reach 0
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        {studentForm.watch("autoInvoiceEnabled") && (
                          <>
                            <FormField
                              control={studentForm.control}
                              name="defaultSessionPack"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Default Session Pack</FormLabel>
                                  <Select 
                                    onValueChange={(v) => field.onChange(parseInt(v))} 
                                    value={field.value?.toString() || "4"}
                                  >
                                    <FormControl>
                                      <SelectTrigger data-testid="select-default-session-pack">
                                        <SelectValue placeholder="Select sessions..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">1 Session</SelectItem>
                                      <SelectItem value="4">4 Sessions</SelectItem>
                                      <SelectItem value="6">6 Sessions</SelectItem>
                                      <SelectItem value="12">12 Sessions</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    Number of sessions to include in auto-generated invoices
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="space-y-2">
                              <Label htmlFor="recurringInvoiceSendDate" className="text-sm font-medium">
                                First Recurring Invoice Send Date
                              </Label>
                              <Input
                                id="recurringInvoiceSendDate"
                                type="date"
                                value={recurringInvoiceSendDate}
                                onChange={(e) => setRecurringInvoiceSendDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                data-testid="input-recurring-invoice-send-date"
                              />
                              <p className="text-xs text-muted-foreground">
                                {recurringInvoiceSendDate 
                                  ? `The first recurring invoice will be scheduled to send on ${new Date(recurringInvoiceSendDate).toLocaleDateString()}. Student can continue lessons before this date.`
                                  : "Leave empty to send immediately when sessions run out, or select a date to schedule the first recurring invoice."}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <FormField
                        control={studentForm.control}
                        name="startYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Started</FormLabel>
                            <FormControl>
                              <Input type="number" min="2000" max="2100" placeholder="e.g. 2024" {...field} value={field.value ?? ""} data-testid="input-start-year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={studentForm.control}
                          name="examMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exam Month</FormLabel>
                              <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString() ?? ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-exam-month">
                                    <SelectValue placeholder="Select month..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {monthNames.map((month, index) => (
                                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                                      {month}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={studentForm.control}
                          name="examYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exam Year</FormLabel>
                              <FormControl>
                                <Input type="number" min="2000" max="2100" placeholder="e.g. 2025" {...field} value={field.value ?? ""} data-testid="input-exam-year" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={studentForm.control}
                        name="subjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjects</FormLabel>
                            <div className="grid grid-cols-2 gap-2" data-testid="subject-multi-select">
                              {SUBJECT_OPTIONS.map((subject) => (
                                <div key={subject} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`subject-${subject}`}
                                    data-testid={`checkbox-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                                    checked={field.value?.includes(subject)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, subject]);
                                      } else {
                                        field.onChange(current.filter((s: string) => s !== subject));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`subject-${subject}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {subject}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="examType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-exam-type">
                                  <SelectValue placeholder="Select exam type..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="11+">11+</SelectItem>
                                <SelectItem value="13+">13+</SelectItem>
                                <SelectItem value="GCSE">GCSE</SelectItem>
                                <SelectItem value="A-Level">A-Level</SelectItem>
                                <SelectItem value="SATs">SATs</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="examBoard"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Board</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. AQA, Edexcel, OCR" {...field} value={field.value ?? ""} data-testid="input-exam-board" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="targetSchools"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Schools</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Eton, Westminster, St Paul's" {...field} value={field.value ?? ""} data-testid="input-target-schools" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="primarySchool"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current School</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter current school" {...field} value={field.value ?? ""} data-testid="input-primary-school" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Regular Session Schedule Section - Multiple Sessions */}
                      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Regular Session Schedule</Label>
                            <p className="text-xs text-muted-foreground">
                              Set weekly recurring lesson times (appears on calendar)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewStudentSessions([...newStudentSessions, { dayOfWeek: undefined, startTime: "", durationMinutes: 60, tutorId: undefined }])}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Session
                          </Button>
                        </div>
                        {newStudentSessions.map((session, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2 items-end">
                            <div>
                              <Label className="text-xs">Day</Label>
                              <Select 
                                onValueChange={(v) => {
                                  const updated = [...newStudentSessions];
                                  updated[index].dayOfWeek = v ? parseInt(v) : undefined;
                                  setNewStudentSessions(updated);
                                }} 
                                value={session.dayOfWeek !== undefined ? session.dayOfWeek.toString() : ""}
                              >
                                <SelectTrigger data-testid={`select-session-day-${index}`}>
                                  <SelectValue placeholder="Day..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {dayOfWeekOptions.map((day) => (
                                    <SelectItem key={day.value} value={day.value}>
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Time</Label>
                              <Input 
                                type="time" 
                                value={session.startTime}
                                onChange={(e) => {
                                  const updated = [...newStudentSessions];
                                  updated[index].startTime = e.target.value;
                                  setNewStudentSessions(updated);
                                }}
                                data-testid={`input-session-time-${index}`}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Duration</Label>
                              <Select 
                                onValueChange={(v) => {
                                  const updated = [...newStudentSessions];
                                  updated[index].durationMinutes = parseInt(v);
                                  setNewStudentSessions(updated);
                                }} 
                                value={session.durationMinutes.toString()}
                              >
                                <SelectTrigger data-testid={`select-session-duration-${index}`}>
                                  <SelectValue placeholder="Duration..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {durationOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Tutor</Label>
                              <Select 
                                onValueChange={(v) => {
                                  const updated = [...newStudentSessions];
                                  updated[index].tutorId = v || undefined;
                                  setNewStudentSessions(updated);
                                }} 
                                value={session.tutorId || ""}
                              >
                                <SelectTrigger data-testid={`select-session-tutor-${index}`}>
                                  <SelectValue placeholder="Tutor..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {allTutors?.filter(t => t.isActive !== false && t.role === "tutor").map((tutor) => (
                                    <SelectItem key={tutor.id} value={tutor.id}>
                                      {tutor.firstName} {tutor.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              {newStudentSessions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = newStudentSessions.filter((_, i) => i !== index);
                                    setNewStudentSessions(updated);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createStudentMutation.isPending}
                        data-testid="button-save-student"
                      >
                        {createStudentMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Creating...
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Create Student
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-auto mobile-scroll">
              <Table className="min-w-[800px]" wrapperClassName="overflow-visible">
                <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
                  <TableRow>
                    <TableHead className="w-10 bg-background"></TableHead>
                    <TableHead className="bg-background">Student Name</TableHead>
                    <TableHead className="bg-background">Parent First Name</TableHead>
                    <TableHead className="bg-background">Parent Surname</TableHead>
                    <TableHead className="bg-background">Tutor</TableHead>
                    <TableHead className="bg-background">Session Schedule</TableHead>
                    <TableHead className="text-center bg-background">Sessions Remaining</TableHead>
                    <TableHead className="text-center bg-background">Outstanding Invoices</TableHead>
                    <TableHead className="text-center text-green-600 bg-background">Paid</TableHead>
                    <TableHead className="text-center text-red-600 bg-background">Awaiting Invoice</TableHead>
                    <TableHead className="text-center bg-background">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No students found. Add your first student to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => {
                      const isExpanded = expandedStudents.has(student.id);
                      const parentFirstName = student.parentName || "-";
                      const parentSurname = (student as any).parentSurname || "-";
                      
                      return (
                        <Fragment key={student.id}>
                          <TableRow 
                            data-testid={`row-student-${student.id}`}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleStudentExpand(student.id)}
                          >
                            <TableCell className="w-10">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStudentExpand(student.id);
                                }}
                                data-testid={`button-expand-student-${student.id}`}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {parentFirstName}
                                {!student.parentUserId && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center">
                                        <UserX className="h-3 w-3 text-amber-500" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>No parent account linked</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{parentSurname}</TableCell>
                            <TableCell>
                              {student.assignedTutors && student.assignedTutors.length > 0
                                ? student.assignedTutors.map((at, idx) => {
                                    const name = at.tutor?.firstName && at.tutor?.lastName
                                      ? `${at.tutor.firstName} ${at.tutor.lastName}`
                                      : at.tutor?.email || "-";
                                    return idx > 0 ? `, ${name}` : name;
                                  }).join("")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const schedules = studentSessionScheduleMap.get(student.id);
                                if (!schedules || schedules.length === 0) return <span className="text-muted-foreground text-xs">-</span>;
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {schedules.map((s, i) => (
                                      <Badge 
                                        key={i} 
                                        variant="outline" 
                                        className={`text-xs ${s.isGroup 
                                          ? "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800" 
                                          : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"}`}
                                      >
                                        {s.label}: {formatDayOfWeek(s.dayOfWeek)} {s.startTime}
                                      </Badge>
                                    ))}
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-center">
                              {(() => {
                                const summary = invoiceSummaryMap.get(student.id);
                                const hasPendingInvoice = summary?.hasPendingInvoice || false;
                                
                                if (student.sessionsRemaining <= 0) {
                                  if (hasPendingInvoice) {
                                    return (
                                      <Badge className="font-medium bg-amber-500 hover:bg-amber-600 text-white">
                                        Invoice Sent
                                      </Badge>
                                    );
                                  } else {
                                    return (
                                      <Badge variant="destructive" className="font-medium">
                                        Send Invoice
                                      </Badge>
                                    );
                                  }
                                } else {
                                  return (
                                    <Badge
                                      variant={student.sessionsRemaining === 1 ? "secondary" : "default"}
                                      className="font-medium"
                                    >
                                      {student.sessionsRemaining}
                                      {student.sessionsRemaining === 1 && (
                                        <AlertTriangle className="w-3 h-3 ml-1" />
                                      )}
                                    </Badge>
                                  );
                                }
                              })()}
                            </TableCell>
                            <TableCell className="text-center">
                              {(() => {
                                const summary = invoiceSummaryMap.get(student.id);
                                const count = summary?.outstandingInvoices || 0;
                                return count > 0 ? (
                                  <Badge variant="destructive" className="font-medium" data-testid={`badge-outstanding-invoices-${student.id}`}>
                                    {count} <AlertTriangle className="w-3 h-3 ml-1" />
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="font-medium text-green-600" data-testid={`badge-no-outstanding-invoices-${student.id}`}>
                                    0
                                  </Badge>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-center">
                              {(() => {
                                const summary = invoiceSummaryMap.get(student.id);
                                const count = summary?.paidSessionsDelivered || 0;
                                return count > 0 ? (
                                  <Badge variant="outline" className="font-medium text-green-600 border-green-300" data-testid={`badge-paid-sessions-${student.id}`}>
                                    {count}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground" data-testid={`text-no-paid-sessions-${student.id}`}>0</span>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-center">
                              {(() => {
                                const summary = invoiceSummaryMap.get(student.id);
                                const count = summary?.awaitingInvoice || 0;
                                return count > 0 ? (
                                  <Badge variant="destructive" className="font-medium" data-testid={`badge-awaiting-invoice-${student.id}`}>
                                    {count}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground" data-testid={`text-no-awaiting-invoice-${student.id}`}>0</span>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => openEditDialog(student)}
                                  data-testid={`button-edit-student-${student.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => archiveStudentMutation.mutate(student.id)}
                                  disabled={archiveStudentMutation.isPending}
                                  data-testid={`button-archive-student-${student.id}`}
                                  title="Archive student"
                                >
                                  <Archive className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow key={`${student.id}-details`} className="bg-muted/30">
                              <TableCell colSpan={9} className="py-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-muted-foreground">Subjects:</span>
                                    <p className="mt-1">{((student as any).subjects || []).join(", ") || "-"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Exam Type:</span>
                                    <p className="mt-1">{(student as any).examType || "-"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Class Type:</span>
                                    <p className="mt-1 capitalize">{student.classType}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Parent Email:</span>
                                    <p className="mt-1">{student.parentEmail || "-"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Parent Phone:</span>
                                    <p className="mt-1">{student.parentPhone || "-"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Sessions Booked:</span>
                                    <p className="mt-1">{student.sessionsBooked}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Tutor Rate:</span>
                                    <p className="mt-1">£{parseFloat(student.tutorRate.toString()).toFixed(2)}/hr</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Year Started:</span>
                                    <p className="mt-1">{student.startYear || "-"}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-muted-foreground">Exam Date:</span>
                                    <p className="mt-1">
                                      {student.examMonth && student.examYear
                                        ? `${monthNames[student.examMonth - 1]} ${student.examYear}`
                                        : "-"}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openTopicsDialog(student);
                                    }}
                                    data-testid={`button-manage-topics-${student.id}`}
                                  >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Manage Topics
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Topics Management Dialog */}
            <Dialog open={isTopicsDialogOpen} onOpenChange={setIsTopicsDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Topics for {selectedStudentForTopics?.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Add Topics Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Add New Topics</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter one topic per line. New topics will be added to the existing list.
                    </p>
                    <Textarea
                      placeholder="Topic 1&#10;Topic 2&#10;Topic 3..."
                      value={bulkTopicsText}
                      onChange={(e) => setBulkTopicsText(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="textarea-bulk-topics"
                    />
                    <Button
                      onClick={handleAddTopics}
                      disabled={!bulkTopicsText.trim() || addTopicsMutation.isPending}
                      data-testid="button-add-topics"
                    >
                      {addTopicsMutation.isPending ? "Adding..." : "Add Topics"}
                    </Button>
                  </div>

                  {/* Existing Topics List */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">
                      Existing Topics ({studentTopics.length})
                    </h4>
                    {topicsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : studentTopics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No topics added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentTopics.map((topic, index) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                            data-testid={`topic-item-${topic.id}`}
                          >
                            <span className="text-muted-foreground text-sm w-6">
                              {index + 1}.
                            </span>
                            {editingTopicId === topic.id ? (
                              <>
                                <Input
                                  value={editingTopicTitle}
                                  onChange={(e) => setEditingTopicTitle(e.target.value)}
                                  className="flex-1"
                                  data-testid={`input-edit-topic-${topic.id}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => updateTopicMutation.mutate({ topicId: topic.id, title: editingTopicTitle })}
                                  disabled={updateTopicMutation.isPending}
                                  data-testid={`button-save-topic-${topic.id}`}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTopicId(null);
                                    setEditingTopicTitle("");
                                  }}
                                  data-testid={`button-cancel-topic-${topic.id}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="flex-1">{topic.title}</span>
                                {topic.isCovered && (
                                  <Badge variant="default" className="flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Covered
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTopicId(topic.id);
                                    setEditingTopicTitle(topic.title);
                                  }}
                                  data-testid={`button-edit-topic-${topic.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Student Name</label>
                      <Input
                        value={editStudentData.name}
                        onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})}
                        data-testid="input-edit-student-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subjects</label>
                      <div className="grid grid-cols-2 gap-2 mt-2" data-testid="edit-subject-multi-select">
                        {SUBJECT_OPTIONS.map((subj) => (
                          <div key={subj} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-subject-${subj}`}
                              data-testid={`checkbox-edit-subject-${subj.replace(/\s+/g, '-').toLowerCase()}`}
                              checked={(editStudentData.subjects as string[])?.includes(subj)}
                              onCheckedChange={(checked) => {
                                const current = (editStudentData.subjects as string[]) || [];
                                if (checked) {
                                  setEditStudentData({...editStudentData, subjects: [...current, subj]});
                                } else {
                                  setEditStudentData({...editStudentData, subjects: current.filter(s => s !== subj)});
                                }
                              }}
                            />
                            <label htmlFor={`edit-subject-${subj}`} className="text-sm">{subj}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Exam Type</label>
                      <Select 
                        value={editStudentData.examType || ""} 
                        onValueChange={(value) => setEditStudentData({...editStudentData, examType: value})}
                      >
                        <SelectTrigger data-testid="select-edit-exam-type">
                          <SelectValue placeholder="Select exam type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11+">11+</SelectItem>
                          <SelectItem value="13+">13+</SelectItem>
                          <SelectItem value="GCSE">GCSE</SelectItem>
                          <SelectItem value="A-Level">A-Level</SelectItem>
                          <SelectItem value="SATs">SATs</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Parent First Name</label>
                      <Input
                        value={editStudentData.parentName}
                        onChange={(e) => setEditStudentData({...editStudentData, parentName: e.target.value})}
                        data-testid="input-edit-parent-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Parent Surname</label>
                      <Input
                        value={editStudentData.parentSurname}
                        onChange={(e) => setEditStudentData({...editStudentData, parentSurname: e.target.value})}
                        data-testid="input-edit-parent-surname"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Parent Email</label>
                      <Input
                        type="email"
                        value={editStudentData.parentEmail}
                        onChange={(e) => setEditStudentData({...editStudentData, parentEmail: e.target.value})}
                        data-testid="input-edit-parent-email"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Parent Phone</label>
                      <Input
                        value={editStudentData.parentPhone}
                        onChange={(e) => setEditStudentData({...editStudentData, parentPhone: e.target.value})}
                        data-testid="input-edit-parent-phone"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Class Type</label>
                      <Select 
                        value={editStudentData.classType} 
                        onValueChange={(value: "individual" | "group") => setEditStudentData({...editStudentData, classType: value})}
                      >
                        <SelectTrigger data-testid="select-edit-class-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Sessions Booked</label>
                      <Select 
                        value={editStudentData.sessionsBooked.toString()} 
                        onValueChange={(value) => setEditStudentData({...editStudentData, sessionsBooked: parseInt(value)})}
                      >
                        <SelectTrigger data-testid="select-edit-sessions-booked">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Session</SelectItem>
                          <SelectItem value="4">4 Sessions</SelectItem>
                          <SelectItem value="6">6 Sessions</SelectItem>
                          <SelectItem value="12">12 Sessions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Sessions Remaining</label>
                      <Input
                        type="number"
                        min="0"
                        value={editStudentData.sessionsRemaining}
                        onChange={(e) => setEditStudentData({...editStudentData, sessionsRemaining: parseInt(e.target.value) || 0})}
                        data-testid="input-edit-sessions-remaining"
                      />
                    </div>
                  </div>

                  {/* Invoice Settings Section */}
                  <div className="border rounded-lg p-4 space-y-4 bg-blue-50/30 dark:bg-blue-950/20">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Invoice Settings
                      </Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Configure billing and invoice preferences for this student
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Parent Rate (£/hr) *</label>
                      <Select 
                        value={editStudentData.parentRate > 0 ? editStudentData.parentRate.toString() : ""} 
                        onValueChange={(v) => setEditStudentData({...editStudentData, parentRate: parseFloat(v)})}
                      >
                        <SelectTrigger data-testid="select-edit-student-parent-rate">
                          <SelectValue placeholder="Select rate...">
                            {editStudentData.parentRate > 0 ? `£${editStudentData.parentRate.toFixed(2)}/hr` : "Select rate..."}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {parentRatesData.filter((r: ParentRate) => r.isActive).map((rate: ParentRate) => (
                            <SelectItem key={rate.id} value={parseFloat(rate.rate).toString()}>
                              £{parseFloat(rate.rate).toFixed(2)} - {rate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        This rate will be used for invoicing and pulled through to allocations
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="editAutoInvoice"
                        checked={editStudentData.autoInvoiceEnabled}
                        onCheckedChange={(checked) => setEditStudentData({...editStudentData, autoInvoiceEnabled: !!checked})}
                        data-testid="checkbox-edit-auto-invoice"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="editAutoInvoice" className="text-sm font-medium cursor-pointer">
                          Enable Recurring Invoices
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically create an invoice when sessions reach 0
                        </p>
                      </div>
                    </div>

                    {editStudentData.autoInvoiceEnabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Default Session Pack</label>
                          <Select 
                            value={(editStudentData.defaultSessionPack || 4).toString()} 
                            onValueChange={(v) => setEditStudentData({...editStudentData, defaultSessionPack: parseInt(v)})}
                          >
                            <SelectTrigger data-testid="select-edit-default-session-pack">
                              <SelectValue placeholder="Select sessions..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Session</SelectItem>
                              <SelectItem value="4">4 Sessions</SelectItem>
                              <SelectItem value="6">6 Sessions</SelectItem>
                              <SelectItem value="12">12 Sessions</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Number of sessions to include in auto-generated invoices
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="editRecurringInvoiceSendDate" className="text-sm font-medium">
                            Recurring Invoice Send Date
                          </Label>
                          <Input
                            id="editRecurringInvoiceSendDate"
                            type="date"
                            value={editStudentData.recurringInvoiceSendDate}
                            onChange={(e) => setEditStudentData({...editStudentData, recurringInvoiceSendDate: e.target.value})}
                            className="mt-1"
                            data-testid="input-edit-recurring-invoice-send-date"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {editStudentData.recurringInvoiceSendDate 
                              ? `Invoice scheduled for ${new Date(editStudentData.recurringInvoiceSendDate).toLocaleDateString()}`
                              : "Leave empty to send immediately when sessions run out"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Year Started</label>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="e.g. 2024"
                        value={editStudentData.startYear ?? ""}
                        onChange={(e) => setEditStudentData({...editStudentData, startYear: e.target.value ? parseInt(e.target.value) : undefined})}
                        data-testid="input-edit-start-year"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Year Finished</label>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="e.g. 2025"
                        value={editStudentData.endYear ?? ""}
                        onChange={(e) => setEditStudentData({...editStudentData, endYear: e.target.value ? parseInt(e.target.value) : undefined})}
                        data-testid="input-edit-end-year"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Exam Month</label>
                      <Select 
                        value={editStudentData.examMonth?.toString() ?? ""} 
                        onValueChange={(value) => setEditStudentData({...editStudentData, examMonth: value ? parseInt(value) : undefined})}
                      >
                        <SelectTrigger data-testid="select-edit-exam-month">
                          <SelectValue placeholder="Select month..." />
                        </SelectTrigger>
                        <SelectContent>
                          {monthNames.map((month, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Exam Year</label>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="e.g. 2025"
                        value={editStudentData.examYear ?? ""}
                        onChange={(e) => setEditStudentData({...editStudentData, examYear: e.target.value ? parseInt(e.target.value) : undefined})}
                        data-testid="input-edit-exam-year"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Exam Board</label>
                      <Input
                        placeholder="e.g. AQA, Edexcel, OCR"
                        value={editStudentData.examBoard}
                        onChange={(e) => setEditStudentData({...editStudentData, examBoard: e.target.value})}
                        data-testid="input-edit-exam-board"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target Schools</label>
                      <Input
                        placeholder="e.g. Eton, Westminster"
                        value={editStudentData.targetSchools}
                        onChange={(e) => setEditStudentData({...editStudentData, targetSchools: e.target.value})}
                        data-testid="input-edit-target-schools"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current School</label>
                    <Input
                      placeholder="Enter current school"
                      value={editStudentData.primarySchool}
                      onChange={(e) => setEditStudentData({...editStudentData, primarySchool: e.target.value})}
                      data-testid="input-edit-primary-school"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 border rounded-md text-sm"
                      placeholder="Add notes about this student..."
                      value={editStudentData.parentContactInfo}
                      onChange={(e) => setEditStudentData({...editStudentData, parentContactInfo: e.target.value})}
                      data-testid="input-edit-notes"
                    />
                  </div>
                  
                  {/* Regular Session Scheduling - Multiple Sessions */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm">Regular Session Schedule</h4>
                        <p className="text-xs text-muted-foreground">
                          Set weekly recurring lesson times
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditStudentSessions([...editStudentSessions, { dayOfWeek: undefined, startTime: "", durationMinutes: 60, tutorId: undefined }])}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Session
                      </Button>
                    </div>
                    {editStudentSessions.map((session, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-end mb-3">
                        <div>
                          <label className="text-xs font-medium">Day</label>
                          <Select 
                            value={session.dayOfWeek !== undefined ? session.dayOfWeek.toString() : ""} 
                            onValueChange={(value) => {
                              const updated = [...editStudentSessions];
                              updated[index].dayOfWeek = value ? parseInt(value) : undefined;
                              setEditStudentSessions(updated);
                            }}
                          >
                            <SelectTrigger data-testid={`select-edit-session-day-${index}`}>
                              <SelectValue placeholder="Day..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                              <SelectItem value="0">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium">Time</label>
                          <Input
                            type="time"
                            value={session.startTime}
                            onChange={(e) => {
                              const updated = [...editStudentSessions];
                              updated[index].startTime = e.target.value;
                              setEditStudentSessions(updated);
                            }}
                            data-testid={`input-edit-session-time-${index}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium">Duration</label>
                          <Select 
                            value={session.durationMinutes.toString()} 
                            onValueChange={(value) => {
                              const updated = [...editStudentSessions];
                              updated[index].durationMinutes = parseInt(value);
                              setEditStudentSessions(updated);
                            }}
                          >
                            <SelectTrigger data-testid={`select-edit-session-duration-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 mins</SelectItem>
                              <SelectItem value="45">45 mins</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="90">1.5 hours</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium">Tutor</label>
                          <Select 
                            value={session.tutorId || ""} 
                            onValueChange={(value) => {
                              const updated = [...editStudentSessions];
                              updated[index].tutorId = value || undefined;
                              setEditStudentSessions(updated);
                            }}
                          >
                            <SelectTrigger data-testid={`select-edit-session-tutor-${index}`}>
                              <SelectValue placeholder="Tutor..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allTutors?.filter(t => t.isActive !== false && t.role === "tutor").map((tutor) => (
                                <SelectItem key={tutor.id} value={tutor.id}>
                                  {tutor.firstName} {tutor.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          {editStudentSessions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = editStudentSessions.filter((_, i) => i !== index);
                                setEditStudentSessions(updated);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleSaveStudent}
                    className="w-full"
                    disabled={updateStudentMutation.isPending}
                    data-testid="button-save-student-edit"
                  >
                    {updateStudentMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist" className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Waitlist Management</h3>
              <Dialog open={isAddWaitlistOpen} onOpenChange={setIsAddWaitlistOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-waitlist">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Waitlist Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Waitlist Entry</DialogTitle>
                  </DialogHeader>
                  <Form {...waitlistForm}>
                    <form onSubmit={waitlistForm.handleSubmit((data) => createWaitlistMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={waitlistForm.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Name *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-waitlist-student-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="parentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-waitlist-parent-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="parentEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="Optional" data-testid="input-waitlist-parent-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="parentPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" data-testid="input-waitlist-parent-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="subjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjects</FormLabel>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(field.value || []).map((subj: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                  {subj}
                                  <X 
                                    className="h-3 w-3 cursor-pointer" 
                                    onClick={() => field.onChange((field.value || []).filter((_: string, i: number) => i !== idx))}
                                  />
                                </Badge>
                              ))}
                            </div>
                            <Select
                              onValueChange={(val) => {
                                if (val && !(field.value || []).includes(val)) {
                                  field.onChange([...(field.value || []), val]);
                                }
                              }}
                              value=""
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-waitlist-subjects">
                                  <SelectValue placeholder="Add a subject..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="11+ Maths">11+ Maths</SelectItem>
                                <SelectItem value="Verbal Reasoning">Verbal Reasoning</SelectItem>
                                <SelectItem value="Non-Verbal Reasoning">Non-Verbal Reasoning</SelectItem>
                                <SelectItem value="11+ English">11+ English</SelectItem>
                                <SelectItem value="GCSE Maths">GCSE Maths</SelectItem>
                                <SelectItem value="GCSE English">GCSE English</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="sessionTypePreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Type Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "no_preference"}>
                              <FormControl>
                                <SelectTrigger data-testid="select-waitlist-session-type">
                                  <SelectValue placeholder="Select preference..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="in_person_group">In Person Group</SelectItem>
                                <SelectItem value="online_1_1">Online 1:1</SelectItem>
                                <SelectItem value="no_preference">No Preference</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Optional notes about this prospect" data-testid="input-waitlist-notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={waitlistForm.control}
                          name="depositPaid"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-waitlist-deposit-paid"
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Deposit Paid</FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={waitlistForm.control}
                          name="depositAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Amount</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00"
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? e.target.value : undefined)}
                                  data-testid="input-waitlist-deposit-amount" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={waitlistForm.control}
                        name="sessionDurationMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Duration (minutes)</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)} 
                                value={field.value?.toString() || ""}
                              >
                                <SelectTrigger data-testid="select-waitlist-session-duration">
                                  <SelectValue placeholder="Select session length..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="45">45 minutes</SelectItem>
                                  <SelectItem value="60">1 hour</SelectItem>
                                  <SelectItem value="90">1.5 hours</SelectItem>
                                  <SelectItem value="120">2 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={waitlistForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-waitlist-status">
                                  <SelectValue placeholder="Select status..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Preferred Timings Section */}
                      <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Preferred Timings</Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setWaitlistPreferredTimings([
                              ...waitlistPreferredTimings, 
                              { dayOfWeek: 1, startTime: "15:00", endTime: "17:00", notes: "" }
                            ])}
                            data-testid="add-preferred-timing"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Timing
                          </Button>
                        </div>
                        
                        {waitlistPreferredTimings.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No preferred timings added yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {waitlistPreferredTimings.map((timing, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-3">
                                <div className="col-span-3">
                                  <Label className="text-xs">Day</Label>
                                  <Select
                                    value={String(timing.dayOfWeek)}
                                    onValueChange={(val) => {
                                      const updated = [...waitlistPreferredTimings];
                                      updated[index].dayOfWeek = parseInt(val);
                                      setWaitlistPreferredTimings(updated);
                                    }}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">Sunday</SelectItem>
                                      <SelectItem value="1">Monday</SelectItem>
                                      <SelectItem value="2">Tuesday</SelectItem>
                                      <SelectItem value="3">Wednesday</SelectItem>
                                      <SelectItem value="4">Thursday</SelectItem>
                                      <SelectItem value="5">Friday</SelectItem>
                                      <SelectItem value="6">Saturday</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">From</Label>
                                  <Input
                                    type="time"
                                    className="h-8"
                                    value={timing.startTime}
                                    onChange={(e) => {
                                      const updated = [...waitlistPreferredTimings];
                                      updated[index].startTime = e.target.value;
                                      setWaitlistPreferredTimings(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">To</Label>
                                  <Input
                                    type="time"
                                    className="h-8"
                                    value={timing.endTime}
                                    onChange={(e) => {
                                      const updated = [...waitlistPreferredTimings];
                                      updated[index].endTime = e.target.value;
                                      setWaitlistPreferredTimings(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-span-4">
                                  <Label className="text-xs">Notes</Label>
                                  <Input
                                    className="h-8"
                                    placeholder="e.g. after school"
                                    value={timing.notes}
                                    onChange={(e) => {
                                      const updated = [...waitlistPreferredTimings];
                                      updated[index].notes = e.target.value;
                                      setWaitlistPreferredTimings(updated);
                                    }}
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setWaitlistPreferredTimings(waitlistPreferredTimings.filter((_, i) => i !== index));
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createWaitlistMutation.isPending}
                        data-testid="button-save-waitlist"
                      >
                        {createWaitlistMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Creating...
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Create Entry
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto mobile-scroll">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Preferred Times</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : waitlistEntries.filter(e => e.status !== "converted").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No active waitlist entries found. Add your first prospective student to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitlistEntries.filter(e => e.status !== "converted").map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-waitlist-${entry.id}`}>
                        <TableCell className="font-medium">{entry.studentName}</TableCell>
                        <TableCell>{entry.parentName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {entry.parentEmail && (
                              <span className="flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" />
                                {entry.parentEmail}
                              </span>
                            )}
                            {entry.parentPhone && (
                              <span className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {entry.parentPhone}
                              </span>
                            )}
                            {!entry.parentEmail && !entry.parentPhone && "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.subjects && entry.subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {entry.subjects.map((subj, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {subj}
                                </Badge>
                              ))}
                            </div>
                          ) : entry.subject ? entry.subject : "-"}
                        </TableCell>
                        <TableCell>
                          {entry.createdAt ? (
                            <div className="flex flex-col">
                              <span className="text-sm">{format(new Date(entry.createdAt), "dd MMM yyyy")}</span>
                              <span className={`text-xs ${differenceInDays(new Date(), new Date(entry.createdAt)) > 14 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{getWaitlistStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          {(() => {
                            const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            const timings = entry.preferredTimings as Array<{dayOfWeek: number; startTime: string; endTime: string; notes?: string}> | null;
                            if (!timings || timings.length === 0) {
                              return <span className="text-muted-foreground">None</span>;
                            }
                            return (
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap gap-1">
                                  {timings.slice(0, 2).map((t, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {DAYS[t.dayOfWeek]} {t.startTime}
                                    </Badge>
                                  ))}
                                  {timings.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">+{timings.length - 2} more</Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="link"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => fetchMatchingTutors(entry.id)}
                                  data-testid={`button-find-tutors-${entry.id}`}
                                >
                                  <UserIcon className="w-3 h-3 mr-1" />
                                  Find Tutors
                                </Button>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={entry.notes || ""}>
                          {entry.notes || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            {entry.status !== "converted" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setConvertingWaitlist(entry);
                                  setConvertWaitlistData({
                                    tutorId: "",
                                    subject: entry.subject || "",
                                    examType: "",
                                    classType: "individual",
                                    parentRate: 0,
                                    tutorRate: 0,
                                    sessionsBooked: 1,
                                    startYear: new Date().getFullYear(),
                                    examMonth: undefined,
                                    examYear: undefined,
                                    parentAccountMode: "none",
                                    selectedParentUserId: "",
                                    newParentPassword: "",
                                  });
                                  setIsConvertWaitlistOpen(true);
                                }}
                                data-testid={`button-convert-waitlist-${entry.id}`}
                                title="Convert to Student"
                              >
                                <GraduationCap className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditWaitlistDialog(entry)}
                              data-testid={`button-edit-waitlist-${entry.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this waitlist entry?")) {
                                  deleteWaitlistMutation.mutate(entry.id);
                                }
                              }}
                              disabled={deleteWaitlistMutation.isPending}
                              data-testid={`button-delete-waitlist-${entry.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Matching Tutors Dialog */}
            <Dialog open={!!viewingMatchingTutors} onOpenChange={(open) => !open && setViewingMatchingTutors(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Matching Tutors
                  </DialogTitle>
                  <DialogDescription>
                    Tutors whose availability matches the preferred times for this student
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {matchingTutorsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : matchingTutorsData?.matches?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No matching tutors found for the preferred timings.</p>
                      <p className="text-sm">Try adjusting the preferred timings or check tutor availability.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        const matches = matchingTutorsData?.matches || [];
                        const groupedByTutor = matches.reduce((acc: any, match: any) => {
                          const tutorId = match.tutor.id;
                          if (!acc[tutorId]) {
                            acc[tutorId] = { tutor: match.tutor, slots: [], totalOverlap: 0 };
                          }
                          acc[tutorId].slots.push(match);
                          acc[tutorId].totalOverlap += match.overlapScore;
                          return acc;
                        }, {});

                        return Object.values(groupedByTutor)
                          .sort((a: any, b: any) => b.totalOverlap - a.totalOverlap)
                          .map((group: any) => (
                            <Card key={group.tutor.id}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-md flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    {group.tutor.firstName} {group.tutor.lastName}
                                  </span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {group.slots.map((match: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                      <div>
                                        <span className="font-medium">{DAYS[match.slot.dayOfWeek]}</span>
                                        <span className="text-muted-foreground ml-2">
                                          {match.slot.startTime} - {match.slot.endTime}
                                        </span>
                                        {match.slot.availabilityType === "seasonal" && (
                                          <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-800">
                                            Seasonal
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ));
                      })()}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewingMatchingTutors(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Waitlist Dialog */}
            <Dialog open={isEditWaitlistOpen} onOpenChange={setIsEditWaitlistOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Waitlist Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Student Name *</label>
                    <Input
                      value={editWaitlistData.studentName}
                      onChange={(e) => setEditWaitlistData({...editWaitlistData, studentName: e.target.value})}
                      data-testid="input-edit-waitlist-student-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Parent Name</label>
                    <Input
                      value={editWaitlistData.parentName}
                      onChange={(e) => setEditWaitlistData({...editWaitlistData, parentName: e.target.value})}
                      data-testid="input-edit-waitlist-parent-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Parent Email</label>
                    <Input
                      type="email"
                      value={editWaitlistData.parentEmail}
                      onChange={(e) => setEditWaitlistData({...editWaitlistData, parentEmail: e.target.value})}
                      data-testid="input-edit-waitlist-parent-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Parent Phone</label>
                    <Input
                      value={editWaitlistData.parentPhone}
                      onChange={(e) => setEditWaitlistData({...editWaitlistData, parentPhone: e.target.value})}
                      data-testid="input-edit-waitlist-parent-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subjects</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editWaitlistData.subjects || []).map((subj, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          {subj}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => setEditWaitlistData({
                              ...editWaitlistData, 
                              subjects: editWaitlistData.subjects.filter((_, i) => i !== idx)
                            })}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select
                      onValueChange={(val) => {
                        if (val && !editWaitlistData.subjects.includes(val)) {
                          setEditWaitlistData({
                            ...editWaitlistData,
                            subjects: [...editWaitlistData.subjects, val]
                          });
                        }
                      }}
                      value=""
                    >
                      <SelectTrigger data-testid="select-edit-waitlist-subjects">
                        <SelectValue placeholder="Add a subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11+ Maths">11+ Maths</SelectItem>
                        <SelectItem value="Verbal Reasoning">Verbal Reasoning</SelectItem>
                        <SelectItem value="Non-Verbal Reasoning">Non-Verbal Reasoning</SelectItem>
                        <SelectItem value="11+ English">11+ English</SelectItem>
                        <SelectItem value="GCSE Maths">GCSE Maths</SelectItem>
                        <SelectItem value="GCSE English">GCSE English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Session Type Preference</label>
                    <Select
                      value={editWaitlistData.sessionTypePreference}
                      onValueChange={(val: "in_person_group" | "online_1_1" | "no_preference") => 
                        setEditWaitlistData({...editWaitlistData, sessionTypePreference: val})
                      }
                    >
                      <SelectTrigger data-testid="select-edit-waitlist-session-type">
                        <SelectValue placeholder="Select preference..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person_group">In Person Group</SelectItem>
                        <SelectItem value="online_1_1">Online 1:1</SelectItem>
                        <SelectItem value="no_preference">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={editWaitlistData.notes}
                      onChange={(e) => setEditWaitlistData({...editWaitlistData, notes: e.target.value})}
                      data-testid="input-edit-waitlist-notes"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={editWaitlistData.depositPaid}
                        onCheckedChange={(checked) => setEditWaitlistData({...editWaitlistData, depositPaid: checked as boolean})}
                        data-testid="checkbox-edit-waitlist-deposit-paid"
                      />
                      <label className="text-sm font-medium">Deposit Paid</label>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deposit Amount</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editWaitlistData.depositAmount}
                        onChange={(e) => setEditWaitlistData({...editWaitlistData, depositAmount: e.target.value})}
                        data-testid="input-edit-waitlist-deposit-amount"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Session Duration (minutes)</label>
                    <Select
                      value={editWaitlistData.sessionDurationMinutes?.toString() || ""}
                      onValueChange={(val) => setEditWaitlistData({...editWaitlistData, sessionDurationMinutes: val ? parseInt(val) : undefined})}
                    >
                      <SelectTrigger data-testid="select-edit-waitlist-session-duration">
                        <SelectValue placeholder="Select session length..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={editWaitlistData.status}
                      onValueChange={(value: "new" | "contacted" | "scheduled" | "converted" | "declined") => 
                        setEditWaitlistData({...editWaitlistData, status: value})
                      }
                    >
                      <SelectTrigger data-testid="select-edit-waitlist-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferred Timings Section */}
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Preferred Timings</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditWaitlistData({
                          ...editWaitlistData,
                          preferredTimings: [
                            ...editWaitlistData.preferredTimings,
                            { dayOfWeek: 1, startTime: "15:00", endTime: "17:00", notes: "" }
                          ]
                        })}
                        data-testid="edit-add-preferred-timing"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Timing
                      </Button>
                    </div>
                    
                    {editWaitlistData.preferredTimings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No preferred timings added yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {editWaitlistData.preferredTimings.map((timing, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-3">
                            <div className="col-span-3">
                              <Label className="text-xs">Day</Label>
                              <Select
                                value={String(timing.dayOfWeek)}
                                onValueChange={(val) => {
                                  const updated = [...editWaitlistData.preferredTimings];
                                  updated[index].dayOfWeek = parseInt(val);
                                  setEditWaitlistData({...editWaitlistData, preferredTimings: updated});
                                }}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Sunday</SelectItem>
                                  <SelectItem value="1">Monday</SelectItem>
                                  <SelectItem value="2">Tuesday</SelectItem>
                                  <SelectItem value="3">Wednesday</SelectItem>
                                  <SelectItem value="4">Thursday</SelectItem>
                                  <SelectItem value="5">Friday</SelectItem>
                                  <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">From</Label>
                              <Input
                                type="time"
                                className="h-8"
                                value={timing.startTime}
                                onChange={(e) => {
                                  const updated = [...editWaitlistData.preferredTimings];
                                  updated[index].startTime = e.target.value;
                                  setEditWaitlistData({...editWaitlistData, preferredTimings: updated});
                                }}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">To</Label>
                              <Input
                                type="time"
                                className="h-8"
                                value={timing.endTime}
                                onChange={(e) => {
                                  const updated = [...editWaitlistData.preferredTimings];
                                  updated[index].endTime = e.target.value;
                                  setEditWaitlistData({...editWaitlistData, preferredTimings: updated});
                                }}
                              />
                            </div>
                            <div className="col-span-4">
                              <Label className="text-xs">Notes</Label>
                              <Input
                                className="h-8"
                                placeholder="e.g. after school"
                                value={timing.notes}
                                onChange={(e) => {
                                  const updated = [...editWaitlistData.preferredTimings];
                                  updated[index].notes = e.target.value;
                                  setEditWaitlistData({...editWaitlistData, preferredTimings: updated});
                                }}
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditWaitlistData({
                                    ...editWaitlistData,
                                    preferredTimings: editWaitlistData.preferredTimings.filter((_, i) => i !== index)
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSaveWaitlist}
                    className="w-full"
                    disabled={updateWaitlistMutation.isPending}
                    data-testid="button-update-waitlist"
                  >
                    {updateWaitlistMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Convert Waitlist to Student Dialog */}
            <Dialog open={isConvertWaitlistOpen} onOpenChange={setIsConvertWaitlistOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Convert to Student
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the required information to create a student record from this waitlist entry.
                  </DialogDescription>
                </DialogHeader>
                {convertingWaitlist && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <h4 className="font-medium">Waitlist Entry Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Student:</span> {convertingWaitlist.studentName}</div>
                        <div><span className="text-muted-foreground">Parent:</span> {convertingWaitlist.parentName || "N/A"}</div>
                        <div><span className="text-muted-foreground">Email:</span> {convertingWaitlist.parentEmail || "N/A"}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {convertingWaitlist.parentPhone || "N/A"}</div>
                      </div>
                    </div>

                    {/* Parent Account Section */}
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                      <div>
                        <Label className="text-sm font-medium">Parent Portal Account</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Create or link a parent login account for the parent portal
                        </p>
                        <Select 
                          value={convertWaitlistData.parentAccountMode} 
                          onValueChange={(v: "none" | "existing" | "new") => {
                            setConvertWaitlistData({
                              ...convertWaitlistData, 
                              parentAccountMode: v,
                              selectedParentUserId: "",
                              newParentPassword: "",
                            });
                          }}
                        >
                          <SelectTrigger data-testid="select-convert-parent-account-mode">
                            <SelectValue placeholder="Select option..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No parent account</SelectItem>
                            <SelectItem value="existing">Link to existing parent</SelectItem>
                            <SelectItem value="new">Create new parent account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {convertWaitlistData.parentAccountMode === "existing" && (
                        <div>
                          <Label>Select Existing Parent</Label>
                          <Select 
                            value={convertWaitlistData.selectedParentUserId} 
                            onValueChange={(val) => setConvertWaitlistData({...convertWaitlistData, selectedParentUserId: val})}
                          >
                            <SelectTrigger data-testid="select-convert-existing-parent">
                              <SelectValue placeholder="Select a parent..." />
                            </SelectTrigger>
                            <SelectContent>
                              {parentUsers.length === 0 ? (
                                <SelectItem value="no-parents" disabled>No parent accounts found</SelectItem>
                              ) : (
                                parentUsers.map((parent) => (
                                  <SelectItem key={parent.id} value={parent.id}>
                                    {parent.firstName && parent.lastName
                                      ? `${parent.firstName} ${parent.lastName}`
                                      : parent.email} ({parent.email})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {convertWaitlistData.parentAccountMode === "new" && (
                        <div>
                          <Label>Parent Account Password</Label>
                          <Input
                            type="password"
                            placeholder="Min 6 characters"
                            value={convertWaitlistData.newParentPassword}
                            onChange={(e) => setConvertWaitlistData({...convertWaitlistData, newParentPassword: e.target.value})}
                            data-testid="input-convert-new-parent-password"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            A parent account will be created using the parent info from the waitlist entry
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Class Type</Label>
                      <Select
                        value={convertWaitlistData.classType}
                        onValueChange={(val: "individual" | "group") => setConvertWaitlistData({...convertWaitlistData, classType: val})}
                      >
                        <SelectTrigger data-testid="select-convert-class-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual (1-on-1)</SelectItem>
                          <SelectItem value="group">Group Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Sessions Booked</Label>
                      <Select
                        value={convertWaitlistData.sessionsBooked.toString()}
                        onValueChange={(val) => setConvertWaitlistData({...convertWaitlistData, sessionsBooked: parseInt(val)})}
                      >
                        <SelectTrigger data-testid="select-convert-sessions-booked">
                          <SelectValue placeholder="Select sessions..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Session</SelectItem>
                          <SelectItem value="4">4 Sessions</SelectItem>
                          <SelectItem value="6">6 Sessions</SelectItem>
                          <SelectItem value="12">12 Sessions</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Sessions remaining will be set to this value</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Parent Rate (£/hour) *</Label>
                      {(() => {
                        const activeRates = parentRatesData.filter(r => r.isActive);
                        const matchingRate = activeRates.find(r => parseFloat(r.rate.toString()) === convertWaitlistData.parentRate);
                        return (
                          <Select 
                            onValueChange={(v) => {
                              const rate = activeRates.find(r => r.id === v);
                              if (rate) setConvertWaitlistData({...convertWaitlistData, parentRate: parseFloat(rate.rate.toString())});
                            }} 
                            value={matchingRate?.id || ""}
                          >
                            <SelectTrigger data-testid="select-convert-parent-rate">
                              <SelectValue placeholder="Select parent rate..." />
                            </SelectTrigger>
                            <SelectContent>
                              {activeRates.map((rate) => (
                                <SelectItem key={rate.id} value={rate.id}>
                                  {rate.name} - £{parseFloat(rate.rate.toString()).toFixed(2)}/hr ({rate.classType})
                                </SelectItem>
                              ))}
                              {activeRates.length === 0 && (
                                <SelectItem value="none" disabled>No parent rates configured</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        );
                      })()}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Year Started</Label>
                      <Input 
                        type="number" 
                        min="2000" 
                        max="2100" 
                        placeholder="e.g. 2024" 
                        value={convertWaitlistData.startYear || ""} 
                        onChange={(e) => setConvertWaitlistData({...convertWaitlistData, startYear: parseInt(e.target.value) || new Date().getFullYear()})}
                        data-testid="input-convert-start-year" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Exam Month</Label>
                        <Select
                          value={convertWaitlistData.examMonth?.toString() ?? ""}
                          onValueChange={(val) => setConvertWaitlistData({...convertWaitlistData, examMonth: parseInt(val)})}
                        >
                          <SelectTrigger data-testid="select-convert-exam-month">
                            <SelectValue placeholder="Select month..." />
                          </SelectTrigger>
                          <SelectContent>
                            {monthNames.map((month, index) => (
                              <SelectItem key={index + 1} value={(index + 1).toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Exam Year</Label>
                        <Input 
                          type="number" 
                          min="2000" 
                          max="2100" 
                          placeholder="e.g. 2025" 
                          value={convertWaitlistData.examYear ?? ""} 
                          onChange={(e) => setConvertWaitlistData({...convertWaitlistData, examYear: parseInt(e.target.value) || undefined})}
                          data-testid="input-convert-exam-year" 
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Exam Type</Label>
                      <Select
                        value={convertWaitlistData.examType}
                        onValueChange={(val) => setConvertWaitlistData({...convertWaitlistData, examType: val})}
                      >
                        <SelectTrigger data-testid="select-convert-exam-type">
                          <SelectValue placeholder="Select exam type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11+">11+</SelectItem>
                          <SelectItem value="13+">13+</SelectItem>
                          <SelectItem value="GCSE">GCSE</SelectItem>
                          <SelectItem value="A-Level">A-Level</SelectItem>
                          <SelectItem value="SATs">SATs</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsConvertWaitlistOpen(false);
                          setConvertingWaitlist(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (!convertWaitlistData.parentRate) {
                            toast({
                              title: "Missing Required Fields",
                              description: "Please select a parent rate.",
                              variant: "destructive",
                            });
                            return;
                          }
                          convertWaitlistMutation.mutate({
                            id: convertingWaitlist.id,
                            additionalInfo: convertWaitlistData,
                          });
                        }}
                        disabled={convertWaitlistMutation.isPending}
                        data-testid="button-convert-confirm"
                      >
                        {convertWaitlistMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Converting...
                          </div>
                        ) : (
                          <>
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Convert to Student
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Converted/Archived Waitlist Section */}
            {waitlistEntries.filter(e => e.status === "converted").length > 0 && (
              <Collapsible className="mt-8">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 border rounded-lg hover:bg-muted/50" data-testid="button-toggle-waitlist-archive">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      <span className="font-medium">Converted Students Archive</span>
                      <Badge variant="secondary" className="ml-2">
                        {waitlistEntries.filter(e => e.status === "converted").length}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="overflow-x-auto mobile-scroll border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Student Name</TableHead>
                          <TableHead>Parent Name</TableHead>
                          <TableHead>Subjects</TableHead>
                          <TableHead>Date Added</TableHead>
                          <TableHead>Converted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waitlistEntries.filter(e => e.status === "converted").map((entry) => (
                          <TableRow key={entry.id} className="opacity-70" data-testid={`row-waitlist-archive-${entry.id}`}>
                            <TableCell className="font-medium">{entry.studentName}</TableCell>
                            <TableCell>{entry.parentName || "-"}</TableCell>
                            <TableCell>
                              {entry.subjects && entry.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {entry.subjects.map((subj, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {subj}
                                    </Badge>
                                  ))}
                                </div>
                              ) : entry.subject ? entry.subject : "-"}
                            </TableCell>
                            <TableCell>
                              {entry.createdAt ? format(new Date(entry.createdAt), "dd MMM yyyy") : "-"}
                            </TableCell>
                            <TableCell>
                              {entry.updatedAt ? format(new Date(entry.updatedAt), "dd MMM yyyy") : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="tutors" className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Staff Management</h3>
              <Dialog open={isAddTutorOpen} onOpenChange={setIsAddTutorOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-tutor">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                  </DialogHeader>
                  <Form {...tutorForm}>
                    <form onSubmit={tutorForm.handleSubmit(onSubmitTutor)} className="space-y-4">
                      <FormField
                        control={tutorForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-tutor-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-tutor-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-tutor-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Min 6 characters" {...field} data-testid="input-tutor-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} data-testid="select-tutor-role">
                              <FormControl>
                                <SelectTrigger data-testid="select-trigger-tutor-role">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tutor">Tutor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="additional_staff">Additional Staff</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel"
                                placeholder="e.g. 07123 456789" 
                                {...field} 
                                value={field.value ?? ""}
                                data-testid="input-tutor-phone" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe staff responsibilities..." 
                                {...field} 
                                value={field.value ?? ""}
                                data-testid="input-tutor-description" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={tutorForm.control}
                        name="startYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Started</FormLabel>
                            <FormControl>
                              <Input type="number" min="2000" max="2100" placeholder="e.g. 2024" {...field} value={field.value ?? ""} data-testid="input-tutor-start-year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Emergency Contact</h4>
                        <div className="space-y-3">
                          <FormField
                            control={tutorForm.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Emergency contact name" 
                                    {...field} 
                                    value={field.value ?? ""}
                                    data-testid="input-tutor-emergency-name" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tutorForm.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="tel"
                                    placeholder="Emergency contact phone" 
                                    {...field} 
                                    value={field.value ?? ""}
                                    data-testid="input-tutor-emergency-phone" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12"
                        disabled={createTutorMutation.isPending}
                        data-testid="button-save-tutor"
                      >
                        {createTutorMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Creating...
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Create Staff Member
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto overflow-x-auto mobile-scroll">
              <Table className="min-w-[850px]" wrapperClassName="overflow-visible">
                <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
                  <TableRow>
                    <TableHead className="bg-background">Name</TableHead>
                    <TableHead className="bg-background">Email</TableHead>
                    <TableHead className="bg-background">Contact</TableHead>
                    <TableHead className="bg-background">Emergency Contact</TableHead>
                    <TableHead className="text-center bg-background">Role</TableHead>
                    <TableHead className="bg-background">Description</TableHead>
                    <TableHead className="text-center bg-background">Students</TableHead>
                    <TableHead className="text-center bg-background">Active Sessions</TableHead>
                    <TableHead className="text-center bg-background">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tutors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No staff members found. Add your first tutor to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tutors.map((tutor) => {
                      const ec = tutor.emergencyContact as { name?: string; phone?: string } | null;
                      return (
                      <TableRow key={tutor.id} data-testid={`row-tutor-${tutor.id}`}>
                        <TableCell className="font-medium">
                          {tutor.firstName && tutor.lastName
                            ? `${tutor.firstName} ${tutor.lastName}`
                            : tutor.email}
                        </TableCell>
                        <TableCell>{tutor.email}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {(tutor as any).phone ? (
                              <div className="flex items-center gap-1 text-sm" data-testid={`text-staff-phone-${tutor.id}`}>
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                <span>{(tutor as any).phone}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No contact</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ec?.name || ec?.phone ? (
                            <div className="space-y-0.5" data-testid={`text-staff-emergency-${tutor.id}`}>
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <AlertCircle className="w-3 h-3 text-orange-500" />
                                <span>{ec.name || 'Not provided'}</span>
                              </div>
                              {ec.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{ec.phone}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={tutor.role}
                            onValueChange={(value: "admin" | "tutor" | "additional_staff") => {
                              if (tutor.id === user.id) {
                                toast({
                                  title: "Cannot change own role",
                                  description: "You cannot change your own role.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              updateTutorRoleMutation.mutate({ tutorId: tutor.id, role: value });
                            }}
                            disabled={tutor.id === user.id || updateTutorRoleMutation.isPending}
                          >
                            <SelectTrigger 
                              className="w-[130px]" 
                              data-testid={`select-role-${tutor.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="tutor">Tutor</SelectItem>
                              <SelectItem value="additional_staff">Additional Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <span className="text-sm text-muted-foreground truncate block" title={(tutor as any).description || ""}>
                            {(tutor as any).description || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {allocations.filter(a => a.tutorId === tutor.id && a.isActive).length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default">
                            {allocations.filter(a => a.tutorId === tutor.id && a.isActive && a.student && a.student.sessionsRemaining > 0).length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setViewingTutorEarnings(tutor);
                                setIsTutorEarningsOpen(true);
                              }}
                              data-testid={`button-view-earnings-${tutor.id}`}
                              title="View tutor's earnings"
                            >
                              <Eye className="w-4 h-4 text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openEditStaffDialog(tutor)}
                              data-testid={`button-edit-staff-${tutor.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {tutor.id !== user.id && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => archiveTutorMutation.mutate(tutor.id)}
                                disabled={archiveTutorMutation.isPending}
                                data-testid={`button-archive-staff-${tutor.id}`}
                                title="Archive staff member"
                              >
                                <Archive className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* View Tutor Earnings Dialog */}
            <Dialog open={isTutorEarningsOpen} onOpenChange={setIsTutorEarningsOpen}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Tutor's Earnings View: {viewingTutorEarnings?.firstName} {viewingTutorEarnings?.lastName}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg flex-1">
                      <p className="text-sm text-muted-foreground">
                        Viewing {earningsPeriod === "weekly" ? "this week" : earningsPeriod === "monthly" ? "this month" : "this year"} ({format(earningsDateRange.start, "MMM dd")} - {format(earningsDateRange.end, "MMM dd, yyyy")})
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant={earningsPeriod === "weekly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEarningsPeriod("weekly")}
                        data-testid="button-earnings-weekly"
                      >
                        Weekly
                      </Button>
                      <Button
                        variant={earningsPeriod === "monthly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEarningsPeriod("monthly")}
                        data-testid="button-earnings-monthly"
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={earningsPeriod === "annual" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEarningsPeriod("annual")}
                        data-testid="button-earnings-annual"
                      >
                        Annual
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            {earningsPeriod === "weekly" ? "This Week's" : earningsPeriod === "monthly" ? "This Month's" : "This Year's"} Earnings
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            £{tutorEarningsLoading ? "..." : (tutorEarningsData?.earnings || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-chart-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {tutorEarningsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : tutorEarningsData?.entries && tutorEarningsData.entries.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Duration</TableHead>
                            <TableHead className="text-right">Tutor Rate</TableHead>
                            <TableHead className="text-right">Earnings</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tutorEarningsData.entries
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell className="font-medium">
                                  {format(new Date(entry.date), "EEE, MMM dd")}
                                </TableCell>
                                <TableCell>{entry.student?.name || "Unknown"}</TableCell>
                                <TableCell>{entry.student?.subject || "-"}</TableCell>
                                <TableCell className="text-right">{entry.duration}h</TableCell>
                                <TableCell className="text-right">
                                  £{entry.student?.tutorRate ? Number(entry.student.tutorRate).toFixed(2) : "-"}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  £{Number(entry.tutorEarnings).toFixed(2)}
                                </TableCell>
                                <TableCell>
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
                            ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} className="font-medium">Total (Approved Only)</TableCell>
                            <TableCell className="text-right font-medium">
                              {tutorEarningsData.entries
                                .filter(e => e.status === "approved")
                                .reduce((sum, e) => sum + Number(e.duration), 0)}h
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-medium">
                              £{tutorEarningsData.entries
                                .filter(e => e.status === "approved")
                                .reduce((sum, e) => sum + Number(e.tutorEarnings), 0).toFixed(2)}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No sessions recorded for this week.
                    </p>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Note:</strong> Earnings shown are calculated from the tutor rate at the time each session was logged.</p>
                    <p>Only approved sessions count towards the tutor's earnings total.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Staff Dialog */}
            <Dialog open={isEditStaffOpen} onOpenChange={setIsEditStaffOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Staff Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={editStaffData.firstName}
                        onChange={(e) => setEditStaffData({...editStaffData, firstName: e.target.value})}
                        data-testid="input-edit-staff-first-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={editStaffData.lastName}
                        onChange={(e) => setEditStaffData({...editStaffData, lastName: e.target.value})}
                        data-testid="input-edit-staff-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={editStaffData.email}
                      onChange={(e) => setEditStaffData({...editStaffData, email: e.target.value})}
                      data-testid="input-edit-staff-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Number</label>
                    <Input
                      type="tel"
                      placeholder="e.g. 07123 456789"
                      value={editStaffData.phone}
                      onChange={(e) => setEditStaffData({...editStaffData, phone: e.target.value})}
                      data-testid="input-edit-staff-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe staff responsibilities..."
                      value={editStaffData.description}
                      onChange={(e) => setEditStaffData({...editStaffData, description: e.target.value})}
                      data-testid="input-edit-staff-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Year Started</label>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="e.g. 2024"
                        value={editStaffData.startYear ?? ""}
                        onChange={(e) => setEditStaffData({...editStaffData, startYear: e.target.value ? parseInt(e.target.value) : undefined})}
                        data-testid="input-edit-staff-start-year"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Year Finished</label>
                      <Input
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="e.g. 2025"
                        value={editStaffData.endYear ?? ""}
                        onChange={(e) => setEditStaffData({...editStaffData, endYear: e.target.value ? parseInt(e.target.value) : undefined})}
                        data-testid="input-edit-staff-end-year"
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Emergency Contact</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          placeholder="Emergency contact name"
                          value={editStaffData.emergencyContactName}
                          onChange={(e) => setEditStaffData({...editStaffData, emergencyContactName: e.target.value})}
                          data-testid="input-edit-staff-emergency-name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input
                          type="tel"
                          placeholder="Emergency contact phone"
                          value={editStaffData.emergencyContactPhone}
                          onChange={(e) => setEditStaffData({...editStaffData, emergencyContactPhone: e.target.value})}
                          data-testid="input-edit-staff-emergency-phone"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveStaff}
                    className="w-full"
                    disabled={updateStaffMutation.isPending}
                    data-testid="button-save-staff-edit"
                  >
                    {updateStaffMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Teaching Sessions</h3>
              <div className="flex flex-wrap gap-2">
                {/* Time Period Filter */}
                <Select value={sessionView} onValueChange={(v: "week" | "all") => setSessionView(v)}>
                  <SelectTrigger className="w-[130px]" data-testid="select-session-view">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="all">All Sessions</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={sessionDateFilter}
                    onChange={(e) => setSessionDateFilter(e.target.value)}
                    className="w-[150px]"
                    data-testid="input-session-date-filter"
                  />
                  {sessionDateFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSessionDateFilter("")}
                      className="h-9 px-2"
                      data-testid="button-clear-date-filter"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Tutor Filter */}
                <Select value={sessionTutorFilter} onValueChange={setSessionTutorFilter}>
                  <SelectTrigger className="w-[160px]" data-testid="select-session-tutor-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Tutors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tutors</SelectItem>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.firstName && tutor.lastName
                          ? `${tutor.firstName} ${tutor.lastName}`
                          : tutor.email || tutor.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Order Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSessionSortOrder(sessionSortOrder === "desc" ? "asc" : "desc")}
                  data-testid="button-session-sort"
                  className="flex items-center gap-1"
                >
                  {sessionSortOrder === "desc" ? (
                    <>
                      <ArrowDown className="w-4 h-4" />
                      <span className="hidden sm:inline">Newest First</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-4 h-4" />
                      <span className="hidden sm:inline">Oldest First</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {(() => {
              // Filter by specific date if set
              let filteredSessions = sessionDateFilter
                ? allSessions.filter((s: TimesheetEntryWithRelations) => {
                    const sessionDate = new Date(s.date).toISOString().split('T')[0];
                    return sessionDate === sessionDateFilter;
                  })
                : sessionView === "week"
                  ? allSessions.filter((s: TimesheetEntryWithRelations) => {
                      const sessionDate = new Date(s.date);
                      return sessionDate >= weekStart && sessionDate <= weekEnd;
                    })
                  : allSessions;

              // Filter by tutor
              if (sessionTutorFilter !== "all") {
                filteredSessions = filteredSessions.filter(
                  (s: TimesheetEntryWithRelations) => s.tutorId === sessionTutorFilter
                );
              }

              // Sort by date
              const sortedSessions = [...filteredSessions].sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sessionSortOrder === "desc" ? dateB - dateA : dateA - dateB;
              });

              if (sortedSessions.length === 0) {
                return (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {sessionDateFilter 
                          ? `No sessions on ${new Date(sessionDateFilter).toLocaleDateString()}`
                          : sessionView === "week" 
                            ? "No sessions this week" 
                            : "No sessions recorded yet"}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="overflow-x-auto mobile-scroll">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Duration</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSessions.map((session: TimesheetEntryWithRelations) => (
                        <TableRow key={session.id} data-testid={`row-session-${session.id}`}>
                          <TableCell className="font-medium">
                            {format(new Date(session.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {session.tutor.firstName && session.tutor.lastName
                              ? `${session.tutor.firstName} ${session.tutor.lastName}`
                              : session.tutor.email}
                          </TableCell>
                          <TableCell>{session.student.name}</TableCell>
                          <TableCell>{session.student.subject}</TableCell>
                          <TableCell className="text-center">
                            {parseFloat(session.duration)} hr{parseFloat(session.duration) !== 1 ? 's' : ''}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={
                                session.status === "approved" ? "default" : 
                                session.status === "rejected" ? "destructive" : 
                                "secondary"
                              }
                            >
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            {session.notes ? (
                              <div className="flex items-start">
                                <FileText className="w-4 h-4 mr-1 mt-0.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground truncate" title={session.notes}>
                                  {session.notes}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="font-medium">
                          Total: {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {sortedSessions.reduce((sum, s) => sum + parseFloat(s.duration), 0).toFixed(1)} hrs
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              );
            })()}
          </TabsContent>

          {/* Student Groups Tab */}
          <TabsContent value="groups" className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold">Student Groups</h3>
                <p className="text-sm text-muted-foreground">
                  Create groups of students for group tutoring sessions. Tutors can log sessions for entire groups at once.
                </p>
              </div>
              <Button onClick={openAddGroupDialog} data-testid="button-add-group">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>

            {/* Add/Edit Group Dialog */}
            <Dialog open={isAddGroupOpen || isEditGroupOpen} onOpenChange={(open) => {
              if (!open) {
                setIsAddGroupOpen(false);
                setIsEditGroupOpen(false);
                setEditingGroup(null);
              }
            }}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingGroup ? "Edit Student Group" : "Create Student Group"}</DialogTitle>
                  <DialogDescription>
                    {editingGroup ? "Update the group details and members." : "Create a new group for group tutoring sessions."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={groupFormData.name}
                      onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Monday Maths Group"
                      data-testid="input-group-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Description (Optional)</Label>
                    <Input
                      id="group-description"
                      value={groupFormData.description}
                      onChange={(e) => setGroupFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Year 10 GCSE preparation"
                      data-testid="input-group-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-tutor">Assigned Tutor</Label>
                    <Select
                      value={groupFormData.tutorId}
                      onValueChange={(value) => setGroupFormData(prev => ({ ...prev, tutorId: value, selectedStudentIds: [] }))}
                    >
                      <SelectTrigger data-testid="select-group-tutor">
                        <SelectValue placeholder="Select a tutor" />
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
                  {groupFormData.tutorId && (
                    <div className="space-y-2">
                      <Label>Select Students for Group</Label>
                      <p className="text-xs text-muted-foreground">Select students to include in this group, or leave empty and add later.</p>
                      <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                        {allStudents.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No students available.</p>
                        ) : (
                          allStudents
                            .filter(s => s.isActive)
                            .map(student => (
                              <div key={student.id} className="flex items-center space-x-2 py-1">
                                <Checkbox
                                  id={`group-student-${student.id}`}
                                  checked={groupFormData.selectedStudentIds.includes(student.id)}
                                  onCheckedChange={() => toggleStudentInGroup(student.id)}
                                  data-testid={`checkbox-student-${student.id}`}
                                />
                                <label
                                  htmlFor={`group-student-${student.id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {student.name} <span className="text-muted-foreground">({student.subject})</span>
                                </label>
                              </div>
                            ))
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {groupFormData.selectedStudentIds.length} student{groupFormData.selectedStudentIds.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddGroupOpen(false);
                      setIsEditGroupOpen(false);
                      setEditingGroup(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGroup}
                    disabled={!groupFormData.name || !groupFormData.tutorId || createGroupMutation.isPending || updateGroupMutation.isPending}
                    data-testid="button-save-group"
                  >
                    {(createGroupMutation.isPending || updateGroupMutation.isPending) ? "Saving..." : editingGroup ? "Update Group" : "Create Group"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Schedule Group Sessions Dialog */}
            <Dialog open={isGroupScheduleOpen} onOpenChange={(open) => {
              if (!open) {
                setIsGroupScheduleOpen(false);
                setSchedulingGroup(null);
              }
            }}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Schedule Group Sessions</DialogTitle>
                  <DialogDescription>
                    Set up a recurring session schedule for "{schedulingGroup?.name}". This will create a weekly session on the calendar for all group members.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select
                      value={groupScheduleFormData.dayOfWeek.toString()}
                      onValueChange={(value) => setGroupScheduleFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={groupScheduleFormData.startTime}
                        onChange={(e) => setGroupScheduleFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Select
                        value={groupScheduleFormData.durationMinutes.toString()}
                        onValueChange={(value) => setGroupScheduleFormData(prev => ({ ...prev, durationMinutes: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject (Optional)</Label>
                    <Input
                      value={groupScheduleFormData.subject}
                      onChange={(e) => setGroupScheduleFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., GCSE Maths"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={groupScheduleFormData.startDate}
                      onChange={(e) => setGroupScheduleFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sessions will be scheduled weekly starting from this date.
                    </p>
                  </div>
                  {schedulingGroup && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Group Members ({schedulingGroup.members.length}):</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {schedulingGroup.members.map(member => (
                          <Badge key={member.id} variant="secondary" className="text-xs">
                            {member.student?.name || "Unknown"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsGroupScheduleOpen(false);
                    setSchedulingGroup(null);
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGroupSchedule}
                    disabled={createGroupScheduleMutation.isPending}
                  >
                    {createGroupScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Groups List */}
            {studentGroupsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : studentGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-muted-foreground">No student groups yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a group to allow tutors to log sessions for multiple students at once.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studentGroups.map(group => (
                  <Card key={group.id} data-testid={`group-card-${group.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{group.name}</CardTitle>
                          {group.description && (
                            <CardDescription className="text-sm mt-1">{group.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openGroupScheduleDialog(group)}
                            title="Schedule Sessions"
                            data-testid={`button-schedule-group-${group.id}`}
                          >
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditGroupDialog(group)}
                            data-testid={`button-edit-group-${group.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                data-testid={`button-delete-group-${group.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the group "{group.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteGroupMutation.mutate(group.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-2" />
                          Tutor: {group.tutor?.firstName} {group.tutor?.lastName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Students ({group.members.length}):</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {group.members.map(member => (
                              <Badge key={member.id} variant="secondary" className="text-xs">
                                {member.student?.name || "Unknown"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {(() => {
                          const groupSchedules = recurringSessionTemplates.filter(t => t.groupId === group.id && t.isActive);
                          // Deduplicate by schedule content (day + time + subject)
                          const uniqueSchedules = groupSchedules.filter((schedule, index, self) => 
                            index === self.findIndex(s => 
                              s.dayOfWeek === schedule.dayOfWeek && 
                              s.startTime === schedule.startTime && 
                              s.subject === schedule.subject
                            )
                          );
                          if (uniqueSchedules.length === 0) return null;
                          return (
                            <div>
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Schedule:
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {uniqueSchedules.map((schedule, idx) => (
                                  <Badge key={`${schedule.dayOfWeek}-${schedule.startTime}-${idx}`} variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                                    {formatDayOfWeek(schedule.dayOfWeek)} {schedule.startTime}
                                    {schedule.subject && ` - ${schedule.subject}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rate Management Tab */}
          <TabsContent value="rates" className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold">Rate Management</h3>
                <p className="text-sm text-muted-foreground">
                  Tutor and parent rates are completely independent. Create, update, or delete one without affecting the other.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    setTutorRateFormData({
                      name: "",
                      description: "",
                      tutorId: "",
                      tutorIds: [],
                      tutorGroupIds: [],
                      tutorAssignmentsLoaded: true,
                      classType: "individual",
                      subjects: [],
                      rate: 0,
                      isDefault: false,
                      isActive: true,
                    });
                    setIsAddTutorRateOpen(true);
                  }}
                  data-testid="button-add-tutor-rate"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tutor Rate
                </Button>
                <Button 
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setParentRateFormData({
                      name: "",
                      description: "",
                      classType: "individual",
                      subjects: [],
                      rate: 0,
                      isDefault: false,
                      isActive: true,
                    });
                    setIsAddParentRateOpen(true);
                  }}
                  data-testid="button-add-parent-rate"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parent Rate
                </Button>
              </div>
            </div>

            {/* Add Tutor Rate Dialog (NEW INDEPENDENT SYSTEM) */}
            <Dialog open={isAddTutorRateOpen} onOpenChange={setIsAddTutorRateOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-green-600">
                    <HandHeart className="w-5 h-5 mr-2" />
                    Add Tutor Payment Rate
                  </DialogTitle>
                  <DialogDescription>
                    Create a new independent rate for tutor payments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="e.g., Standard Individual Rate"
                      value={tutorRateFormData.name}
                      onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, name: e.target.value })}
                      data-testid="input-tutor-rate-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Optional description"
                      value={tutorRateFormData.description || ""}
                      onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, description: e.target.value })}
                      data-testid="input-tutor-rate-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign to Tutors</label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {tutorRateFormData.tutorIds.length === 0 && tutorRateFormData.tutorGroupIds.length === 0 && (
                        <p className="text-xs text-muted-foreground mb-2">No tutors selected - rate applies to all tutors (Global)</p>
                      )}
                      {allTutors.filter(t => t.isActive).map((tutor) => (
                        <div key={tutor.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tutor-rate-${tutor.id}`}
                            checked={tutorRateFormData.tutorIds.includes(tutor.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTutorRateFormData({
                                  ...tutorRateFormData,
                                  tutorIds: [...tutorRateFormData.tutorIds, tutor.id]
                                });
                              } else {
                                setTutorRateFormData({
                                  ...tutorRateFormData,
                                  tutorIds: tutorRateFormData.tutorIds.filter(id => id !== tutor.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`tutor-rate-${tutor.id}`} className="text-sm">
                            {tutor.firstName} {tutor.lastName}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Select tutors this rate applies to. Leave empty for a global rate.</p>
                  </div>
                  {tutorGroupsData.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Or Assign to Tutor Groups</label>
                      <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                        {tutorGroupsData.map((group: any) => (
                          <div key={group.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tutor-group-rate-${group.id}`}
                              checked={tutorRateFormData.tutorGroupIds.includes(group.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTutorRateFormData({
                                    ...tutorRateFormData,
                                    tutorGroupIds: [...tutorRateFormData.tutorGroupIds, group.id]
                                  });
                                } else {
                                  setTutorRateFormData({
                                    ...tutorRateFormData,
                                    tutorGroupIds: tutorRateFormData.tutorGroupIds.filter(id => id !== group.id)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={`tutor-group-rate-${group.id}`} className="text-sm">
                              {group.name} ({group.members?.length || 0} tutors)
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class Type *</label>
                      <Select
                        value={tutorRateFormData.classType}
                        onValueChange={(value: "individual" | "group") => setTutorRateFormData({ ...tutorRateFormData, classType: value })}
                      >
                        <SelectTrigger data-testid="select-tutor-rate-class-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="e.g., Maths"
                        value={tutorRateFormData.subject || ""}
                        onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, subject: e.target.value })}
                        data-testid="input-tutor-rate-subject"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-600">Tutor Rate (£/hr) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tutorRateFormData.rate}
                      onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, rate: parseFloat(e.target.value) || 0 })}
                      className="border-green-200 focus:border-green-500"
                      data-testid="input-tutor-rate-amount"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tutorIsDefault"
                        checked={tutorRateFormData.isDefault}
                        onCheckedChange={(checked) => setTutorRateFormData({ ...tutorRateFormData, isDefault: !!checked })}
                        data-testid="checkbox-tutor-rate-default"
                      />
                      <label htmlFor="tutorIsDefault" className="text-sm">Default rate</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tutorIsActive"
                        checked={tutorRateFormData.isActive}
                        onCheckedChange={(checked) => setTutorRateFormData({ ...tutorRateFormData, isActive: !!checked })}
                        data-testid="checkbox-tutor-rate-active"
                      />
                      <label htmlFor="tutorIsActive" className="text-sm">Active</label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddTutorRateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => createTutorRateMutation.mutate(tutorRateFormData)}
                    disabled={createTutorRateMutation.isPending || !tutorRateFormData.name || tutorRateFormData.rate <= 0}
                    data-testid="button-save-tutor-rate"
                  >
                    {createTutorRateMutation.isPending ? "Creating..." : "Create Tutor Rate"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Parent Rate Dialog (NEW INDEPENDENT SYSTEM) */}
            <Dialog open={isAddParentRateOpen} onOpenChange={setIsAddParentRateOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-blue-600">
                    <Users className="w-5 h-5 mr-2" />
                    Add Parent Billing Rate
                  </DialogTitle>
                  <DialogDescription>
                    Create a new independent rate for parent billing.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="e.g., Standard Individual Rate"
                      value={parentRateFormData.name}
                      onChange={(e) => setParentRateFormData({ ...parentRateFormData, name: e.target.value })}
                      data-testid="input-parent-rate-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Optional description"
                      value={parentRateFormData.description || ""}
                      onChange={(e) => setParentRateFormData({ ...parentRateFormData, description: e.target.value })}
                      data-testid="input-parent-rate-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class Type *</label>
                      <Select
                        value={parentRateFormData.classType}
                        onValueChange={(value: "individual" | "group") => setParentRateFormData({ ...parentRateFormData, classType: value })}
                      >
                        <SelectTrigger data-testid="select-parent-rate-class-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="e.g., Maths"
                        value={parentRateFormData.subject || ""}
                        onChange={(e) => setParentRateFormData({ ...parentRateFormData, subject: e.target.value })}
                        data-testid="input-parent-rate-subject"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Parent Rate (£/hr) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={parentRateFormData.rate}
                      onChange={(e) => setParentRateFormData({ ...parentRateFormData, rate: parseFloat(e.target.value) || 0 })}
                      className="border-blue-200 focus:border-blue-500"
                      data-testid="input-parent-rate-amount"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parentIsDefault"
                        checked={parentRateFormData.isDefault}
                        onCheckedChange={(checked) => setParentRateFormData({ ...parentRateFormData, isDefault: !!checked })}
                        data-testid="checkbox-parent-rate-default"
                      />
                      <label htmlFor="parentIsDefault" className="text-sm">Default rate</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parentIsActive"
                        checked={parentRateFormData.isActive}
                        onCheckedChange={(checked) => setParentRateFormData({ ...parentRateFormData, isActive: !!checked })}
                        data-testid="checkbox-parent-rate-active"
                      />
                      <label htmlFor="parentIsActive" className="text-sm">Active</label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddParentRateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => createParentRateMutation.mutate(parentRateFormData)}
                    disabled={createParentRateMutation.isPending || !parentRateFormData.name || parentRateFormData.rate < 0}
                    data-testid="button-save-parent-rate"
                  >
                    {createParentRateMutation.isPending ? "Creating..." : "Create Parent Rate"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {tutorRatesLoading || parentRatesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : tutorRatesData.length === 0 && parentRatesData.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Rate Configurations</h3>
                  <p className="text-muted-foreground mb-4">
                    Create rate templates to standardize tutor payments and parent billing.
                    Rates are completely independent - creating one does not affect the other.
                  </p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    <Button 
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        setTutorRateFormData({
                          name: "",
                          description: "",
                          tutorId: "",
                          classType: "individual",
                          subjects: [],
                          rate: 0,
                          isDefault: false,
                          isActive: true,
                        });
                        setIsAddTutorRateOpen(true);
                      }}
                      data-testid="button-add-first-tutor-rate"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tutor Rate
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setParentRateFormData({
                          name: "",
                          description: "",
                          classType: "individual",
                          subjects: [],
                          rate: 0,
                          isDefault: false,
                          isActive: true,
                        });
                        setIsAddParentRateOpen(true);
                      }}
                      data-testid="button-add-first-parent-rate"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Parent Rate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tutor Rates Section (NEW INDEPENDENT SYSTEM) */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-green-600">
                      <HandHeart className="w-5 h-5 mr-2" />
                      Tutor Payment Rates
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Independent rates paid to tutors for each session type
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {tutorRatesData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No tutor rates configured yet.</p>
                        <Button 
                          variant="link" 
                          className="text-green-600"
                          onClick={() => {
                            setTutorRateFormData({
                              name: "",
                              description: "",
                              tutorId: "",
                              classType: "individual",
                              subjects: [],
                              rate: 0,
                              isDefault: false,
                              isActive: true,
                            });
                            setIsAddTutorRateOpen(true);
                          }}
                        >
                          Add your first tutor rate
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Tutor</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Rate (£/hr)</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tutorRatesData.map((rate) => {
                              const rateAmount = parseFloat(rate.rate?.toString() || "0");
                              const assignedTutor = rate.tutorId ? allTutors.find(t => t.id === rate.tutorId) : null;
                              return (
                                <TableRow key={rate.id} data-testid={`row-tutor-rate-${rate.id}`}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      {rate.name}
                                      {rate.isDefault && (
                                        <Badge variant="secondary" className="text-xs">Default</Badge>
                                      )}
                                      {!rate.isActive && (
                                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                                      )}
                                    </div>
                                    {rate.subject && (
                                      <span className="text-xs text-muted-foreground">{rate.subject}</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {assignedTutor ? (
                                      <span className="text-sm">{assignedTutor.firstName} {assignedTutor.lastName}</span>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">Global</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={rate.classType === "individual" ? "default" : "outline"} className="text-xs">
                                      {rate.classType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-green-600 font-semibold">
                                    £{rateAmount.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          setEditingTutorRate(rate);
                                          setIsLoadingTutorRateAssignments(true);
                                          setIsEditTutorRateOpen(true);
                                          // Pre-populate with basic rate data first
                                          setTutorRateFormData({
                                            name: rate.name,
                                            description: rate.description || "",
                                            tutorId: rate.tutorId || "",
                                            tutorIds: [],
                                            tutorGroupIds: [],
                                            tutorAssignmentsLoaded: false,
                                            classType: rate.classType as "individual" | "group",
                                            subject: rate.subject || "",
                                            rate: rateAmount,
                                            isDefault: rate.isDefault,
                                            isActive: rate.isActive,
                                          });
                                          // Fetch existing tutor and group assignments with credentials
                                          let tutorIds: string[] = [];
                                          let tutorGroupIds: string[] = [];
                                          let assignmentsLoaded = false;
                                          try {
                                            const tutorRes = await fetch(`/api/tutor-rates/${rate.id}/tutors`, { credentials: 'include' });
                                            if (tutorRes.ok) {
                                              const tutorAssignments = await tutorRes.json();
                                              tutorIds = Array.isArray(tutorAssignments) ? tutorAssignments.map((a: any) => a.tutorId) : [];
                                            }
                                            const groupRes = await fetch(`/api/tutor-rates/${rate.id}/tutor-groups`, { credentials: 'include' });
                                            if (groupRes.ok) {
                                              const groupAssignments = await groupRes.json();
                                              tutorGroupIds = Array.isArray(groupAssignments) ? groupAssignments.map((a: any) => a.tutorGroupId) : [];
                                            }
                                            assignmentsLoaded = true;
                                          } catch (e) {
                                            console.error("Failed to fetch rate assignments:", e);
                                            assignmentsLoaded = false;
                                          }
                                          setTutorRateFormData(prev => ({
                                            ...prev,
                                            tutorIds,
                                            tutorGroupIds,
                                            tutorAssignmentsLoaded: assignmentsLoaded,
                                          }));
                                          setIsLoadingTutorRateAssignments(false);
                                        }}
                                        data-testid={`button-edit-tutor-rate-${rate.id}`}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => {
                                          if (confirm("Are you sure you want to delete this tutor rate? This will NOT affect any parent rates.")) {
                                            deleteTutorRateMutation.mutate(rate.id);
                                          }
                                        }}
                                        data-testid={`button-delete-tutor-rate-${rate.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Parent Rates Section (NEW INDEPENDENT SYSTEM) */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-blue-600">
                      <Users className="w-5 h-5 mr-2" />
                      Parent Billing Rates
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Independent rates charged to parents for each session type
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {parentRatesData.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No parent rates configured yet.</p>
                        <Button 
                          variant="link" 
                          className="text-blue-600"
                          onClick={() => {
                            setParentRateFormData({
                              name: "",
                              description: "",
                              classType: "individual",
                              subjects: [],
                              rate: 0,
                              isDefault: false,
                              isActive: true,
                            });
                            setIsAddParentRateOpen(true);
                          }}
                        >
                          Add your first parent rate
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Rate (£/hr)</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parentRatesData.map((rate) => {
                              const rateAmount = parseFloat(rate.rate?.toString() || "0");
                              return (
                                <TableRow key={rate.id} data-testid={`row-parent-rate-${rate.id}`}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      {rate.name}
                                      {rate.isDefault && (
                                        <Badge variant="secondary" className="text-xs">Default</Badge>
                                      )}
                                      {!rate.isActive && (
                                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                                      )}
                                    </div>
                                    {rate.subject && (
                                      <span className="text-xs text-muted-foreground">{rate.subject}</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={rate.classType === "individual" ? "default" : "outline"} className="text-xs">
                                      {rate.classType}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-blue-600 font-semibold">
                                    £{rateAmount.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingParentRate(rate);
                                          setParentRateFormData({
                                            name: rate.name,
                                            description: rate.description || "",
                                            classType: rate.classType as "individual" | "group",
                                            subject: rate.subject || "",
                                            rate: rateAmount,
                                            isDefault: rate.isDefault,
                                            isActive: rate.isActive,
                                          });
                                          setIsEditParentRateOpen(true);
                                        }}
                                        data-testid={`button-edit-parent-rate-${rate.id}`}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => {
                                          if (confirm("Are you sure you want to delete this parent rate? This will NOT affect any tutor rates.")) {
                                            deleteParentRateMutation.mutate(rate.id);
                                          }
                                        }}
                                        data-testid={`button-delete-parent-rate-${rate.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Additional Staff Rates Section */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-purple-600">
                  <Users className="w-5 h-5 mr-2" />
                  Additional Staff Hourly Rates
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set hourly rates for non-tutor staff members (used when they submit timesheets)
                </p>
              </CardHeader>
              <CardContent>
                {additionalStaffLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                ) : additionalStaffData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No additional staff members found.</p>
                    <p className="text-sm mt-2">Add staff members from the Staff tab with role "Additional Staff".</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Hourly Rate (£)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {additionalStaffData.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            {staff.firstName} {staff.lastName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {staff.description || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingStaffRateId === staff.id ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-24 ml-auto text-right"
                                value={editingStaffRate}
                                onChange={(e) => setEditingStaffRate(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateStaffRateMutation.mutate({ staffId: staff.id, hourlyRate: editingStaffRate });
                                  } else if (e.key === "Escape") {
                                    setEditingStaffRateId(null);
                                    setEditingStaffRate("");
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span className={`font-mono font-semibold ${staff.staffHourlyRate ? "text-purple-600" : "text-muted-foreground"}`}>
                                {staff.staffHourlyRate ? `£${parseFloat(staff.staffHourlyRate).toFixed(2)}` : "Not set"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingStaffRateId === staff.id ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingStaffRateId(null);
                                    setEditingStaffRate("");
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => updateStaffRateMutation.mutate({ staffId: staff.id, hourlyRate: editingStaffRate })}
                                  disabled={updateStaffRateMutation.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingStaffRateId(staff.id);
                                  setEditingStaffRate(staff.staffHourlyRate || "");
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Profit Margin Analysis - Shows linked rate pairs (NEW INDEPENDENT SYSTEM) */}
            {(tutorRatesData.length > 0 || parentRatesData.length > 0) && (
              <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 text-chart-2 mr-2" />
                      Profit Margin Analysis
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Optionally link tutor rates to parent rates to calculate profit margins
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    onClick={() => {
                      setLinkingTutorRateId("");
                      setLinkingParentRateId("");
                      setIsLinkRateOpen(true);
                    }}
                    data-testid="button-create-link"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Link Rates
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tutor Rate</TableHead>
                          <TableHead>Parent Rate</TableHead>
                          <TableHead className="text-right text-green-600">Tutor £/hr</TableHead>
                          <TableHead className="text-right text-blue-600">Parent £/hr</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-right">Margin</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rateLinksData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No rate links created yet. Link tutor rates with parent rates to analyze profit margins.
                            </TableCell>
                          </TableRow>
                        ) : (
                          rateLinksData.map((link) => {
                            const tutorRate = tutorRatesData.find(r => r.id === link.tutorRateId);
                            const parentRate = parentRatesData.find(r => r.id === link.parentRateId);
                            
                            if (!tutorRate || !parentRate) return null;
                            
                            const tutorAmount = parseFloat(tutorRate.rate?.toString() || "0");
                            const parentAmount = parseFloat(parentRate.rate?.toString() || "0");
                            const profit = parentAmount - tutorAmount;
                            const profitMargin = parentAmount > 0 ? ((profit / parentAmount) * 100).toFixed(1) : "0";
                            
                            return (
                              <TableRow key={link.id} className="bg-emerald-50/50" data-testid={`row-linked-${link.id}`}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600">{tutorRate.name}</span>
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Tutor</Badge>
                                  </div>
                                  {tutorRate.subject && (
                                    <span className="text-xs text-muted-foreground">{tutorRate.subject}</span>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-600">{parentRate.name}</span>
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Parent</Badge>
                                  </div>
                                  {parentRate.subject && (
                                    <span className="text-xs text-muted-foreground">{parentRate.subject}</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-mono text-green-600 font-semibold">
                                  £{tutorAmount.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-blue-600 font-semibold">
                                  £{parentAmount.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`font-mono font-semibold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    £{profit.toFixed(2)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={profit >= 0 ? "default" : "destructive"} className="font-mono">
                                    {profitMargin}%
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-600 hover:text-orange-700"
                                    onClick={() => {
                                      if (confirm("Remove this rate link? This will NOT delete either rate.")) {
                                        deleteRateLinkMutation.mutate(link.id);
                                      }
                                    }}
                                    data-testid={`button-unlink-${link.id}`}
                                  >
                                    <Link2Off className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Summary stats */}
                  {rateLinksData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      {(() => {
                        const linkedPairs: { tutorAmount: number; parentAmount: number }[] = [];
                        
                        rateLinksData.forEach((link) => {
                          const tutorRate = tutorRatesData.find(r => r.id === link.tutorRateId);
                          const parentRate = parentRatesData.find(r => r.id === link.parentRateId);
                          if (tutorRate && parentRate) {
                            linkedPairs.push({
                              tutorAmount: parseFloat(tutorRate.rate?.toString() || "0"),
                              parentAmount: parseFloat(parentRate.rate?.toString() || "0"),
                            });
                          }
                        });
                        
                        const count = linkedPairs.length;
                        const avgTutorRate = count > 0 ? linkedPairs.reduce((sum, p) => sum + p.tutorAmount, 0) / count : 0;
                        const avgParentRate = count > 0 ? linkedPairs.reduce((sum, p) => sum + p.parentAmount, 0) / count : 0;
                        const avgProfit = avgParentRate - avgTutorRate;
                        const avgMargin = avgParentRate > 0 ? ((avgProfit / avgParentRate) * 100).toFixed(1) : "0";
                        
                        return (
                          <>
                            <div className="p-3 rounded-lg bg-muted/50 text-center">
                              <p className="text-xs text-muted-foreground">Linked Pairs</p>
                              <p className="text-xl font-bold">{count}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10 text-center">
                              <p className="text-xs text-muted-foreground">Avg Tutor Rate</p>
                              <p className="text-xl font-bold text-green-600">£{avgTutorRate.toFixed(2)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                              <p className="text-xs text-muted-foreground">Avg Parent Rate</p>
                              <p className="text-xl font-bold text-blue-600">£{avgParentRate.toFixed(2)}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                              <p className="text-xs text-muted-foreground">Avg Profit Margin</p>
                              <p className="text-xl font-bold text-emerald-600">{avgMargin}%</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Link Rate Dialog (NEW INDEPENDENT SYSTEM) */}
            <Dialog open={isLinkRateOpen} onOpenChange={setIsLinkRateOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-purple-600">
                    <Link2 className="w-5 h-5 mr-2" />
                    Link Rates for Profit Analysis
                  </DialogTitle>
                  <DialogDescription>
                    Link a tutor rate with a parent rate to calculate profit margins. Both rates remain completely independent.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-600">Select Tutor Rate</label>
                    <Select
                      value={linkingTutorRateId}
                      onValueChange={setLinkingTutorRateId}
                    >
                      <SelectTrigger data-testid="select-tutor-rate-link">
                        <SelectValue placeholder="Choose a tutor rate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tutorRatesData.map((rate) => (
                          <SelectItem key={rate.id} value={rate.id}>
                            {rate.name} - £{parseFloat(rate.rate?.toString() || "0").toFixed(2)}/hr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowDown className="w-6 h-6 text-purple-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Select Parent Rate</label>
                    <Select
                      value={linkingParentRateId}
                      onValueChange={setLinkingParentRateId}
                    >
                      <SelectTrigger data-testid="select-parent-rate-link">
                        <SelectValue placeholder="Choose a parent rate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parentRatesData.map((rate) => (
                          <SelectItem key={rate.id} value={rate.id}>
                            {rate.name} - £{parseFloat(rate.rate?.toString() || "0").toFixed(2)}/hr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {linkingTutorRateId && linkingParentRateId && (() => {
                    const tutorRate = tutorRatesData.find(r => r.id === linkingTutorRateId);
                    const parentRate = parentRatesData.find(r => r.id === linkingParentRateId);
                    if (!tutorRate || !parentRate) return null;
                    const tutorAmount = parseFloat(tutorRate.rate?.toString() || "0");
                    const parentAmount = parseFloat(parentRate.rate?.toString() || "0");
                    const profit = parentAmount - tutorAmount;
                    const margin = parentAmount > 0 ? ((profit / parentAmount) * 100).toFixed(1) : "0";
                    
                    return (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-700">Profit Preview</p>
                        <p className={`text-lg font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          £{profit.toFixed(2)}/hr ({margin}% margin)
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLinkRateOpen(false);
                      setLinkingTutorRateId("");
                      setLinkingParentRateId("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      if (linkingTutorRateId && linkingParentRateId) {
                        createRateLinkMutation.mutate({
                          tutorRateId: linkingTutorRateId,
                          parentRateId: linkingParentRateId,
                        });
                      }
                    }}
                    disabled={createRateLinkMutation.isPending || !linkingTutorRateId || !linkingParentRateId}
                    data-testid="button-confirm-link"
                  >
                    {createRateLinkMutation.isPending ? "Linking..." : "Link Rates"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Tutor Rate Dialog (NEW INDEPENDENT SYSTEM) */}
            <Dialog open={isEditTutorRateOpen} onOpenChange={setIsEditTutorRateOpen}>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-green-600">
                    <HandHeart className="w-5 h-5 mr-2" />
                    Edit Tutor Rate
                  </DialogTitle>
                  <DialogDescription>
                    Update this tutor payment rate. Changes will NOT affect any parent rates.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="e.g., Standard Individual Rate"
                      value={tutorRateFormData.name}
                      onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, name: e.target.value })}
                      data-testid="input-edit-tutor-rate-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Optional description"
                      value={tutorRateFormData.description || ""}
                      onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, description: e.target.value })}
                      data-testid="input-edit-tutor-rate-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign to Tutors</label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {tutorRateFormData.tutorIds.length === 0 && tutorRateFormData.tutorGroupIds.length === 0 && (
                        <p className="text-xs text-muted-foreground mb-2">No tutors selected - rate applies to all tutors (Global)</p>
                      )}
                      {allTutors.filter(t => t.isActive).map((tutor) => (
                        <div key={tutor.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-tutor-rate-${tutor.id}`}
                            checked={tutorRateFormData.tutorIds.includes(tutor.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTutorRateFormData({
                                  ...tutorRateFormData,
                                  tutorIds: [...tutorRateFormData.tutorIds, tutor.id]
                                });
                              } else {
                                setTutorRateFormData({
                                  ...tutorRateFormData,
                                  tutorIds: tutorRateFormData.tutorIds.filter(id => id !== tutor.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={`edit-tutor-rate-${tutor.id}`} className="text-sm">
                            {tutor.firstName} {tutor.lastName}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Select tutors this rate applies to. Leave empty for a global rate.</p>
                  </div>
                  {tutorGroupsData.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Or Assign to Tutor Groups</label>
                      <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2">
                        {tutorGroupsData.map((group: any) => (
                          <div key={group.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-tutor-group-rate-${group.id}`}
                              checked={tutorRateFormData.tutorGroupIds.includes(group.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTutorRateFormData({
                                    ...tutorRateFormData,
                                    tutorGroupIds: [...tutorRateFormData.tutorGroupIds, group.id]
                                  });
                                } else {
                                  setTutorRateFormData({
                                    ...tutorRateFormData,
                                    tutorGroupIds: tutorRateFormData.tutorGroupIds.filter(id => id !== group.id)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={`edit-tutor-group-rate-${group.id}`} className="text-sm">
                              {group.name} ({group.members?.length || 0} tutors)
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class Type *</label>
                      <Select
                        value={tutorRateFormData.classType}
                        onValueChange={(value: "individual" | "group") => setTutorRateFormData({ ...tutorRateFormData, classType: value })}
                      >
                        <SelectTrigger data-testid="select-edit-tutor-rate-class-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="e.g., Maths"
                        value={tutorRateFormData.subject || ""}
                        onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, subject: e.target.value })}
                        data-testid="input-edit-tutor-rate-subject"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-600">Tutor Rate (£/hr) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tutorRateFormData.rate}
                      onChange={(e) => setTutorRateFormData({ ...tutorRateFormData, rate: parseFloat(e.target.value) || 0 })}
                      className="border-green-200 focus:border-green-500"
                      data-testid="input-edit-tutor-rate-amount"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editTutorIsDefault"
                        checked={tutorRateFormData.isDefault}
                        onCheckedChange={(checked) => setTutorRateFormData({ ...tutorRateFormData, isDefault: !!checked })}
                        data-testid="checkbox-edit-tutor-rate-default"
                      />
                      <label htmlFor="editTutorIsDefault" className="text-sm">Default rate</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editTutorIsActive"
                        checked={tutorRateFormData.isActive}
                        onCheckedChange={(checked) => setTutorRateFormData({ ...tutorRateFormData, isActive: !!checked })}
                        data-testid="checkbox-edit-tutor-rate-active"
                      />
                      <label htmlFor="editTutorIsActive" className="text-sm">Active</label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditTutorRateOpen(false);
                      setEditingTutorRate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (editingTutorRate) {
                        updateTutorRateMutation.mutate({ id: editingTutorRate.id, data: tutorRateFormData });
                      }
                    }}
                    disabled={updateTutorRateMutation.isPending || isLoadingTutorRateAssignments || !tutorRateFormData.tutorAssignmentsLoaded || !tutorRateFormData.name || tutorRateFormData.rate <= 0}
                    data-testid="button-save-edit-tutor-rate"
                  >
                    {updateTutorRateMutation.isPending ? "Saving..." : isLoadingTutorRateAssignments ? "Loading..." : !tutorRateFormData.tutorAssignmentsLoaded ? "Error Loading" : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Parent Rate Dialog (NEW INDEPENDENT SYSTEM) */}
            <Dialog open={isEditParentRateOpen} onOpenChange={setIsEditParentRateOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-blue-600">
                    <Users className="w-5 h-5 mr-2" />
                    Edit Parent Rate
                  </DialogTitle>
                  <DialogDescription>
                    Update this parent billing rate. Changes will NOT affect any tutor rates.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      placeholder="e.g., Standard Individual Rate"
                      value={parentRateFormData.name}
                      onChange={(e) => setParentRateFormData({ ...parentRateFormData, name: e.target.value })}
                      data-testid="input-edit-parent-rate-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="Optional description"
                      value={parentRateFormData.description || ""}
                      onChange={(e) => setParentRateFormData({ ...parentRateFormData, description: e.target.value })}
                      data-testid="input-edit-parent-rate-description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class Type *</label>
                      <Select
                        value={parentRateFormData.classType}
                        onValueChange={(value: "individual" | "group") => setParentRateFormData({ ...parentRateFormData, classType: value })}
                      >
                        <SelectTrigger data-testid="select-edit-parent-rate-class-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="e.g., Maths"
                        value={parentRateFormData.subject || ""}
                        onChange={(e) => setParentRateFormData({ ...parentRateFormData, subject: e.target.value })}
                        data-testid="input-edit-parent-rate-subject"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-600">Parent Rate (£/hr) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={parentRateFormData.rate}
                      onChange={(e) => setParentRateFormData({ ...parentRateFormData, rate: parseFloat(e.target.value) || 0 })}
                      className="border-blue-200 focus:border-blue-500"
                      data-testid="input-edit-parent-rate-amount"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editParentIsDefault"
                        checked={parentRateFormData.isDefault}
                        onCheckedChange={(checked) => setParentRateFormData({ ...parentRateFormData, isDefault: !!checked })}
                        data-testid="checkbox-edit-parent-rate-default"
                      />
                      <label htmlFor="editParentIsDefault" className="text-sm">Default rate</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editParentIsActive"
                        checked={parentRateFormData.isActive}
                        onCheckedChange={(checked) => setParentRateFormData({ ...parentRateFormData, isActive: !!checked })}
                        data-testid="checkbox-edit-parent-rate-active"
                      />
                      <label htmlFor="editParentIsActive" className="text-sm">Active</label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditParentRateOpen(false);
                      setEditingParentRate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (editingParentRate) {
                        updateParentRateMutation.mutate({ id: editingParentRate.id, data: parentRateFormData });
                      }
                    }}
                    disabled={updateParentRateMutation.isPending || !parentRateFormData.name || parentRateFormData.rate < 0}
                    data-testid="button-save-edit-parent-rate"
                  >
                    {updateParentRateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </TabsContent>

          {/* Tutor/Student Allocations Tab */}
          <TabsContent value="allocations" className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Tutor/Student Allocations</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage student assignments to tutors with individual rates and track profit per tutor
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setAllocationFormData({
                      studentId: "",
                      tutorId: "",
                      subjects: [],
                      parentRate: 0,
                      tutorRate: 0,
                      isPrimary: false,
                      isActive: true,
                      notes: "",
                    });
                    setIsAddAllocationOpen(true);
                  }}
                  data-testid="button-add-allocation"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Allocation
                </Button>
              </div>

              {/* Profit Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profitSummaryLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ) : profitSummary.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-6">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No allocations yet. Create allocations to see profit summary.</p>
                    </CardContent>
                  </Card>
                ) : (
                  profitSummary.map((summary) => (
                    <Card key={summary.tutorId} data-testid={`card-profit-summary-${summary.tutorId}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{summary.tutorName}</h4>
                          <Badge variant={parseFloat(summary.totalProfit) > 0 ? "default" : "destructive"}>
                            {parseFloat(summary.profitMargin).toFixed(0)}% margin
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Allocations</p>
                            <p className="font-medium">{summary.activeAllocations}/{summary.totalAllocations}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Hourly Profit</p>
                            <p className="font-medium text-green-600">£{summary.totalProfit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Parent Revenue</p>
                            <p className="font-medium">£{summary.totalParentRevenue}/hr</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tutor Cost</p>
                            <p className="font-medium">£{summary.totalTutorCost}/hr</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Allocations Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    All Allocations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-right">Parent Rate</TableHead>
                          <TableHead className="text-right">Tutor Rate</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocationsLoading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            </TableCell>
                          </TableRow>
                        ) : allocations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No allocations found. Click "Add Allocation" to create one.
                            </TableCell>
                          </TableRow>
                        ) : (
                          allocations.map((allocation) => (
                            <TableRow key={allocation.id} data-testid={`row-allocation-${allocation.id}`}>
                              <TableCell className="font-medium">
                                {allocation.student?.name || "Unknown Student"}
                                {allocation.isPrimary && (
                                  <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {allocation.tutor?.firstName && allocation.tutor?.lastName
                                  ? `${allocation.tutor.firstName} ${allocation.tutor.lastName}`
                                  : allocation.tutor?.email || "Unknown"}
                              </TableCell>
                              <TableCell>{allocation.subject || "-"}</TableCell>
                              <TableCell className="text-right">£{parseFloat(allocation.parentRate || "0").toFixed(2)}</TableCell>
                              <TableCell className="text-right">£{parseFloat(allocation.tutorRate || "0").toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                £{allocation.profit}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={allocation.isActive ? "default" : "secondary"}>
                                  {allocation.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingAllocation(allocation);
                                      // Parse subject string into array (subjects are stored comma-separated)
                                      const subjectsArray = allocation.subject 
                                        ? allocation.subject.split(", ").filter(s => s.trim())
                                        : [];
                                      setAllocationFormData({
                                        studentId: allocation.studentId,
                                        tutorId: allocation.tutorId,
                                        subjects: subjectsArray,
                                        parentRate: parseFloat(allocation.parentRate || "0"),
                                        tutorRate: parseFloat(allocation.tutorRate || "0"),
                                        isPrimary: allocation.isPrimary,
                                        isActive: allocation.isActive,
                                        notes: allocation.notes || "",
                                      });
                                      setIsEditAllocationOpen(true);
                                    }}
                                    data-testid={`button-edit-allocation-${allocation.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this allocation?")) {
                                        deleteAllocationMutation.mutate(allocation.id);
                                      }
                                    }}
                                    data-testid={`button-delete-allocation-${allocation.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Add Allocation Dialog */}
              <Dialog open={isAddAllocationOpen} onOpenChange={setIsAddAllocationOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Allocation</DialogTitle>
                    <DialogDescription>
                      Assign a student to a tutor with specific rates.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Student</Label>
                      <Select
                        value={allocationFormData.studentId}
                        onValueChange={(val) => {
                          const selectedStudent = students.find((s: StudentWithTutor) => s.id === val);
                          const studentParentRate = selectedStudent?.parentRate ? parseFloat(selectedStudent.parentRate.toString()) : 0;
                          // Auto-populate subjects from student's profile that match available options
                          const studentSubjects = (selectedStudent as any)?.subjects || [];
                          const matchingSubjects = ALLOCATION_SUBJECTS.filter(subject => 
                            studentSubjects.includes(subject)
                          );
                          setAllocationFormData({
                            ...allocationFormData, 
                            studentId: val, 
                            subjects: matchingSubjects,
                            parentRate: studentParentRate
                          });
                        }}
                      >
                        <SelectTrigger data-testid="select-allocation-student">
                          <SelectValue placeholder="Select a student..." />
                        </SelectTrigger>
                        <SelectContent>
                          {students.filter((s: StudentWithTutor) => s.isActive).map((student: StudentWithTutor) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tutor</Label>
                      <Select
                        value={allocationFormData.tutorId}
                        onValueChange={(val) => setAllocationFormData({...allocationFormData, tutorId: val, subjects: allocationFormData.subjects || []})}
                      >
                        <SelectTrigger data-testid="select-allocation-tutor">
                          <SelectValue placeholder="Select a tutor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tutors.filter((t: User) => t.isActive && t.role === "tutor").map((tutor: User) => (
                            <SelectItem key={tutor.id} value={tutor.id}>
                              {tutor.firstName && tutor.lastName
                                ? `${tutor.firstName} ${tutor.lastName}`
                                : tutor.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Subjects</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto" data-testid="select-allocation-subjects">
                        {ALLOCATION_SUBJECTS.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={`allocation-subject-${subject}`}
                              checked={allocationFormData.subjects.includes(subject)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAllocationFormData({
                                    ...allocationFormData,
                                    subjects: [...allocationFormData.subjects, subject]
                                  });
                                } else {
                                  setAllocationFormData({
                                    ...allocationFormData,
                                    subjects: allocationFormData.subjects.filter(s => s !== subject)
                                  });
                                }
                              }}
                              data-testid={`checkbox-allocation-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                            />
                            <Label 
                              htmlFor={`allocation-subject-${subject}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {subject}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {allocationFormData.subjects.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {allocationFormData.subjects.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Parent Rate (£/hr)</Label>
                        <Select
                          value={allocationFormData.parentRate > 0 ? allocationFormData.parentRate.toFixed(2) : ""}
                          onValueChange={(val) => setAllocationFormData({...allocationFormData, parentRate: parseFloat(val)})}
                        >
                          <SelectTrigger data-testid="select-allocation-parent-rate">
                            <SelectValue placeholder="Select rate...">
                              {allocationFormData.parentRate > 0 ? `£${allocationFormData.parentRate.toFixed(2)}/hr` : "Select rate..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {parentRatesData.filter((r: ParentRate) => r.isActive).map((rate: ParentRate) => (
                              <SelectItem key={rate.id} value={parseFloat(rate.rate).toFixed(2)}>
                                £{parseFloat(rate.rate).toFixed(2)} - {rate.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tutor Rate (£/hr)</Label>
                        <Select
                          value={allocationFormData.tutorRate > 0 ? allocationFormData.tutorRate.toFixed(2) : ""}
                          onValueChange={(val) => setAllocationFormData({...allocationFormData, tutorRate: parseFloat(val)})}
                        >
                          <SelectTrigger data-testid="select-allocation-tutor-rate">
                            <SelectValue placeholder="Select rate...">
                              {allocationFormData.tutorRate > 0 ? `£${allocationFormData.tutorRate.toFixed(2)}/hr` : "Select rate..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {tutorRatesData.filter((r: TutorRate) => r.isActive).map((rate: TutorRate) => (
                              <SelectItem key={rate.id} value={parseFloat(rate.rate).toFixed(2)}>
                                £{parseFloat(rate.rate).toFixed(2)} - {rate.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="allocationPrimary"
                          checked={allocationFormData.isPrimary}
                          onCheckedChange={(checked) => setAllocationFormData({...allocationFormData, isPrimary: checked})}
                        />
                        <label htmlFor="allocationPrimary" className="text-sm">Primary Tutor</label>
                      </div>
                    </div>

                    <div>
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={allocationFormData.notes}
                        onChange={(e) => setAllocationFormData({...allocationFormData, notes: e.target.value})}
                        placeholder="Any additional notes..."
                        data-testid="input-allocation-notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddAllocationOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createAllocationMutation.mutate(allocationFormData)}
                      disabled={createAllocationMutation.isPending || !allocationFormData.studentId || !allocationFormData.tutorId}
                      data-testid="button-save-allocation"
                    >
                      {createAllocationMutation.isPending ? "Creating..." : "Create Allocation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Allocation Dialog */}
              <Dialog open={isEditAllocationOpen} onOpenChange={setIsEditAllocationOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Allocation</DialogTitle>
                    <DialogDescription>
                      Update allocation rates and settings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Student</Label>
                        <Input
                          value={editingAllocation?.student?.name || ""}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Tutor</Label>
                        <Input
                          value={editingAllocation?.tutor?.firstName && editingAllocation?.tutor?.lastName
                            ? `${editingAllocation.tutor.firstName} ${editingAllocation.tutor.lastName}`
                            : editingAllocation?.tutor?.email || ""}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Subjects</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto" data-testid="select-edit-allocation-subjects">
                        {ALLOCATION_SUBJECTS.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-allocation-subject-${subject}`}
                              checked={allocationFormData.subjects.includes(subject)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAllocationFormData({
                                    ...allocationFormData,
                                    subjects: [...allocationFormData.subjects, subject]
                                  });
                                } else {
                                  setAllocationFormData({
                                    ...allocationFormData,
                                    subjects: allocationFormData.subjects.filter(s => s !== subject)
                                  });
                                }
                              }}
                              data-testid={`checkbox-edit-allocation-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                            />
                            <Label 
                              htmlFor={`edit-allocation-subject-${subject}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {subject}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {allocationFormData.subjects.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {allocationFormData.subjects.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Parent Rate (£/hr)</Label>
                        <Select
                          value={allocationFormData.parentRate > 0 ? allocationFormData.parentRate.toFixed(2) : ""}
                          onValueChange={(val) => setAllocationFormData({...allocationFormData, parentRate: parseFloat(val)})}
                        >
                          <SelectTrigger data-testid="select-edit-allocation-parent-rate">
                            <SelectValue placeholder="Select rate...">
                              {allocationFormData.parentRate > 0 ? `£${allocationFormData.parentRate.toFixed(2)}/hr` : "Select rate..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {parentRatesData.filter((r: ParentRate) => r.isActive).map((rate: ParentRate) => (
                              <SelectItem key={rate.id} value={parseFloat(rate.rate).toFixed(2)}>
                                £{parseFloat(rate.rate).toFixed(2)} - {rate.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tutor Rate (£/hr)</Label>
                        <Select
                          value={allocationFormData.tutorRate > 0 ? allocationFormData.tutorRate.toFixed(2) : ""}
                          onValueChange={(val) => setAllocationFormData({...allocationFormData, tutorRate: parseFloat(val)})}
                        >
                          <SelectTrigger data-testid="select-edit-allocation-tutor-rate">
                            <SelectValue placeholder="Select rate...">
                              {allocationFormData.tutorRate > 0 ? `£${allocationFormData.tutorRate.toFixed(2)}/hr` : "Select rate..."}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {tutorRatesData.filter((r: TutorRate) => r.isActive).map((rate: TutorRate) => (
                              <SelectItem key={rate.id} value={parseFloat(rate.rate).toFixed(2)}>
                                £{parseFloat(rate.rate).toFixed(2)} - {rate.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="editAllocationPrimary"
                          checked={allocationFormData.isPrimary}
                          onCheckedChange={(checked) => setAllocationFormData({...allocationFormData, isPrimary: checked})}
                        />
                        <label htmlFor="editAllocationPrimary" className="text-sm">Primary Tutor</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="editAllocationActive"
                          checked={allocationFormData.isActive}
                          onCheckedChange={(checked) => setAllocationFormData({...allocationFormData, isActive: checked})}
                        />
                        <label htmlFor="editAllocationActive" className="text-sm">Active</label>
                      </div>
                    </div>

                    <div>
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={allocationFormData.notes}
                        onChange={(e) => setAllocationFormData({...allocationFormData, notes: e.target.value})}
                        placeholder="Any additional notes..."
                        data-testid="input-edit-allocation-notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsEditAllocationOpen(false);
                      setEditingAllocation(null);
                    }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingAllocation) {
                          updateAllocationMutation.mutate({
                            id: editingAllocation.id,
                            data: allocationFormData,
                          });
                        }
                      }}
                      disabled={updateAllocationMutation.isPending}
                      data-testid="button-update-allocation"
                    >
                      {updateAllocationMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Weekly Timesheets Tab */}
          <TabsContent value="weekly-timesheets" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Weekly Timesheet Approvals</h3>
            </div>

            <div className="space-y-4">
              {submittedWeeklyTimesheets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">No weekly timesheets pending review</p>
                  </CardContent>
                </Card>
              ) : (
                submittedWeeklyTimesheets.map((timesheet: WeeklyTimesheetWithRelations) => {
                  const totalHours = timesheet.entries.reduce((sum, e) => sum + parseFloat(e.duration.toString()), 0);
                  const totalTutorPay = timesheet.entries.reduce((sum, e) => sum + parseFloat(e.tutorEarnings.toString()), 0);
                  const totalParentBill = timesheet.entries.reduce((sum, e) => sum + parseFloat(e.parentBilling.toString()), 0);

                  return (
                    <Card key={timesheet.id} data-testid={`card-weekly-timesheet-${timesheet.id}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {timesheet.tutor.firstName && timesheet.tutor.lastName
                                ? `${timesheet.tutor.firstName} ${timesheet.tutor.lastName}`
                                : timesheet.tutor.email}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Week of {format(new Date(timesheet.weekStart), "MMM dd")} - {format(new Date(timesheet.weekEnd), "MMM dd, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {timesheet.submittedAt ? format(new Date(timesheet.submittedAt), "MMM dd, yyyy 'at' h:mm a") : "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                              {timesheet.entries.length} session(s)
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                              {totalHours.toFixed(1)} hours
                            </Badge>
                          </div>
                        </div>

                        <div className="overflow-x-auto mb-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Duration</TableHead>
                                <TableHead className="text-right">Tutor Pay</TableHead>
                                <TableHead className="text-right">Parent Bill</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {groupTimesheetEntries(timesheet.entries).map((grouped) => {
                                if (grouped.type === 'individual') {
                                  const entry = grouped.entries[0];
                                  return (
                                    <TableRow key={entry.id}>
                                      <TableCell>{format(new Date(entry.date), "MMM dd")}</TableCell>
                                      <TableCell>{entry.student.name}</TableCell>
                                      <TableCell>{entry.student.subject}</TableCell>
                                      <TableCell className="text-right">{entry.duration}h</TableCell>
                                      <TableCell className="text-right">£{parseFloat(entry.tutorEarnings.toString()).toFixed(2)}</TableCell>
                                      <TableCell className="text-right">£{parseFloat(entry.parentBilling.toString()).toFixed(2)}</TableCell>
                                      <TableCell className="max-w-[200px]">
                                        {entry.notes ? (
                                          <div className="flex items-start">
                                            <FileText className="w-4 h-4 mr-1 mt-0.5 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground truncate" title={entry.notes}>
                                              {entry.notes}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingEntry({
                                              id: entry.id,
                                              duration: entry.duration.toString(),
                                              tutorEarnings: parseFloat(entry.tutorEarnings.toString()).toFixed(2),
                                              parentBilling: parseFloat(entry.parentBilling.toString()).toFixed(2),
                                              studentName: entry.student.name,
                                            });
                                            setEditEntryDialogOpen(true);
                                          }}
                                          data-testid={`button-edit-entry-${entry.id}`}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                      </TableCell>
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
                                        onClick={() => setExpandedGroupSessionId(expandedGroupSessionId === grouped.id ? null : grouped.id)}
                                        data-testid={`admin-group-session-row-${grouped.id}`}
                                      >
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            {expandedGroupSessionId === grouped.id ? (
                                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            {format(grouped.date, "MMM dd")}
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
                                        <TableCell className="text-right">£{grouped.totalTutorEarnings.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">£{grouped.totalParentBilling.toFixed(2)}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2 text-sm">
                                            <span className="text-green-600">{presentStudents.length} present</span>
                                            {absentStudents.length > 0 && (
                                              <span className="text-orange-500">{absentStudents.length} absent</span>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                      {expandedGroupSessionId === grouped.id && (
                                        <TableRow className="bg-muted/30">
                                          <TableCell colSpan={8} className="p-4">
                                            <div className="space-y-2">
                                              <p className="text-sm font-medium text-muted-foreground mb-2">Student Attendance:</p>
                                              <div className="grid grid-cols-1 gap-2">
                                                {grouped.entries.map((entry) => {
                                                  const isPresent = entry.notes?.includes('Present');
                                                  const isCharged = parseFloat(entry.tutorEarnings.toString()) > 0 || parseFloat(entry.parentBilling.toString()) > 0;
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
                                                        {isPresent ? 'Present' : (isCharged ? 'Absent (charged)' : 'Absent (not charged)')}
                                                      </span>
                                                      {!isPresent && (
                                                        <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                                                          <Label className="text-xs text-muted-foreground">Charge:</Label>
                                                          <Switch
                                                            checked={isCharged}
                                                            onCheckedChange={(checked) => {
                                                              const duration = parseFloat(entry.duration.toString());
                                                              const tutorRate = parseFloat(entry.student?.tutorRate?.toString() || '0');
                                                              const parentRate = parseFloat(entry.student?.parentRate?.toString() || '0');
                                                              updateTimesheetEntryMutation.mutate({
                                                                id: entry.id,
                                                                duration: duration,
                                                                tutorEarnings: checked ? tutorRate * duration : 0,
                                                                parentBilling: checked ? parentRate * duration : 0,
                                                              });
                                                            }}
                                                            data-testid={`switch-charge-absent-${entry.id}`}
                                                          />
                                                        </div>
                                                      )}
                                                      <span className="text-sm ml-auto">
                                                        Tutor: £{parseFloat(entry.tutorEarnings.toString()).toFixed(2)} | Parent: £{parseFloat(entry.parentBilling.toString()).toFixed(2)}
                                                      </span>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setEditingEntry({
                                                            id: entry.id,
                                                            duration: entry.duration.toString(),
                                                            tutorEarnings: parseFloat(entry.tutorEarnings.toString()).toFixed(2),
                                                            parentBilling: parseFloat(entry.parentBilling.toString()).toFixed(2),
                                                            studentName: entry.student.name,
                                                          });
                                                          setEditEntryDialogOpen(true);
                                                        }}
                                                        data-testid={`button-edit-group-entry-${entry.id}`}
                                                      >
                                                        <Edit className="w-4 h-4" />
                                                      </Button>
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
                                <TableCell colSpan={3} className="font-semibold">Total</TableCell>
                                <TableCell className="text-right font-semibold">{totalHours.toFixed(1)}h</TableCell>
                                <TableCell className="text-right font-semibold">£{totalTutorPay.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">£{totalParentBill.toFixed(2)}</TableCell>
                                <TableCell colSpan={2}></TableCell>
                              </TableRow>
                            </TableFooter>
                          </Table>
                        </div>

                        {/* Status History Section */}
                        <StatusHistorySection 
                          timesheetId={timesheet.id}
                          isExpanded={expandedStatusHistoryId === timesheet.id}
                          onToggle={() => setExpandedStatusHistoryId(
                            expandedStatusHistoryId === timesheet.id ? null : timesheet.id
                          )}
                        />

                        {/* Notes input for review */}
                        <div className="mb-4">
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Review Notes (Optional)
                          </label>
                          <Textarea
                            placeholder="Add notes for the tutor..."
                            value={reviewNotes[timesheet.id] || ""}
                            onChange={(e) =>
                              setReviewNotes((prev) => ({ ...prev, [timesheet.id]: e.target.value }))
                            }
                            className="h-20"
                            data-testid={`textarea-review-notes-${timesheet.id}`}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setRejectingTimesheetId(timesheet.id);
                              setRejectionReason("");
                              setRejectDialogOpen(true);
                            }}
                            disabled={rejectWeeklyTimesheetMutation.isPending}
                            data-testid={`button-reject-weekly-${timesheet.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() =>
                              approveWeeklyTimesheetMutation.mutate({
                                id: timesheet.id,
                                notes: reviewNotes[timesheet.id],
                              })
                            }
                            disabled={approveWeeklyTimesheetMutation.isPending}
                            data-testid={`button-approve-weekly-${timesheet.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Rejection Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Timesheet</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this timesheet. The tutor will see this message and can amend their timesheet accordingly.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rejection Reason *</label>
                    <Textarea
                      placeholder="Explain why this timesheet is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="textarea-rejection-reason"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (rejectingTimesheetId && rejectionReason.trim()) {
                        rejectWeeklyTimesheetMutation.mutate({
                          id: rejectingTimesheetId,
                          notes: rejectionReason,
                        });
                        setRejectDialogOpen(false);
                        setRejectingTimesheetId(null);
                        setRejectionReason("");
                      }
                    }}
                    disabled={!rejectionReason.trim() || rejectWeeklyTimesheetMutation.isPending}
                    data-testid="button-confirm-reject"
                  >
                    {rejectWeeklyTimesheetMutation.isPending ? "Rejecting..." : "Reject Timesheet"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Entry Dialog */}
            <Dialog open={editEntryDialogOpen} onOpenChange={setEditEntryDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Session Entry</DialogTitle>
                  <DialogDescription>
                    Update the session details for {editingEntry?.studentName}
                  </DialogDescription>
                </DialogHeader>
                {editingEntry && (
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Duration (hours)</label>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        value={editingEntry.duration}
                        onChange={(e) => setEditingEntry({ ...editingEntry, duration: e.target.value })}
                        data-testid="input-edit-duration"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tutor Pay ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingEntry.tutorEarnings}
                        onChange={(e) => setEditingEntry({ ...editingEntry, tutorEarnings: e.target.value })}
                        data-testid="input-edit-tutor-earnings"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Parent Bill ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingEntry.parentBilling}
                        onChange={(e) => setEditingEntry({ ...editingEntry, parentBilling: e.target.value })}
                        data-testid="input-edit-parent-billing"
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditEntryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editingEntry) {
                        updateTimesheetEntryMutation.mutate({
                          id: editingEntry.id,
                          duration: parseFloat(editingEntry.duration),
                          tutorEarnings: parseFloat(editingEntry.tutorEarnings),
                          parentBilling: parseFloat(editingEntry.parentBilling),
                        });
                      }
                    }}
                    disabled={updateTimesheetEntryMutation.isPending}
                    data-testid="button-save-entry"
                  >
                    {updateTimesheetEntryMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Financial Ledger Tab (Legacy) */}
          <TabsContent value="timesheets" className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold">Financial Ledger</h3>
                <p className="text-muted-foreground text-sm">
                  {groupedLedger?.fiscalYearLabel || 'Fiscal Year'} - All invoices grouped by parent and tutor
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="fiscal-year-select" className="text-sm whitespace-nowrap">Fiscal Year:</Label>
                <Select
                  value={legacyFiscalYear?.toString() ?? fiscalYearsData?.currentFiscalYear?.toString() ?? ""}
                  onValueChange={(val) => setLegacyFiscalYear(val ? parseInt(val) : undefined)}
                >
                  <SelectTrigger id="fiscal-year-select" className="w-[180px]" data-testid="select-fiscal-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYearsData?.fiscalYears && fiscalYearsData.fiscalYears.length > 0 ? (
                      fiscalYearsData.fiscalYears.map((fy) => (
                        <SelectItem key={fy.year} value={fy.year.toString()}>
                          {fy.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {groupedLedgerLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue (Booked)</p>
                          <p className="text-2xl font-bold text-foreground">
                            £{(groupedLedger?.bookedIn || 0).toFixed(2)}
                          </p>
                        </div>
                        <ArrowDownLeft className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        All invoices sent to parents
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue (Paid)</p>
                          <p className="text-2xl font-bold text-green-600">
                            £{(groupedLedger?.paidIn || 0).toFixed(2)}
                          </p>
                        </div>
                        <ArrowDownLeft className="w-8 h-8 text-green-600 opacity-50" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        From {(groupedLedger?.parentGroups || []).length} parents
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Expenditure (Booked)</p>
                          <p className="text-2xl font-bold text-foreground">
                            £{(groupedLedger?.bookedOut || 0).toFixed(2)}
                          </p>
                        </div>
                        <ArrowUpRight className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        All tutor invoices submitted
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Expenditure (Paid)</p>
                          <p className="text-2xl font-bold text-red-600">
                            £{(groupedLedger?.paidOut || 0).toFixed(2)}
                          </p>
                        </div>
                        <ArrowUpRight className="w-8 h-8 text-red-600 opacity-50" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        To {(groupedLedger?.tutorGroups || []).length} tutors
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Net Profit Card */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Net Profit (Paid Revenue - Paid Expenditure)</p>
                        <p className={`text-2xl font-bold ${(groupedLedger?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          £{(groupedLedger?.netProfit || 0).toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Money In Section - Grouped by Parent */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-600">
                        <ArrowDownLeft className="w-5 h-5 mr-2" />
                        Money In (From Parents)
                      </CardTitle>
                      <CardDescription>
                        Click on a parent to see individual invoices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(groupedLedger?.parentGroups || []).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No paid invoices yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {(groupedLedger?.parentGroups || []).map((parentGroup) => (
                            <div key={parentGroup.parentId} className="border rounded-lg">
                              <div 
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                onClick={() => setExpandedLedgerParent(
                                  expandedLedgerParent === parentGroup.parentId ? null : parentGroup.parentId
                                )}
                                data-testid={`ledger-parent-${parentGroup.parentId}`}
                              >
                                <div className="flex items-center gap-3">
                                  {expandedLedgerParent === parentGroup.parentId ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="font-medium">{parentGroup.parentName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {parentGroup.invoiceCount} invoice{parentGroup.invoiceCount !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">
                                    Booked: £{parentGroup.totalBooked.toFixed(2)}
                                  </p>
                                  <p className="font-bold text-green-600">
                                    Paid: £{parentGroup.totalPaid.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              
                              {expandedLedgerParent === parentGroup.parentId && (
                                <div className="border-t bg-muted/30 p-3 space-y-2">
                                  {parentGroup.invoices.map((inv) => (
                                    <div 
                                      key={inv.id} 
                                      className="p-3 bg-background rounded-lg border"
                                      data-testid={`ledger-parent-invoice-${inv.id}`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {inv.type === 'parent_invoice' ? 'Sessions' : 'Adhoc'}
                                          </Badge>
                                          <Badge 
                                            variant={inv.status === 'paid' ? 'default' : inv.status === 'sent' ? 'secondary' : 'outline'} 
                                            className={`text-xs ${inv.status === 'paid' ? 'bg-green-600' : ''}`}
                                          >
                                            {inv.status}
                                          </Badge>
                                          <span className="font-medium text-sm">{inv.invoiceNumber}</span>
                                        </div>
                                        <p className={`font-bold ${inv.status === 'paid' ? 'text-green-600' : 'text-muted-foreground'}`}>
                                          {inv.status === 'paid' ? '+' : ''}£{parseFloat(inv.amount).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        {inv.studentName && (
                                          <p>Student: {inv.studentName}</p>
                                        )}
                                        <p>{inv.description}</p>
                                        <div className="flex gap-4 text-xs">
                                          {inv.sentAt && (
                                            <span>Sent: {format(new Date(inv.sentAt), "dd MMM yyyy")}</span>
                                          )}
                                          {inv.paidAt && (
                                            <span className="text-green-600">Paid: {format(new Date(inv.paidAt), "dd MMM yyyy")}</span>
                                          )}
                                        </div>
                                        {inv.notes && (
                                          <p className="text-xs italic mt-1">Notes: {inv.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Money Out Section - Grouped by Tutor */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <ArrowUpRight className="w-5 h-5 mr-2" />
                        Money Out (To Tutors)
                      </CardTitle>
                      <CardDescription>
                        Click on a tutor to see individual invoices and status history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(groupedLedger?.tutorGroups || []).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <HandHeart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No tutor invoices yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                          {(groupedLedger?.tutorGroups || []).map((tutorGroup) => (
                            <div key={tutorGroup.tutorId} className="border rounded-lg">
                              <div 
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                onClick={() => setExpandedLedgerTutor(
                                  expandedLedgerTutor === tutorGroup.tutorId ? null : tutorGroup.tutorId
                                )}
                                data-testid={`ledger-tutor-${tutorGroup.tutorId}`}
                              >
                                <div className="flex items-center gap-3">
                                  {expandedLedgerTutor === tutorGroup.tutorId ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="font-medium">{tutorGroup.tutorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {tutorGroup.invoiceCount} invoice{tutorGroup.invoiceCount !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">
                                    Booked: £{tutorGroup.totalBooked.toFixed(2)}
                                  </p>
                                  <p className="font-bold text-red-600">
                                    Paid: £{tutorGroup.totalPaid.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              
                              {expandedLedgerTutor === tutorGroup.tutorId && (
                                <div className="border-t bg-muted/30 p-3 space-y-2">
                                  {tutorGroup.invoices.map((inv) => (
                                    <div 
                                      key={inv.id} 
                                      className="p-3 bg-background rounded-lg border"
                                      data-testid={`ledger-tutor-invoice-${inv.id}`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{inv.invoiceNumber}</span>
                                          <Badge 
                                            variant={
                                              inv.status === 'paid' ? 'default' :
                                              inv.status === 'approved' ? 'secondary' :
                                              inv.status === 'rejected' ? 'destructive' :
                                              'outline'
                                            }
                                            className="text-xs"
                                          >
                                            {inv.status}
                                          </Badge>
                                        </div>
                                        <p className={`font-bold ${inv.status === 'paid' ? 'text-red-600' : 'text-muted-foreground'}`}>
                                          {inv.status === 'paid' ? '-' : ''}£{parseFloat(inv.amount).toFixed(2)}
                                        </p>
                                      </div>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        <p>{inv.hoursWorked}h worked</p>
                                        {inv.weekStart && inv.weekEnd && (
                                          <p className="text-xs">
                                            Week: {format(new Date(inv.weekStart), "dd MMM")} - {format(new Date(inv.weekEnd), "dd MMM yyyy")}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-3 text-xs">
                                          {inv.submittedAt && (
                                            <span>Submitted: {format(new Date(inv.submittedAt), "dd MMM yyyy")}</span>
                                          )}
                                          {inv.approvedAt && (
                                            <span className="text-green-600">Approved: {format(new Date(inv.approvedAt), "dd MMM yyyy")}</span>
                                          )}
                                          {inv.paidAt && (
                                            <span className="text-blue-600">Paid: {format(new Date(inv.paidAt), "dd MMM yyyy")}</span>
                                          )}
                                        </div>
                                        
                                        {/* Show rejection reason if rejected */}
                                        {inv.status === 'rejected' && inv.rejectionReason && (
                                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900">
                                            <p className="text-xs font-medium text-red-600">Rejection Reason:</p>
                                            <p className="text-xs text-red-600">{inv.rejectionReason}</p>
                                          </div>
                                        )}
                                        
                                        {/* Status History */}
                                        {inv.statusHistory && inv.statusHistory.length > 0 && (
                                          <div className="mt-2 pt-2 border-t">
                                            <p className="text-xs font-medium mb-1">Status History:</p>
                                            <div className="space-y-1">
                                              {inv.statusHistory.map((history, idx) => (
                                                <div key={idx} className="text-xs flex items-center gap-2">
                                                  <Badge 
                                                    variant={
                                                      history.status === 'approved' ? 'default' :
                                                      history.status === 'rejected' ? 'destructive' :
                                                      'outline'
                                                    }
                                                    className="text-xs"
                                                  >
                                                    {history.status}
                                                  </Badge>
                                                  <span className="text-muted-foreground">
                                                    by {history.changedByName} on {format(new Date(history.changedAt), "dd MMM yyyy HH:mm")}
                                                  </span>
                                                  {history.notes && (
                                                    <span className="italic text-muted-foreground">- {history.notes}</span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {inv.notes && (
                                          <p className="text-xs italic mt-1">Notes: {inv.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Legacy timesheet history removed - Financial Ledger tab above now shows all paid invoices */}
          {/* The legacy unused state variables below are kept for type compatibility */}
          {(() => {
            // Suppress unused variable warnings by referencing legacy state
            void legacyTutorFilter; void legacyStatusFilter; void expandedLegacyTutor; 
            void expandedLegacyWeek; void expandedLegacyGroupSession;
            return null;
          })()}

          {/* End of legacy placeholder */}


          {/* Invoices & Payments Tab */}
          <TabsContent value="invoices" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Invoices & Payment Management</h3>
              <div className="flex space-x-2">
                <Button onClick={() => setIsCreateAdhocInvoiceOpen(true)} data-testid="button-create-adhoc-invoice">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Adhoc Invoice
                </Button>
                <Button variant="outline" data-testid="button-export-quickbooks">
                  <Download className="w-4 h-4 mr-2" />
                  Export to QuickBooks
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tutor Invoices - This Week */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HandHeart className="w-5 h-5 text-primary mr-2" />
                    Tutor Invoices - This Week
                  </CardTitle>
                  <CardDescription>
                    Invoices submitted by tutors for payment this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tutorInvoicesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : tutorInvoicesThisWeek.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <HandHeart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No tutor invoices submitted this week</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tutorInvoicesThisWeek.map((invoice) => (
                        <div 
                          key={invoice.id} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                          data-testid={`tutor-invoice-${invoice.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium" data-testid={`text-tutor-invoice-name-${invoice.id}`}>
                                {invoice.tutor?.firstName} {invoice.tutor?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.submittedAt ? new Date(invoice.submittedAt).toLocaleDateString() : "N/A"} • {invoice.invoiceNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-600" data-testid={`text-tutor-invoice-amount-${invoice.id}`}>
                              £{parseFloat(invoice.amount).toFixed(2)}
                            </p>
                            <Badge 
                              variant={invoice.status === "paid" ? "default" : invoice.status === "approved" ? "secondary" : "outline"}
                              className={invoice.status === "paid" ? "bg-green-100 text-green-800" : ""}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {tutorInvoicesThisWeek.length > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total This Week:</span>
                            <span className="font-bold text-lg text-green-600">
                              £{tutorInvoicesThisWeek.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Outstanding Parent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <File className="w-5 h-5 text-chart-1 mr-2" />
                    Outstanding Parent Invoices ({parentInvoices.filter(inv => inv.status !== "paid" && inv.status !== "cancelled").length})
                  </CardTitle>
                  <CardDescription>
                    Invoices awaiting payment from parents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {parentInvoicesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (() => {
                    const outstandingInvoices = parentInvoices.filter(inv => inv.status !== "paid" && inv.status !== "cancelled");
                    return outstandingInvoices.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p>No outstanding invoices</p>
                        <p className="text-sm mt-1">All invoices have been paid!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {outstandingInvoices.map((invoice) => (
                          <div 
                            key={invoice.id} 
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                            data-testid={`parent-invoice-${invoice.id}`}
                          >
                            <div>
                              <p className="font-bold text-base" data-testid={`text-parent-invoice-student-${invoice.id}`}>
                                {invoice.student?.name || "Unknown Student"}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-parent-invoice-number-${invoice.id}`}>
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Sent: {invoice.sentAt ? new Date(invoice.sentAt).toLocaleDateString() : (invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "N/A")} • {invoice.sessionsIncluded} sessions • Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-lg text-blue-600" data-testid={`text-parent-invoice-amount-${invoice.id}`}>
                                  £{parseFloat(invoice.amount).toFixed(2)}
                                </p>
                                <Badge 
                                  variant={invoice.status === "overdue" ? "destructive" : invoice.status === "sent" ? "secondary" : invoice.status === "scheduled" ? "outline" : "outline"}
                                  className={invoice.status === "overdue" ? "bg-red-100 text-red-800" : invoice.status === "scheduled" ? "bg-purple-100 text-purple-800" : ""}
                                >
                                  {invoice.status === "scheduled" && (invoice as any).scheduledSendDate 
                                    ? `Scheduled: ${new Date((invoice as any).scheduledSendDate).toLocaleDateString()}`
                                    : invoice.status}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingParentInvoice(invoice);
                                  const studentRate = invoice.student?.parentRate ? parseFloat(invoice.student.parentRate.toString()) : 0;
                                  const matchingRate = parentRatesData.find((r: ParentRate) => 
                                    parseFloat(r.ratePerHour) === studentRate || parseFloat(r.rate) === studentRate
                                  );
                                  setParentInvoiceFormData({
                                    amount: invoice.amount,
                                    sessionsIncluded: invoice.sessionsIncluded || 0,
                                    selectedRateId: matchingRate?.id || "",
                                    status: invoice.status as any,
                                    notes: invoice.notes || "",
                                  });
                                  setIsEditParentInvoiceOpen(true);
                                }}
                                data-testid={`button-edit-parent-invoice-${invoice.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

            </div>

            {/* Paid/Settled Parent Invoices - Full Width Card */}
            <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    Paid/Settled Parent Invoices ({parentInvoices.filter(inv => inv.status === "paid").length})
                  </CardTitle>
                  <CardDescription>
                    Completed payments from parents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const paidInvoices = parentInvoices.filter(inv => inv.status === "paid");
                    
                    const filteredPaidInvoices = paidInvoices.filter(inv => {
                      if (paidInvoiceFilters.studentName && 
                          !inv.student?.name?.toLowerCase().includes(paidInvoiceFilters.studentName.toLowerCase())) {
                        return false;
                      }
                      if (paidInvoiceFilters.parentName) {
                        const parentName = `${inv.student?.parentName || ""} ${(inv.student as any)?.parentSurname || ""}`.toLowerCase();
                        if (!parentName.includes(paidInvoiceFilters.parentName.toLowerCase())) {
                          return false;
                        }
                      }
                      if (paidInvoiceFilters.tutorName) {
                        const tutorName = `${(inv.student as any)?.tutor?.firstName || ""} ${(inv.student as any)?.tutor?.lastName || ""}`.toLowerCase();
                        if (!tutorName.includes(paidInvoiceFilters.tutorName.toLowerCase())) {
                          return false;
                        }
                      }
                      if (paidInvoiceFilters.month) {
                        const invoiceDate = inv.paidAt ? new Date(inv.paidAt) : (inv.createdAt ? new Date(inv.createdAt) : null);
                        if (!invoiceDate || (invoiceDate.getMonth() + 1).toString() !== paidInvoiceFilters.month) {
                          return false;
                        }
                      }
                      if (paidInvoiceFilters.year) {
                        const invoiceDate = inv.paidAt ? new Date(inv.paidAt) : (inv.createdAt ? new Date(inv.createdAt) : null);
                        if (!invoiceDate || invoiceDate.getFullYear().toString() !== paidInvoiceFilters.year) {
                          return false;
                        }
                      }
                      const amount = parseFloat(inv.amount);
                      if (paidInvoiceFilters.minAmount && amount < parseFloat(paidInvoiceFilters.minAmount)) {
                        return false;
                      }
                      if (paidInvoiceFilters.maxAmount && amount > parseFloat(paidInvoiceFilters.maxAmount)) {
                        return false;
                      }
                      return true;
                    });
                    
                    return (
                      <div className="space-y-4">
                        {/* Filters */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-3 bg-muted/30 rounded-lg">
                          <Input
                            placeholder="Student name"
                            value={paidInvoiceFilters.studentName}
                            onChange={(e) => setPaidInvoiceFilters(prev => ({ ...prev, studentName: e.target.value }))}
                            className="h-8 text-sm"
                            data-testid="filter-student-name"
                          />
                          <Input
                            placeholder="Parent name"
                            value={paidInvoiceFilters.parentName}
                            onChange={(e) => setPaidInvoiceFilters(prev => ({ ...prev, parentName: e.target.value }))}
                            className="h-8 text-sm"
                            data-testid="filter-parent-name"
                          />
                          <Input
                            placeholder="Tutor name"
                            value={paidInvoiceFilters.tutorName}
                            onChange={(e) => setPaidInvoiceFilters(prev => ({ ...prev, tutorName: e.target.value }))}
                            className="h-8 text-sm"
                            data-testid="filter-tutor-name"
                          />
                          <Select
                            value={paidInvoiceFilters.month || "all"}
                            onValueChange={(value) => setPaidInvoiceFilters(prev => ({ ...prev, month: value === "all" ? "" : value }))}
                          >
                            <SelectTrigger className="h-8 text-sm" data-testid="filter-month">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Months</SelectItem>
                              {monthNames.map((month, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Year"
                            type="number"
                            value={paidInvoiceFilters.year}
                            onChange={(e) => setPaidInvoiceFilters(prev => ({ ...prev, year: e.target.value }))}
                            className="h-8 text-sm"
                            data-testid="filter-year"
                          />
                          <Input
                            placeholder="Min £"
                            type="number"
                            value={paidInvoiceFilters.minAmount}
                            onChange={(e) => setPaidInvoiceFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                            className="h-8 text-sm"
                            data-testid="filter-min-amount"
                          />
                          <Input
                            placeholder="Max £"
                            type="number"
                            value={paidInvoiceFilters.maxAmount}
                            onChange={(e) => setPaidInvoiceFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                            className="h-8 text-sm"
                            data-testid="filter-max-amount"
                          />
                        </div>
                        
                        {/* Clear Filters Button */}
                        {(paidInvoiceFilters.studentName || paidInvoiceFilters.parentName || paidInvoiceFilters.tutorName || 
                          paidInvoiceFilters.month || paidInvoiceFilters.year || paidInvoiceFilters.minAmount || paidInvoiceFilters.maxAmount) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPaidInvoiceFilters({
                              studentName: "",
                              parentName: "",
                              tutorName: "",
                              month: "",
                              year: "",
                              minAmount: "",
                              maxAmount: "",
                            })}
                            className="text-muted-foreground"
                            data-testid="button-clear-filters"
                          >
                            <X className="w-3 h-3 mr-1" /> Clear Filters
                          </Button>
                        )}
                        
                        {/* Results */}
                        <p className="text-sm text-muted-foreground">
                          Showing {filteredPaidInvoices.length} of {paidInvoices.length} paid invoices
                        </p>
                        
                        {filteredPaidInvoices.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No paid invoices found</p>
                            {paidInvoices.length > 0 && (
                              <p className="text-sm mt-1">Try adjusting your filters</p>
                            )}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Invoice #</TableHead>
                                  <TableHead>Student</TableHead>
                                  <TableHead>Parent</TableHead>
                                  <TableHead>Paid Date</TableHead>
                                  <TableHead>Sessions</TableHead>
                                  <TableHead className="text-right">Amount</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredPaidInvoices.map((invoice) => (
                                  <TableRow key={invoice.id} data-testid={`paid-invoice-${invoice.id}`}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{invoice.student?.name || "Unknown"}</TableCell>
                                    <TableCell>
                                      {invoice.student?.parentName || ""} {(invoice.student as any)?.parentSurname || ""}
                                    </TableCell>
                                    <TableCell>
                                      {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : (invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "N/A")}
                                    </TableCell>
                                    <TableCell>{invoice.sessionsIncluded}</TableCell>
                                    <TableCell className="text-right font-bold text-green-600">
                                      £{parseFloat(invoice.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingParentInvoice(invoice);
                                          const studentRate = invoice.student?.parentRate ? parseFloat(invoice.student.parentRate.toString()) : 0;
                                          const matchingRate = parentRatesData.find((r: ParentRate) => 
                                            parseFloat(r.ratePerHour) === studentRate || parseFloat(r.rate) === studentRate
                                          );
                                          setParentInvoiceFormData({
                                            amount: invoice.amount,
                                            sessionsIncluded: invoice.sessionsIncluded || 0,
                                            selectedRateId: matchingRate?.id || "",
                                            status: invoice.status as any,
                                            notes: invoice.notes || "",
                                          });
                                          setIsEditParentInvoiceOpen(true);
                                        }}
                                        data-testid={`button-view-paid-invoice-${invoice.id}`}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableFooter>
                                <TableRow>
                                  <TableCell colSpan={5} className="font-bold">Total</TableCell>
                                  <TableCell className="text-right font-bold text-green-600">
                                    £{filteredPaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0).toFixed(2)}
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

            {/* Adhoc Invoices Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 text-orange-500 mr-2" />
                  Adhoc Invoices
                </CardTitle>
                <CardDescription>
                  Manual invoices not tied to students - for one-off payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adhocInvoicesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : adhocInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No adhoc invoices yet</p>
                    <p className="text-sm mt-1">Click "Create Adhoc Invoice" to create a manual invoice</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Parent Name</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adhocInvoices.map((invoice) => (
                          <TableRow key={invoice.id} data-testid={`adhoc-invoice-${invoice.id}`}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {invoice.category === "lesson" ? "Lesson" :
                                 invoice.category === "textbook_maths" ? "Maths Textbook" :
                                 invoice.category === "textbook_vr" ? "VR Textbook" :
                                 invoice.category === "textbook_bundle" ? "Textbook Bundle" :
                                 invoice.category === "mock_exam" ? "Mock Exam" :
                                 invoice.category === "mathz_skillz" ? "Mathz Skillz" :
                                 "Other"}
                              </Badge>
                            </TableCell>
                            <TableCell>{invoice.parentFirstName} {invoice.parentSurname}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{invoice.reason}</TableCell>
                            <TableCell className="font-bold text-blue-600">£{parseFloat(invoice.amount).toFixed(2)}</TableCell>
                            <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={invoice.status === "paid" ? "default" : invoice.status === "sent" ? "secondary" : invoice.status === "approved" ? "secondary" : "outline"}
                                className={invoice.status === "paid" ? "bg-green-100 text-green-800" : invoice.status === "approved" ? "bg-blue-100 text-blue-800" : invoice.status === "overdue" ? "bg-red-100 text-red-800" : invoice.status === "scheduled" ? "bg-purple-100 text-purple-800" : ""}
                              >
                                {invoice.status === "scheduled" && (invoice as any).scheduledSendDate 
                                  ? `Scheduled: ${new Date((invoice as any).scheduledSendDate).toLocaleDateString()}`
                                  : invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingAdhocInvoice(invoice);
                                  setAdhocInvoiceFormData({
                                    category: (invoice.category || "other") as "lesson" | "textbook_maths" | "textbook_vr" | "textbook_bundle" | "mock_exam" | "mathz_skillz" | "other",
                                    studentId: invoice.studentId || "",
                                    parentFirstName: invoice.parentFirstName,
                                    parentSurname: invoice.parentSurname,
                                    amount: invoice.amount,
                                    reason: invoice.reason,
                                    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
                                    status: invoice.status as "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled",
                                    notes: invoice.notes || "",
                                  });
                                  setIsEditAdhocInvoiceOpen(true);
                                }}
                                data-testid={`button-edit-adhoc-${invoice.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Tutor Invoices Table with Awaiting/Paid Toggle */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 text-primary mr-2" />
                      Tutor Invoices
                    </CardTitle>
                    <CardDescription>
                      Payment requests from tutors
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={tutorInvoiceView === "awaiting" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTutorInvoiceView("awaiting")}
                      data-testid="btn-tutor-invoices-awaiting"
                    >
                      Awaiting Payment ({allTutorInvoices.filter(inv => inv.status !== "paid").length})
                    </Button>
                    <Button
                      variant={tutorInvoiceView === "paid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTutorInvoiceView("paid")}
                      data-testid="btn-tutor-invoices-paid"
                    >
                      Paid ({allTutorInvoices.filter(inv => inv.status === "paid").length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tutorInvoiceView === "awaiting" ? (
                  allTutorInvoices.filter(inv => inv.status !== "paid").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No tutor invoices awaiting payment</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allTutorInvoices.filter(inv => inv.status !== "paid").map((invoice) => (
                            <TableRow key={invoice.id} data-testid={`row-tutor-invoice-${invoice.id}`}>
                              <TableCell className="font-mono text-sm">
                                {invoice.invoiceNumber}
                              </TableCell>
                              <TableCell>
                                {invoice.tutor?.firstName} {invoice.tutor?.lastName}
                              </TableCell>
                              <TableCell>
                                {invoice.submittedAt ? new Date(invoice.submittedAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell className="text-right font-bold text-green-600">
                                £{parseFloat(invoice.amount).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary">
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {invoice.notes || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  onClick={() => markTutorInvoicePaidMutation.mutate(invoice.id)}
                                  disabled={markTutorInvoicePaidMutation.isPending}
                                  data-testid={`btn-mark-paid-${invoice.id}`}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Mark Paid
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                ) : (
                  allTutorInvoices.filter(inv => inv.status === "paid").length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No paid tutor invoices yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Paid On</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allTutorInvoices.filter(inv => inv.status === "paid").map((invoice) => (
                            <TableRow key={invoice.id} data-testid={`row-tutor-invoice-paid-${invoice.id}`}>
                              <TableCell className="font-mono text-sm">
                                {invoice.invoiceNumber}
                              </TableCell>
                              <TableCell>
                                {invoice.tutor?.firstName} {invoice.tutor?.lastName}
                              </TableCell>
                              <TableCell>
                                {invoice.submittedAt ? new Date(invoice.submittedAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell className="text-right font-bold text-green-600">
                                £{parseFloat(invoice.amount).toFixed(2)}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {invoice.notes || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="p-4 sm:p-6">
            <AdminInventory />
          </TabsContent>

          {/* Mock Exams Tab */}
          <TabsContent value="mock-exams" className="p-4 sm:p-6">
            <AdminMockExams />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-4 sm:p-6">
            <AdminDocuments />
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold">Archive - Ex-Students & Ex-Tutors</h3>
              <div className="flex gap-2">
                <Button
                  variant={archiveView === "students" ? "default" : "outline"}
                  onClick={() => setArchiveView("students")}
                  data-testid="button-archive-students"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Ex-Students
                </Button>
                <Button
                  variant={archiveView === "tutors" ? "default" : "outline"}
                  onClick={() => setArchiveView("tutors")}
                  data-testid="button-archive-tutors"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Ex-Tutors
                </Button>
              </div>
            </div>

            {archiveView === "students" && (
              <div className="overflow-x-auto mobile-scroll">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Parent First Name</TableHead>
                      <TableHead>Parent Surname</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead className="text-center">Total Sessions</TableHead>
                      <TableHead className="text-right">Parent Rate</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archivedStudentsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : archivedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No archived students found</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Students will appear here when they are archived
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      archivedStudents.map((student) => {
                        const isExpanded = expandedArchivedStudents.has(student.id);
                        const parentFirstName = student.parentName || "-";
                        const parentSurname = (student as any).parentSurname || "-";
                        
                        return (
                          <>
                            <TableRow 
                              key={student.id} 
                              data-testid={`row-archived-student-${student.id}`}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => toggleArchivedStudentExpand(student.id)}
                            >
                              <TableCell className="w-10">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleArchivedStudentExpand(student.id);
                                  }}
                                  data-testid={`button-expand-archived-student-${student.id}`}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium" data-testid={`text-archived-student-name-${student.id}`}>
                                {student.name}
                              </TableCell>
                              <TableCell>{parentFirstName}</TableCell>
                              <TableCell>{parentSurname}</TableCell>
                              <TableCell>
                                {student.tutor?.firstName && student.tutor?.lastName
                                  ? `${student.tutor.firstName} ${student.tutor.lastName}`
                                  : ""}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="font-medium">
                                  {student.sessionCount}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                £{parseFloat((student.parentRate || 0).toString()).toFixed(2)}/hr
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedArchivedStudent(student)}
                                    data-testid={`button-view-archived-student-${student.id}`}
                                    title="View details"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => restoreStudentMutation.mutate(student.id)}
                                    disabled={restoreStudentMutation.isPending}
                                    data-testid={`button-restore-student-${student.id}`}
                                    title="Restore student"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                        data-testid={`button-delete-student-${student.id}`}
                                        title="Permanently delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Permanently Delete Student?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete {student.name} and all associated records including session history.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => deleteStudentMutation.mutate(student.id)}
                                        >
                                          {deleteStudentMutation.isPending ? "Deleting..." : "Delete Permanently"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                            {isExpanded && (
                              <TableRow key={`${student.id}-details`} className="bg-muted/30">
                                <TableCell colSpan={8} className="py-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-muted-foreground">Subject:</span>
                                      <p className="mt-1">{student.subject}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Exam Type:</span>
                                      <p className="mt-1">{(student as any).examType || "-"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Class Type:</span>
                                      <p className="mt-1 capitalize">{student.classType}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Parent Name:</span>
                                      <p className="mt-1">{student.parentName || "-"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Parent Email:</span>
                                      <p className="mt-1">{student.parentEmail || "-"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Parent Phone:</span>
                                      <p className="mt-1">{student.parentPhone || "-"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Tutor Rate:</span>
                                      <p className="mt-1">£{parseFloat((student.tutorRate || 0).toString()).toFixed(2)}/hr</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Period:</span>
                                      <p className="mt-1">
                                        {student.startYear || student.endYear
                                          ? `${student.startYear || "?"} - ${student.endYear || "?"}`
                                          : "-"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Exam Date:</span>
                                      <p className="mt-1">
                                        {student.examMonth && student.examYear
                                          ? `${monthNames[student.examMonth - 1]} ${student.examYear}`
                                          : "-"}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-muted-foreground">Sessions Booked:</span>
                                      <p className="mt-1">{student.sessionsBooked || 0}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                                      <p className="text-xs text-muted-foreground mb-1">Total Billed</p>
                                      <p className="font-semibold text-primary" data-testid={`text-archived-student-billed-${student.id}`}>
                                        £{(student.totalBilled || 0).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                                      <p className="text-xs text-muted-foreground mb-1">Received</p>
                                      <p className="font-semibold text-green-600" data-testid={`text-archived-student-received-${student.id}`}>
                                        £{(student.totalReceived || 0).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
                                      <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                                      <p className="font-semibold text-red-600" data-testid={`text-archived-student-outstanding-${student.id}`}>
                                        £{(student.totalOutstanding || 0).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {archiveView === "tutors" && (
              <div className="space-y-4">
                {archivedTutorsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : archivedTutors.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <UserX className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No archived tutors found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tutors will appear here when they are archived
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {archivedTutors.map((tutor) => (
                      <Card key={tutor.id} data-testid={`card-archived-tutor-${tutor.id}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-lg" data-testid={`text-archived-tutor-name-${tutor.id}`}>
                                  {tutor.firstName} {tutor.lastName}
                                </h4>
                                <Badge variant={tutor.role === "admin" ? "default" : "secondary"}>
                                  {tutor.role === "admin" ? "Admin" : "Tutor"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {tutor.email && <p><strong>Email:</strong> {tutor.email}</p>}
                                <p><strong>Total Sessions:</strong> {tutor.sessionCount}</p>
                                <p><strong>Students Taught:</strong> {tutor.studentCount}</p>
                                {(tutor.startYear || tutor.endYear) && (
                                  <p>
                                    <strong>Period:</strong> {tutor.startYear || "?"} - {tutor.endYear || "?"}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                                <p className="font-semibold text-primary" data-testid={`text-archived-tutor-earnings-${tutor.id}`}>
                                  £{(tutor.totalEarnings || 0).toFixed(2)}
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Paid Out</p>
                                <p className="font-semibold text-green-600" data-testid={`text-archived-tutor-paid-${tutor.id}`}>
                                  £{(tutor.totalPaid || 0).toFixed(2)}
                                </p>
                              </div>
                              <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                                <p className="font-semibold text-orange-600" data-testid={`text-archived-tutor-outstanding-${tutor.id}`}>
                                  £{(tutor.totalOutstanding || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedArchivedTutor(tutor)}
                                data-testid={`button-view-archived-tutor-${tutor.id}`}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => restoreTutorMutation.mutate(tutor.id)}
                                disabled={restoreTutorMutation.isPending}
                                data-testid={`button-restore-tutor-${tutor.id}`}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Restore
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Archived Student Detail Dialog */}
            <Dialog open={selectedArchivedStudent !== null} onOpenChange={(open) => !open && setSelectedArchivedStudent(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {selectedArchivedStudent?.name} - Archive Details
                  </DialogTitle>
                </DialogHeader>
                {selectedArchivedStudent && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Subject</p>
                        <p className="font-medium">{selectedArchivedStudent.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class Type</p>
                        <p className="font-medium capitalize">{selectedArchivedStudent.classType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Parent</p>
                        <p className="font-medium">{selectedArchivedStudent.parentName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedArchivedStudent.parentPhone || "N/A"}</p>
                      </div>
                    </div>

                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Financial Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Sessions</p>
                            <p className="font-bold text-lg">{selectedArchivedStudent.sessionCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Billed</p>
                            <p className="font-bold text-lg text-primary">£{(selectedArchivedStudent.totalBilled || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Received</p>
                            <p className="font-bold text-lg text-green-600">£{(selectedArchivedStudent.totalReceived || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                            <p className="font-bold text-lg text-red-600">£{(selectedArchivedStudent.totalOutstanding || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          restoreStudentMutation.mutate(selectedArchivedStudent.id);
                          setSelectedArchivedStudent(null);
                        }}
                        disabled={restoreStudentMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore Student
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Archived Tutor Detail Dialog */}
            <Dialog open={selectedArchivedTutor !== null} onOpenChange={(open) => !open && setSelectedArchivedTutor(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {selectedArchivedTutor?.firstName} {selectedArchivedTutor?.lastName} - Archive Details
                  </DialogTitle>
                </DialogHeader>
                {selectedArchivedTutor && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedArchivedTutor.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <Badge variant={selectedArchivedTutor.role === "admin" ? "default" : "secondary"}>
                          {selectedArchivedTutor.role === "admin" ? "Admin" : "Tutor"}
                        </Badge>
                      </div>
                    </div>

                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Financial Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Sessions</p>
                            <p className="font-bold text-lg">{selectedArchivedTutor.sessionCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Earnings</p>
                            <p className="font-bold text-lg text-primary">£{(selectedArchivedTutor.totalEarnings || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Paid Out</p>
                            <p className="font-bold text-lg text-green-600">£{(selectedArchivedTutor.totalPaid || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                            <p className="font-bold text-lg text-orange-600">£{(selectedArchivedTutor.totalOutstanding || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Students Taught: {selectedArchivedTutor.studentCount}</p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          restoreTutorMutation.mutate(selectedArchivedTutor.id);
                          setSelectedArchivedTutor(null);
                        }}
                        disabled={restoreTutorMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore Tutor
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Parent Feedback Tab */}
          <TabsContent value="feedback" className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold">Parent Feedback & Messages</h3>
                <p className="text-sm text-muted-foreground">View messages sent by parents</p>
              </div>
              <Select 
                value={messageRecipientFilter} 
                onValueChange={(val) => setMessageRecipientFilter(val as "all" | "admin" | "tutor")}
              >
                <SelectTrigger className="w-[180px]" data-testid="select-message-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="admin">Admin Only</SelectItem>
                  <SelectItem value="tutor">Tutor Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {parentMessagesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : parentMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages from parents yet</p>
              </div>
            ) : (() => {
              const filteredMessages = parentMessages.filter(
                message => messageRecipientFilter === "all" || message.recipientType === messageRecipientFilter
              );
              
              if (filteredMessages.length === 0) {
                return (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {messageRecipientFilter === "admin" ? "admin-only" : "tutor"} messages found</p>
                  </div>
                );
              }
              
              return (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    className={`${!message.isRead ? 'border-primary/50 bg-primary/5' : ''}`}
                    data-testid={`card-message-${message.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{message.subject || 'No Subject'}</CardTitle>
                          {!message.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                          <Badge 
                            variant={message.recipientType === 'admin' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {message.recipientType === 'admin' ? 'Admin Only' : 'Tutor & Admin'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {!message.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markMessageReadMutation.mutate(message.id)}
                              disabled={markMessageReadMutation.isPending}
                              data-testid={`button-mark-read-${message.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          <span>Student: <span className="text-foreground font-medium">{message.student?.name || 'Unknown'}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>From: <span className="text-foreground">{message.senderName || message.senderEmail}</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(message.createdAt!), 'PPp')}</span>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 mt-2">
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                      </div>
                      {message.isRead && message.readAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Read {message.readByTutor ? `by ${message.readByTutor.firstName} ${message.readByTutor.lastName}` : ''} on {format(new Date(message.readAt), 'PPp')}
                        </p>
                      )}
                      
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedMessageId(expandedMessageId === message.id ? null : message.id)}
                          data-testid={`button-toggle-reply-${message.id}`}
                        >
                          {expandedMessageId === message.id ? (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Hide Replies
                            </>
                          ) : (
                            <>
                              <Reply className="w-4 h-4 mr-1" />
                              Reply / View Replies
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {expandedMessageId === message.id && (
                        <div className="mt-4 border-t pt-4">
                          {expandedMessage?.replies && expandedMessage.replies.length > 0 && (
                            <div className="space-y-3 mb-4">
                              <p className="text-sm font-medium text-muted-foreground">Conversation</p>
                              {expandedMessage.replies.map((reply) => (
                                <div 
                                  key={reply.id} 
                                  className="ml-4 p-3 bg-primary/5 rounded-lg border-l-2 border-primary"
                                  data-testid={`reply-${reply.id}`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {reply.repliedByRole}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {reply.createdAt ? format(new Date(reply.createdAt), 'PPp') : ""}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
              );
            })()}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="p-4 sm:p-6">
            <AdminCalendar />
            
            {/* Tutor Availability Section */}
            <div className="mt-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tutor Availability
                </h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Filter by Tutor:</Label>
                  <Select value={availabilityTutorFilter} onValueChange={setAvailabilityTutorFilter}>
                    <SelectTrigger className="w-48" data-testid="availability-tutor-filter">
                      <SelectValue placeholder="Select tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tutors</SelectItem>
                      {tutors.filter(t => t.role === "tutor").map((tutor) => (
                        <SelectItem key={tutor.id} value={tutor.id}>
                          {tutor.firstName} {tutor.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {tutorAvailabilitySlots.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No availability slots found.</p>
                    <p className="text-sm">Tutors can add their available time slots from their calendar.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {(() => {
                    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const groupedByTutor = tutorAvailabilitySlots.reduce((acc, slot) => {
                      const tutorName = slot.tutor 
                        ? `${slot.tutor.firstName || ''} ${slot.tutor.lastName || ''}`.trim() || slot.tutor.email
                        : 'Unknown Tutor';
                      if (!acc[tutorName]) acc[tutorName] = [];
                      acc[tutorName].push(slot);
                      return acc;
                    }, {} as Record<string, typeof tutorAvailabilitySlots>);

                    return Object.entries(groupedByTutor).map(([tutorName, slots]) => (
                      <Card key={tutorName}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-md flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            {tutorName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Timeframe</TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {slots.map((slot) => (
                                <TableRow key={slot.id}>
                                  <TableCell className="font-medium">
                                    {slot.dayOfWeek !== null ? DAYS[slot.dayOfWeek] : 'N/A'}
                                  </TableCell>
                                  <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                                  <TableCell>
                                    <Badge variant={slot.availabilityType === "weekly" ? "default" : "outline"} 
                                           className={slot.availabilityType === "seasonal" ? "bg-orange-100 text-orange-800 border-orange-300" : ""}>
                                      {slot.availabilityType === "weekly" ? "Weekly" : "Seasonal"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {slot.availabilityType === "seasonal" && slot.timeframeStart && slot.timeframeEnd ? (
                                      <span className="text-sm">
                                        {new Date(slot.timeframeStart).toLocaleDateString()} - {new Date(slot.timeframeEnd).toLocaleDateString()}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">{slot.notes || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Parent Session Feedback Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Flag className="w-5 h-5 text-orange-500" />
                    Parent Session Feedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Sessions flagged by parents for review. Acknowledge to clear the flag.
                  </p>
                </div>
                {flaggedSessions.length > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    {flaggedSessions.length} flagged
                  </Badge>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flag className="w-4 h-4 text-orange-500" />
                    Flagged Sessions
                    {flaggedSessions.length > 0 && (
                      <Badge variant="destructive">{flaggedSessions.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flaggedSessionsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : flaggedSessions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No flagged sessions. Parents haven't raised any concerns.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Session Date</TableHead>
                          <TableHead>Flagged At</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flaggedSessions.map((session) => (
                          <TableRow key={session.id} data-testid={`flagged-session-row-${session.id}`}>
                            <TableCell className="font-medium">{session.student?.name || "Unknown"}</TableCell>
                            <TableCell>
                              {session.tutor ? `${session.tutor.firstName} ${session.tutor.lastName}` : "Unknown"}
                            </TableCell>
                            <TableCell>
                              {format(new Date(session.startDateTime), "EEE, MMM d 'at' h:mm a")}
                            </TableCell>
                            <TableCell>
                              {session.parentFlaggedAt && format(new Date(session.parentFlaggedAt), "MMM d, h:mm a")}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {session.parentFlagComment ? (
                                <span className="text-sm italic">&quot;{session.parentFlagComment}&quot;</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">No comment</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acknowledgeFlaggedSessionMutation.mutate(session.id)}
                                disabled={acknowledgeFlaggedSessionMutation.isPending}
                                data-testid={`button-acknowledge-flagged-${session.id}`}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Acknowledge
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Session Change Requests Section */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                    Session Change Requests
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Requests from parents and tutors to cancel or reschedule sessions. Acknowledge to log.
                  </p>
                </div>
                {changeRequests.filter(r => r.status === "pending").length > 0 && (
                  <Badge className="bg-blue-500 text-white text-sm">
                    {changeRequests.filter(r => r.status === "pending").length} pending
                  </Badge>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    Pending Change Requests
                    {changeRequests.filter(r => r.status === "pending").length > 0 && (
                      <Badge className="bg-blue-500 text-white">{changeRequests.filter(r => r.status === "pending").length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {changeRequestsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : changeRequests.filter(r => r.status === "pending").length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No pending change requests.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Session Date</TableHead>
                          <TableHead>Request Type</TableHead>
                          <TableHead>Reason/Comments</TableHead>
                          <TableHead>Proposed Alternative</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {changeRequests.filter(r => r.status === "pending").map((request) => (
                          <TableRow key={request.id} data-testid={`calendar-change-request-row-${request.id}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {(request as any).requesterType === "tutor" ? (
                                  <>
                                    {(request as any).tutor ? `${(request as any).tutor.firstName} ${(request as any).tutor.lastName}` : "Unknown"}
                                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">Tutor</Badge>
                                  </>
                                ) : (
                                  <>
                                    {request.parent ? `${request.parent.firstName} ${request.parent.lastName}` : "Unknown"}
                                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">Parent</Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {(request as any).group?.name || request.student?.name || "Unknown"}
                                {(request as any).group && (
                                  <Badge variant="outline" className="text-xs">Group</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.sessionOccurrence?.startDateTime && 
                                format(new Date(request.sessionOccurrence.startDateTime), "EEE, MMM d 'at' h:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge className={request.requestType === "cancel" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
                                {request.requestType === "cancel" ? (
                                  <><CalendarX className="w-3 h-3 mr-1" /> Cancel</>
                                ) : (
                                  <><RefreshCw className="w-3 h-3 mr-1" /> Reschedule</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {request.reason ? (
                                <span className="text-sm italic">&quot;{request.reason}&quot;</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">No reason provided</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {request.proposedDateMessage ? (
                                <span className="text-sm italic">&quot;{request.proposedDateMessage}&quot;</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {respondingRequestId === request.id ? (
                                <div className="flex flex-col gap-2 items-end min-w-[280px]">
                                  {request.requestType === "reschedule" && (
                                    <div className="w-full">
                                      <label className="text-xs text-muted-foreground mb-1 block">New Date/Time</label>
                                      <Input
                                        type="datetime-local"
                                        value={newRescheduleDateTime}
                                        onChange={(e) => setNewRescheduleDateTime(e.target.value)}
                                        className="w-full"
                                        data-testid={`calendar-input-datetime-${request.id}`}
                                      />
                                    </div>
                                  )}
                                  <div className="w-full">
                                    <label className="text-xs text-muted-foreground mb-1 block">Admin Note (optional)</label>
                                    <Input
                                      placeholder="Add a note..."
                                      value={changeRequestResponse}
                                      onChange={(e) => setChangeRequestResponse(e.target.value)}
                                      className="w-full"
                                      data-testid={`calendar-input-message-${request.id}`}
                                    />
                                  </div>
                                  <div className="flex gap-2 w-full justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setRespondingRequestId(null);
                                        setNewRescheduleDateTime("");
                                      }}
                                      data-testid={`calendar-button-cancel-${request.id}`}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => rejectChangeRequestMutation.mutate({
                                        requestId: request.id,
                                        adminNotes: changeRequestResponse
                                      })}
                                      disabled={rejectChangeRequestMutation.isPending}
                                      data-testid={`calendar-button-reject-${request.id}`}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => approveChangeRequestMutation.mutate({
                                        requestId: request.id,
                                        adminNotes: changeRequestResponse,
                                        newDateTime: request.requestType === "reschedule" ? newRescheduleDateTime : undefined
                                      })}
                                      disabled={approveChangeRequestMutation.isPending || (request.requestType === "reschedule" && !newRescheduleDateTime)}
                                      data-testid={`calendar-button-approve-${request.id}`}
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setRespondingRequestId(request.id);
                                      setChangeRequestResponse("");
                                      setNewRescheduleDateTime("");
                                    }}
                                    data-testid={`calendar-button-respond-${request.id}`}
                                  >
                                    Review
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab - Session Logging Tracking */}
          <TabsContent value="compliance" className="p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Session Logging Compliance</h3>
                  <p className="text-sm text-muted-foreground">
                    Track tutors who haven't logged their sessions within 24 hours
                  </p>
                </div>
                <Button
                  onClick={() => checkOverdueSessionsMutation.mutate()}
                  disabled={checkOverdueSessionsMutation.isPending}
                  data-testid="button-check-overdue"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {checkOverdueSessionsMutation.isPending ? "Checking..." : "Check for Overdue Sessions"}
                </Button>
              </div>

              {/* Pending Alerts Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Pending Alerts
                    {sessionAlerts.filter(a => a.status === "pending").length > 0 && (
                      <Badge variant="destructive">
                        {sessionAlerts.filter(a => a.status === "pending").length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionAlertsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : sessionAlerts.filter(a => a.status === "pending").length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No pending alerts. All tutors are logging sessions on time!
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Session Date</TableHead>
                          <TableHead>Overdue Since</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionAlerts.filter(a => a.status === "pending").map((alert) => (
                          <TableRow key={alert.id} data-testid={`alert-row-${alert.id}`}>
                            <TableCell className="font-medium">{alert.tutorName}</TableCell>
                            <TableCell>{alert.studentName}</TableCell>
                            <TableCell>{format(new Date(alert.sessionEndTime), "EEE, MMM d 'at' h:mm a")}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                                {Math.round((Date.now() - new Date(alert.alertCreatedAt).getTime()) / (1000 * 60 * 60))}h overdue
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog 
                                open={dismissingAlertId === alert.id} 
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setDismissingAlertId(null);
                                    setDismissReason("");
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDismissingAlertId(alert.id)}
                                    data-testid={`button-dismiss-${alert.id}`}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Dismiss
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Dismiss Alert</DialogTitle>
                                    <DialogDescription>
                                      Provide a reason for dismissing this alert for {alert.tutorName}'s session with {alert.studentName}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Dismiss Reason</Label>
                                      <Input
                                        value={dismissReason}
                                        onChange={(e) => setDismissReason(e.target.value)}
                                        placeholder="e.g., Session was logged in a different system"
                                        data-testid="input-dismiss-reason"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setDismissingAlertId(null);
                                        setDismissReason("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        if (dismissReason.trim()) {
                                          dismissAlertMutation.mutate({
                                            id: alert.id,
                                            reason: dismissReason.trim()
                                          });
                                        }
                                      }}
                                      disabled={!dismissReason.trim() || dismissAlertMutation.isPending}
                                      data-testid="button-confirm-dismiss"
                                    >
                                      {dismissAlertMutation.isPending ? "Dismissing..." : "Dismiss Alert"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Tutor Compliance Metrics / Pattern Tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Tutor Logging Performance
                  </CardTitle>
                  <CardDescription>
                    Track patterns of late logging to identify tutors who consistently log sessions late
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {complianceMetricsLoading ? (
                    <Skeleton className="h-40 w-full" />
                  ) : complianceMetrics.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No compliance data yet. Data will appear after sessions are marked as completed.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tutor</TableHead>
                          <TableHead className="text-center">Total Sessions</TableHead>
                          <TableHead className="text-center">Late Logged</TableHead>
                          <TableHead className="text-center">Pending Alerts</TableHead>
                          <TableHead className="text-center">Late %</TableHead>
                          <TableHead className="text-center">Avg Hours Late</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {complianceMetrics.map((metric) => (
                          <TableRow key={metric.tutorId} data-testid={`metric-row-${metric.tutorId}`}>
                            <TableCell className="font-medium">{metric.tutorName}</TableCell>
                            <TableCell className="text-center">{metric.totalSessions}</TableCell>
                            <TableCell className="text-center">{metric.lateLogged}</TableCell>
                            <TableCell className="text-center">
                              {metric.pendingAlerts > 0 ? (
                                <Badge variant="destructive">{metric.pendingAlerts}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={metric.latePercentage > 20 ? "text-red-600 font-medium" : metric.latePercentage > 10 ? "text-orange-600" : "text-green-600"}>
                                {metric.latePercentage.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {metric.avgHoursLate > 0 ? `${metric.avgHoursLate.toFixed(1)}h` : "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              {metric.latePercentage > 20 || metric.pendingAlerts > 2 ? (
                                <Badge className="bg-red-100 text-red-700 border-red-300">At Risk</Badge>
                              ) : metric.latePercentage > 10 || metric.pendingAlerts > 0 ? (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Needs Improvement</Badge>
                              ) : metric.latePercentage > 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Good</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-700 border-green-300">Excellent</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Payment Compliance Section */}
              <div className="pt-8 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Invoice Payment Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Track parents who haven't paid invoices within the due date (5 days from sent)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => checkOverdueInvoicesMutation.mutate()}
                      disabled={checkOverdueInvoicesMutation.isPending}
                      data-testid="button-check-overdue-invoices"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      {checkOverdueInvoicesMutation.isPending ? "Checking..." : "Check for Overdue Invoices"}
                    </Button>
                    <Button
                      onClick={() => sendInvoiceRemindersMutation.mutate()}
                      disabled={sendInvoiceRemindersMutation.isPending}
                      variant="outline"
                      data-testid="button-send-invoice-reminders"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {sendInvoiceRemindersMutation.isPending ? "Sending..." : "Send Invoice Reminders"}
                    </Button>
                  </div>
                </div>

                {/* Invoices Awaiting Confirmation */}
                {parentInvoices.filter(inv => inv.parentClaimedPaid && inv.status === "sent").length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        Awaiting Payment Confirmation
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {parentInvoices.filter(inv => inv.parentClaimedPaid && inv.status === "sent").length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Claimed Paid On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parentInvoices.filter(inv => inv.parentClaimedPaid && inv.status === "sent").map((invoice) => (
                            <TableRow key={invoice.id} data-testid={`awaiting-confirm-row-${invoice.id}`}>
                              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                              <TableCell>{invoice.student?.parent ? `${invoice.student.parent.firstName} ${invoice.student.parent.lastName}` : "N/A"}</TableCell>
                              <TableCell>{invoice.student?.name || "N/A"}</TableCell>
                              <TableCell>£{parseFloat(invoice.amount).toFixed(2)}</TableCell>
                              <TableCell>
                                {invoice.parentClaimedPaidAt ? format(new Date(invoice.parentClaimedPaidAt), "dd MMM yyyy") : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => confirmInvoicePaidMutation.mutate(invoice.id)}
                                  disabled={confirmInvoicePaidMutation.isPending}
                                  data-testid={`button-confirm-paid-${invoice.id}`}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Confirm Paid
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Pending Invoice Payment Alerts */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Overdue Invoice Alerts
                      {invoiceAlerts.filter(a => a.status === "pending").length > 0 && (
                        <Badge variant="destructive">
                          {invoiceAlerts.filter(a => a.status === "pending").length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invoiceAlertsLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : invoiceAlerts.filter(a => a.status === "pending").length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No pending invoice alerts. All parents are paying on time!
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Overdue Since</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceAlerts.filter(a => a.status === "pending").map((alert) => (
                            <TableRow key={alert.id} data-testid={`invoice-alert-row-${alert.id}`}>
                              <TableCell className="font-medium">{alert.invoiceNumber}</TableCell>
                              <TableCell>{alert.parentName}</TableCell>
                              <TableCell>{alert.studentName}</TableCell>
                              <TableCell>£{parseFloat(alert.amount).toFixed(2)}</TableCell>
                              <TableCell>{format(new Date(alert.dueDate), "dd MMM yyyy")}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-red-100 text-red-700">
                                  {Math.round((Date.now() - new Date(alert.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Dialog 
                                  open={dismissingInvoiceAlertId === alert.id} 
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      setDismissingInvoiceAlertId(null);
                                      setInvoiceAlertDismissReason("");
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDismissingInvoiceAlertId(alert.id)}
                                      data-testid={`button-dismiss-invoice-alert-${alert.id}`}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Dismiss
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Dismiss Invoice Alert</DialogTitle>
                                      <DialogDescription>
                                        Provide a reason for dismissing this alert for invoice {alert.invoiceNumber}.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Dismiss Reason</Label>
                                        <Input
                                          value={invoiceAlertDismissReason}
                                          onChange={(e) => setInvoiceAlertDismissReason(e.target.value)}
                                          placeholder="e.g., Payment received via bank transfer"
                                          data-testid="input-invoice-alert-dismiss-reason"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setDismissingInvoiceAlertId(null);
                                          setInvoiceAlertDismissReason("");
                                        }}
                                        data-testid="button-cancel-dismiss-invoice-alert"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          if (invoiceAlertDismissReason.trim()) {
                                            dismissInvoiceAlertMutation.mutate({
                                              id: alert.id,
                                              reason: invoiceAlertDismissReason.trim()
                                            });
                                          }
                                        }}
                                        disabled={!invoiceAlertDismissReason.trim() || dismissInvoiceAlertMutation.isPending}
                                        data-testid="button-confirm-dismiss-invoice-alert"
                                      >
                                        {dismissInvoiceAlertMutation.isPending ? "Dismissing..." : "Dismiss Alert"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Parent Payment Compliance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Parent Payment Performance
                    </CardTitle>
                    <CardDescription>
                      Track patterns of late payments to identify parents who consistently pay late
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {paymentMetricsLoading ? (
                      <Skeleton className="h-40 w-full" />
                    ) : paymentMetrics.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No payment data yet. Data will appear after invoices are sent.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parent</TableHead>
                            <TableHead className="text-center">Total Invoices</TableHead>
                            <TableHead className="text-center">Late Paid</TableHead>
                            <TableHead className="text-center">Pending Alerts</TableHead>
                            <TableHead className="text-center">Late %</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentMetrics.map((metric) => (
                            <TableRow key={metric.parentId} data-testid={`payment-metric-row-${metric.parentId}`}>
                              <TableCell className="font-medium">{metric.parentName}</TableCell>
                              <TableCell className="text-center">{metric.totalInvoices}</TableCell>
                              <TableCell className="text-center">{metric.latePaid}</TableCell>
                              <TableCell className="text-center">
                                {metric.pendingAlerts > 0 ? (
                                  <Badge variant="destructive">{metric.pendingAlerts}</Badge>
                                ) : (
                                  <span className="text-muted-foreground">0</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={metric.latePercentage > 20 ? "text-red-600 font-medium" : metric.latePercentage > 10 ? "text-orange-600" : "text-green-600"}>
                                  {metric.latePercentage.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {metric.latePercentage > 20 || metric.pendingAlerts > 2 ? (
                                  <Badge className="bg-red-100 text-red-700 border-red-300">At Risk</Badge>
                                ) : metric.latePercentage > 10 || metric.pendingAlerts > 0 ? (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Needs Improvement</Badge>
                                ) : metric.latePercentage > 0 ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Good</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 border-green-300">Excellent</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Log Tab - Processed Change Requests */}
          <TabsContent value="log" className="p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Processed Change Requests
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    History of approved, rejected, and acknowledged session change requests.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-500 text-white text-sm">
                    {changeRequests.filter(r => r.status === "approved").length} approved
                  </Badge>
                  <Badge className="bg-red-500 text-white text-sm">
                    {changeRequests.filter(r => r.status === "rejected").length} rejected
                  </Badge>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Change Request History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {changeRequestsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : changeRequests.filter(r => r.status !== "pending").length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No processed change requests yet.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requested By</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Session Date</TableHead>
                          <TableHead>Request Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Processed</TableHead>
                          <TableHead>Admin Note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {changeRequests.filter(r => r.status !== "pending").map((request) => (
                          <TableRow key={request.id} data-testid={`log-change-request-row-${request.id}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {(request as any).requesterType === "tutor" ? (
                                  <>
                                    {(request as any).tutor ? `${(request as any).tutor.firstName} ${(request as any).tutor.lastName}` : "Unknown"}
                                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">Tutor</Badge>
                                  </>
                                ) : (
                                  <>
                                    {request.parent ? `${request.parent.firstName} ${request.parent.lastName}` : "Unknown"}
                                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">Parent</Badge>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {(request as any).group?.name || request.student?.name || "Unknown"}
                                {(request as any).group && (
                                  <Badge variant="outline" className="text-xs">Group</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.sessionOccurrence?.startDateTime && 
                                format(new Date(request.sessionOccurrence.startDateTime), "EEE, MMM d 'at' h:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge className={request.requestType === "cancel" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}>
                                {request.requestType === "cancel" ? (
                                  <><CalendarX className="w-3 h-3 mr-1" /> Cancel</>
                                ) : (
                                  <><RefreshCw className="w-3 h-3 mr-1" /> Reschedule</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                request.status === "approved" ? "bg-green-100 text-green-700" : 
                                request.status === "rejected" ? "bg-red-100 text-red-700" : 
                                "bg-gray-100 text-gray-700"
                              }>
                                {request.status === "approved" ? (
                                  <><Check className="w-3 h-3 mr-1" /> Approved</>
                                ) : request.status === "rejected" ? (
                                  <><X className="w-3 h-3 mr-1" /> Rejected</>
                                ) : (
                                  <>Acknowledged</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {request.reason ? (
                                <span className="text-sm italic">&quot;{request.reason}&quot;</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">No reason provided</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {(request as any).processedAt ? format(new Date((request as any).processedAt), "MMM d, yyyy h:mm a") : 
                               (request as any).acknowledgedAt ? format(new Date((request as any).acknowledgedAt), "MMM d, yyyy h:mm a") : "-"}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {request.adminNotes ? (
                                <span className="text-sm">{request.adminNotes}</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="p-4 sm:p-6">
            <AdminAuditLog />
          </TabsContent>

          {/* Curriculum Topics Tab */}
          <TabsContent value="curriculum-topics" className="p-4 sm:p-6">
            <CurriculumTopicsManager />
          </TabsContent>

          {/* Work Types Tab */}
          <TabsContent value="work-types" className="p-4 sm:p-6">
            <WorkTypesManager />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Parent Invoice Dialog */}
      <Dialog open={isEditParentInvoiceOpen} onOpenChange={setIsEditParentInvoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parent Invoice</DialogTitle>
            <DialogDescription>
              Update the invoice details for {editingParentInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Rate (from Rates tab)</label>
              <Select
                value={parentInvoiceFormData.selectedRateId}
                onValueChange={(value) => {
                  const selectedRate = parentRatesData.find(r => r.id === value);
                  if (selectedRate) {
                    const rateAmount = parseFloat(selectedRate.ratePerHour);
                    const totalAmount = rateAmount * parentInvoiceFormData.sessionsIncluded;
                    setParentInvoiceFormData(prev => ({
                      ...prev,
                      selectedRateId: value,
                      amount: totalAmount.toFixed(2),
                    }));
                  }
                }}
              >
                <SelectTrigger data-testid="select-invoice-rate">
                  <SelectValue placeholder="Select a rate to apply" />
                </SelectTrigger>
                <SelectContent>
                  {parentRatesData.map((rate) => (
                    <SelectItem key={rate.id} value={rate.id}>
                      {rate.name} - £{rate.ratePerHour}/hr ({rate.classType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Selecting a rate will auto-calculate the amount</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sessions Included</label>
              <Input
                type="number"
                value={parentInvoiceFormData.sessionsIncluded}
                onChange={(e) => {
                  const sessions = parseInt(e.target.value) || 0;
                  const selectedRate = parentRatesData.find(r => r.id === parentInvoiceFormData.selectedRateId);
                  const rateAmount = selectedRate ? parseFloat(selectedRate.ratePerHour) : 0;
                  const totalAmount = rateAmount * sessions;
                  setParentInvoiceFormData(prev => ({
                    ...prev,
                    sessionsIncluded: sessions,
                    amount: selectedRate ? totalAmount.toFixed(2) : prev.amount,
                  }));
                }}
                data-testid="input-invoice-sessions"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (£)</label>
              <Input
                type="number"
                step="0.01"
                value={parentInvoiceFormData.amount}
                onChange={(e) => setParentInvoiceFormData(prev => ({ ...prev, amount: e.target.value }))}
                data-testid="input-invoice-amount"
              />
              <p className="text-xs text-muted-foreground">Auto-calculated from rate × sessions, or edit manually</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={parentInvoiceFormData.status}
                onValueChange={(value) => setParentInvoiceFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger data-testid="select-invoice-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={parentInvoiceFormData.notes}
                onChange={(e) => setParentInvoiceFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this invoice..."
                data-testid="input-invoice-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditParentInvoiceOpen(false);
                setEditingParentInvoice(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingParentInvoice) {
                  updateParentInvoiceMutation.mutate({
                    id: editingParentInvoice.id,
                    ...parentInvoiceFormData,
                  });
                }
              }}
              disabled={updateParentInvoiceMutation.isPending}
              data-testid="button-save-invoice"
            >
              {updateParentInvoiceMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Adhoc Invoice Dialog */}
      <Dialog open={isCreateAdhocInvoiceOpen} onOpenChange={setIsCreateAdhocInvoiceOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Adhoc Invoice</DialogTitle>
            <DialogDescription>
              Create a manual invoice for one-off payments not tied to a student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What is this invoice for? *</label>
              <Select
                value={adhocInvoiceFormData.category}
                onValueChange={(value: "lesson" | "textbook_maths" | "textbook_vr" | "textbook_bundle" | "mock_exam" | "mathz_skillz" | "other") => {
                  setAdhocInvoiceFormData(prev => ({ 
                    ...prev, 
                    category: value,
                    reason: value === "lesson" ? "Tutoring Lesson" :
                            value === "textbook_maths" ? "Maths Textbook" :
                            value === "textbook_vr" ? "Verbal Reasoning Textbook" :
                            value === "textbook_bundle" ? "Textbook Bundle (Maths + Verbal Reasoning)" :
                            value === "mock_exam" ? "Mock Exam Participation" :
                            value === "mathz_skillz" ? "Access to Mathz Skillz Student Revision Portal" :
                            prev.reason,
                    amount: value === "textbook_maths" ? "78.85" :
                            value === "textbook_vr" ? "23.15" :
                            value === "textbook_bundle" ? "96.90" :
                            prev.amount
                  }));
                }}
              >
                <SelectTrigger data-testid="select-adhoc-category">
                  <SelectValue placeholder="Select what this invoice is for" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="textbook_maths">Maths Textbook (£78.85)</SelectItem>
                  <SelectItem value="textbook_vr">Verbal Reasoning Textbook (£23.15)</SelectItem>
                  <SelectItem value="textbook_bundle">Textbook Bundle (£96.90)</SelectItem>
                  <SelectItem value="mock_exam">Mock Exam Participation</SelectItem>
                  <SelectItem value="mathz_skillz">Mathz Skillz Portal Access</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link to Student (optional)</label>
              <Select
                value={adhocInvoiceFormData.studentId || "__none__"}
                onValueChange={(studentId) => {
                  if (studentId === "__none__") {
                    setAdhocInvoiceFormData(prev => ({ ...prev, studentId: "" }));
                    return;
                  }
                  const selectedStudent = students.find(s => s.id === studentId);
                  if (selectedStudent) {
                    // Auto-fill parent name from student if available
                    const parentNameParts = (selectedStudent.parentName || '').trim().split(' ');
                    const firstName = parentNameParts[0] || '';
                    const surname = parentNameParts.slice(1).join(' ') || selectedStudent.parentSurname || '';
                    setAdhocInvoiceFormData(prev => ({
                      ...prev,
                      studentId,
                      parentFirstName: prev.parentFirstName || firstName,
                      parentSurname: prev.parentSurname || surname,
                    }));
                  } else {
                    setAdhocInvoiceFormData(prev => ({ ...prev, studentId: "" }));
                  }
                }}
              >
                <SelectTrigger data-testid="select-adhoc-student">
                  <SelectValue placeholder="Select a student (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No student link</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} {student.parentName ? `(${student.parentName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Link this invoice to a student to group it with their parent in financial reports</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent First Name *</label>
                <Input
                  value={adhocInvoiceFormData.parentFirstName}
                  onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, parentFirstName: e.target.value }))}
                  placeholder="First name"
                  data-testid="input-adhoc-firstname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Surname *</label>
                <Input
                  value={adhocInvoiceFormData.parentSurname}
                  onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, parentSurname: e.target.value }))}
                  placeholder="Surname"
                  data-testid="input-adhoc-surname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Rate (optional)</label>
              <Select
                value=""
                onValueChange={(rateId) => {
                  const selectedRate = parentRatesData.find(r => r.id === rateId);
                  if (selectedRate) {
                    setAdhocInvoiceFormData(prev => ({ 
                      ...prev, 
                      amount: selectedRate.rate.toString(),
                      reason: prev.reason || `${selectedRate.name} - ${selectedRate.classType || 'Session'}`
                    }));
                  }
                }}
              >
                <SelectTrigger data-testid="select-adhoc-rate">
                  <SelectValue placeholder="Select a rate to auto-fill amount" />
                </SelectTrigger>
                <SelectContent>
                  {parentRatesData.map((rate) => (
                    <SelectItem key={rate.id} value={rate.id}>
                      {rate.name} - £{rate.rate}/hr ({rate.classType || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (£) *</label>
              <Input
                type="number"
                step="0.01"
                value={adhocInvoiceFormData.amount}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                data-testid="input-adhoc-amount"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Invoice *</label>
              <Textarea
                value={adhocInvoiceFormData.reason}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter the reason for this invoice..."
                data-testid="input-adhoc-reason"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={adhocInvoiceFormData.dueDate}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                data-testid="input-adhoc-duedate"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={adhocInvoiceFormData.status}
                onValueChange={(value) => setAdhocInvoiceFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger data-testid="select-adhoc-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Link Products for Inventory Deduction */}
            {["textbook_maths", "textbook_vr", "textbook_bundle", "other"].includes(adhocInvoiceFormData.category) && inventoryProducts.filter(p => p.isActive !== false && (p.category === "textbook" || p.category === "workbook")).length > 0 && (
              <div className="space-y-2 p-3 border rounded-md bg-muted/30">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Link Products (for inventory deduction)
                </label>
                <p className="text-xs text-muted-foreground">
                  Select products to automatically deduct from inventory when invoice is sent.
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {inventoryProducts.filter(p => p.isActive !== false && (p.category === "textbook" || p.category === "workbook")).map(product => {
                    const isSelected = selectedInvoiceProducts.some(sp => sp.productId === product.id);
                    const selectedItem = selectedInvoiceProducts.find(sp => sp.productId === product.id);
                    return (
                      <div key={product.id} className="flex items-center justify-between gap-2 p-2 border rounded bg-background">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedInvoiceProducts(prev => [...prev, {
                                  productId: product.id,
                                  quantity: 1,
                                  unitPrice: product.price || "0",
                                }]);
                              } else {
                                setSelectedInvoiceProducts(prev => prev.filter(sp => sp.productId !== product.id));
                              }
                            }}
                            data-testid={`checkbox-product-${product.id}`}
                          />
                          <div className="text-sm">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-muted-foreground ml-2">£{product.price}</span>
                            <span className="text-xs text-muted-foreground ml-2">(Stock: {product.stockQuantity || 0})</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Qty:</span>
                            <Input
                              type="number"
                              min="1"
                              value={selectedItem?.quantity || 1}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 1;
                                setSelectedInvoiceProducts(prev => prev.map(sp => 
                                  sp.productId === product.id ? { ...sp, quantity: qty } : sp
                                ));
                              }}
                              className="w-16 h-7 text-sm"
                              data-testid={`input-product-qty-${product.id}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedInvoiceProducts.length > 0 && (
                  <p className="text-xs text-blue-600">
                    {selectedInvoiceProducts.length} product(s) will be deducted from inventory when status is set to "Sent"
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={adhocInvoiceFormData.notes}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
                data-testid="input-adhoc-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateAdhocInvoiceOpen(false);
                setAdhocInvoiceFormData({
                  category: "other",
                  studentId: "",
                  parentFirstName: "",
                  parentSurname: "",
                  amount: "",
                  reason: "",
                  dueDate: "",
                  status: "draft",
                  notes: "",
                });
                setSelectedInvoiceProducts([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (adhocInvoiceFormData.parentFirstName && adhocInvoiceFormData.parentSurname && adhocInvoiceFormData.amount && adhocInvoiceFormData.reason) {
                  // Get parentUserId from selected student if available
                  const selectedStudent = adhocInvoiceFormData.studentId ? students.find(s => s.id === adhocInvoiceFormData.studentId) : null;
                  createAdhocInvoiceMutation.mutate({
                    ...adhocInvoiceFormData,
                    parentUserId: selectedStudent?.parentUserId || null,
                    products: selectedInvoiceProducts,
                  });
                }
              }}
              disabled={createAdhocInvoiceMutation.isPending || !adhocInvoiceFormData.parentFirstName || !adhocInvoiceFormData.parentSurname || !adhocInvoiceFormData.amount || !adhocInvoiceFormData.reason}
              data-testid="button-create-adhoc-submit"
            >
              {createAdhocInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Adhoc Invoice Dialog */}
      <Dialog open={isEditAdhocInvoiceOpen} onOpenChange={setIsEditAdhocInvoiceOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Adhoc Invoice</DialogTitle>
            <DialogDescription>
              Update details for invoice {editingAdhocInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What is this invoice for? *</label>
              <Select
                value={adhocInvoiceFormData.category}
                onValueChange={(value: "lesson" | "textbook_maths" | "textbook_vr" | "textbook_bundle" | "mock_exam" | "mathz_skillz" | "other") => {
                  setAdhocInvoiceFormData(prev => ({ 
                    ...prev, 
                    category: value,
                    reason: value === "lesson" ? "Tutoring Lesson" :
                            value === "textbook_maths" ? "Maths Textbook" :
                            value === "textbook_vr" ? "Verbal Reasoning Textbook" :
                            value === "textbook_bundle" ? "Textbook Bundle (Maths + Verbal Reasoning)" :
                            value === "mock_exam" ? "Mock Exam Participation" :
                            value === "mathz_skillz" ? "Access to Mathz Skillz Student Revision Portal" :
                            prev.reason,
                    amount: value === "textbook_maths" ? "78.85" :
                            value === "textbook_vr" ? "23.15" :
                            value === "textbook_bundle" ? "96.90" :
                            prev.amount
                  }));
                }}
              >
                <SelectTrigger data-testid="select-edit-adhoc-category">
                  <SelectValue placeholder="Select what this invoice is for" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="textbook_maths">Maths Textbook (£78.85)</SelectItem>
                  <SelectItem value="textbook_vr">Verbal Reasoning Textbook (£23.15)</SelectItem>
                  <SelectItem value="textbook_bundle">Textbook Bundle (£96.90)</SelectItem>
                  <SelectItem value="mock_exam">Mock Exam Participation</SelectItem>
                  <SelectItem value="mathz_skillz">Mathz Skillz Portal Access</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent First Name *</label>
                <Input
                  value={adhocInvoiceFormData.parentFirstName}
                  onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, parentFirstName: e.target.value }))}
                  placeholder="First name"
                  data-testid="input-edit-adhoc-firstname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parent Surname *</label>
                <Input
                  value={adhocInvoiceFormData.parentSurname}
                  onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, parentSurname: e.target.value }))}
                  placeholder="Surname"
                  data-testid="input-edit-adhoc-surname"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (£) *</label>
              <Input
                type="number"
                step="0.01"
                value={adhocInvoiceFormData.amount}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                data-testid="input-edit-adhoc-amount"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Invoice *</label>
              <Textarea
                value={adhocInvoiceFormData.reason}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter the reason for this invoice..."
                data-testid="input-edit-adhoc-reason"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={adhocInvoiceFormData.dueDate}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                data-testid="input-edit-adhoc-duedate"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={adhocInvoiceFormData.status}
                onValueChange={(value) => setAdhocInvoiceFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger data-testid="select-edit-adhoc-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={adhocInvoiceFormData.notes}
                onChange={(e) => setAdhocInvoiceFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
                data-testid="input-edit-adhoc-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditAdhocInvoiceOpen(false);
                setEditingAdhocInvoice(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingAdhocInvoice && adhocInvoiceFormData.parentFirstName && adhocInvoiceFormData.parentSurname && adhocInvoiceFormData.amount && adhocInvoiceFormData.reason) {
                  updateAdhocInvoiceMutation.mutate({
                    id: editingAdhocInvoice.id,
                    category: adhocInvoiceFormData.category,
                    parentFirstName: adhocInvoiceFormData.parentFirstName,
                    parentSurname: adhocInvoiceFormData.parentSurname,
                    amount: adhocInvoiceFormData.amount,
                    reason: adhocInvoiceFormData.reason,
                    dueDate: adhocInvoiceFormData.dueDate || null,
                    status: adhocInvoiceFormData.status,
                    paidAt: adhocInvoiceFormData.status === "paid" ? new Date().toISOString() : null,
                    notes: adhocInvoiceFormData.notes,
                  });
                }
              }}
              disabled={updateAdhocInvoiceMutation.isPending || !adhocInvoiceFormData.parentFirstName || !adhocInvoiceFormData.parentSurname || !adhocInvoiceFormData.amount || !adhocInvoiceFormData.reason}
              data-testid="button-edit-adhoc-submit"
            >
              {updateAdhocInvoiceMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}
