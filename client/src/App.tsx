import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import AdminLogin from "@/pages/admin-login";
import TutorLogin from "@/pages/tutor-login";
import ParentLogin from "@/pages/parent-login";
import AdminHome from "@/pages/admin-home";
import TutorHome from "@/pages/tutor-home";
import ParentHome from "@/pages/parent-home";
import NotFound from "@/pages/not-found";
import Unauthorized from "@/pages/unauthorized";
import MockExamRegistration from "@/pages/mock-exam-registration";

function RoleProtectedRoute({ 
  role, 
  component: Component 
}: { 
  role: "admin" | "tutor" | "parent"; 
  component: React.ComponentType 
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect to={`/${role}/login`} />;
  }

  // Allow additional_staff to access the tutor dashboard
  const hasAccess = user.role === role || 
    (role === "tutor" && user.role === "additional_staff");

  if (!hasAccess) {
    return <Redirect to="/unauthorized" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated && user ? (
          <Redirect to={`/${user.role === "additional_staff" ? "tutor" : user.role}`} />
        ) : (
          <Landing />
        )}
      </Route>
      
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/tutor/login" component={TutorLogin} />
      <Route path="/parent/login" component={ParentLogin} />
      
      <Route path="/admin">
        <RoleProtectedRoute role="admin" component={AdminHome} />
      </Route>
      <Route path="/tutor">
        <RoleProtectedRoute role="tutor" component={TutorHome} />
      </Route>
      <Route path="/additional_staff">
        <Redirect to="/tutor" />
      </Route>
      <Route path="/parent">
        <RoleProtectedRoute role="parent" component={ParentHome} />
      </Route>
      
      <Route path="/unauthorized" component={Unauthorized} />
      
      <Route path="/register" component={MockExamRegistration} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
