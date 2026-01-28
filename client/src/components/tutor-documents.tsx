import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Eye, Download, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { DocumentWithUploader, DocumentShareWithRelations } from "@shared/schema";

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

export function TutorDocuments() {
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: documents = [], isLoading: documentsLoading } = useQuery<DocumentWithUploader[]>({
    queryKey: ["/api/tutor-documents"],
  });

  const { data: sharedDocuments = [], isLoading: sharesLoading } = useQuery<DocumentShareWithRelations[]>({
    queryKey: ["/api/tutor-document-shares"],
  });

  if (documentsLoading || sharesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
            <Badge variant="secondary" className="ml-2">
              {documents.length + sharedDocuments.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-documents"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {documents.length === 0 && sharedDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents available. Documents shared by admin will appear here.
            </p>
          ) : (
            <div className="space-y-6">
              {documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Available Documents</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id} data-testid={`row-tutor-document-${doc.id}`}>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={doc.objectPath} target="_blank" rel="noopener noreferrer" data-testid={`link-view-tutor-file-${doc.id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {sharedDocuments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Documents Shared with Parents
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Shared</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sharedDocuments.map((share) => (
                        <TableRow key={share.id} data-testid={`row-tutor-shared-${share.id}`}>
                          <TableCell>
                            <div className="font-medium">{share.document?.title}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={categoryColors[share.document?.category || "other"] || categoryColors.other}>
                              {categoryLabels[share.document?.category || "other"] || share.document?.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {share.parent?.firstName} {share.parent?.lastName}
                          </TableCell>
                          <TableCell>
                            {share.student?.name || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {share.createdAt && format(new Date(share.createdAt), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={share.document?.objectPath} target="_blank" rel="noopener noreferrer" data-testid={`link-view-shared-file-${share.id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
