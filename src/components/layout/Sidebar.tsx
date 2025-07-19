import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Brain,
  BookOpen,
  GraduationCap,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Home,
  Users,
  UserPlus
} from "lucide-react";
import { UserRole } from "@/types/auth";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
}

const mainMenuItems = [
  {
    icon: Brain,
    label: "ForBrain Bilişsel Beceri Değerlendirme",
    href: "/cognitive-assessment",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: BookOpen,
    label: "ForBrain Etkin ve Anlayarak Okuma",
    href: "/reading-exercises",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: GraduationCap,
    label: "Uluslararası Alan Testleri",
    href: "/international-tests",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: FileText,
    label: "Formlar",
    href: "/forms",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  }
];

const managementItems = [
  {
    icon: Users,
    label: "Öğrenciler",
    href: "/students",
    roles: ["admin", "trainer"] as UserRole[]
  },
  {
    icon: UserPlus,
    label: "Kullanıcı Ekle",
    href: "/add-user",
    roles: ["admin"] as UserRole[]
  },
  {
    icon: FileText,
    label: "Test Tanımla",
    href: "/test-management",
    roles: ["admin", "trainer"] as UserRole[]
  },
  {
    icon: BarChart3,
    label: "Raporlar",
    href: "/reports",
    roles: ["admin", "trainer"] as UserRole[]
  }
];

const quickAccessItems = [
  {
    icon: Settings,
    label: "Ayarlar",
    href: "/settings",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: HelpCircle,
    label: "Yardım",
    href: "/help",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  }
];

export function Sidebar({ userRole, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  
  const isActive = (href: string): boolean => {
    return location.pathname === href;
  };

  const filterItemsByRole = (items: typeof mainMenuItems) => {
    return items.filter(item => item.roles.includes(userRole));
  };

  return (
    <ShadcnSidebar collapsible="icon" className="border-r bg-background">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          {/* Logo/title removed */}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
            Ana Menü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(mainMenuItems).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    className="w-full justify-start"
                  >
                    <NavLink
                      to={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filterItemsByRole(managementItems).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              Yönetim
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterItemsByRole(managementItems).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)}
                      className="w-full justify-start"
                    >
                      <NavLink
                        to={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
            Diğer
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(quickAccessItems).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.href)}
                    className="w-full justify-start"
                  >
                    <NavLink
                      to={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}