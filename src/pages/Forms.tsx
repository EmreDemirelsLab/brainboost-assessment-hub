import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Forms() {
  const { user, switchRole, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const forms = [
    {
      id: 1,
      title: "Öğrenci Bilgi Formu",
      description: "Yeni öğrenci kaydı için temel bilgi formu",
      category: "Kayıt",
      status: "Aktif",
      responses: 156,
      lastModified: "2024-01-15",
      createdBy: "Ahmet Yılmaz"
    },
    {
      id: 2,
      title: "Bilişsel Değerlendirme Formu",
      description: "Öğrencinin bilişsel becerilerini değerlendirme formu",
      category: "Değerlendirme",
      status: "Aktif",
      responses: 89,
      lastModified: "2024-01-10",
      createdBy: "Fatma Kaya"
    },
    {
      id: 3,
      title: "Ebeveyn Görüşme Formu",
      description: "Ebeveyn görüşmesi sonrası doldurulan değerlendirme formu",
      category: "Görüşme",
      status: "Taslak",
      responses: 0,
      lastModified: "2024-01-05",
      createdBy: "Mehmet Özkan"
    },
    {
      id: 4,
      title: "Test Sonuçları Rapor Formu",
      description: "Test sonuçlarının detaylı raporlanması için form",
      category: "Rapor",
      status: "Aktif",
      responses: 234,
      lastModified: "2024-01-12",
      createdBy: "Ayşe Demir"
    },
    {
      id: 5,
      title: "Öğrenci İlerleme Takip Formu",
      description: "Öğrencinin aylık ilerleme durumunu takip formu",
      category: "Takip",
      status: "Aktif",
      responses: 78,
      lastModified: "2024-01-08",
      createdBy: "Ali Yıldız"
    },
    {
      id: 6,
      title: "Öz Değerlendirme Formu",
      description: "Öğrencinin kendi gelişimini değerlendirmesi için form",
      category: "Değerlendirme",
      status: "Pasif",
      responses: 45,
      lastModified: "2023-12-20",
      createdBy: "Zeynep Arslan"
    }
  ];

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif": return "bg-green-100 text-green-800";
      case "Taslak": return "bg-yellow-100 text-yellow-800";
      case "Pasif": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Kayıt": return "bg-blue-100 text-blue-800";
      case "Değerlendirme": return "bg-purple-100 text-purple-800";
      case "Görüşme": return "bg-orange-100 text-orange-800";
      case "Rapor": return "bg-red-100 text-red-800";
      case "Takip": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                Formlar
              </h1>
              <p className="text-muted-foreground">
                Değerlendirme ve veri toplama formlarınızı yönetin.
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Form
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Arama</CardTitle>
            <CardDescription>
              Form başlığı, açıklama veya kategoriye göre arama yapabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Form ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {form.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge className={getCategoryColor(form.category)}>
                    {form.category}
                  </Badge>
                  <Badge className={getStatusColor(form.status)}>
                    {form.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Yanıtlar:</span>
                      <div className="font-medium">{form.responses}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Son Güncelleme:</span>
                      <div className="font-medium">
                        {new Date(form.lastModified).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">Oluşturan:</span>
                    <div className="font-medium">{form.createdBy}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Görüntüle
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun form bulunamadı.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Form Türleri</CardTitle>
            <CardDescription>
              Sistemde bulunan form kategorileri ve kullanım alanları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Kayıt Formları</h3>
                <p className="text-sm text-muted-foreground">
                  Yeni öğrenci kaydı ve temel bilgi toplama formları
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Değerlendirme Formları</h3>
                <p className="text-sm text-muted-foreground">
                  Öğrenci performansı ve beceri değerlendirme formları
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Görüşme Formları</h3>
                <p className="text-sm text-muted-foreground">
                  Ebeveyn ve öğrenci görüşme kayıt formları
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Rapor Formları</h3>
                <p className="text-sm text-muted-foreground">
                  Test sonuçları ve ilerleme raporu formları
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Takip Formları</h3>
                <p className="text-sm text-muted-foreground">
                  Öğrenci gelişimi ve süreç takip formları
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Özel Formlar</h3>
                <p className="text-sm text-muted-foreground">
                  Kurumsal ihtiyaçlara özel tasarlanmış formlar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}