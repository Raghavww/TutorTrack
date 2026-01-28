import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "./ObjectUploader";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Share2,
  Trash2,
  Eye,
  Download,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  UserCheck,
  EyeOff,
} from "lucide-react";
import type { DocumentWithUploader, DocumentShareWithRelations, User, Student } from "@shared/schema";

const documentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(["study_material", "worksheet", "exam_paper", "textbook", "reference", "other"]),
  subject: z.string().optional(),
  examType: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

const shareFormSchema = z.object({
  recipientKeys: z.array(z.string()).min(1, "Select at least one recipient"),
  message: z.string().optional(),
  tutorVisibleWhenShared: z.boolean().default(false),
});

type ShareFormData = z.infer<typeof shareFormSchema>;

type ShareableRecipient = {
  parentId: string;
  parentName: string;
  parentEmail: string | null;
  studentId: string | null;
  studentName: string | null;
  yearGroup: number | null;
  tutorIds: string[];
  tutorNames: string[];
};

const categoryLabels: Record<string, string> = {
  study_material: "Study Material",
  worksheet: "Worksheet",
  exam_paper: "Exam Paper",
  textbook: "Textbook",
  reference: "Reference",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  study_material: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  worksheet: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  exam_paper: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  textbook: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  reference: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  other: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function AdminDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [shareDialogDocument, setShareDialogDocument] = useState<DocumentWithUploader | null>(null);
  const [viewSharesDocument, setViewSharesDocument] = useState<DocumentWithUploader | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [uploadedFile, setUploadedFile] = useState<{ objectPath: string; fileName: string; fileSize: number; fileType: string } | null>(null);

  const { data: documents = [], isLoading: documentsLoading } = useQuery<DocumentWithUploader[]>({
    queryKey: ["/api/documents"],
  });

  const { data: parents = [] } = useQuery<User[]>({
    queryKey: ["/api/parent-users"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: documentShares = [] } = useQuery<DocumentShareWithRelations[]>({
    queryKey: ["/api/documents", viewSharesDocument?.id, "shares"],
    enabled: !!viewSharesDocument,
  });

  const documentForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "study_material",
      subject: "",
      examType: "",
    },
  });

  const shareForm = useForm<ShareFormData>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      recipientKeys: [],
      message: "",
      tutorVisibleWhenShared: false,
    },
  });

  const { data: allShares = [] } = useQuery<DocumentShareWithRelations[]>({
    queryKey: ["/api/all-document-shares"],
  });

  const { data: tutors = [] } = useQuery<User[]>({
    queryKey: ["/api/tutors"],
  });

  const [activeTab, setActiveTab] = useState("documents");
  const [shareFilterTutor, setShareFilterTutor] = useState<string>("all");
  const [shareFilterParent, setShareFilterParent] = useState<string>("all");
  
  const [recipientFilterTutor, setRecipientFilterTutor] = useState<string>("all");
  const [recipientFilterYearGroup, setRecipientFilterYearGroup] = useState<string>("all");

  const { data: shareableRecipients = [] } = useQuery<ShareableRecipient[]>({
    queryKey: ["/api/documents/shareable-recipients"],
    enabled: !!shareDialogDocument,
  });
  
  const filteredRecipients = shareableRecipients.filter((recipient) => {
    if (recipientFilterTutor !== "all" && !recipient.tutorIds.includes(recipientFilterTutor)) {
      return false;
    }
    if (recipientFilterYearGroup !== "all" && recipient.yearGroup !== parseInt(recipientFilterYearGroup)) {
      return false;
    }
    return true;
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData & { objectPath: string; fileName: string; fileSize: number; fileType: string }) => {
      const res = await apiRequest("POST", "/api/documents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploadDialogOpen(false);
      setUploadedFile(null);
      documentForm.reset();
      toast({ title: "Document uploaded successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const shareDocumentMutation = useMutation({
    mutationFn: async ({ documentId, data, recipients }: { documentId: string; data: ShareFormData; recipients: ShareableRecipient[] }) => {
      const selectedRecipients = recipients.filter(r => 
        data.recipientKeys.includes(`${r.parentId}:${r.studentId || 'none'}`)
      );
      
      const sharePromises = selectedRecipients.map(r => 
        apiRequest("POST", `/api/documents/${documentId}/share`, {
          parentIds: [r.parentId],
          message: data.message || undefined,
          studentId: r.studentId || undefined,
          tutorVisibleWhenShared: data.tutorVisibleWhenShared || false,
        })
      );
      
      await Promise.all(sharePromises);
      return { shareCount: selectedRecipients.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/all-document-shares"] });
      setShareDialogDocument(null);
      setRecipientFilterTutor("all");
      setRecipientFilterYearGroup("all");
      shareForm.reset();
      toast({ title: `Document shared with ${data.shareCount} recipient(s)` });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share document",
        variant: "destructive",
      });
    },
  });

  const updateTutorVisibilityMutation = useMutation({
    mutationFn: async ({ documentId, visibleToTutors }: { documentId: string; visibleToTutors: boolean }) => {
      const res = await apiRequest("PATCH", `/api/documents/${documentId}/tutor-visibility`, { visibleToTutors });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Tutor visibility updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tutor visibility",
        variant: "destructive",
      });
    },
  });

  const deleteShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      await apiRequest("DELETE", `/api/document-shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", viewSharesDocument?.id, "shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Share removed successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove share",
        variant: "destructive",
      });
    },
  });

  const handleUploadComplete = async (result: any) => {
    const successfulUpload = result.successful?.[0];
    if (successfulUpload) {
      const file = successfulUpload;
      const response = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      }).then(r => r.json());
      
      setUploadedFile({
        objectPath: response.objectPath || `/objects/uploads/${file.name}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
      });
    }
  };

  const onDocumentFormSubmit = async (data: DocumentFormData) => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }
    
    createDocumentMutation.mutate({
      ...data,
      objectPath: uploadedFile.objectPath,
      fileName: uploadedFile.fileName,
      fileSize: uploadedFile.fileSize,
      fileType: uploadedFile.fileType,
    });
  };

  const onShareFormSubmit = async (data: ShareFormData) => {
    if (!shareDialogDocument) return;
    shareDocumentMutation.mutate({ 
      documentId: shareDialogDocument.id, 
      data, 
      recipients: shareableRecipients 
    });
  };

  const filteredDocuments = categoryFilter === "all" 
    ? documents 
    : documents.filter(d => d.category === categoryFilter);

  if (documentsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Store
              </CardTitle>
              <CardDescription>
                Upload and share documents with parents
              </CardDescription>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)} data-testid="button-upload-document">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Visible to Tutors</TableHead>
                <TableHead>Shared With</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                    <TableCell>
                      <div className="font-medium">{doc.title}</div>
                      {doc.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {doc.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[doc.category] || categoryColors.other}>
                        {categoryLabels[doc.category] || doc.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {doc.subject || "-"}
                      {doc.examType && (
                        <div className="text-xs text-muted-foreground">{doc.examType}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{doc.fileName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {doc.uploader?.firstName} {doc.uploader?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doc.createdAt && format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={doc.visibleToTutors || false}
                          onCheckedChange={(checked) => 
                            updateTutorVisibilityMutation.mutate({ documentId: doc.id, visibleToTutors: checked })
                          }
                          data-testid={`switch-tutor-visibility-${doc.id}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {doc.visibleToTutors ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <UserCheck className="h-3 w-3" />
                              Yes
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500">
                              <EyeOff className="h-3 w-3" />
                              No
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewSharesDocument(doc)}
                        data-testid={`button-view-shares-${doc.id}`}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        {doc.shareCount || 0}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={doc.objectPath} target="_blank" rel="noopener noreferrer" data-testid={`link-view-file-${doc.id}`}>
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShareDialogDocument(doc)}
                          data-testid={`button-share-${doc.id}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-${doc.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{doc.title}"? This will also remove all shares.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteDocumentMutation.mutate(doc.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to share with parents
            </DialogDescription>
          </DialogHeader>
          <Form {...documentForm}>
            <form onSubmit={documentForm.handleSubmit(onDocumentFormSubmit)} className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {uploadedFile ? (
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{uploadedFile.fileName}</span>
                    <span className="text-sm text-muted-foreground">
                      ({formatFileSize(uploadedFile.fileSize)})
                    </span>
                  </div>
                ) : (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={52428800}
                    onGetUploadParameters={async (file) => {
                      try {
                        console.log("Requesting upload URL for:", file.name);
                        const res = await fetch("/api/uploads/request-url", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: file.name,
                            size: file.size,
                            contentType: file.type,
                          }),
                        });
                        
                        if (!res.ok) {
                          const errorText = await res.text();
                          console.error("Upload URL request failed:", res.status, errorText);
                          throw new Error(`Failed to get upload URL: ${res.status}`);
                        }
                        
                        const response = await res.json();
                        console.log("Upload URL response:", response);
                        
                        if (!response.uploadURL) {
                          console.error("No uploadURL in response:", response);
                          throw new Error("Server did not provide upload URL");
                        }
                        
                        // Store the objectPath for use after upload completes
                        (file.meta as any).objectPath = response.objectPath;
                        
                        return {
                          method: "PUT" as const,
                          url: response.uploadURL,
                          headers: { "Content-Type": file.type as string || "application/octet-stream" },
                        };
                      } catch (error) {
                        console.error("Error in upload parameters:", error);
                        toast({
                          title: "Upload Failed",
                          description: "Could not get upload URL. Please try again.",
                          variant: "destructive",
                        });
                        throw error;
                      }
                    }}
                    onComplete={(result) => {
                      console.log("Upload complete:", result);
                      const successfulUpload = result.successful?.[0];
                      if (successfulUpload) {
                        const meta = successfulUpload.meta as any;
                        
                        setUploadedFile({
                          objectPath: meta?.objectPath || `/objects/uploads/${successfulUpload.name}`,
                          fileName: successfulUpload.name || "document",
                          fileSize: successfulUpload.size || 0,
                          fileType: successfulUpload.type || "application/octet-stream",
                        });
                        
                        toast({
                          title: "File uploaded",
                          description: "Now fill in the document details below.",
                        });
                      } else if (result.failed?.length) {
                        console.error("Upload failed:", result.failed);
                        toast({
                          title: "Upload Failed",
                          description: "Could not upload file. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    buttonClassName="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </ObjectUploader>
                )}
              </div>

              <FormField
                control={documentForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Document title" {...field} data-testid="input-document-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={documentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description" {...field} data-testid="input-document-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={documentForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-document-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={documentForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mathematics" {...field} data-testid="input-document-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={documentForm.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Type (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., GCSE, A-Level" {...field} data-testid="input-document-exam-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsUploadDialogOpen(false);
                  setUploadedFile(null);
                  documentForm.reset();
                }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!uploadedFile || createDocumentMutation.isPending}
                  data-testid="button-save-document"
                >
                  {createDocumentMutation.isPending ? "Saving..." : "Save Document"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!shareDialogDocument} onOpenChange={(open) => {
        if (!open) {
          setShareDialogDocument(null);
          setRecipientFilterTutor("all");
          setRecipientFilterYearGroup("all");
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Share "{shareDialogDocument?.title}" with parents
            </DialogDescription>
          </DialogHeader>
          <Form {...shareForm}>
            <form onSubmit={shareForm.handleSubmit(onShareFormSubmit)} className="space-y-4">
              <div className="flex gap-4 mb-2">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Tutor</label>
                  <Select value={recipientFilterTutor} onValueChange={setRecipientFilterTutor}>
                    <SelectTrigger data-testid="select-filter-tutor">
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
                  <Select value={recipientFilterYearGroup} onValueChange={setRecipientFilterYearGroup}>
                    <SelectTrigger data-testid="select-filter-year-group">
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
              
              <FormField
                control={shareForm.control}
                name="recipientKeys"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Recipients ({filteredRecipients.length} available)</FormLabel>
                    <ScrollArea className="h-64 border rounded-md p-2">
                      <div className="space-y-2">
                        {filteredRecipients.map((recipient) => {
                          const key = `${recipient.parentId}:${recipient.studentId || 'none'}`;
                          return (
                            <div key={key} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded">
                              <Checkbox
                                id={`recipient-${key}`}
                                checked={field.value.includes(key)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, key]
                                    : field.value.filter((k) => k !== key);
                                  field.onChange(newValue);
                                }}
                                data-testid={`checkbox-recipient-${recipient.studentId || recipient.parentId}`}
                              />
                              <label htmlFor={`recipient-${key}`} className="text-sm cursor-pointer flex-1">
                                <div className="font-medium">
                                  {recipient.studentName 
                                    ? `${recipient.parentName} - ${recipient.studentName}`
                                    : recipient.parentName}
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                                  {recipient.yearGroup && (
                                    <Badge variant="outline" className="text-xs">Year {recipient.yearGroup}</Badge>
                                  )}
                                  {recipient.tutorNames.length > 0 && (
                                    <span>Tutor{recipient.tutorNames.length > 1 ? 's' : ''}: {recipient.tutorNames.join(', ')}</span>
                                  )}
                                  {!recipient.studentId && (
                                    <Badge variant="secondary" className="text-xs">No student linked</Badge>
                                  )}
                                </div>
                                {recipient.parentEmail && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {recipient.parentEmail}
                                  </div>
                                )}
                              </label>
                            </div>
                          );
                        })}
                        {filteredRecipients.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No recipients found matching the filters
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={shareForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a message for the parents..." 
                        {...field} 
                        data-testid="input-share-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={shareForm.control}
                name="tutorVisibleWhenShared"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Visible to Tutors</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Allow tutors to see this shared document
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-tutor-visible-when-shared"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setShareDialogDocument(null);
                  setRecipientFilterTutor("all");
                  setRecipientFilterYearGroup("all");
                  shareForm.reset();
                }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={shareDocumentMutation.isPending}
                  data-testid="button-confirm-share"
                >
                  {shareDocumentMutation.isPending ? "Sharing..." : "Share"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewSharesDocument} onOpenChange={(open) => !open && setViewSharesDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Shares</DialogTitle>
            <DialogDescription>
              People who have access to "{viewSharesDocument?.title}"
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parent</TableHead>
                <TableHead>Related Student</TableHead>
                <TableHead>Shared By</TableHead>
                <TableHead>Tutor Visible</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentShares.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Not shared with anyone yet
                  </TableCell>
                </TableRow>
              ) : (
                documentShares.map((share) => (
                  <TableRow key={share.id} data-testid={`row-share-${share.id}`}>
                    <TableCell>
                      {share.parent?.firstName} {share.parent?.lastName}
                    </TableCell>
                    <TableCell>
                      {share.student?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {share.sharedByUser?.firstName} {share.sharedByUser?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {share.createdAt && format(new Date(share.createdAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {share.tutorVisibleWhenShared ? (
                        <Badge variant="outline" className="text-green-600">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <EyeOff className="h-3 w-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {share.isRead ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Read {share.readAt && format(new Date(share.readAt), "MMM d")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Unread
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-remove-share-${share.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Share</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this share? The parent will no longer have access to this document.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteShareMutation.mutate(share.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewSharesDocument(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
