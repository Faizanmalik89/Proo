import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider, AdminAuthProvider } from "@/lib/auth";
import { queryClient } from "./lib/queryClient";
import { ProtectedRoute, AdminProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminLayout from "@/pages/admin/layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBlogManagement from "@/pages/admin/blog-management";
import AdminVideoManagement from "@/pages/admin/video-management";
import AdminAdsManagement from "@/pages/admin/ads-management";
import AdminSettings from "@/pages/admin/settings";
import AdminTerms from "@/pages/admin/terms";
import AdminUsers from "@/pages/admin/users";
import AdminAuth from "@/pages/admin-auth";

// User pages
import UserLayout from "@/pages/user/layout";
import UserHome from "@/pages/user/home";
import UserVideos from "@/pages/user/videos";
import UserBlog from "@/pages/user/blog";
import UserAbout from "@/pages/user/about";
import UserTerms from "@/pages/user/terms";
import AuthPage from "@/pages/auth";

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminAuth} />
      <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      <AdminProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminProtectedRoute path="/admin/blogs" component={AdminBlogManagement} />
      <AdminProtectedRoute path="/admin/videos" component={AdminVideoManagement} />
      <AdminProtectedRoute path="/admin/ads" component={AdminAdsManagement} />
      <AdminProtectedRoute path="/admin/settings" component={AdminSettings} />
      <AdminProtectedRoute path="/admin/terms" component={AdminTerms} />
      <AdminProtectedRoute path="/admin/users" component={AdminUsers} />
      
      {/* User Routes */}
      <Route path="/" component={UserHome} />
      <Route path="/videos" component={UserVideos} />
      <Route path="/blog" component={UserBlog} />
      <Route path="/about" component={UserAbout} />
      <Route path="/terms" component={UserTerms} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AuthProvider>
          <Switch>
            {/* Admin Layout */}
            <Route path="/admin/:rest*">
              <AdminLayout>
                <Router />
              </AdminLayout>
            </Route>
            
            {/* Admin Login */}
            <Route path="/admin/login">
              <Router />
            </Route>
            
            {/* User Layout */}
            <Route path="/:rest*">
              <UserLayout>
                <Router />
              </UserLayout>
            </Route>
          </Switch>
          <Toaster />
        </AuthProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
