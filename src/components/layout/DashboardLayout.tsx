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
  return <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <Header user={user} onRoleSwitch={onRoleSwitch} onLogout={onLogout} />
        
        <div className="flex w-full">
          <Sidebar userRole={user?.currentRole || 'user'} isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          
          <main className="flex-1 overflow-auto pb-20">
            <div className="p-6 animate-fade-in">
              {children}
            </div>
            
            {/* Fixed Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-50">
              <div className="text-center py-3">
                <div className="h-1 bg-primary rounded-full mb-3 mx-auto max-w-32"></div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>+90 212 351 32 12</div>
                  <div>forbrain@forbrainacademy.com</div>
                </div>
              </div>
            </footer>
            
            {/* Floating Contact Info */}
            
          </main>
        </div>
      </div>
    </SidebarProvider>;
}