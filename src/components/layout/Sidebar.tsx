import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Brain,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  UserPlus,
  Settings,
  BarChart3,
  TestTube,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    icon: Brain,
    label: "ForBrain Bilişsel Beceri Değerlendirme",
    href: "/cognitive-assessment",
    type: "test",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: BookOpen,
    label: "ForBrain Etkin ve Anlayarak Okuma",
    href: "/reading-exercises",
    type: "exercise",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: GraduationCap,
    label: "Uluslararası Alan Testleri",
    href: "/international-tests",
    type: "test",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: FileText,
    label: "Formlar",
    href: "/forms",
    type: "form",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  }
];

const managementItems = [
  {
    icon: Users,
    label: "Öğrencilerim",
    href: "/students",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: UserPlus,
    label: "Öğrenci Ekle",
    href: "/add-student",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: TestTube,
    label: "Test Tanımla",
    href: "/define-test",
    roles: ["admin", "trainer"] as UserRole[]
  },
  {
    icon: BarChart3,
    label: "Raporlar",
    href: "/reports",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: Settings,
    label: "Hesap Bilgileri",
    href: "/account",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  }
];

export function Sidebar({ userRole, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["main"]));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));
  const filteredManagementItems = managementItems.filter(item => item.roles.includes(userRole));

  const SidebarLink = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <NavLink
      to={item.href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
        isActive
          ? "bg-primary text-primary-foreground shadow-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        "bg-card border-r transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Modules */}
        <div className="px-3 mb-6">
          {!isCollapsed && (
            <button
              onClick={() => toggleSection("main")}
              className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 hover:text-foreground transition-colors"
            >
              Ana Modüller
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedSections.has("main") && "rotate-90"
                )}
              />
            </button>
          )}
          
          {(isCollapsed || expandedSections.has("main")) && (
            <div className="space-y-1">
              {filteredMenuItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </div>
          )}
        </div>

        {/* Management */}
        {filteredManagementItems.length > 0 && (
          <div className="px-3">
            {!isCollapsed && (
              <button
                onClick={() => toggleSection("management")}
                className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 hover:text-foreground transition-colors"
              >
                Yönetim
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedSections.has("management") && "rotate-90"
                  )}
                />
              </button>
            )}
            
            {(isCollapsed || expandedSections.has("management")) && (
              <div className="space-y-1">
                {filteredManagementItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    isActive={location.pathname === item.href}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        {!isCollapsed && (
          <div className="text-center">
            <div className="h-1 bg-primary rounded-full mb-2"></div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>+90 212 351 32 12</div>
              <div>forbrain@forbrainacademy.com</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}