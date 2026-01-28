import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FileText, Award, Eye, Users } from "lucide-react";
import type { MockExamEvent, ServiceBooking, MockExamPaperWithResults } from "@shared/schema";

interface PaperStatistic {
  paperId: string;
  paperTitle: string;
  childScore: number | null;
  median: number;
  average: number;
  highest: number;
  lowest: number;
  rank: number;
  totalParticipants: number;
}

interface ExamResultData {
  exam: MockExamEvent;
  booking: ServiceBooking;
  papers: MockExamPaperWithResults[];
  statistics: PaperStatistic[];
}

export function ParentMockExamResults() {
  const [selectedExam, setSelectedExam] = useState<ExamResultData | null>(null);

  const { data: results = [], isLoading } = useQuery<ExamResultData[]>({
    queryKey: ["/api/parent/mock-exam-results"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mock Exam Results</CardTitle>
          <CardDescription>View your child's mock exam performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mock Exam Results</CardTitle>
          <CardDescription>View your child's mock exam performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            No mock exam results available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasResults = (result: ExamResultData) => {
    return result.statistics.length > 0 && result.statistics.some(s => s.childScore !== null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Mock Exam Results
        </CardTitle>
        <CardDescription>View your child's mock exam performance and rankings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result) => (
          <Card key={result.booking.id} className="overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{result.exam.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(result.exam.examDate), "dd MMM yyyy")} • {result.exam.examType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasResults(result) ? (
                  <Badge variant="default">Results Available</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedExam(result)}
                  disabled={!hasResults(result)}
                  data-testid={`btn-view-results-${result.exam.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
            
            {hasResults(result) && (
              <div className="border-t px-4 py-3 bg-muted/30">
                <div className="flex gap-6 flex-wrap">
                  {result.statistics.map((stat) => (
                    <div key={stat.paperId} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{stat.paperTitle}</p>
                      {stat.childScore !== null ? (
                        <>
                          <p className="font-semibold text-lg">
                            {stat.childScore}
                          </p>
                          {stat.rank > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Rank: {stat.rank}/{stat.totalParticipants}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </CardContent>

      <Dialog open={!!selectedExam} onOpenChange={(open) => !open && setSelectedExam(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExam?.exam.title} - Results</DialogTitle>
            <DialogDescription>
              {selectedExam && format(new Date(selectedExam.exam.examDate), "dd MMM yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedExam?.statistics.map((stat) => {
            const paper = selectedExam.papers.find(p => p.id === stat.paperId);
            const maxScore = paper?.maxScore || 100;
            
            return (
              <div key={stat.paperId} className="space-y-4 border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{stat.paperTitle}</h3>
                  {stat.rank > 0 && (
                    <Badge variant="outline" className="text-primary">
                      Rank {stat.rank} of {stat.totalParticipants}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Your Score</p>
                    <p className="font-bold text-xl text-primary">
                      {stat.childScore !== null ? stat.childScore : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">/ {maxScore}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Average</p>
                    <p className="font-bold text-xl">{stat.average.toFixed(1)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Median</p>
                    <p className="font-bold text-xl">{stat.median.toFixed(1)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Highest</p>
                    <p className="font-bold text-xl">{stat.highest}</p>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Your Score", score: stat.childScore || 0, fill: "hsl(var(--primary))" },
                        { name: "Average", score: stat.average, fill: "hsl(var(--muted-foreground))" },
                        { name: "Median", score: stat.median, fill: "hsl(var(--muted-foreground))" },
                        { name: "Highest", score: stat.highest, fill: "hsl(var(--chart-2))" },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, maxScore]} />
                      <Tooltip />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                      <ReferenceLine y={maxScore} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Max", fill: "#10b981", fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{stat.totalParticipants} participants</span>
                </div>
              </div>
            );
          })}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
