import { useAuth } from "@/hooks/useAuth";
import TutorDashboard from "@/components/tutor-dashboard";
import { GraduationCap, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TutorHome() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                <h1 className="text-lg sm:text-xl font-bold text-foreground">ZHK Tuition Ltd</h1>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-chart-2/10 px-3 py-1 rounded-full">
                <BookOpen className="w-4 h-4 text-chart-2" />
                <span className="text-sm font-medium text-chart-2">Tutor Portal</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-chart-2 rounded-full flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {user.firstName?.[0] || user.email?.[0] || "?"}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block" data-testid="text-user-name">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <TutorDashboard user={user} />
      </main>
    </div>
  );
}
