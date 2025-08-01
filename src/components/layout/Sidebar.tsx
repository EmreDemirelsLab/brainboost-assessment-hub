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
  Users,
  UserPlus,
  UserCheck
} from "lucide-react";
import { UserRole } from "@/types/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: UserRole;
}

const mainMenuItems = [
  {
    icon: Brain,
    label: "Bilişsel Beceri\nDeğerlendirme",
    href: "/cognitive-assessment",
    roles: ["admin", "trainer", "beyin_antrenoru", "representative", "temsilci", "user", "kullanici"] as UserRole[]
  },
  {
    icon: BookOpen,
    label: "Etkin ve\nAnlayarak Okuma",
    href: "/reading-exercises",
    roles: ["admin", "trainer", "beyin_antrenoru", "representative", "temsilci", "user", "kullanici"] as UserRole[]
  },
  {
    icon: GraduationCap,
    label: "Uluslararası\nAlan Testleri",
    href: "/international-tests",
    roles: ["admin", "trainer", "beyin_antrenoru", "representative", "temsilci", "user", "kullanici"] as UserRole[]
  },
  {
    icon: FileText,
    label: "Formlar",
    href: "/forms",
    roles: ["admin", "trainer", "beyin_antrenoru", "representative", "temsilci", "user", "kullanici"] as UserRole[]
  }
];

const managementItems = [
  {
    icon: Users,
    label: "Öğrenciler",
    href: "/students",
    roles: ["admin", "trainer", "beyin_antrenoru"] as UserRole[]
  },
  {
    icon: UserCheck,
    label: "Kullanıcılar",
    href: "/add-user",
    roles: ["admin", "temsilci"] as UserRole[]
  },
  {
    icon: FileText,
    label: "Test Tanımla",
    href: "/test-management",
    roles: ["admin", "temsilci", "beyin_antrenoru"] as UserRole[]
  },
  {
    icon: BarChart3,
    label: "Raporlar",
    href: "/reports",
    roles: ["admin", "temsilci", "beyin_antrenoru"] as UserRole[]
  }
];

const quickAccessItems = [
  {
    icon: Settings,
    label: "Ayarlar",
    href: "/settings",
    roles: ["admin", "trainer", "beyin_antrenoru", "representative", "temsilci", "user", "kullanici"] as UserRole[]
  },
  {
    icon: HelpCircle,
    label: "Yardım",
    href: "/help",
    roles: ["admin", "trainer", "beyin_antrenoru", "representative", "temsilci", "user", "kullanici"] as UserRole[]
  }
];

export function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (href: string) => location.pathname === href;
  const filterItemsByRole = (items: typeof mainMenuItems) => items.filter(item => item.roles.includes(userRole));

  const renderMenuItem = (item: any) => {
    const active = isActive(item.href);
    const hovered = hoveredItem === item.href;

    return (
      <NavLink
        key={item.href}
        to={item.href}
        onMouseEnter={() => setHoveredItem(item.href)}
        onMouseLeave={() => setHoveredItem(null)}
        className={cn(
          "group flex items-center gap-3 rounded-xl p-2 text-sm font-medium transition-all duration-300",
          "hover:bg-white/50 hover:shadow-lg hover:shadow-black/5",
          active && "bg-white shadow-md shadow-black/5 text-primary"
        )}
      >
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
          active 
            ? "bg-primary text-white scale-105" 
            : "bg-white/80 text-slate-600 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary"
        )}>
          <item.icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          {item.label.split('\n').map((line: string, index: number) => (
            <span
              key={index}
              className={cn(
                "font-medium transition-colors",
                active ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
              )}
            >
              {line}
            </span>
          ))}
        </div>
        {active && (
          <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 flex flex-col gap-y-4 border-r border-slate-200 bg-slate-50/50 p-4 backdrop-blur-xl z-30">
      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-y-1.5 overflow-y-auto">
        {/* Ana Menü */}
        <div>
          <div className="mb-2 flex items-center gap-2 px-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ana Menü</span>
          </div>
          <div className="space-y-1">
            {filterItemsByRole(mainMenuItems).map(renderMenuItem)}
          </div>
        </div>

        {/* Yönetim */}
        {filterItemsByRole(managementItems).length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 px-2">
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Yönetim</span>
            </div>
            <div className="space-y-1">
              {filterItemsByRole(managementItems).map(renderMenuItem)}
            </div>
          </div>
        )}

        {/* Hızlı Erişim */}
        <div className="mt-auto">
          <div className="mb-2 flex items-center gap-2 px-2">
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hızlı Erişim</span>
          </div>
          <div className="space-y-1">
            {filterItemsByRole(quickAccessItems).map(renderMenuItem)}
          </div>
        </div>
      </nav>
    </aside>
  );
}
