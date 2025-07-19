import { Bell, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    roles: UserRole[];
    currentRole: UserRole;
  };
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  trainer: "Beyin Antrenörü",
  representative: "Temsilci", 
  user: "Kullanıcı"
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-destructive text-destructive-foreground",
  trainer: "bg-primary text-primary-foreground",
  representative: "bg-warning text-warning-foreground",
  user: "bg-success text-success-foreground"
};

export function Header({ user, onRoleSwitch, onLogout }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ForTest
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{user.name}</div>
                      <Badge variant="secondary" className={`text-xs ${roleColors[user.currentRole]}`}>
                        {roleLabels[user.currentRole]}
                      </Badge>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                
                {/* Role Switching */}
                {user.roles.length > 1 && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Rol Değiştir</p>
                      {user.roles.map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => onRoleSwitch(role)}
                          className={`text-sm ${role === user.currentRole ? 'bg-accent' : ''}`}
                        >
                          <Badge variant="outline" className={`mr-2 ${roleColors[role]}`}>
                            {roleLabels[role]}
                          </Badge>
                          {role === user.currentRole && <span className="ml-auto">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}