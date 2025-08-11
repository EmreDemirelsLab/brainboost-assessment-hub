import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Reports from "./pages/Reports";

import ReadingTests from "./pages/ReadingTests";
import SubjectTests from "./pages/SubjectTests";
import CognitiveAssessment from "./pages/CognitiveAssessment";
import ReadingExercises from "./pages/ReadingExercises";
import InternationalTests from "./pages/InternationalTests";
import Forms from "./pages/Forms";
import Students from "./pages/Students";
import AddUser from "./pages/AddUser";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import TestManagement from "./pages/TestManagement";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();
  
  // Eğer hâlâ yükleniyorsa spinner göster
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Session yoksa auth'a yönlendir (user cache'den gelmiş olabilir ama session yoksa geçersiz)
  if (!session && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Session var ama user henüz yüklenmemişse biraz daha bekle
  // (Bu durum neredeyse hiç oluşmayacak çünkü cache'den hızlıca yükleniyor)
  if (session && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();
  
  // Eğer hâlâ yükleniyorsa spinner göster
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // User veya session varsa dashboard'a yönlendir
  if (user || session) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const App = () => {
  useEffect(() => {
    // Chrome translate'i zorla kapat
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.setAttribute('lang', 'tr');
    document.body.setAttribute('translate', 'no');
    
    // Ek olarak class ekle
    document.documentElement.classList.add('notranslate');
    document.body.classList.add('notranslate');
    
    // Meta tag kontrol et veya ekle
    let metaGoogle = document.querySelector('meta[name="google"]');
    if (!metaGoogle) {
      metaGoogle = document.createElement('meta');
      metaGoogle.setAttribute('name', 'google');
      metaGoogle.setAttribute('content', 'notranslate');
      document.head.appendChild(metaGoogle);
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />

            <Route path="/reading-tests" element={
              <ProtectedRoute>
                <ReadingTests />
              </ProtectedRoute>
            } />
            <Route path="/subject-tests" element={
              <ProtectedRoute>
                <SubjectTests />
              </ProtectedRoute>
            } />
            <Route path="/cognitive-assessment" element={
              <ProtectedRoute>
                <CognitiveAssessment />
              </ProtectedRoute>
            } />
            <Route path="/reading-exercises" element={
              <ProtectedRoute>
                <ReadingExercises />
              </ProtectedRoute>
            } />
            <Route path="/international-tests" element={
              <ProtectedRoute>
                <InternationalTests />
              </ProtectedRoute>
            } />
            <Route path="/forms" element={
              <ProtectedRoute>
                <Forms />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/add-user" element={
              <ProtectedRoute>
                <AddUser />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } />
            <Route path="/test-management" element={
              <ProtectedRoute>
                <TestManagement />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
