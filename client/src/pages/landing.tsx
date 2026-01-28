import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldCheck, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">ZHK Tuition Ltd</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Welcome to ZHK Tuition Ltd
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Please select your portal to continue
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-admin-portal">
              <Link href="/admin/login">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full group-hover:bg-primary/20 transition-colors">
                      <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Admin Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage students, tutors, invoices, and business operations
                  </p>
                  <Button className="w-full" data-testid="button-go-admin">
                    Admin Login
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-tutor-portal">
              <Link href="/tutor/login">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className="bg-chart-2/10 p-4 rounded-full group-hover:bg-chart-2/20 transition-colors">
                      <BookOpen className="h-10 w-10 text-chart-2" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Tutor Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Log sessions, manage timesheets, and track student progress
                  </p>
                  <Button className="w-full" variant="outline" data-testid="button-go-tutor">
                    Tutor Login
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group" data-testid="card-parent-portal">
              <Link href="/parent/login">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className="bg-chart-4/10 p-4 rounded-full group-hover:bg-chart-4/20 transition-colors">
                      <Users className="h-10 w-10 text-chart-4" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">Parent Portal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    View your child's progress, invoices, and message tutors
                  </p>
                  <Button className="w-full" variant="outline" data-testid="button-go-parent">
                    Parent Login
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2024 ZHK Tuition Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
