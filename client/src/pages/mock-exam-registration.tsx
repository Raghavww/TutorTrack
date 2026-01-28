import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Link, useLocation, useParams } from "wouter";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Clock,
  GraduationCap,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const registrationFormSchema = z.object({
  mockExamEventId: z.string().min(1, "Please select an exam"),
  parentFirstName: z.string().min(1, "Parent first name is required"),
  parentLastName: z.string().min(1, "Parent last name is required"),
  parentEmail: z.string().email("Valid email is required"),
  parentPhone: z.string().min(10, "Phone number is required"),
  childFirstName: z.string().min(1, "Child first name is required"),
  childLastName: z.string().min(1, "Child last name is required"),
  childDateOfBirth: z.string().min(1, "Date of birth is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  medicalConditions: z.string().optional(),
  photoRightsConsent: z.boolean(),
});

type RegistrationFormData = z.infer<typeof registrationFormSchema>;

export default function MockExamRegistration() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"select" | "form" | "terms" | "complete">("select");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const { data: availableExams = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/public/mock-exams-available"],
    queryFn: async () => {
      const response = await fetch("/api/public/mock-exams-available");
      if (!response.ok) throw new Error("Failed to fetch exams");
      return response.json();
    },
  });

  const { data: activeTerms } = useQuery<any>({
    queryKey: ["/api/terms-and-conditions/active"],
    queryFn: async () => {
      const response = await fetch("/api/terms-and-conditions/active");
      if (!response.ok) return null;
      return response.json();
    },
  });

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      mockExamEventId: "",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      parentPhone: "",
      childFirstName: "",
      childLastName: "",
      childDateOfBirth: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      photoRightsConsent: false,
    },
  });

  const createRegistrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/mock-exam-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          isGuest: true,
          status: "pending_tc",
        }),
      });
      if (!response.ok) throw new Error("Failed to create registration");
      return response.json();
    },
    onSuccess: (registration) => {
      setRegistrationId(registration.id);
      if (activeTerms) {
        setStep("terms");
      } else {
        setStep("complete");
      }
    },
    onError: () => {
      toast({ title: "Failed to submit registration", variant: "destructive" });
    },
  });

  const acceptTermsMutation = useMutation({
    mutationFn: async (data: { termsId: string; signedName: string }) => {
      const response = await fetch("/api/terms-acceptances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termsId: data.termsId,
          registrationId,
          signedName: data.signedName,
        }),
      });
      if (!response.ok) throw new Error("Failed to accept terms");
      return response.json();
    },
    onSuccess: () => {
      setStep("complete");
      toast({ title: "Registration complete!" });
    },
    onError: () => {
      toast({ title: "Failed to accept terms", variant: "destructive" });
    },
  });

  const [termsSignature, setTermsSignature] = useState("");

  const selectExam = (exam: any) => {
    setSelectedExam(exam);
    form.setValue("mockExamEventId", exam.id);
    setStep("form");
  };

  const onSubmit = (data: RegistrationFormData) => {
    createRegistrationMutation.mutate(data);
  };

  const acceptTerms = () => {
    if (!activeTerms || !termsSignature.trim()) {
      toast({ title: "Please type your full name to sign", variant: "destructive" });
      return;
    }
    acceptTermsMutation.mutate({ termsId: activeTerms.id, signedName: termsSignature });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold">Mock Exam Registration</h1>
          <p className="text-muted-foreground">Register your child for upcoming mock exams</p>
        </div>

        {step === "select" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select an Exam</h2>
            {availableExams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No exams are currently available for registration</p>
                  <p className="text-sm text-muted-foreground mt-2">Please check back later</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableExams.map((exam) => (
                  <Card 
                    key={exam.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => selectExam(exam)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <Badge variant="default">£{Number(exam.price).toFixed(2)}</Badge>
                      </div>
                      <CardDescription>{exam.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(exam.examDate), "PPPP")}
                      </div>
                      {exam.time && (
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          {exam.time}
                        </div>
                      )}
                      {exam.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {exam.location}
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {exam.examType} ({exam.papers?.length || 0} papers)
                      </div>
                      {exam.maxCapacity && (
                        <div className="text-sm">
                          <span className="font-medium">{exam.maxCapacity - exam.currentEnrollments}</span> spots remaining
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "form" && selectedExam && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("select")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {selectedExam.title}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>
                  Please provide the information below to register for the mock exam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Parent/Guardian Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="parentFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Child Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="childFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Child First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="childLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Child Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="childDateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="medicalConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Medical Conditions (optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Please list any medical conditions, allergies, or special requirements we should be aware of"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContactRelationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Grandparent, Aunt" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="emergencyContactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="photoRightsConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Photo Rights Consent</FormLabel>
                              <FormDescription>
                                I consent to photographs being taken of my child during the exam for promotional purposes
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep("select")}>
                        Back
                      </Button>
                      <Button type="submit" disabled={createRegistrationMutation.isPending}>
                        {createRegistrationMutation.isPending ? "Submitting..." : "Continue to Terms"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "terms" && activeTerms && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Terms & Conditions</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {activeTerms.title}
                </CardTitle>
                <CardDescription>Version {activeTerms.version}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-md max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{activeTerms.content}</pre>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Digital Signature</label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Type your full name below to accept the terms and conditions
                    </p>
                    <Input
                      value={termsSignature}
                      onChange={(e) => setTermsSignature(e.target.value)}
                      placeholder="Full legal name"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep("form")}>
                      Back
                    </Button>
                    <Button 
                      onClick={acceptTerms} 
                      disabled={acceptTermsMutation.isPending || !termsSignature.trim()}
                    >
                      {acceptTermsMutation.isPending ? "Processing..." : "Accept & Complete Registration"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "complete" && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Thank you for registering. You will receive an invoice shortly via email. 
                Your registration will be confirmed once payment is received.
              </p>
              <div className="flex gap-4">
                <Link href="/">
                  <Button>Return Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
