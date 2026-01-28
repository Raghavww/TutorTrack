import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  User,
  BookOpen,
  FileText,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Settings,
  Save,
  Lock,
  FolderOpen,
  Download,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { User as UserType, StudentWithTutor, TimesheetEntryWithRelations, Invoice, Payment, ParentMessageWithRelations, DocumentShareWithRelations } from "@shared/schema";
import { ParentSchedule } from "./parent-schedule";
import { ParentMockExamResults } from "./parent-mock-exam-results";

interface ParentDashboardProps {
  user: UserType;
  viewingStudentId?: string;
}

export default function ParentDashboard({ user, viewingStudentId }: ParentDashboardProps) {
  const { toast } = useToast();
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [recipientType, setRecipientType] = useState<"tutor" | "admin">("tutor");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const { data: students = [], isLoading: studentsLoading } = useQuery<StudentWithTutor[]>({
    queryKey: ["/api/parent/students", viewingStudentId],
    retry: false,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<TimesheetEntryWithRelations[]>({
    queryKey: ["/api/parent/sessions", viewingStudentId],
    retry: false,
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/parent/invoices", viewingStudentId],
    retry: false,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/parent/payments", viewingStudentId],
    retry: false,
  });

  const { data: sentMessages = [], isLoading: messagesLoading } = useQuery<ParentMessageWithRelations[]>({
    queryKey: ["/api/parent/messages"],
    retry: false,
  });

  const { data: expandedMessage } = useQuery<ParentMessageWithRelations>({
    queryKey: ["/api/messages", expandedMessageId],
    enabled: !!expandedMessageId,
    retry: false,
  });

  const { data: sharedDocuments = [], isLoading: documentsLoading } = useQuery<DocumentShareWithRelations[]>({
    queryKey: ["/api/my-documents"],
    retry: false,
  });

  const markDocumentReadMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const response = await apiRequest("PATCH", `/api/document-shares/${shareId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-documents"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { studentId: string; recipientType: "tutor" | "admin"; subject: string; message: string; senderEmail: string; senderName: string }) => {
      const response = await apiRequest("POST", "/api/parent/messages", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
      setMessageSubject("");
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/parent/messages"] });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to change password", 
        description: error.message || "Please check your current password and try again",
        variant: "destructive" 
      });
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "New passwords do not match", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleSendMessage = () => {
    const studentId = selectedStudentId || students[0]?.id;
    if (!studentId || !messageContent.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }
    sendMessageMutation.mutate({
      studentId,
      recipientType,
      subject: messageSubject.trim() || "No Subject",
      message: messageContent.trim(),
      senderEmail: user.email || "",
      senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Parent",
    });
  };

  // Auto-select first student when students load (or use viewingStudentId if provided)
  useEffect(() => {
    if (students.length > 0 && !activeStudentId) {
      const initialStudent = viewingStudentId 
        ? students.find(s => s.id === viewingStudentId)?.id 
        : students[0]?.id;
      if (initialStudent) {
        setActiveStudentId(initialStudent);
      }
    }
  }, [students, activeStudentId, viewingStudentId]);

  // Determine which student to display - either the selected one or default to first
  const selectedStudent = activeStudentId 
    ? students.find(s => s.id === activeStudentId) 
    : students[0];

  // Calculate balance for selected student only
  const studentInvoices = invoices.filter(inv => inv.studentId === selectedStudent?.id);
  const studentPayments = payments.filter(p => p.studentId === selectedStudent?.id);
  const totalBilled = studentInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount?.toString() || "0"), 0);
  const totalPaid = studentPayments.reduce((sum, p) => sum + parseFloat(p.amount?.toString() || "0"), 0);
  const balance = totalBilled - totalPaid;
  
  // Filter sessions for selected student
  const studentSessions = sessions.filter(s => s.studentId === selectedStudent?.id);
  
  // Filter documents for selected student (or show all if no studentId specified on share)
  const studentDocuments = sharedDocuments.filter(share => 
    !share.studentId || share.studentId === selectedStudent?.id
  );

  if (studentsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const student = selectedStudent;

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Student Linked</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your account is not linked to any student records. Please contact the tuition center to link your child's account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Selector - only show when parent has multiple students */}
      {students.length > 1 && (
        <Card className="bg-primary/5 border-primary/20" data-testid="card-student-selector">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-medium">Viewing:</span>
              </div>
              <Select 
                value={activeStudentId || students[0]?.id} 
                onValueChange={setActiveStudentId}
              >
                <SelectTrigger className="w-[280px]" data-testid="select-student">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id} data-testid={`select-student-${s.id}`}>
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="text-muted-foreground text-sm">({s.subject})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="ml-auto">
                {students.length} students linked
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-student-info">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-student-name">
              {student.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {student.subject} {student.examType ? `- ${student.examType}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-sessions-remaining">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-sessions-remaining">
              {student.sessionsRemaining || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {student.sessionsBooked || 0} booked
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-account-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance > 0 ? "text-red-500" : "text-green-500"}`} data-testid="text-account-balance">
              £{balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance > 0 ? "Amount due" : "Credit balance"}
            </p>
          </CardContent>
        </Card>
      </div>

      {student.tutor && (
        <Card data-testid="card-tutor-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold" data-testid="text-tutor-name">
                  {student.tutor?.firstName} {student.tutor?.lastName}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-tutor-email">
                  {student.tutor?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <Tabs defaultValue="sessions">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="sessions" data-testid="tab-sessions">
                <Clock className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="schedule" data-testid="tab-schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="exams" data-testid="tab-exams">
                <GraduationCap className="h-4 w-4 mr-2" />
                Exams
              </TabsTrigger>
              <TabsTrigger value="invoices" data-testid="tab-invoices">
                <FileText className="h-4 w-4 mr-2" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payments" data-testid="tab-payments">
                <DollarSign className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">
                <FolderOpen className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="messages" data-testid="tab-messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="account" data-testid="tab-account">
                <Settings className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="sessions" className="p-4">
            <CardContent className="p-0">
              {sessionsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : studentSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentSessions.map((session) => (
                        <TableRow key={session.id} data-testid={`row-session-${session.id}`}>
                          <TableCell>
                            {format(new Date(session.date), "EEE, MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{session.duration} hr{parseFloat(session.duration.toString()) !== 1 ? "s" : ""}</TableCell>
                          <TableCell className="max-w-xs truncate">{session.notes || "-"}</TableCell>
                          <TableCell className="text-right font-medium">
                            £{parseFloat(session.parentBilling?.toString() || "0").toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="schedule" className="p-4">
            <ParentSchedule user={user} />
          </TabsContent>

          <TabsContent value="exams" className="p-4">
            <ParentMockExamResults />
          </TabsContent>

          <TabsContent value="invoices" className="p-4">
            <CardContent className="p-0">
              {invoicesLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : studentInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentInvoices.map((invoice) => (
                        <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {invoice.createdAt ? format(new Date(invoice.createdAt), "MMM d, yyyy") : "-"}
                          </TableCell>
                          <TableCell>
                            {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, yyyy") : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              invoice.status === "paid" ? "default" :
                              invoice.status === "overdue" ? "destructive" :
                              invoice.status === "cancelled" ? "outline" :
                              "secondary"
                            }>
                              {invoice.status === "sent" ? "Open" : 
                               invoice.status === "paid" ? "Paid" :
                               invoice.status === "overdue" ? "Overdue" :
                               invoice.status === "cancelled" ? "Cancelled" :
                               invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £{parseFloat(invoice.amount?.toString() || "0").toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="payments" className="p-4">
            <CardContent className="p-0">
              {paymentsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : studentPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentPayments.map((payment) => (
                        <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                          <TableCell>
                            {payment.receivedAt ? format(new Date(payment.receivedAt), "MMM d, yyyy") : "-"}
                          </TableCell>
                          <TableCell className="capitalize">{payment.paymentMethod?.replace("_", " ")}</TableCell>
                          <TableCell>{payment.reference || "-"}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            £{parseFloat(payment.amount?.toString() || "0").toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="documents" className="p-4">
            <CardContent className="p-0">
              {documentsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : studentDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents shared with you yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {studentDocuments.filter(d => !d.isRead).length} unread document{studentDocuments.filter(d => !d.isRead).length !== 1 ? 's' : ''}
                  </p>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Shared By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentDocuments.map((share) => (
                          <TableRow 
                            key={share.id} 
                            data-testid={`row-document-${share.id}`}
                            className={!share.isRead ? "bg-primary/5" : ""}
                          >
                            <TableCell>
                              <div>
                                <p className={`font-medium ${!share.isRead ? "font-semibold" : ""}`}>
                                  {share.document?.title}
                                </p>
                                {share.document?.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {share.document.description}
                                  </p>
                                )}
                                {share.message && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    "{share.message}"
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {share.document?.category?.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {share.sharedByUser?.firstName} {share.sharedByUser?.lastName}
                            </TableCell>
                            <TableCell>
                              {share.createdAt && format(new Date(share.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {share.isRead ? (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Read
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500">New</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  onClick={() => {
                                    if (!share.isRead) {
                                      markDocumentReadMutation.mutate(share.id);
                                    }
                                  }}
                                >
                                  <a 
                                    href={share.document?.objectPath} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    data-testid={`link-view-document-${share.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </a>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                >
                                  <a 
                                    href={share.document?.objectPath} 
                                    download={share.document?.fileName}
                                    data-testid={`link-download-document-${share.id}`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="messages" className="p-4">
            <CardContent className="p-0 space-y-6">
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send a Message
                  </CardTitle>
                  <CardDescription>
                    Contact your tutor or the admin team with questions or feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {students.length > 1 && (
                    <div className="space-y-2">
                      <Label>Regarding Student</Label>
                      <Select value={selectedStudentId || students[0]?.id} onValueChange={setSelectedStudentId}>
                        <SelectTrigger data-testid="select-student">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Send To</Label>
                    <RadioGroup
                      value={recipientType}
                      onValueChange={(v) => setRecipientType(v as "tutor" | "admin")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tutor" id="recipient-tutor" data-testid="radio-tutor" />
                        <Label htmlFor="recipient-tutor" className="cursor-pointer">
                          Tutor ({student?.tutor?.firstName} {student?.tutor?.lastName})
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="recipient-admin" data-testid="radio-admin" />
                        <Label htmlFor="recipient-admin" className="cursor-pointer">Admin Only</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      {recipientType === "tutor" 
                        ? "Your message will be sent to both the tutor and admin." 
                        : "Your message will be sent to admin only (tutor will not see it)."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message-subject">Subject (Optional)</Label>
                    <Input
                      id="message-subject"
                      placeholder="Enter subject..."
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      data-testid="input-message-subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message-content">Message</Label>
                    <Textarea
                      id="message-content"
                      placeholder="Type your message here..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      data-testid="input-message-content"
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !messageContent.trim()}
                    data-testid="button-send-message"
                  >
                    {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold mb-3">Sent Messages</h3>
                {messagesLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : sentMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentMessages.map((msg) => {
                      const isExpanded = expandedMessageId === msg.id;
                      const replies = isExpanded && expandedMessage?.replies ? expandedMessage.replies : [];
                      const hasReplies = (msg.replies && msg.replies.length > 0) || replies.length > 0;
                      
                      return (
                        <Card key={msg.id} className="bg-muted/30" data-testid={`card-message-${msg.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{msg.subject || "No Subject"}</p>
                                <p className="text-xs text-muted-foreground">
                                  To: {msg.recipientType === "tutor" ? "Tutor & Admin" : "Admin Only"} • 
                                  {msg.createdAt ? format(new Date(msg.createdAt), " MMM d, yyyy h:mm a") : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={msg.isRead ? "secondary" : "default"}>
                                  {msg.isRead 
                                    ? (msg.readByTutor 
                                        ? `Read by ${msg.readByTutor.firstName}` 
                                        : "Read") 
                                    : "Sent"}
                                </Badge>
                                {hasReplies && (
                                  <Badge variant="outline" className="text-xs">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {replies.length || msg.replies?.length || 0}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{msg.message}</p>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full justify-center text-xs"
                              onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                              data-testid={`button-toggle-message-${msg.id}`}
                            >
                              {isExpanded ? (
                                <>Hide Replies <ChevronUp className="h-4 w-4 ml-1" /></>
                              ) : (
                                <>View Replies <ChevronDown className="h-4 w-4 ml-1" /></>
                              )}
                            </Button>
                            
                            {isExpanded && (
                              <div className="mt-4 border-t pt-4 space-y-3">
                                {replies.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-2">
                                    No replies yet
                                  </p>
                                ) : (
                                  replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="bg-primary/5 rounded-lg p-3 border-l-2 border-primary"
                                      data-testid={`reply-${reply.id}`}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-medium">
                                          {reply.repliedBy?.firstName} {reply.repliedBy?.lastName}
                                          <span className="text-xs text-muted-foreground ml-2">
                                            ({reply.repliedBy?.role === "admin" ? "Admin" : "Tutor"})
                                          </span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {reply.createdAt ? format(new Date(reply.createdAt), "MMM d, h:mm a") : ""}
                                        </p>
                                      </div>
                                      <p className="text-sm">{reply.replyContent}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="account" className="p-4">
            <CardContent className="p-0">
              <div className="max-w-md space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        data-testid="input-current-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        data-testid="input-new-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        data-testid="input-confirm-password"
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending}
                      className="w-full"
                      data-testid="button-change-password"
                    >
                      {changePasswordMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Changing...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Account Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p data-testid="text-account-email">
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p data-testid="text-account-name">
                      <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
