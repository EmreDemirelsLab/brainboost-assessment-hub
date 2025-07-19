import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { UserRole } from "@/types/auth";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    roles: UserRole[];
    currentRole: UserRole;
  };
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
}

export function DashboardLayout({ 
  children, 
  user, 
  onRoleSwitch, 
  onLogout 
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <Header 
          user={user} 
          onRoleSwitch={onRoleSwitch} 
          onLogout={onLogout} 
        />
        
        <div className="flex w-full">
          <Sidebar
            userRole={user?.currentRole || 'user'}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 animate-fade-in">
              {children}
            </div>
            
            {/* Footer */}
            <footer className="bg-muted/30 border-t p-4 text-center text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span>📧 info@forbrain.com</span>
                <span>📞 +90 (212) 123 45 67</span>
              </div>
            </footer>
            
            {/* Floating Contact Info */}
            <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg border-2 border-primary">
              <div className="flex items-center gap-2 text-sm">
                <span>📧 info@forbrain.com</span>
                <span>📞 +90 (212) 123 45 67</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}