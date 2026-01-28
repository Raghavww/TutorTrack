import { useState, useEffect, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Search, ChevronLeft, ChevronRight, User, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface AuditLogUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  performedBy: string;
  details: Record<string, any> | null;
  createdAt: string;
  performedByUser: AuditLogUser;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

const actionLabels: Record<string, string> = {
  tutor_created: "Tutor Created",
  tutor_updated: "Tutor Updated",
  tutor_archived: "Tutor Archived",
  tutor_restored: "Tutor Restored",
  student_created: "Student Created",
  student_updated: "Student Updated",
  student_archived: "Student Archived",
  student_restored: "Student Restored",
  student_deleted: "Student Deleted",
  parent_created: "Parent Created",
  parent_updated: "Parent Updated",
  rate_created: "Rate Created",
  rate_updated: "Rate Updated",
  rate_deleted: "Rate Deleted",
  allocation_created: "Allocation Created",
  allocation_updated: "Allocation Updated",
  allocation_deleted: "Allocation Deleted",
  waitlist_created: "Waitlist Entry Created",
  waitlist_updated: "Waitlist Entry Updated",
  waitlist_deleted: "Waitlist Entry Deleted",
  waitlist_converted: "Waitlist Converted to Student",
  invoice_created: "Invoice Created",
  invoice_updated: "Invoice Updated",
  invoice_paid: "Invoice Marked Paid",
  group_created: "Group Created",
  group_updated: "Group Updated",
  group_deleted: "Group Deleted",
  session_created: "Session Created",
  session_updated: "Session Updated",
  session_deleted: "Session Deleted",
  timesheet_approved: "Timesheet Approved",
  timesheet_rejected: "Timesheet Rejected",
  document_created: "Document Created",
  document_updated: "Document Updated",
  document_deleted: "Document Deleted",
  document_shared: "Document Shared",
};

const entityTypeLabels: Record<string, string> = {
  user: "User",
  student: "Student",
  rate: "Rate",
  allocation: "Allocation",
  waitlist: "Waitlist",
  invoice: "Invoice",
  group: "Group",
  session: "Session",
  timesheet: "Timesheet",
  document: "Document",
};

const actionColors: Record<string, string> = {
  created: "bg-green-100 text-green-700 border-green-300",
  updated: "bg-blue-100 text-blue-700 border-blue-300",
  deleted: "bg-red-100 text-red-700 border-red-300",
  archived: "bg-gray-100 text-gray-700 border-gray-300",
  restored: "bg-purple-100 text-purple-700 border-purple-300",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-300",
  approved: "bg-teal-100 text-teal-700 border-teal-300",
  rejected: "bg-orange-100 text-orange-700 border-orange-300",
  converted: "bg-indigo-100 text-indigo-700 border-indigo-300",
  shared: "bg-cyan-100 text-cyan-700 border-cyan-300",
};

function getActionColor(action: string): string {
  const actionParts = action.split("_");
  const actionType = actionParts[actionParts.length - 1];
  return actionColors[actionType] || "bg-gray-100 text-gray-700";
}

function generateSummary(log: AuditLog): string {
  const details = log.details;
  if (!details) return "No details available";

  const actionType = log.action.split("_").pop();
  
  if (details.name) {
    return `${details.name}`;
  }
  
  if (details.studentName) {
    return `Student: ${details.studentName}`;
  }
  
  if (details.tutorName) {
    return `Tutor: ${details.tutorName}`;
  }

  if (details.changes && typeof details.changes === "object") {
    const changedFields = Object.keys(details.changes);
    if (changedFields.length === 1) {
      return `Changed ${changedFields[0]}`;
    } else if (changedFields.length > 1) {
      return `Changed ${changedFields.length} fields`;
    }
  }

  if (details.amount !== undefined) {
    return `Amount: £${details.amount}`;
  }

  if (details.reason) {
    return details.reason.length > 50 ? details.reason.substring(0, 50) + "..." : details.reason;
  }

  const keys = Object.keys(details).filter(k => typeof details[k] !== "object");
  if (keys.length > 0) {
    const firstKey = keys[0];
    const value = details[firstKey];
    if (typeof value === "string" && value.length > 50) {
      return `${firstKey}: ${value.substring(0, 50)}...`;
    }
    return `${firstKey}: ${value}`;
  }

  return "View details for more info";
}

export default function AdminAuditLog() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const pageSize = 20;

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityTypeFilter]);

  const { data: auditLogsData, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: [
      "/api/audit-logs",
      { limit: pageSize, offset: (page - 1) * pageSize, action: actionFilter, entityType: entityTypeFilter },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", pageSize.toString());
      params.append("offset", ((page - 1) * pageSize).toString());
      if (actionFilter) params.append("action", actionFilter);
      if (entityTypeFilter) params.append("entityType", entityTypeFilter);
      
      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });

  const logs = auditLogsData?.logs || [];
  const totalLogs = auditLogsData?.total || 0;
  const totalPages = Math.ceil(totalLogs / pageSize);

  const filteredLogs = searchQuery
    ? logs.filter((log) => {
        const searchLower = searchQuery.toLowerCase();
        const userName = `${log.performedByUser?.firstName || ""} ${log.performedByUser?.lastName || ""}`.toLowerCase();
        const details = JSON.stringify(log.details || {}).toLowerCase();
        return (
          userName.includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.entityType.toLowerCase().includes(searchLower) ||
          details.includes(searchLower)
        );
      })
    : logs;

  const uniqueActions = Array.from(
    new Set(Object.keys(actionLabels))
  ).sort();

  const uniqueEntityTypes = Array.from(
    new Set(Object.keys(entityTypeLabels))
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Admin Audit Log
          </h3>
          <p className="text-sm text-muted-foreground">
            Track all administrative changes made in the system
          </p>
        </div>
        <Badge className="bg-primary text-white text-sm">
          {totalLogs} total entries
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-audit-search"
              />
            </div>
            <Select
              value={actionFilter}
              onValueChange={(value) => {
                setActionFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger data-testid="select-audit-action-filter">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {actionLabels[action] || action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={entityTypeFilter}
              onValueChange={(value) => {
                setEntityTypeFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger data-testid="select-audit-entity-filter">
                <SelectValue placeholder="Filter by entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entity Types</SelectItem>
                {uniqueEntityTypes.map((entityType) => (
                  <SelectItem key={entityType} value={entityType}>
                    {entityTypeLabels[entityType] || entityType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            All administrative actions are logged here for accountability. Click a row to see full details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No audit logs found matching your criteria.
            </p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const isExpanded = expandedRows.has(log.id);
                      return (
                        <Fragment key={log.id}>
                          <TableRow 
                            data-testid={`audit-log-row-${log.id}`}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRow(log.id)}
                          >
                            <TableCell className="w-[40px]">
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getActionColor(log.action)}
                              >
                                {actionLabels[log.action] || log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {entityTypeLabels[log.entityType] || log.entityType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {log.performedByUser
                                    ? `${log.performedByUser.firstName || ""} ${log.performedByUser.lastName || ""}`.trim() ||
                                      log.performedByUser.email ||
                                      "Unknown"
                                    : "System"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {generateSummary(log)}
                              </span>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow key={`${log.id}-details`} className="bg-muted/30">
                              <TableCell colSpan={6} className="py-4">
                                <div className="pl-10 space-y-3">
                                  <div className="text-sm font-medium">Full Details</div>
                                  {log.details ? (
                                    <div className="bg-background rounded-lg p-4 border">
                                      <div className="grid gap-2">
                                        {Object.entries(log.details).map(([key, value]) => {
                                          if (key === "changes" && typeof value === "object" && value !== null) {
                                            return (
                                              <div key={key} className="space-y-2">
                                                <div className="font-medium text-sm">Changes Made:</div>
                                                <div className="pl-4 space-y-1">
                                                  {Object.entries(value as Record<string, any>).map(([field, change]) => {
                                                    if (change && typeof change === "object" && ("from" in change || "to" in change)) {
                                                      return (
                                                        <div key={field} className="text-sm">
                                                          <span className="font-medium">{field}:</span>{" "}
                                                          <span className="text-red-600 line-through">{String(change.from ?? "empty")}</span>
                                                          {" → "}
                                                          <span className="text-green-600">{String(change.to ?? "empty")}</span>
                                                        </div>
                                                      );
                                                    }
                                                    return (
                                                      <div key={field} className="text-sm">
                                                        <span className="font-medium">{field}:</span>{" "}
                                                        <span className="text-muted-foreground">{String(change ?? "empty")}</span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          }
                                          if (typeof value === "object" && value !== null) {
                                            return (
                                              <div key={key} className="text-sm">
                                                <span className="font-medium">{key}:</span>{" "}
                                                <pre className="inline text-muted-foreground text-xs bg-muted p-1 rounded">
                                                  {JSON.stringify(value, null, 2)}
                                                </pre>
                                              </div>
                                            );
                                          }
                                          return (
                                            <div key={key} className="text-sm">
                                              <span className="font-medium">{key}:</span>{" "}
                                              <span className="text-muted-foreground">{String(value)}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No additional details available.</p>
                                  )}
                                  {log.entityId && (
                                    <div className="text-xs text-muted-foreground">
                                      Entity ID: {log.entityId}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalLogs)} of {totalLogs} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-audit-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      data-testid="button-audit-next-page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
