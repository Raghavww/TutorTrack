import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Bell,
  Users,
  Calendar,
  MapPin,
  Clock,
  Eye,
  UserPlus,
  Receipt,
  DollarSign,
  TrendingUp,
  CheckCircle,
  X,
  Pencil,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from "recharts";
import type { MockExamEvent, MockExamEventWithBookings, ServiceBookingWithRelations, Student, MockExamExpense, MockExamPaper, MockExamPaperWithResults } from "@shared/schema";

// Predefined subject options for mock exams
const MOCK_EXAM_SUBJECTS = [
  "Maths",
  "English",
  "Verbal Reasoning",
  "Non-Verbal Reasoning",
  "11+ Maths",
  "11+ English",
  "13+ Maths",
  "13+ English",
  "GCSE Maths",
  "GCSE English",
  "A-Level Maths",
  "A-Level English",
];

const mockExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  examType: z.enum(["11+", "13+", "GCSE", "A-Level", "other"]),
  subject: z.string().optional(),
  examDate: z.string().min(1, "Exam date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().optional(),
  maxCapacity: z.coerce.number().min(1).optional(),
  price: z.string().min(1, "Price is required"),
  registrationDeadline: z.string().optional(),
  status: z.enum(["upcoming", "registration_open", "registration_closed", "completed", "cancelled"]),
  isHistorical: z.boolean().default(false),
  notes: z.string().optional(),
});

type MockExamFormData = z.infer<typeof mockExamSchema>;

const expenseSchema = z.object({
  category: z.enum(["supplies", "invigilators", "hall_booking", "other"]),
  description: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface GuestStudent {
  name: string;
  email: string;
}

export function AdminMockExams() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<MockExamEvent | null>(null);
  const [viewingExam, setViewingExam] = useState<MockExamEventWithBookings | null>(null);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [guestStudents, setGuestStudents] = useState<GuestStudent[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [expenses, setExpenses] = useState<MockExamExpense[]>([]);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [papers, setPapers] = useState<MockExamPaperWithResults[]>([]);
  const [isAddPaperDialogOpen, setIsAddPaperDialogOpen] = useState(false);
  const [newPaperTitle, setNewPaperTitle] = useState("");
  const [newPaperMaxScore, setNewPaperMaxScore] = useState("100");
  const [newPaperYear, setNewPaperYear] = useState("");
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [editingMaxScore, setEditingMaxScore] = useState("");
  const [resultScores, setResultScores] = useState<Record<string, Record<string, string>>>({});
  const [confirmedParticipants, setConfirmedParticipants] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("registrations");
  const [historicalResultScores, setHistoricalResultScores] = useState<Record<string, Record<string, string>>>({});
  const [historicalSelectedStudents, setHistoricalSelectedStudents] = useState<string[]>([]);
  const [mainActiveTab, setMainActiveTab] = useState<"exams" | "trends" | "registrations" | "terms">("exams");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { data: mockExams = [], isLoading } = useQuery<MockExamEvent[]>({
    queryKey: ["/api/mock-exams?includeCompleted=true"],
  });

  interface TrendAnalytics {
    examId: string;
    title: string;
    examDate: string;
    examType: string;
    papers: {
      paperId: string;
      title: string;
      maxScore: number;
      paperYear?: number | null;
      stats: {
        highest: number | null;
        lowest: number | null;
        average: number | null;
        median: number | null;
        count: number;
      };
    }[];
  }

  const { data: trendAnalytics = [], isLoading: trendsLoading } = useQuery<TrendAnalytics[]>({
    queryKey: ["/api/mock-exams/trends/analytics"],
    enabled: mainActiveTab === "trends",
  });

  const { data: serviceBookings = [] } = useQuery<ServiceBookingWithRelations[]>({
    queryKey: ["/api/service-bookings"],
  });

  const { data: allStudents = [] } = useQuery<Student[]>({
    queryKey: ["/api/students/all"],
  });

  const { data: tutors = [] } = useQuery<{ id: string; firstName: string | null; lastName: string | null }[]>({
    queryKey: ["/api/tutors"],
  });

  interface StudentTutorAllocation {
    id: string;
    studentId: string;
    tutorId: string;
    isPrimary: boolean;
    isActive: boolean;
  }

  const { data: studentTutorAllocations = [] } = useQuery<StudentTutorAllocation[]>({
    queryKey: ["/api/student-tutors/all"],
  });

  const getStudentsByTutor = (tutorId: string): string[] => {
    return studentTutorAllocations
      .filter(st => st.tutorId === tutorId && st.isActive)
      .map(st => st.studentId);
  };

  const [studentFilterTutor, setStudentFilterTutor] = useState<string>("all");
  const [studentFilterYearGroup, setStudentFilterYearGroup] = useState<string>("all");

  const getStudentYearGroup = (startYear: number | null | undefined): number | null => {
    if (!startYear) return null;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const academicYearStart = currentMonth >= 9 ? currentYear : currentYear - 1;
    let yearGroup = academicYearStart - startYear + 1;
    if (yearGroup < 1) yearGroup = 1;
    if (yearGroup > 13) yearGroup = 13;
    return yearGroup;
  };

  const form = useForm<MockExamFormData>({
    resolver: zodResolver(mockExamSchema),
    defaultValues: {
      title: "",
      description: "",
      examType: "11+",
      subject: "",
      examDate: "",
      startTime: "",
      endTime: "",
      venue: "",
      maxCapacity: undefined,
      price: "",
      registrationDeadline: "",
      status: "registration_open",
      isHistorical: false,
      notes: "",
    },
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: MockExamFormData) => {
      const payload = {
        ...data,
        examDate: new Date(data.examDate).toISOString(),
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
      };
      const res = await apiRequest("POST", "/api/mock-exams", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exams?includeCompleted=true"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({ title: "Mock exam created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create mock exam",
        variant: "destructive",
      });
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MockExamFormData> }) => {
      const payload = {
        ...data,
        examDate: data.examDate ? new Date(data.examDate).toISOString() : undefined,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
      };
      const res = await apiRequest("PATCH", `/api/mock-exams/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exams?includeCompleted=true"] });
      setEditingExam(null);
      form.reset();
      toast({ title: "Mock exam updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update mock exam",
        variant: "destructive",
      });
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/mock-exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exams?includeCompleted=true"] });
      toast({ title: "Mock exam deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete mock exam",
        variant: "destructive",
      });
    },
  });

  const notifyParentsMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/notify-parents`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Parents Notified",
        description: `Sent notifications to ${data.count} parents`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to notify parents",
        variant: "destructive",
      });
    },
  });

  const registerStudentsMutation = useMutation({
    mutationFn: async ({ examId, studentIds, guests }: { examId: string; studentIds: string[]; guests: GuestStudent[] }) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/register-students`, {
        studentIds,
        guests,
      });
      return res.json();
    },
    onSuccess: (result: { bookings: any[]; invoices: any[] }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exams?includeCompleted=true"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/adhoc-invoices"] });
      setIsAddStudentDialogOpen(false);
      setSelectedStudentIds([]);
      setGuestStudents([]);
      if (viewingExam) {
        fetchExamDetails(viewingExam.id);
      }
      const count = result.bookings?.length || 0;
      toast({ 
        title: `${count} student${count > 1 ? 's' : ''} registered successfully`,
        description: `${result.invoices?.length || 0} invoice${(result.invoices?.length || 0) > 1 ? 's' : ''} generated`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register students",
        variant: "destructive",
      });
    },
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "supplies",
      description: "",
      amount: "",
      notes: "",
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async ({ examId, data }: { examId: string; data: ExpenseFormData }) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/expenses`, data);
      return res.json();
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamExpenses(viewingExam.id);
      }
      setIsAddExpenseDialogOpen(false);
      expenseForm.reset();
      toast({ title: "Expense added successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async ({ examId, expenseId }: { examId: string; expenseId: string }) => {
      await apiRequest("DELETE", `/api/mock-exams/${examId}/expenses/${expenseId}`);
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamExpenses(viewingExam.id);
      }
      toast({ title: "Expense deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const markExpensePaidMutation = useMutation({
    mutationFn: async ({ examId, expenseId }: { examId: string; expenseId: string }) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/expenses/${expenseId}/mark-paid`);
      return res.json();
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamExpenses(viewingExam.id);
      }
      toast({ title: "Expense marked as paid" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark expense as paid",
        variant: "destructive",
      });
    },
  });

  const createPaperMutation = useMutation({
    mutationFn: async ({ examId, title, maxScore, paperYear }: { examId: string; title: string; maxScore: number; paperYear?: number }) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/papers`, { title, maxScore, orderIndex: papers.length, paperYear });
      return res.json();
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamPapers(viewingExam.id);
      }
      setIsAddPaperDialogOpen(false);
      setNewPaperTitle("");
      setNewPaperMaxScore("100");
      setNewPaperYear("");
      toast({ title: "Paper added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add paper", variant: "destructive" });
    },
  });

  const deletePaperMutation = useMutation({
    mutationFn: async ({ examId, paperId }: { examId: string; paperId: string }) => {
      await apiRequest("DELETE", `/api/mock-exams/${examId}/papers/${paperId}`);
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamPapers(viewingExam.id);
      }
      toast({ title: "Paper deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete paper", variant: "destructive" });
    },
  });

  const updatePaperMutation = useMutation({
    mutationFn: async ({ examId, paperId, maxScore }: { examId: string; paperId: string; maxScore: number }) => {
      await apiRequest("PATCH", `/api/mock-exams/${examId}/papers/${paperId}`, { maxScore });
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamPapers(viewingExam.id);
      }
      setEditingPaperId(null);
      setEditingMaxScore("");
      toast({ title: "Max score updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update paper", variant: "destructive" });
    },
  });

  const saveResultsMutation = useMutation({
    mutationFn: async ({ examId, results }: { examId: string; results: { paperId: string; bookingId: string; score: number | null; isConfirmed: boolean }[] }) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/batch-results`, { results });
      return res.json();
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamPapers(viewingExam.id);
      }
      toast({ title: "Results saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save results", variant: "destructive" });
    },
  });

  const saveHistoricalResultsMutation = useMutation({
    mutationFn: async ({ examId, results }: { examId: string; results: { paperId: string; studentId: string; score: number | null; isConfirmed: boolean }[] }) => {
      const res = await apiRequest("POST", `/api/mock-exams/${examId}/historical-results`, { results });
      return res.json();
    },
    onSuccess: () => {
      if (viewingExam) {
        fetchExamPapers(viewingExam.id);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exams/trends/analytics"] });
      toast({ title: "Historical results saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save historical results", variant: "destructive" });
    },
  });

  const saveAllHistoricalResults = () => {
    if (!viewingExam) return;
    
    const results: { paperId: string; studentId: string; score: number | null; isConfirmed: boolean }[] = [];
    
    for (const studentId of historicalSelectedStudents) {
      for (const paper of papers) {
        const scoreStr = historicalResultScores[studentId]?.[paper.id] || "";
        // Only send results that have actual scores to avoid overwriting with nulls
        if (scoreStr.trim() !== "") {
          const score = parseInt(scoreStr, 10);
          if (!isNaN(score)) {
            results.push({
              paperId: paper.id,
              studentId,
              score,
              isConfirmed: true,
            });
          }
        }
      }
    }
    
    if (results.length === 0) {
      toast({ title: "No scores to save", description: "Enter at least one score before saving", variant: "destructive" });
      return;
    }
    
    saveHistoricalResultsMutation.mutate({ examId: viewingExam.id, results });
  };

  const handleHistoricalScoreChange = (studentId: string, paperId: string, value: string) => {
    setHistoricalResultScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [paperId]: value,
      },
    }));
  };

  const onSubmitExam = (data: MockExamFormData) => {
    if (editingExam) {
      updateExamMutation.mutate({ id: editingExam.id, data });
    } else {
      createExamMutation.mutate(data);
    }
  };

  const onSubmitExpense = (data: ExpenseFormData) => {
    if (viewingExam) {
      createExpenseMutation.mutate({ examId: viewingExam.id, data });
    }
  };

  const openEditDialog = (exam: MockExamEvent) => {
    setEditingExam(exam);
    form.reset({
      title: exam.title,
      description: exam.description || "",
      examType: exam.examType as any,
      subject: exam.subject || "",
      examDate: exam.examDate ? format(new Date(exam.examDate), "yyyy-MM-dd") : "",
      startTime: exam.startTime || "",
      endTime: exam.endTime || "",
      venue: exam.venue || "",
      maxCapacity: exam.maxCapacity || undefined,
      price: exam.price,
      registrationDeadline: exam.registrationDeadline ? format(new Date(exam.registrationDeadline), "yyyy-MM-dd") : "",
      status: exam.status as any,
      notes: exam.notes || "",
    });
  };

  const fetchExamDetails = async (examId: string) => {
    try {
      // Clear stale historical data before loading new exam
      setHistoricalResultScores({});
      setHistoricalSelectedStudents([]);
      
      const response = await fetch(`/api/mock-exams/${examId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setViewingExam(data);
      }
      // Also fetch expenses and papers
      await fetchExamExpenses(examId);
      await fetchExamPapers(examId);
    } catch (error) {
      console.error("Error fetching exam details:", error);
    }
  };

  const fetchExamExpenses = async (examId: string) => {
    try {
      const response = await fetch(`/api/mock-exams/${examId}/expenses`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching exam expenses:", error);
    }
  };

  const fetchExamPapers = async (examId: string) => {
    try {
      const response = await fetch(`/api/mock-exams/${examId}/papers-with-results`, {
        credentials: "include",
      });
      if (response.ok) {
        const data: MockExamPaperWithResults[] = await response.json();
        setPapers(data);
        
        // Initialize result scores and confirmed status from existing results
        const scores: Record<string, Record<string, string>> = {};
        const confirmed = new Set<string>();
        
        for (const paper of data) {
          for (const result of paper.results) {
            if (result.serviceBookingId) {
              if (!scores[result.serviceBookingId]) {
                scores[result.serviceBookingId] = {};
              }
              scores[result.serviceBookingId][paper.id] = result.score?.toString() || "";
              if (result.isConfirmed) {
                confirmed.add(result.serviceBookingId);
              }
            }
          }
        }
        
        setResultScores(scores);
        setConfirmedParticipants(confirmed);
        
        // Also initialize historical result scores for historical exams
        const historicalScores: Record<string, Record<string, string>> = {};
        const historicalStudentIds: string[] = [];
        
        for (const paper of data) {
          for (const result of paper.results) {
            if (result.studentId && !result.serviceBookingId) {
              if (!historicalScores[result.studentId]) {
                historicalScores[result.studentId] = {};
              }
              historicalScores[result.studentId][paper.id] = result.score?.toString() || "";
              if (!historicalStudentIds.includes(result.studentId)) {
                historicalStudentIds.push(result.studentId);
              }
            }
          }
        }
        
        if (historicalStudentIds.length > 0) {
          setHistoricalResultScores(historicalScores);
          setHistoricalSelectedStudents(historicalStudentIds);
        }
      }
    } catch (error) {
      console.error("Error fetching exam papers:", error);
    }
  };

  const createDefaultPapers = async (examId: string) => {
    try {
      await apiRequest("POST", `/api/mock-exams/${examId}/papers`, { title: "Verbal Reasoning", maxScore: 100, orderIndex: 0 });
      await apiRequest("POST", `/api/mock-exams/${examId}/papers`, { title: "Maths", maxScore: 100, orderIndex: 1 });
      await fetchExamPapers(examId);
      toast({ title: "Default papers created (VR and Maths)" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create papers", variant: "destructive" });
    }
  };

  const handleScoreChange = (bookingId: string, paperId: string, value: string) => {
    setResultScores(prev => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] || {}),
        [paperId]: value,
      },
    }));
  };

  const handleConfirmToggle = (bookingId: string) => {
    setConfirmedParticipants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const saveAllResults = () => {
    if (!viewingExam) return;
    
    const results: { paperId: string; bookingId: string; score: number | null; isConfirmed: boolean }[] = [];
    
    for (const booking of viewingExam.bookings || []) {
      for (const paper of papers) {
        const scoreStr = resultScores[booking.id]?.[paper.id] || "";
        const score = scoreStr ? parseInt(scoreStr, 10) : null;
        const isConfirmed = confirmedParticipants.has(booking.id);
        
        results.push({
          paperId: paper.id,
          bookingId: booking.id,
          score,
          isConfirmed,
        });
      }
    }
    
    saveResultsMutation.mutate({ examId: viewingExam.id, results });
  };

  const calculateFinancials = () => {
    if (!viewingExam) return { totalIncome: 0, paidIncome: 0, totalExpenses: 0, paidExpenses: 0, profit: 0 };
    
    const totalIncome = viewingExam.bookings?.reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0) || 0;
    // Check multiple indicators for paid status: booking status, paymentReceivedAt, or linked invoice paid
    const paidIncome = viewingExam.bookings?.filter(b => 
      b.status === "paid" || 
      b.paymentReceivedAt || 
      (b.invoice && b.invoice.status === "paid")
    ).reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0) || 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const paidExpenses = expenses.filter(e => e.isPaid).reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const profit = totalIncome - totalExpenses;
    
    return { totalIncome, paidIncome, totalExpenses, paidExpenses, profit };
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      supplies: "Supplies",
      invigilators: "Invigilators",
      hall_booking: "Hall Booking",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "secondary",
      registration_open: "default",
      registration_closed: "outline",
      completed: "outline",
      cancelled: "destructive",
    };
    const labels: Record<string, string> = {
      upcoming: "Upcoming",
      registration_open: "Open",
      registration_closed: "Closed",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const upcomingExams = mockExams.filter(e => e.status !== "completed" && e.status !== "cancelled");
  const pastExams = mockExams.filter(e => e.status === "completed" || e.status === "cancelled");
  const historicalExams = mockExams.filter(e => (e as any).isHistorical);

  return (
    <div className="space-y-6">
      <Tabs value={mainActiveTab} onValueChange={(v) => setMainActiveTab(v as "exams" | "trends" | "registrations" | "terms")} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="exams">Mock Exams</TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trend Analytics
          </TabsTrigger>
          <TabsTrigger value="registrations">
            <UserPlus className="w-4 h-4 mr-2" />
            Registrations
          </TabsTrigger>
          <TabsTrigger value="terms">
            <FileText className="w-4 h-4 mr-2" />
            Terms & Conditions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="exams" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mock Exam Events</h2>
          <p className="text-muted-foreground">Create and manage mock exam events for students</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-add-mock-exam">
              <Plus className="w-4 h-4 mr-2" />
              Create Mock Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Mock Exam Event</DialogTitle>
              <DialogDescription>Set up a new mock exam for students to register</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitExam)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 11+ Mock Exam - January 2025" data-testid="input-exam-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-exam-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="11+">11+</SelectItem>
                            <SelectItem value="13+">13+</SelectItem>
                            <SelectItem value="GCSE">GCSE</SelectItem>
                            <SelectItem value="A-Level">A-Level</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects (Optional)</FormLabel>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                          {MOCK_EXAM_SUBJECTS.map((subject) => {
                            const currentSubjects = field.value ? field.value.split(', ').filter(s => s.length > 0) : [];
                            const isChecked = currentSubjects.includes(subject);
                            return (
                              <div key={subject} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`subject-${subject}`}
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    let newSubjects: string[];
                                    if (checked) {
                                      newSubjects = [...currentSubjects, subject];
                                    } else {
                                      newSubjects = currentSubjects.filter(s => s !== subject);
                                    }
                                    field.onChange(newSubjects.join(', '));
                                  }}
                                  data-testid={`checkbox-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                                />
                                <label
                                  htmlFor={`subject-${subject}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {subject}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                        {field.value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Selected: {field.value}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="examDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-exam-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Deadline</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-registration-deadline" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" data-testid="input-start-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" data-testid="input-end-time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Main Study Centre" data-testid="input-venue" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (£)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-exam-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Capacity</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" placeholder="e.g., 30" data-testid="input-max-capacity" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-exam-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming (Not Open Yet)</SelectItem>
                          <SelectItem value="registration_open">Registration Open</SelectItem>
                          <SelectItem value="registration_closed">Registration Closed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isHistorical"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Historical Exam</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Enable for past exams - allows direct student result entry without registration
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-historical"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Details about the mock exam..." data-testid="input-exam-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createExamMutation.isPending} data-testid="btn-save-exam">
                    {createExamMutation.isPending ? "Creating..." : "Create Exam"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Active Exams ({upcomingExams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-center">Enrolled</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingExams.map((exam) => (
                <TableRow key={exam.id} data-testid={`exam-row-${exam.id}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{exam.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {exam.examType} {exam.subject && `• ${exam.subject}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(exam.examDate), "dd MMM yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {exam.startTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exam.startTime}{exam.endTime && ` - ${exam.endTime}`}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {exam.currentEnrollments}{exam.maxCapacity && ` / ${exam.maxCapacity}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">£{exam.price}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(exam.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchExamDetails(exam.id)}
                        data-testid={`btn-view-exam-${exam.id}`}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => notifyParentsMutation.mutate(exam.id)}
                        disabled={notifyParentsMutation.isPending}
                        data-testid={`btn-notify-parents-${exam.id}`}
                      >
                        <Bell className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(exam)}
                        data-testid={`btn-edit-exam-${exam.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" data-testid={`btn-delete-exam-${exam.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Mock Exam?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{exam.title}"? This will also remove all registrations.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteExamMutation.mutate(exam.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {upcomingExams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No upcoming mock exams. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pastExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Past Exams ({pastExams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Enrolled</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastExams.map((exam) => (
                  <TableRow key={exam.id} className="opacity-60">
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{format(new Date(exam.examDate), "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-center">{exam.currentEnrollments}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(exam.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editingExam} onOpenChange={(open) => !open && setEditingExam(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mock Exam</DialogTitle>
            <DialogDescription>Update all exam details</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitExam)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-exam-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of the exam" data-testid="input-edit-exam-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-exam-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="11+">11+</SelectItem>
                          <SelectItem value="13+">13+</SelectItem>
                          <SelectItem value="GCSE">GCSE</SelectItem>
                          <SelectItem value="A-Level">A-Level</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects (Optional)</FormLabel>
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                        {MOCK_EXAM_SUBJECTS.map((subject) => {
                          const currentSubjects = field.value ? field.value.split(', ').filter(s => s.length > 0) : [];
                          const isChecked = currentSubjects.includes(subject);
                          return (
                            <div key={subject} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-subject-${subject}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  let newSubjects: string[];
                                  if (checked) {
                                    newSubjects = [...currentSubjects, subject];
                                  } else {
                                    newSubjects = currentSubjects.filter(s => s !== subject);
                                  }
                                  field.onChange(newSubjects.join(', '));
                                }}
                                data-testid={`edit-checkbox-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                              />
                              <label
                                htmlFor={`edit-subject-${subject}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {subject}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      {field.value && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {field.value}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-edit-exam-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-edit-exam-deadline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" data-testid="input-edit-exam-start-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" data-testid="input-edit-exam-end-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Location of exam" data-testid="input-edit-exam-venue" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="1" placeholder="Max students" data-testid="input-edit-exam-capacity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" data-testid="input-edit-exam-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-exam-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="registration_open">Registration Open</SelectItem>
                          <SelectItem value="registration_closed">Registration Closed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isHistorical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-edit-exam-historical"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Historical Exam</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark as historical for past data entry (no registration workflow)
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Additional notes" data-testid="input-edit-exam-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingExam(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateExamMutation.isPending} data-testid="btn-update-exam">
                  {updateExamMutation.isPending ? "Updating..." : "Update Exam"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingExam} onOpenChange={(open) => !open && setViewingExam(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingExam?.title}</DialogTitle>
            <DialogDescription>
              {viewingExam?.examType} Mock Exam • {viewingExam && format(new Date(viewingExam.examDate), "dd MMM yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {viewingExam?.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingExam.venue}</span>
                </div>
              )}
              {viewingExam?.startTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingExam.startTime}{viewingExam.endTime && ` - ${viewingExam.endTime}`}</span>
                </div>
              )}
            </div>

            {(() => {
              const financials = calculateFinancials();
              return (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Financial Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Income</p>
                      <p className="font-semibold text-green-600" data-testid="text-mock-exam-income">
                        £{financials.totalIncome.toFixed(2)}
                        <span className="text-xs text-muted-foreground ml-1">
                          (£{financials.paidIncome.toFixed(2)} paid)
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Expenses</p>
                      <p className="font-semibold text-red-600" data-testid="text-mock-exam-expenses">
                        £{financials.totalExpenses.toFixed(2)}
                        <span className="text-xs text-muted-foreground ml-1">
                          (£{financials.paidExpenses.toFixed(2)} paid)
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Profit</p>
                      <p className={`font-semibold ${financials.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="text-mock-exam-profit">
                        £{financials.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="registrations">Registrations ({viewingExam?.bookings?.length || 0})</TabsTrigger>
                <TabsTrigger value="results">Papers & Results</TabsTrigger>
                <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="registrations" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Registered Students
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddStudentDialogOpen(true)}
                    data-testid="btn-add-student-to-exam"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
                {viewingExam?.bookings && viewingExam.bookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingExam.bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            {booking.student?.name || booking.guestName || "N/A"}
                            {booking.guestName && !booking.student && (
                              <Badge variant="outline" className="ml-2 text-xs">Guest</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {booking.parent?.firstName || booking.parent?.lastName 
                              ? `${booking.parent?.firstName || ''} ${booking.parent?.lastName || ''}`.trim()
                              : booking.guestEmail || "-"}
                          </TableCell>
                          <TableCell>£{parseFloat(booking.totalAmount || "0").toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === "paid" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-sm">No registrations yet</p>
                )}
              </TabsContent>
              
              <TabsContent value="results" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Exam Papers ({papers.length})
                  </h4>
                  <div className="flex gap-2">
                    {papers.length === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewingExam && createDefaultPapers(viewingExam.id)}
                        data-testid="btn-create-default-papers"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create VR & Maths Papers
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddPaperDialogOpen(true)}
                      data-testid="btn-add-paper"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Paper
                    </Button>
                  </div>
                </div>
                
                {papers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {papers.map((paper) => (
                      <div key={paper.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                        <span className="font-medium text-sm">{paper.title}{paper.paperYear ? ` (${paper.paperYear})` : ""}</span>
                        {editingPaperId === paper.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">(Max:</span>
                            <Input
                              type="number"
                              value={editingMaxScore}
                              onChange={(e) => setEditingMaxScore(e.target.value)}
                              className="w-16 h-6 text-xs px-1"
                              min="1"
                              autoFocus
                            />
                            <span className="text-xs text-muted-foreground">)</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-green-600"
                              onClick={() => {
                                const newMax = parseInt(editingMaxScore);
                                if (newMax > 0 && viewingExam) {
                                  updatePaperMutation.mutate({ examId: viewingExam.id, paperId: paper.id, maxScore: newMax });
                                }
                              }}
                              disabled={updatePaperMutation.isPending}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingPaperId(null);
                                setEditingMaxScore("");
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs text-muted-foreground">(Max: {paper.maxScore})</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setEditingPaperId(paper.id);
                                setEditingMaxScore(paper.maxScore.toString());
                              }}
                              title="Edit max score"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" data-testid={`btn-delete-paper-${paper.id}`}>
                              <X className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Paper?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the "{paper.title}" paper and all associated results.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => viewingExam && deletePaperMutation.mutate({ examId: viewingExam.id, paperId: paper.id })}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
                
                {papers.length > 0 && (viewingExam as any)?.isHistorical ? (
                  <>
                    {/* Saved Results Summary with Percentages */}
                    {papers.some(p => p.results.some(r => r.studentId && r.score !== null)) && (
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Saved Results
                          </h4>
                          <p className="text-xs text-muted-foreground">Scores can be edited below</p>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead>Student</TableHead>
                                {papers.map((paper) => (
                                  <TableHead key={paper.id} className="text-center">
                                    <div>{paper.title}</div>
                                    <div className="text-xs font-normal text-muted-foreground">
                                      {paper.paperYear ? `(${paper.paperYear}) ` : ""}Max: {paper.maxScore}
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const studentIdsWithResults = new Set<string>();
                                papers.forEach(p => p.results.forEach(r => {
                                  if (r.studentId && r.score !== null) studentIdsWithResults.add(r.studentId);
                                }));
                                return Array.from(studentIdsWithResults).map(studentId => {
                                  const student = allStudents.find(s => s.id === studentId);
                                  return (
                                    <TableRow key={studentId}>
                                      <TableCell className="font-medium">{student?.name || "Unknown"}</TableCell>
                                      {papers.map(paper => {
                                        const result = paper.results.find(r => r.studentId === studentId);
                                        const score = result?.score;
                                        const pct = score !== null && score !== undefined && paper.maxScore > 0 
                                          ? Math.round((score / paper.maxScore) * 100) 
                                          : null;
                                        return (
                                          <TableCell key={paper.id} className="text-center">
                                            {score !== null && score !== undefined ? (
                                              <div>
                                                <span className="font-medium">{score}</span>
                                                <span className="text-muted-foreground ml-1">({pct}%)</span>
                                              </div>
                                            ) : (
                                              <span className="text-muted-foreground">-</span>
                                            )}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  );
                                });
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {papers.some(p => p.results.some(r => r.studentId && r.score !== null)) ? "Edit Results" : "Enter Results"}
                        </h4>
                        <p className="text-xs text-muted-foreground">Select students and enter their scores directly</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Filter by Tutor</label>
                          <Select value={studentFilterTutor} onValueChange={setStudentFilterTutor}>
                            <SelectTrigger>
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
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Filter by Year Group</label>
                          <Select value={studentFilterYearGroup} onValueChange={setStudentFilterYearGroup}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Years</SelectItem>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(y => (
                                <SelectItem key={y} value={y.toString()}>Year {y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[200px] border rounded-lg p-2">
                        <div className="space-y-2">
                          {allStudents
                            .filter(s => {
                              // Apply tutor filter
                              if (studentFilterTutor !== "all") {
                                const tutorStudentIds = getStudentsByTutor(studentFilterTutor);
                                if (!tutorStudentIds.includes(s.id)) return false;
                              }
                              // Apply year group filter
                              if (studentFilterYearGroup !== "all") {
                                const yg = getStudentYearGroup(s.startYear);
                                if (yg !== parseInt(studentFilterYearGroup)) return false;
                              }
                              return true;
                            })
                            .map((student) => (
                              <div key={student.id} className="flex items-center gap-2">
                                <Checkbox
                                  checked={historicalSelectedStudents.includes(student.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setHistoricalSelectedStudents([...historicalSelectedStudents, student.id]);
                                    } else {
                                      setHistoricalSelectedStudents(historicalSelectedStudents.filter(id => id !== student.id));
                                    }
                                  }}
                                />
                                <span className="text-sm">{student.name}</span>
                                {getStudentYearGroup(student.startYear) && (
                                  <Badge variant="outline" className="text-xs">Y{getStudentYearGroup(student.startYear)}</Badge>
                                )}
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                      
                      {historicalSelectedStudents.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                {papers.map((paper) => (
                                  <TableHead key={paper.id} className="text-center w-32">
                                    <div>{paper.title}</div>
                                    <div className="text-xs font-normal text-muted-foreground">
                                      {paper.paperYear ? `(${paper.paperYear}) ` : ""}Max: {paper.maxScore}
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {historicalSelectedStudents.map((studentId) => {
                                const student = allStudents.find(s => s.id === studentId);
                                return (
                                  <TableRow key={studentId}>
                                    <TableCell>{student?.name || "Unknown"}</TableCell>
                                    {papers.map((paper) => {
                                      const scoreStr = historicalResultScores[studentId]?.[paper.id] || "";
                                      const score = parseInt(scoreStr, 10);
                                      const percentage = !isNaN(score) && paper.maxScore > 0 ? Math.round((score / paper.maxScore) * 100) : null;
                                      return (
                                        <TableCell key={paper.id} className="text-center">
                                          <div className="flex flex-col items-center gap-1">
                                            <Input
                                              type="number"
                                              min="0"
                                              max={paper.maxScore}
                                              value={scoreStr}
                                              onChange={(e) => handleHistoricalScoreChange(studentId, paper.id, e.target.value)}
                                              className="w-20 h-8 text-center mx-auto"
                                              placeholder="-"
                                            />
                                            {percentage !== null && (
                                              <span className="text-xs text-muted-foreground">{percentage}%</span>
                                            )}
                                          </div>
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={saveAllHistoricalResults}
                          disabled={saveHistoricalResultsMutation.isPending || historicalSelectedStudents.length === 0}
                        >
                          {saveHistoricalResultsMutation.isPending ? "Saving..." : "Save Historical Results"}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : papers.length > 0 && viewingExam?.bookings && viewingExam.bookings.length > 0 ? (
                  <>
                    {/* Saved Results Summary with Percentages for Registration-based exams */}
                    {papers.some(p => p.results.some(r => r.serviceBookingId && r.score !== null)) && (
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Saved Results Summary
                          </h4>
                          <p className="text-xs text-muted-foreground">Edit scores in the table below</p>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead>Student</TableHead>
                                {papers.map((paper) => (
                                  <TableHead key={paper.id} className="text-center">
                                    <div>{paper.title}</div>
                                    <div className="text-xs font-normal text-muted-foreground">
                                      {paper.paperYear ? `(${paper.paperYear}) ` : ""}Max: {paper.maxScore}
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {viewingExam.bookings
                                .filter(booking => papers.some(p => p.results.some(r => r.serviceBookingId === booking.id && r.score !== null)))
                                .map(booking => (
                                  <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.student?.name || booking.guestName || "N/A"}</TableCell>
                                    {papers.map(paper => {
                                      const result = paper.results.find(r => r.serviceBookingId === booking.id);
                                      const score = result?.score;
                                      const pct = score !== null && score !== undefined && paper.maxScore > 0 
                                        ? Math.round((score / paper.maxScore) * 100) 
                                        : null;
                                      return (
                                        <TableCell key={paper.id} className="text-center">
                                          {score !== null && score !== undefined ? (
                                            <div>
                                              <span className="font-medium">{score}</span>
                                              <span className="text-muted-foreground ml-1">({pct}%)</span>
                                            </div>
                                          ) : (
                                            <span className="text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                    
                    <h4 className="font-medium text-sm mb-2">
                      {papers.some(p => p.results.some(r => r.serviceBookingId && r.score !== null)) ? "Edit Results" : "Enter Results"}
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={confirmedParticipants.size === viewingExam.bookings.length}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setConfirmedParticipants(new Set(viewingExam.bookings.map(b => b.id)));
                                  } else {
                                    setConfirmedParticipants(new Set());
                                  }
                                }}
                                data-testid="checkbox-confirm-all"
                              />
                            </TableHead>
                            <TableHead>Student</TableHead>
                            {papers.map((paper) => (
                              <TableHead key={paper.id} className="text-center w-32">
                                <div>{paper.title}</div>
                                <div className="text-xs font-normal text-muted-foreground">
                                  {paper.paperYear ? `(${paper.paperYear}) ` : ""}Max: {paper.maxScore}
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {viewingExam.bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <Checkbox
                                  checked={confirmedParticipants.has(booking.id)}
                                  onCheckedChange={() => handleConfirmToggle(booking.id)}
                                  data-testid={`checkbox-confirm-${booking.id}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {confirmedParticipants.has(booking.id) && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  <span>{booking.student?.name || booking.guestName || "N/A"}</span>
                                </div>
                              </TableCell>
                              {papers.map((paper) => {
                                const scoreStr = resultScores[booking.id]?.[paper.id] || "";
                                const score = parseInt(scoreStr, 10);
                                const percentage = !isNaN(score) && paper.maxScore > 0 ? Math.round((score / paper.maxScore) * 100) : null;
                                return (
                                  <TableCell key={paper.id} className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={paper.maxScore}
                                        value={scoreStr}
                                        onChange={(e) => handleScoreChange(booking.id, paper.id, e.target.value)}
                                        className="w-20 h-8 text-center mx-auto"
                                        placeholder="-"
                                        data-testid={`input-score-${booking.id}-${paper.id}`}
                                      />
                                      {percentage !== null && (
                                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                                      )}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={saveAllResults}
                        disabled={saveResultsMutation.isPending}
                        data-testid="btn-save-results"
                      >
                        {saveResultsMutation.isPending ? "Saving..." : "Save All Results"}
                      </Button>
                    </div>
                    
                    {/* Results Comparison Graph - showing all student names */}
                    {papers.some(paper => paper.results.some(r => r.score !== null)) && (
                      <div className="mt-8 space-y-6">
                        <h4 className="font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Score Comparison by Paper
                        </h4>
                        
                        {papers.map((paper) => {
                          const chartData = viewingExam.bookings
                            .map((booking) => {
                              const result = paper.results.find(r => r.serviceBookingId === booking.id);
                              return {
                                name: booking.student?.name || booking.guestName || "Unknown",
                                score: result?.score ?? 0,
                                isConfirmed: result?.isConfirmed ?? false,
                              };
                            })
                            .filter(d => d.score > 0)
                            .sort((a, b) => b.score - a.score);
                          
                          if (chartData.length === 0) return null;
                          
                          const confirmedScores = chartData.filter(d => d.isConfirmed).map(d => d.score);
                          const average = confirmedScores.length > 0 
                            ? confirmedScores.reduce((a, b) => a + b, 0) / confirmedScores.length 
                            : 0;
                          
                          const COLORS = [
                            "hsl(var(--chart-1))",
                            "hsl(var(--chart-2))",
                            "hsl(var(--chart-3))",
                            "hsl(var(--chart-4))",
                            "hsl(var(--chart-5))",
                          ];
                          
                          return (
                            <Card key={paper.id} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                  {paper.title}
                                  {paper.paperYear ? <span className="text-sm font-normal text-muted-foreground ml-1">({paper.paperYear})</span> : ""}
                                </CardTitle>
                                <CardDescription>Max Score: {paper.maxScore} | {confirmedScores.length} confirmed results</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="h-80">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={chartData}
                                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                      layout="horizontal"
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis 
                                        dataKey="name" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        height={80}
                                        interval={0}
                                        tick={{ fontSize: 11 }}
                                      />
                                      <YAxis domain={[0, paper.maxScore]} />
                                      <Tooltip 
                                        formatter={(value: number, name: string) => {
                                          const pct = paper.maxScore > 0 ? Math.round((value / paper.maxScore) * 100) : 0;
                                          return [`${value} (${pct}%)`, "Score"];
                                        }}
                                        labelFormatter={(label) => `Student: ${label}`}
                                      />
                                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.isConfirmed ? COLORS[index % COLORS.length] : "#9ca3af"} 
                                          />
                                        ))}
                                      </Bar>
                                      {average > 0 && (
                                        <ReferenceLine 
                                          y={average} 
                                          stroke="#ef4444" 
                                          strokeDasharray="5 5" 
                                          label={{ 
                                            value: `Avg: ${average.toFixed(1)} (${paper.maxScore > 0 ? Math.round((average / paper.maxScore) * 100) : 0}%)`, 
                                            fill: "#ef4444", 
                                            fontSize: 12,
                                            position: "right"
                                          }} 
                                        />
                                      )}
                                      <ReferenceLine 
                                        y={paper.maxScore} 
                                        stroke="#10b981" 
                                        strokeDasharray="5 5" 
                                        label={{ 
                                          value: "Max", 
                                          fill: "#10b981", 
                                          fontSize: 12,
                                          position: "right"
                                        }} 
                                      />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded bg-gray-400"></div>
                                    Unconfirmed
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded" style={{background: "hsl(var(--chart-1))"}}></div>
                                    Confirmed
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : papers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Create exam papers first to enter results</p>
                ) : (
                  <p className="text-muted-foreground text-sm">No students registered yet</p>
                )}
              </TabsContent>
              
              <TabsContent value="expenses" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setIsAddExpenseDialogOpen(true)} data-testid="btn-add-expense">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
                {expenses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                          <TableCell>{expense.description || "-"}</TableCell>
                          <TableCell>£{parseFloat(expense.amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={expense.isPaid ? "default" : "outline"}>
                              {expense.isPaid ? "Paid" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {!expense.isPaid && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => viewingExam && markExpensePaidMutation.mutate({ examId: viewingExam.id, expenseId: expense.id })}
                                  disabled={markExpensePaidMutation.isPending}
                                  data-testid={`btn-mark-expense-paid-${expense.id}`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-destructive" data-testid={`btn-delete-expense-${expense.id}`}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this expense? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => viewingExam && deleteExpenseMutation.mutate({ examId: viewingExam.id, expenseId: expense.id })}
                                      data-testid="btn-confirm-delete-expense"
                                    >
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
                ) : (
                  <p className="text-muted-foreground text-sm">No expenses recorded</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Add an expense for {viewingExam?.title}
            </DialogDescription>
          </DialogHeader>
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(onSubmitExpense)} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expense-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="invigilators">Invigilators</SelectItem>
                        <SelectItem value="hall_booking">Hall Booking</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description" data-testid="input-expense-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (£)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-expense-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes" data-testid="input-expense-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createExpenseMutation.isPending} data-testid="btn-submit-expense">
                  {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddPaperDialogOpen} onOpenChange={setIsAddPaperDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exam Paper</DialogTitle>
            <DialogDescription>
              Add a paper for {viewingExam?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Title</label>
              <Input
                value={newPaperTitle}
                onChange={(e) => setNewPaperTitle(e.target.value)}
                placeholder="e.g., Verbal Reasoning, Maths, English"
                data-testid="input-paper-title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Score</label>
              <Input
                type="number"
                min="1"
                value={newPaperMaxScore}
                onChange={(e) => setNewPaperMaxScore(e.target.value)}
                placeholder="100"
                data-testid="input-paper-max-score"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Year (Optional)</label>
              <Select value={newPaperYear} onValueChange={setNewPaperYear}>
                <SelectTrigger data-testid="select-paper-year">
                  <SelectValue placeholder="Select year (if applicable)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific year</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">For papers from previous years (e.g., past exam papers)</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddPaperDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (viewingExam && newPaperTitle.trim()) {
                    createPaperMutation.mutate({
                      examId: viewingExam.id,
                      title: newPaperTitle.trim(),
                      maxScore: parseInt(newPaperMaxScore, 10) || 100,
                      paperYear: newPaperYear && newPaperYear !== "none" ? parseInt(newPaperYear, 10) : undefined,
                    });
                  }
                }}
                disabled={createPaperMutation.isPending || !newPaperTitle.trim()}
                data-testid="btn-submit-paper"
              >
                {createPaperMutation.isPending ? "Adding..." : "Add Paper"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddStudentDialogOpen} onOpenChange={(open) => {
        setIsAddStudentDialogOpen(open);
        if (!open) {
          setSelectedStudentIds([]);
          setGuestStudents([]);
          setNewGuestName("");
          setNewGuestEmail("");
          setStudentFilterTutor("all");
          setStudentFilterYearGroup("all");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Students for Mock Exam</DialogTitle>
            <DialogDescription>
              Select multiple students or add guest students for {viewingExam?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Filter Controls */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Filter by Tutor</label>
                <Select value={studentFilterTutor} onValueChange={setStudentFilterTutor}>
                  <SelectTrigger data-testid="select-student-filter-tutor">
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
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Filter by Year Group</label>
                <Select value={studentFilterYearGroup} onValueChange={setStudentFilterYearGroup}>
                  <SelectTrigger data-testid="select-student-filter-year-group">
                    <SelectValue placeholder="All Year Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Year Groups</SelectItem>
                    {[...Array(13)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        Year {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Existing Students Multi-Select */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Existing Students
              </label>
              <ScrollArea className="h-48 border rounded-md p-3">
                {(() => {
                  const filteredStudents = allStudents.filter(student => {
                    const alreadyRegistered = viewingExam?.bookings?.some(
                      b => b.studentId === student.id
                    );
                    if (alreadyRegistered) return false;
                    
                    if (studentFilterTutor !== "all" && student.tutorId !== studentFilterTutor) {
                      return false;
                    }
                    
                    if (studentFilterYearGroup !== "all") {
                      const yearGroup = getStudentYearGroup(student.startYear);
                      if (yearGroup !== parseInt(studentFilterYearGroup)) {
                        return false;
                      }
                    }
                    
                    return true;
                  });

                  return filteredStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available students matching filters</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredStudents.map((student) => {
                        const yearGroup = getStudentYearGroup(student.startYear);
                        const tutor = tutors.find(t => t.id === student.tutorId);
                        return (
                          <div key={student.id} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded">
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={selectedStudentIds.includes(student.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedStudentIds([...selectedStudentIds, student.id]);
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                                }
                              }}
                              data-testid={`checkbox-student-${student.id}`}
                            />
                            <label
                              htmlFor={`student-${student.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-0.5">
                                {yearGroup && (
                                  <Badge variant="outline" className="text-xs">Year {yearGroup}</Badge>
                                )}
                                {tutor && (
                                  <span>Tutor: {tutor.firstName} {tutor.lastName}</span>
                                )}
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </ScrollArea>
              {selectedStudentIds.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Guest Students Section */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add Guest Students (not in system)
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Guest name *"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  data-testid="input-guest-name"
                />
                <Input
                  placeholder="Email (optional)"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  data-testid="input-guest-email"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newGuestName.trim()) {
                      setGuestStudents([...guestStudents, { name: newGuestName.trim(), email: newGuestEmail.trim() }]);
                      setNewGuestName("");
                      setNewGuestEmail("");
                    }
                  }}
                  disabled={!newGuestName.trim()}
                  data-testid="btn-add-guest"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {guestStudents.length > 0 && (
                <div className="border rounded-md p-2 space-y-1">
                  {guestStudents.map((guest, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                      <span className="text-sm">
                        {guest.name} {guest.email && <span className="text-muted-foreground">({guest.email})</span>}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setGuestStudents(guestStudents.filter((_, i) => i !== index))}
                        data-testid={`btn-remove-guest-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {viewingExam && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price per student:</span>
                  <span className="font-medium">£{viewingExam.price}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Total students:</span>
                  <span className="font-medium">{selectedStudentIds.length + guestStudents.length}</span>
                </div>
                <div className="flex justify-between items-center mt-1 pt-1 border-t">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="font-bold">
                    £{((selectedStudentIds.length + guestStudents.length) * parseFloat(viewingExam.price || "0")).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddStudentDialogOpen(false);
                setSelectedStudentIds([]);
                setGuestStudents([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (viewingExam && (selectedStudentIds.length > 0 || guestStudents.length > 0)) {
                  registerStudentsMutation.mutate({
                    examId: viewingExam.id,
                    studentIds: selectedStudentIds,
                    guests: guestStudents,
                  });
                }
              }}
              disabled={(selectedStudentIds.length === 0 && guestStudents.length === 0) || registerStudentsMutation.isPending}
              data-testid="btn-confirm-register-students"
            >
              {registerStudentsMutation.isPending ? "Registering..." : `Register ${selectedStudentIds.length + guestStudents.length} Student${(selectedStudentIds.length + guestStudents.length) > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Mock Exam Trend Analytics</h2>
            <p className="text-muted-foreground">Track performance trends across historical and current mock exams</p>
          </div>
          
          {trendsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : trendAnalytics.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No exam data available yet.</p>
                <p className="text-sm">Create and complete mock exams to see trend analytics.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {trendAnalytics.map((exam) => (
                <Card key={exam.examId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {exam.title}
                      <Badge variant="outline" className="ml-2">{exam.examType}</Badge>
                      {(mockExams.find(e => e.id === exam.examId) as any)?.isHistorical && (
                        <Badge variant="secondary">Historical</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(exam.examDate), "dd MMM yyyy")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {exam.papers.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No papers configured for this exam.</p>
                    ) : (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Paper</TableHead>
                              <TableHead className="text-center">Participants</TableHead>
                              <TableHead className="text-center">Highest</TableHead>
                              <TableHead className="text-center">Lowest</TableHead>
                              <TableHead className="text-center">Average</TableHead>
                              <TableHead className="text-center">Median</TableHead>
                              <TableHead className="text-center">Max Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {exam.papers.map((paper) => {
                              const maxScore = paper.maxScore || 100;
                              const highestPct = paper.stats.highest !== null ? Math.round((paper.stats.highest / maxScore) * 100) : null;
                              const lowestPct = paper.stats.lowest !== null ? Math.round((paper.stats.lowest / maxScore) * 100) : null;
                              const avgPct = paper.stats.average !== null ? Math.round((paper.stats.average / maxScore) * 100) : null;
                              const medianPct = paper.stats.median !== null ? Math.round((paper.stats.median / maxScore) * 100) : null;
                              return (
                                <TableRow key={paper.paperId}>
                                  <TableCell className="font-medium">
                                    {paper.title}
                                    {paper.paperYear ? <span className="text-xs text-muted-foreground ml-1">({paper.paperYear})</span> : ""}
                                  </TableCell>
                                  <TableCell className="text-center">{paper.stats.count}</TableCell>
                                  <TableCell className="text-center">
                                    {paper.stats.highest !== null ? (
                                      <div>
                                        <span className="text-green-600 font-medium">{paper.stats.highest}</span>
                                        <span className="text-xs text-muted-foreground ml-1">({highestPct}%)</span>
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {paper.stats.lowest !== null ? (
                                      <div>
                                        <span className="text-red-600 font-medium">{paper.stats.lowest}</span>
                                        <span className="text-xs text-muted-foreground ml-1">({lowestPct}%)</span>
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {paper.stats.average !== null ? (
                                      <div>
                                        <span>{paper.stats.average.toFixed(1)}</span>
                                        <span className="text-xs text-muted-foreground ml-1">({avgPct}%)</span>
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {paper.stats.median !== null ? (
                                      <div>
                                        <span>{paper.stats.median}</span>
                                        <span className="text-xs text-muted-foreground ml-1">({medianPct}%)</span>
                                      </div>
                                    ) : "-"}
                                  </TableCell>
                                  <TableCell className="text-center text-muted-foreground">
                                    {paper.maxScore}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                        
                        {exam.papers.some(p => p.stats.count > 0) && (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={exam.papers.filter(p => p.stats.count > 0).map(p => ({
                                  name: p.title + (p.paperYear ? ` (${p.paperYear})` : ""),
                                  highest: p.stats.highest || 0,
                                  average: p.stats.average || 0,
                                  median: p.stats.median || 0,
                                  lowest: p.stats.lowest || 0,
                                  max: p.maxScore,
                                  highestPct: p.stats.highest !== null && p.maxScore > 0 ? Math.round((p.stats.highest / p.maxScore) * 100) : 0,
                                  averagePct: p.stats.average !== null && p.maxScore > 0 ? Math.round((p.stats.average / p.maxScore) * 100) : 0,
                                  medianPct: p.stats.median !== null && p.maxScore > 0 ? Math.round((p.stats.median / p.maxScore) * 100) : 0,
                                  lowestPct: p.stats.lowest !== null && p.maxScore > 0 ? Math.round((p.stats.lowest / p.maxScore) * 100) : 0,
                                }))}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip 
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0]?.payload;
                                      return (
                                        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                                          <p className="font-medium mb-2">{label}</p>
                                          <p className="text-muted-foreground text-xs mb-2">Max Score: {data?.max}</p>
                                          <div className="space-y-1">
                                            <p className="flex items-center gap-2">
                                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e" }}></span>
                                              <span>Highest: {data?.highest} ({data?.highestPct}%)</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#3b82f6" }}></span>
                                              <span>Average: {data?.average} ({data?.averagePct}%)</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#8b5cf6" }}></span>
                                              <span>Median: {data?.median} ({data?.medianPct}%)</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }}></span>
                                              <span>Lowest: {data?.lowest} ({data?.lowestPct}%)</span>
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Legend />
                                <Bar dataKey="highest" fill="#22c55e" name="Highest" />
                                <Bar dataKey="average" fill="#3b82f6" name="Average" />
                                <Bar dataKey="median" fill="#8b5cf6" name="Median" />
                                <Bar dataKey="lowest" fill="#ef4444" name="Lowest" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="registrations" className="space-y-6">
          <AdminRegistrationsTab mockExams={mockExams} />
        </TabsContent>
        
        <TabsContent value="terms" className="space-y-6">
          <AdminTermsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Terms and Conditions Management Tab
function AdminTermsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<any>(null);

  const { data: terms = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/terms-and-conditions"],
  });

  const termForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Title is required"),
      version: z.string().min(1, "Version is required"),
      content: z.string().min(10, "Content must be at least 10 characters"),
      isActive: z.boolean(),
      effectiveDate: z.string().min(1, "Effective date is required"),
    })),
    defaultValues: {
      title: "",
      version: "",
      content: "",
      isActive: false,
      effectiveDate: new Date().toISOString().split('T')[0],
    },
  });

  const createTermMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/terms-and-conditions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms-and-conditions"] });
      toast({ title: "Terms created successfully" });
      setIsAddDialogOpen(false);
      termForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create terms", variant: "destructive" });
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/terms-and-conditions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms-and-conditions"] });
      toast({ title: "Terms updated successfully" });
      setEditingTerm(null);
      termForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update terms", variant: "destructive" });
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/terms-and-conditions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/terms-and-conditions"] });
      toast({ title: "Terms deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete terms", variant: "destructive" });
    },
  });

  const handleEdit = (term: any) => {
    setEditingTerm(term);
    termForm.reset({
      title: term.title,
      version: term.version,
      content: term.content,
      isActive: term.isActive,
      effectiveDate: term.effectiveDate ? new Date(term.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    if (editingTerm) {
      updateTermMutation.mutate({ id: editingTerm.id, data });
    } else {
      createTermMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          <p className="text-muted-foreground">Manage terms and conditions for mock exam registrations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingTerm(null);
            termForm.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Terms
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTerm ? "Edit Terms" : "Create Terms & Conditions"}</DialogTitle>
              <DialogDescription>
                {editingTerm ? "Update the terms and conditions" : "Create a new version of terms and conditions"}
              </DialogDescription>
            </DialogHeader>
            <Form {...termForm}>
              <form onSubmit={termForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={termForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Mock Exam Registration Terms" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1.0, 2.0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter the full terms and conditions text..."
                          className="min-h-[300px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={termForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Active (Only one version can be active at a time)</FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createTermMutation.isPending || updateTermMutation.isPending}>
                    {editingTerm ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {terms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No terms and conditions created yet</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Terms
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {terms.map((term: any) => (
            <Card key={term.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{term.title}</CardTitle>
                  <Badge variant={term.isActive ? "default" : "secondary"}>
                    {term.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">v{term.version}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(term)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Terms?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete these terms and conditions. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTermMutation.mutate(term.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  Created: {term.createdAt ? format(new Date(term.createdAt), "PPP") : "Unknown"}
                  {term.creator && ` by ${term.creator.firstName} ${term.creator.lastName}`}
                </div>
                <div className="bg-muted p-4 rounded-md max-h-[200px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{term.content}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Registrations Tab
function AdminRegistrationsTab({ mockExams }: { mockExams: MockExamEvent[] }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [viewingRegistration, setViewingRegistration] = useState<any>(null);

  const { data: registrations = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/mock-exam-registrations", selectedEventId],
    queryFn: async () => {
      const url = selectedEventId && selectedEventId !== "all"
        ? `/api/mock-exam-registrations?mockExamEventId=${selectedEventId}`
        : "/api/mock-exam-registrations";
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/mock-exam-registrations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exam-registrations"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/mock-exam-registrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-exam-registrations"] });
      toast({ title: "Registration deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete registration", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending_tc: "secondary",
      awaiting_payment: "outline",
      confirmed: "default",
      cancelled: "destructive",
      refunded: "outline",
    };
    const labels: Record<string, string> = {
      pending_tc: "Pending T&C",
      awaiting_payment: "Awaiting Payment",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mock Exam Registrations</h2>
          <p className="text-muted-foreground">View and manage registration submissions</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {mockExams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No registrations found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg: any) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">
                      {reg.childFirstName} {reg.childLastName}
                      {reg.isGuest && <Badge variant="outline" className="ml-2">Guest</Badge>}
                    </TableCell>
                    <TableCell>
                      {reg.parentFirstName} {reg.parentLastName}
                      <div className="text-sm text-muted-foreground">{reg.parentEmail}</div>
                    </TableCell>
                    <TableCell>{reg.mockExamEvent?.title || "Unknown"}</TableCell>
                    <TableCell>{getStatusBadge(reg.status)}</TableCell>
                    <TableCell>£{reg.totalAmount ? Number(reg.totalAmount).toFixed(2) : "0.00"}</TableCell>
                    <TableCell>{format(new Date(reg.createdAt), "PP")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setViewingRegistration(reg)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select 
                          value={reg.status}
                          onValueChange={(status) => updateStatusMutation.mutate({ id: reg.id, status })}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending_tc">Pending T&C</SelectItem>
                            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Registration?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this registration. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRegistrationMutation.mutate(reg.id)}>
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

      {/* Registration Details Dialog */}
      <Dialog open={!!viewingRegistration} onOpenChange={(open) => !open && setViewingRegistration(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {viewingRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Child Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><strong>Name:</strong> {viewingRegistration.childFirstName} {viewingRegistration.childLastName}</p>
                    <p><strong>Date of Birth:</strong> {viewingRegistration.childDateOfBirth ? format(new Date(viewingRegistration.childDateOfBirth), "PP") : "N/A"}</p>
                    <p><strong>Medical Conditions:</strong> {viewingRegistration.medicalConditions || "None specified"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Parent Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><strong>Name:</strong> {viewingRegistration.parentFirstName} {viewingRegistration.parentLastName}</p>
                    <p><strong>Email:</strong> {viewingRegistration.parentEmail}</p>
                    <p><strong>Phone:</strong> {viewingRegistration.parentPhone}</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Name:</strong> {viewingRegistration.emergencyContactName}</p>
                  <p><strong>Relationship:</strong> {viewingRegistration.emergencyContactRelationship}</p>
                  <p><strong>Phone:</strong> {viewingRegistration.emergencyContactPhone}</p>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Registration Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><strong>Exam:</strong> {viewingRegistration.mockExamEvent?.title}</p>
                    <p><strong>Status:</strong> {getStatusBadge(viewingRegistration.status)}</p>
                    <p><strong>Amount:</strong> £{viewingRegistration.totalAmount ? Number(viewingRegistration.totalAmount).toFixed(2) : "0.00"}</p>
                    <p><strong>Photo Rights:</strong> {viewingRegistration.photoRightsConsent ? "Consented" : "Not Consented"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Terms Acceptance</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {viewingRegistration.termsAcceptance ? (
                      <>
                        <p><strong>Accepted:</strong> {format(new Date(viewingRegistration.termsAcceptance.acceptedAt), "PPP p")}</p>
                        <p><strong>IP:</strong> {viewingRegistration.termsAcceptance.ipAddress}</p>
                        <p><strong>Signed Name:</strong> {viewingRegistration.termsAcceptance.signedName}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Not yet accepted</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
