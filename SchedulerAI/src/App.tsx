
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavigationHeader from "./components/common/NavigationHeader";
import Login from "./pages/Login";
import OwnerDashboard from "./pages/OwnerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import NotFound from "./pages/NotFound";

// Create a toast provider that combines both toast libraries
import toast, { Toaster as HotToaster } from 'react-hot-toast';

// Properly declare the toast property on window
// This avoids the TypeScript error
if (typeof window !== "undefined") {
  window.toast = toast;
}

// Protected route component
const ProtectedRoute = ({
  element,
  requiredRole,
}: {
  element: JSX.Element;
  requiredRole?: "Owner" | "Employee";
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-t-scheduler-primary rounded-full animate-spin"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === "Owner" ? "/owner/dashboard" : "/employee/dashboard"} replace />;
  }

  return element;
};

// Layout component that includes the header
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      {isAuthenticated && <NavigationHeader />}
      {children}
    </>
  );
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to={user?.role === "Owner" ? "/owner/dashboard" : "/employee/dashboard"} replace />
          ) : (
            <Login />
          )
        } />
        
        {/* Owner Routes */}
        <Route 
          path="/owner/dashboard" 
          element={
            <ProtectedRoute 
              element={<OwnerDashboard />} 
              requiredRole="Owner" 
            />
          } 
        />
        
        {/* Employee Routes */}
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute 
              element={<EmployeeDashboard />} 
              requiredRole="Employee" 
            />
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster position="top-center" />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
