import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { UserRole } from "@/types/auth";

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
    <div className="min-h-screen bg-background w-full">
      <Header 
        user={user} 
        onRoleSwitch={onRoleSwitch} 
        onLogout={onLogout} 
      />
      
      <div className="flex">
        <Sidebar
          userRole={user?.currentRole || 'user'}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}