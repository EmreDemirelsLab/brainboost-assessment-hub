import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function TestManagement() {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Test Yönetimi</h1>
              <p className="text-muted-foreground">
                Bu özellik kaldırılmıştır. Bilişsel değerlendirme testlerini kullanın.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Özellik Kaldırıldı</CardTitle>
            <CardDescription>
              Test yönetimi artık mevcut değil. Bilişsel değerlendirme sistemini kullanın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/cognitive-assessment">
                Bilişsel Değerlendirme Testleri
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}