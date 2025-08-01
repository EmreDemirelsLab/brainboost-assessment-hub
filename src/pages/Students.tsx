import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Users, Plus, Eye, Edit, Trash2 } from "lucide-react";
import React from "react";

// React Error Boundary Class Component
class StudentsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorCount: number }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('🚨 StudentsErrorBoundary caught error:', error, errorInfo);
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
  }

  componentDidUpdate() {
    // Error olduktan sonra kısa süre bekleyip recovery dene
    if (this.state.hasError) {
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Sistem Güncelleniyor</h2>
            <p className="text-muted-foreground">Lütfen bekleyin...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { TrainerAddStudentModal } from "@/components/admin/TrainerAddStudentModal";

interface Student {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  roles: any; // JSONB array
  supervisor_id?: string;
  demographic_info: any; // JSONB object - öğrenci bilgileri burada
  created_at: string;
  is_active: boolean;
}

function StudentsInner() {
  const { user, switchRole, logout, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
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
  const canViewStudents = user?.roles?.includes('admin') || 
                          user?.roles?.includes('temsilci') || 
                          user?.roles?.includes('beyin_antrenoru');

  if (user && !canViewStudents) {
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
    // AuthContext session restore sırasında race condition önlemek için guard
    if (!user?.id || !user?.currentRole || !user?.email) {
      console.log('⏸️ Skipping fetchStudents - user not fully loaded', {
        hasId: !!user?.id,
        hasRole: !!user?.currentRole,
        hasEmail: !!user?.email
      });
      return;
    }
    
    // Minimal delay ile fetchStudents
    const timer = setTimeout(() => {
      try {
        fetchStudents();
      } catch (error) {
        console.error('❌ fetchStudents error:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user?.currentRole, user?.id, user?.email]); // Email de dependency'e ekle

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.id || !user.currentRole || !user.email) {
        console.log('⏸️ fetchStudents - user data incomplete:', {
          hasUser: !!user,
          hasId: !!user?.id,
          hasRole: !!user?.currentRole,
          hasEmail: !!user?.email
        });
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching students based on user role:', user.currentRole, 'User ID:', user.id);
      
      // Dinamik rol kategorisi belirleme
      const isAdminRole = user.currentRole === 'admin';
      const isTrainerRole = user.currentRole === 'beyin_antrenoru';
      const isRepresentativeRole = user.currentRole === 'temsilci';
      
      // Dinamik query builder - role göre filtering
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
        `)
        .contains('roles', '["kullanici"]'); // Sadece öğrenciler - JSON string formatı

      // Rol bazlı dinamik filtering
      if (isAdminRole) {
        console.log('👑 Admin user - showing all students');
        // Admin tüm öğrencileri görür
      } else if (isRepresentativeRole) {
        console.log('🎯 Representative user - showing students of supervised trainers');
        // Temsilci kendi altındaki beyin antrenörlerinin öğrencilerini görür
        const { data: trainersData } = await supabase
          .from('users')
          .select('id')
          .contains('roles', '["beyin_antrenoru"]')
          .eq('supervisor_id', user.id);
        
        const trainerIds = trainersData?.map(t => t.id) || [];
        if (trainerIds.length > 0) {
          query = query.in('supervisor_id', trainerIds);
        } else {
          query = query.limit(0);
        }
      } else if (isTrainerRole) {
        console.log('🎯 Trainer user - showing only supervised students');
        // Beyin antrenörleri sadece kendi öğrencilerini görür
        query = query.eq('supervisor_id', user.id);
      } else {
        console.log('👤 Other role - no students visible');
        // Diğer roller öğrenci göremez
        query = query.limit(0);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }

      console.log('✅ Students loaded:', data?.length || 0, 'for role:', user.currentRole);
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Hata",
        description: "Öğrenciler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredStudents = students.filter(student => {
    const searchTermLower = searchTerm.toLowerCase();
    const demographicInfo = student.demographic_info || {};
    const studentNumber = demographicInfo.student_number || `STU-${student.id.slice(-8)}`;
    const schoolName = demographicInfo.school_name || '';
    
    return (
      student.first_name?.toLowerCase().includes(searchTermLower) ||
      student.last_name?.toLowerCase().includes(searchTermLower) ||
      studentNumber.toLowerCase().includes(searchTermLower) ||
      schoolName.toLowerCase().includes(searchTermLower)
    );
  });

  const getStatusBadge = (birthDate: string | null) => {
    // For now, all students are active - this is a placeholder
    return <Badge variant="secondary" className="bg-success text-success-foreground">Aktif</Badge>;
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
          <div className="text-lg">Öğrenciler yükleniyor...</div>
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
                Öğrenci Yönetimi
              </h1>
              <p className="text-muted-foreground">
                Sistemdeki öğrencileri görüntüleyebilir ve yönetebilirsiniz.
              </p>
            </div>
          </div>
          {/* Role göre farklı kullanıcı ekleme modali */}
          {user?.currentRole === 'admin' ? (
            <Button asChild>
              <Link to="/add-user">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Öğrenci
              </Link>
            </Button>
          ) : user?.currentRole === 'beyin_antrenoru' ? (
            <TrainerAddStudentModal
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Öğrenci
                </Button>
              }
              {...({ onStudentCreated: fetchStudents } as any)}
            />
          ) : (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Öğrenci
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Arama</CardTitle>
            <CardDescription>
              Öğrenci adı, numarası, okul veya veli adına göre arama yapabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Öğrenci ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Öğrenci Listesi</CardTitle>
            <CardDescription>
              Toplam {filteredStudents.length} öğrenci bulundu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Öğrenci bulunamadı.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Öğrenci No</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Sınıf</TableHead>
                    <TableHead>Okul</TableHead>
                    <TableHead>Veli</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const demographicInfo = student.demographic_info || {};
                    const studentNumber = demographicInfo.student_number || `STU-${student.id.slice(-8)}`;
                    const birthDate = demographicInfo.birth_date || demographicInfo.date_of_birth;
                    const gradeLevel = demographicInfo.grade_level;
                    const schoolName = demographicInfo.school_name || demographicInfo.school;
                    const parentName = demographicInfo.parent_name;
                    const parentPhone = demographicInfo.parent_phone;
                    const parentEmail = demographicInfo.parent_email;
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {studentNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {birthDate ? new Date(birthDate).toLocaleDateString('tr-TR') : '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {gradeLevel ? (
                            <Badge variant="outline">{gradeLevel}. Sınıf</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-32 truncate" title={schoolName || '-'}>
                            {schoolName || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{parentName || '-'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="truncate max-w-24" title={parentPhone || '-'}>
                                {parentPhone || '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="truncate max-w-24" title={parentEmail || '-'}>
                                {parentEmail || '-'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(birthDate)}
                        </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Toplam Öğrenci</CardTitle>
              <CardDescription>Sistemdeki toplam öğrenci sayısı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{students.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktif Öğrenci</CardTitle>
              <CardDescription>Eğitime devam eden öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {students.filter(s => {
                  const demographicInfo = s.demographic_info || {};
                  const birthDate = demographicInfo.birth_date || demographicInfo.date_of_birth;
                  return birthDate && new Date(birthDate).getMonth() === new Date().getMonth();
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bu Ay Kayıt</CardTitle>
              <CardDescription>Bu ay kayıt olan öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {students.filter(s => s.created_at && new Date(s.created_at).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Main Export with Error Boundary
export default function Students() {
  return (
    <StudentsErrorBoundary>
      <StudentsInner />
    </StudentsErrorBoundary>
  );
}