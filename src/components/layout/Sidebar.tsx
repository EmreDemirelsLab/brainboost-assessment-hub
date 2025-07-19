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
  Home,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  onToggle: () => void;
}

const mainMenuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/dashboard",
    gradient: "from-blue-500 to-blue-600",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: Brain,
    label: "Bilişsel Değerlendirme",
    href: "/cognitive-assessment",
    gradient: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: BookOpen,
    label: "Okuma Egzersizleri",
    href: "/reading-exercises",
    gradient: "from-green-500 to-emerald-500",
    iconColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: GraduationCap,
    label: "Alan Testleri",
    href: "/international-tests",
    gradient: "from-orange-500 to-red-500",
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  },
  {
    icon: FileText,
    label: "Formlar",
    href: "/forms",
    gradient: "from-indigo-500 to-blue-500",
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  }
];

const managementItems = [
  {
    icon: Users,
    label: "Öğrencilerim",
    href: "/students",
    gradient: "from-cyan-500 to-blue-500",
    iconColor: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: UserPlus,
    label: "Öğrenci Ekle",
    href: "/add-student",
    gradient: "from-emerald-500 to-green-500",
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: TestTube,
    label: "Test Tanımla",
    href: "/define-test",
    gradient: "from-violet-500 to-purple-500",
    iconColor: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    roles: ["admin", "trainer"] as UserRole[]
  },
  {
    icon: BarChart3,
    label: "Raporlar",
    href: "/reports",
    gradient: "from-rose-500 to-pink-500",
    iconColor: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  }
];

const quickAccessItems = [
  {
    icon: TrendingUp,
    label: "İstatistikler",
    href: "/analytics",
    gradient: "from-amber-500 to-yellow-500",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    roles: ["admin", "trainer"] as UserRole[]
  },
  {
    icon: Award,
    label: "Sertifikalar",
    href: "/certificates",
    gradient: "from-yellow-500 to-orange-500",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: Calendar,
    label: "Takvim",
    href: "/calendar",
    gradient: "from-blue-500 to-indigo-500",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    roles: ["admin", "trainer", "representative"] as UserRole[]
  },
  {
    icon: Settings,
    label: "Ayarlar",
    href: "/settings",
    gradient: "from-gray-500 to-slate-500",
    iconColor: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    roles: ["admin", "trainer", "representative", "user"] as UserRole[]
  }
];

export function Sidebar({ userRole, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["main", "management"])
  );

  const toggleGroup = (groupId: string) => {
    if (isCollapsed) return;
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => location.pathname === href;

  const filteredMainItems = mainMenuItems.filter(item => item.roles.includes(userRole));
  const filteredManagementItems = managementItems.filter(item => item.roles.includes(userRole));
  const filteredQuickAccessItems = quickAccessItems.filter(item => item.roles.includes(userRole));

  const ModernMenuButton = ({ item, isActiveItem }: { item: any; isActiveItem: boolean }) => (
    <SidebarMenuButton asChild className={cn("relative group overflow-hidden")}>
      <NavLink
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ease-out",
          "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          isActiveItem
            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-[1.02]`
            : `hover:${item.bgColor} group-hover:shadow-md`
        )}
      >
        {/* Animated background effect */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
          item.gradient,
          "group-hover:opacity-10"
        )} />
        
        {/* Icon with special styling */}
        <div className={cn(
          "relative z-10 p-2 rounded-lg transition-all duration-300",
          isActiveItem 
            ? "bg-white/20 backdrop-blur-sm" 
            : `${item.bgColor} group-hover:scale-110`
        )}>
          <item.icon className={cn(
            "h-5 w-5 transition-all duration-300",
            isActiveItem ? "text-white" : item.iconColor
          )} />
        </div>
        
        {/* Label */}
        {!isCollapsed && (
          <span className={cn(
            "relative z-10 font-medium transition-all duration-300 truncate",
            isActiveItem ? "text-white" : "text-foreground group-hover:text-foreground"
          )}>
            {item.label}
          </span>
        )}
        
        {/* Active indicator */}
        {isActiveItem && !isCollapsed && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-white/80 animate-pulse" />
          </div>
        )}
      </NavLink>
    </SidebarMenuButton>
  );

  const CollapsibleGroup = ({ 
    id, 
    title, 
    items, 
    defaultOpen = false 
  }: { 
    id: string; 
    title: string; 
    items: any[]; 
    defaultOpen?: boolean 
  }) => {
    const isExpanded = isCollapsed || expandedGroups.has(id);
    
    return (
      <SidebarGroup>
        {!isCollapsed && (
          <SidebarGroupLabel asChild>
            <button
              onClick={() => toggleGroup(id)}
              className={cn(
                "flex items-center justify-between w-full px-2 py-2 mb-2",
                "text-sm font-semibold text-muted-foreground uppercase tracking-wider",
                "hover:text-foreground transition-all duration-200",
                "bg-gradient-to-r from-muted/50 to-transparent rounded-lg",
                "hover:from-muted to-muted/50"
              )}
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {title}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          </SidebarGroupLabel>
        )}
        
        {isExpanded && (
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <ModernMenuButton 
                    item={item} 
                    isActiveItem={isActive(item.href)} 
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  return (
    <ShadcnSidebar
      className={cn(
        "transition-all duration-300 ease-out border-r",
        "bg-gradient-to-b from-background via-background to-muted/20",
        isCollapsed ? "w-16" : "w-80"
      )}
      collapsible="icon"
    >
      {/* Header with modern styling */}
      <div className={cn(
        "p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10",
        "backdrop-blur-sm"
      )}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary-foreground rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  ForTest
                </h2>
                <p className="text-xs text-muted-foreground">Beyin Akademisi</p>
              </div>
            </div>
          )}
          <SidebarTrigger className={cn(
            "hover:bg-primary/10 hover:scale-110 transition-all duration-200",
            isCollapsed && "mx-auto"
          )} />
        </div>
      </div>

      <SidebarContent className="py-6 space-y-6">
        {/* Main Navigation */}
        <CollapsibleGroup
          id="main"
          title="Ana Menü"
          items={filteredMainItems}
          defaultOpen
        />

        {/* Management Section */}
        {filteredManagementItems.length > 0 && (
          <CollapsibleGroup
            id="management"
            title="Yönetim"
            items={filteredManagementItems}
            defaultOpen
          />
        )}

        {/* Quick Access */}
        {filteredQuickAccessItems.length > 0 && (
          <CollapsibleGroup
            id="quick"
            title="Hızlı Erişim"
            items={filteredQuickAccessItems}
          />
        )}
      </SidebarContent>

      {/* Modern Footer */}
      <div className={cn(
        "p-4 border-t mt-auto",
        "bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm"
      )}>
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistem Aktif</span>
            </div>
            
            {/* Contact info */}
            <div className="text-center space-y-1">
              <div className="h-1 bg-gradient-to-r from-primary via-primary-foreground to-primary rounded-full mb-2"></div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>7/24 Destek</span>
                </div>
                <div>forbrain@forbrainacademy.com</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </ShadcnSidebar>
  );
}