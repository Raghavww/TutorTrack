import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ShieldX, Home, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Unauthorized() {
  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-destructive/10 p-4 rounded-full">
              <ShieldX className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">ZHK Tuition Ltd</span>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this portal. Please log in with the correct account type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/">
            <Button className="w-full" variant="outline" data-testid="button-go-home">
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Button 
            className="w-full" 
            variant="destructive"
            onClick={handleLogout}
            data-testid="button-logout-unauthorized"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout and Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
