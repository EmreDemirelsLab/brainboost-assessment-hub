import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, FileText, Search, Filter, ArrowLeft, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Report {
  id: string;
  title: string;
  report_type: string;
  created_at: string;
  is_published: boolean;
  file_url: string | null;
  student_name?: string;
  created_by_name?: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          students!inner(id, user_id, users(first_name, last_name)),
          users!reports_created_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data?.map(report => ({
        ...report,
        student_name: report.students?.users ? 
          `${report.students.users.first_name} ${report.students.users.last_name}` : 
          'Bilinmeyen Öğrenci',
        created_by_name: report.users ? 
          `${report.users.first_name} ${report.users.last_name}` : 
          'Bilinmeyen Kullanıcı'
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Hata",
        description: "Raporlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: Report, format: 'pdf' | 'excel') => {
    if (!report.file_url) {
      toast({
        title: "Hata",
        description: "Bu rapor için dosya bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a downloadable file based on format
      const blob = new Blob([JSON.stringify(report)], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Başarılı",
        description: `${report.title} raporu ${format.toUpperCase()} formatında indiriliyor...`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rapor indirilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.report_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const reportTypes = [...new Set(reports.map(r => r.report_type))];

  const { user, switchRole, logout } = useAuth();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
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
          <div className="text-lg">Raporlar yükleniyor...</div>
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
              <h1 className="text-3xl font-bold">Raporlar</h1>
              <p className="text-muted-foreground">
                Öğrenci raporlarını görüntüleyebilir ve indirebilirsiniz.
              </p>
            </div>
          </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapor Filtreleri</CardTitle>
          <CardDescription>
            Raporları arayabilir ve türe göre filtreleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rapor başlığı veya öğrenci adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Rapor türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {reportTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rapor Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredReports.length} rapor bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz rapor bulunmuyor.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rapor Başlığı</TableHead>
                  <TableHead>Öğrenci</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Oluşturan</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.student_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.report_type}</Badge>
                    </TableCell>
                    <TableCell>{report.created_by_name}</TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.is_published ? "default" : "secondary"}>
                        {report.is_published ? "Yayınlandı" : "Taslak"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report, 'pdf')}
                          disabled={!report.file_url}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report, 'excel')}
                          disabled={!report.file_url}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}