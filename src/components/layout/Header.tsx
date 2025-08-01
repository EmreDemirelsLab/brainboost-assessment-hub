import { Bell, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
    roles: string[]; // Dinamik rol isimleri
    currentRole: UserRole;
  };
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  trainer: "Beyin Antrenörü",
  beyin_antrenoru: "Beyin Antrenörü",
  representative: "Temsilci",
  temsilci: "Temsilci", 
  user: "Kullanıcı",
  kullanici: "Kullanıcı"
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-slate-100 text-slate-700 border-slate-200",
  trainer: "bg-blue-50 text-blue-700 border-blue-200",
  beyin_antrenoru: "bg-blue-50 text-blue-700 border-blue-200",
  representative: "bg-green-50 text-green-700 border-green-200",
  temsilci: "bg-green-50 text-green-700 border-green-200",
  user: "bg-gray-50 text-gray-700 border-gray-200",
  kullanici: "bg-gray-50 text-gray-700 border-gray-200"
};

export function Header({ user, onRoleSwitch, onLogout }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="block">
            <img 
              src="/assets/images/logo.png" 
              alt="ForTest Logo" 
              className="h-8 hover:scale-105 transition-transform cursor-pointer"
            />
          </Link>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-accent/50 transition-colors duration-200"
          >
            <Bell className="h-5 w-5 hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-pulse">
              3
            </span>
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 rounded-lg h-auto min-w-[220px] border border-border/40 shadow-sm backdrop-blur-sm bg-card/50 hover:bg-card/80 hover:border-border/60"
                >
                  {/* User icon container */}
                  <div className="relative bg-primary/10 p-2 rounded-lg border border-primary/20">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  
                  {/* User info */}
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate w-full max-w-[160px] text-left flex justify-start">
                      {user.name}
                    </div>
                    <div className="flex items-center justify-start gap-2 mt-0.5 w-full max-w-[160px]">
                      <div className={`w-2 h-2 rounded-full ${
                        user.currentRole === 'admin' ? 'bg-red-500' :
                        (user.currentRole === 'trainer' || user.currentRole === 'beyin_antrenoru') ? 'bg-blue-500' :
                        (user.currentRole === 'representative' || user.currentRole === 'temsilci') ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-xs text-muted-foreground font-medium truncate">
                        {roleLabels[user.currentRole]}
                      </span>
                    </div>
                  </div>
                  
                  {/* Chevron icon */}
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="bottom"
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={10}
                className="w-72 bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
              >
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate break-all">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          user.currentRole === 'admin' ? 'bg-red-500' :
                          (user.currentRole === 'trainer' || user.currentRole === 'beyin_antrenoru') ? 'bg-blue-500' :
                          (user.currentRole === 'representative' || user.currentRole === 'temsilci') ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-xs text-muted-foreground">{roleLabels[user.currentRole]}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {/* Role Switching */}
                {user.roles.length > 1 && (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Rol Değiştir</p>
                      <div className="space-y-1">
                        {user.roles.map((role) => {
                          // Dinamik rol kategorisi belirleme
                          const getRoleCategory = (roleString: string): UserRole => {
                            if (roleString === 'admin') return 'admin';
                            if (roleString === 'beyin_antrenoru') return 'beyin_antrenoru';
                            if (roleString === 'trainer') return 'trainer';
                            if (roleString === 'representative') return 'representative';
                            if (roleString === 'temsilci') return 'temsilci';
                            if (roleString === 'kullanici') return 'kullanici';
                            return 'user';
                          };
                          
                          const roleCategory = getRoleCategory(role);
                          
                          return (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => onRoleSwitch(roleCategory)}
                              className={`text-sm rounded-lg cursor-pointer flex items-center justify-between ${roleCategory === user.currentRole ? 'bg-accent' : ''}`}
                            >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                role === 'admin' ? 'bg-red-400' :
                                (role === 'trainer' || role === 'beyin_antrenoru') ? 'bg-blue-400' :
                                (role === 'representative' || role === 'temsilci') ? 'bg-green-400' :
                                'bg-gray-400'
                              }`}></div>
                              <span className="text-xs">{roleLabels[roleCategory]}</span>
                            </div>
                            {roleCategory === user.currentRole && <span className="text-primary font-medium text-xs">✓</span>}
                          </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={onLogout} className="text-destructive mx-2 mb-2 rounded-lg">
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