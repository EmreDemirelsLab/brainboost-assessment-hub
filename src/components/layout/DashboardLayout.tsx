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
    roles: string[]; // Dinamik rol isimleri
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
        <Header user={user} onRoleSwitch={onRoleSwitch} onLogout={onLogout} />
        
        <div className="flex w-full pt-16">
          <Sidebar 
            userRole={user?.currentRole || 'user'}
            // isCollapsed={sidebarCollapsed} // Bu satırları kaldırın
            // onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          
          <main className="flex-1 ml-72 overflow-auto pb-20">
            <div className="p-6 animate-fade-in">
              {children}
            </div>
          </main>
        </div>
        
        {/* Fixed Footer */}
        <footer className="fixed bottom-0 left-72 right-0 bg-background/95 backdrop-blur-sm z-50">
          <div className="text-center py-0.5 px-8">
            <div className="h-1 bg-primary rounded-full mb-2 w-full"></div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>+90 212 351 32 12</div>
              <div>forbrain@forbrainacademy.com</div>
            </div>
          </div>
        </footer>
      </div>
    </SidebarProvider>
  );
}