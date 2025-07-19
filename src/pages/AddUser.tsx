import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function AddUser() {
  const { user, switchRole, logout } = useAuth();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <DashboardLayout
      user={user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        roles: user.roles,
        currentRole: user.currentRole,
      } : undefined}
      onRoleSwitch={handleRoleSwitch}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserPlus className="h-8 w-8 text-primary" />
              Kullanıcı Ekle
            </h1>
            <p className="text-muted-foreground">
              Sisteme yeni kullanıcı ekleyin.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <CreateUserModal
            trigger={
              <Button size="lg" className="px-8 py-6">
                <UserPlus className="h-6 w-6 mr-3" />
                Yeni Kullanıcı Ekle
              </Button>
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}