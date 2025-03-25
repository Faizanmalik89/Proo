import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ProjectHistory from "@/pages/ProjectHistory";
import ProjectDetails from "@/pages/ProjectDetails";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/settings" component={Settings} />
      <Route path="/projects">
        {() => (
          <ProtectedRoute>
            <ProjectHistory />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id">
        {(params) => (
          <ProtectedRoute>
            <ProjectDetails params={params} />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
