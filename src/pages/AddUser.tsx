import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  roles: any; // JSONB array
  supervisor_id?: string;
  demographic_info: any; // JSONB object
  created_at: string;
  is_active: boolean;
}

export default function AddUser() {
  const { user, switchRole, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Auth yüklenene kadar bekle
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Basit rol kontrolü - user varsa kontrol et
  const canViewUsers = user?.roles?.includes('admin') || 
                       user?.roles?.includes('temsilci') ||
                       user?.roles?.includes('beyin_antrenoru');

  if (user && !canViewUsers) {
    return (
      <DashboardLayout
        user={user ? {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          roles: user.roles,
          currentRole: user.currentRole,
        } : undefined}
        onRoleSwitch={(role: any) => switchRole(role)}
        onLogout={logout}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Erişim Yetkisi Yok</h2>
            <p className="text-muted-foreground">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching users from users table...');
      let query = supabase
        .from('users')
        .select(`
          id,
          auth_user_id,
          email,
          first_name,
          last_name,
          phone,
          roles,
          supervisor_id,
          demographic_info,
          created_at,
          is_active
        `);

      // Temsilci rolündeki kullanıcılar sadece kendi altındaki beyin antrenörlerini görebilir
      if (user?.roles?.includes('temsilci')) {
        query = query
          .contains('roles', '["beyin_antrenoru"]')
          .eq('supervisor_id', user.id);
      }
      
      // Beyin antrenörü rolündeki kullanıcılar sadece kendi altındaki kullanıcıları görebilir
      if (user?.roles?.includes('beyin_antrenoru') && !user?.roles?.includes('admin')) {
        query = query.eq('supervisor_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Users loaded:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getRolesBadges = (roles: any) => {
    let rolesArray: string[] = [];
    
    if (Array.isArray(roles)) {
      rolesArray = roles;
    } else if (typeof roles === 'string') {
      try {
        rolesArray = JSON.parse(roles);
      } catch (e) {
        rolesArray = [roles];
      }
    }

    // Dinamik rol mapping - sadece role değerine bak, kullanıcı adına bakma
    const getRoleDisplay = (role: string) => {
      // Admin kontrolü
      if (role === 'admin') {
        return { label: 'Admin', variant: 'destructive' as const };
      }
      
      // Beyin antrenörü kontrolü - role değerine bak
      if (role === 'beyin_antrenoru' || role === 'trainer') {
        return { label: 'Beyin Antrenörü', variant: 'default' as const };
      }
      
      // Temsilci kontrolü
      if (role === 'representative' || role === 'temsilci') {
        return { label: 'Temsilci', variant: 'secondary' as const };
      }
      
      // Kullanıcı kontrolü
      if (role === 'kullanici' || role === 'user') {
        return { label: 'Kullanıcı', variant: 'secondary' as const };
      }
      
      // Bilinmeyen rol - database'deki orijinal değeri göster
      return { label: role, variant: 'outline' as const };
    };

    return rolesArray.map((role, index) => {
      const { label, variant } = getRoleDisplay(role);
      return (
        <Badge 
          key={index} 
          variant={variant}
          className="mr-1 mb-1"
        >
          {label}
        </Badge>
      );
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="default" className="bg-green-500">Aktif</Badge> : 
      <Badge variant="secondary">Pasif</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Kullanıcılar yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

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
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                {user?.roles?.includes('temsilci') ? 'Beyin Antrenörü Yönetimi' 
                  : user?.roles?.includes('beyin_antrenoru') ? 'Öğrenci Yönetimi'
                  : 'Kullanıcı Yönetimi'}
              </h1>
              <p className="text-muted-foreground">
                {user?.roles?.includes('temsilci') 
                  ? 'Beyin antrenörlerini görüntüleyebilir ve yeni beyin antrenörü ekleyebilirsiniz.'
                  : user?.roles?.includes('beyin_antrenoru')
                  ? 'Kendi öğrencilerinizi görüntüleyebilir ve yeni öğrenci ekleyebilirsiniz.'
                  : 'Sistemdeki kullanıcıları görüntüleyebilir ve yönetebilirsiniz.'
                }
              </p>
            </div>
          </div>
          <CreateUserModal
            trigger={
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-6 py-3">
                <Plus className="h-5 w-5 mr-2" />
                {user?.roles?.includes('temsilci') ? 'Beyin Antrenörü Ekle' 
                  : user?.roles?.includes('beyin_antrenoru') ? 'Yeni Öğrenci Ekle'
                  : 'Yeni Kullanıcı Ekle'}
              </Button>
            }
            onUserCreated={fetchUsers}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {user?.roles?.includes('temsilci') ? 'Beyin Antrenörü Arama' 
                : user?.roles?.includes('beyin_antrenoru') ? 'Öğrenci Arama'
                : 'Kullanıcı Arama'}
            </CardTitle>
            <CardDescription>
              {user?.roles?.includes('temsilci') 
                ? 'Beyin antrenörlerini arayabilir ve yönetebilirsiniz.'
                : user?.roles?.includes('beyin_antrenoru')
                ? 'Kendi öğrencilerinizi arayabilir ve yönetebilirsiniz.'
                : 'Sisteme kayıtlı kullanıcıları arayabilir ve yönetebilirsiniz.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ad, soyad veya e-posta ile arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar ({getFilteredUsers().length})</CardTitle>
            <CardDescription>
              Sisteme kayıtlı tüm kullanıcıların listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Roller</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredUsers().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? 'Arama kriterlerine uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı bulunmuyor.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredUsers().map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getRolesBadges(user.roles)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.is_active)}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}