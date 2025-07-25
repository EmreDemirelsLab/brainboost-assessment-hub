import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logSecurityEvent } from "@/lib/security";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: UserRole[];
}

export function SecureRoleManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only allow admins to access this component
  if (!currentUser || !currentUser.roles.includes('admin')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Bu özelliğe erişim yetkiniz bulunmamaktadır. Sadece yöneticiler kullanıcı rollerini yönetebilir.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('is_active', true);

      if (usersError) throw usersError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (rolesError) {
            console.error('Error fetching roles for user:', user.id, rolesError);
            return { ...user, roles: [] };
          }

          return {
            ...user,
            roles: rolesData.map(r => r.role as UserRole)
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
      logSecurityEvent({
        action: 'role_manager_fetch_error',
        userId: currentUser?.id,
        details: { error: String(err) },
        severity: 'medium'
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      // Use the secure admin function
      const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: userId,
        new_role: role
      });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, roles: [...new Set([...user.roles, role])] }
          : user
      ));

      toast.success(`Rol başarıyla atandı: ${role}`);
      
      logSecurityEvent({
        action: 'role_assigned',
        userId: currentUser?.id,
        details: { targetUserId: userId, role },
        severity: 'medium'
      });
    } catch (err) {
      console.error('Error assigning role:', err);
      toast.error('Rol atanırken bir hata oluştu.');
      
      logSecurityEvent({
        action: 'role_assignment_failed',
        userId: currentUser?.id,
        details: { targetUserId: userId, role, error: String(err) },
        severity: 'high'
      });
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      // Prevent removing admin role from current user
      if (userId === currentUser?.id && role === 'admin') {
        toast.error('Kendi admin rolünüzü kaldıramazsınız.');
        return;
      }

      // Use the secure admin function
      const { error } = await supabase.rpc('remove_user_role', {
        target_user_id: userId,
        role_to_remove: role
      });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, roles: user.roles.filter(r => r !== role) }
          : user
      ));

      toast.success(`Rol başarıyla kaldırıldı: ${role}`);
      
      logSecurityEvent({
        action: 'role_removed',
        userId: currentUser?.id,
        details: { targetUserId: userId, role },
        severity: 'medium'
      });
    } catch (err) {
      console.error('Error removing role:', err);
      toast.error('Rol kaldırılırken bir hata oluştu.');
      
      logSecurityEvent({
        action: 'role_removal_failed',
        userId: currentUser?.id,
        details: { targetUserId: userId, role, error: String(err) },
        severity: 'high'
      });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'trainer': return 'default';
      case 'representative': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Rolleri</CardTitle>
          <CardDescription>Kullanıcılar yükleniyor...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Güvenli Kullanıcı Rol Yönetimi
        </CardTitle>
        <CardDescription>
          Kullanıcı rollerini güvenli şekilde atayın ve kaldırın. Tüm işlemler denetim günlüğüne kaydedilir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {user.first_name} {user.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge 
                      key={role} 
                      variant={getRoleBadgeVariant(role)}
                      className="cursor-pointer"
                      onClick={() => removeRole(user.id, role)}
                    >
                      {role} ×
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select onValueChange={(role) => assignRole(user.id, role as UserRole)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Rol ekle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="representative">Representative</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers()}
                  className="ml-auto"
                >
                  Yenile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}