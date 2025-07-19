import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Upload, Download, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function AddUser() {
  const { user, switchRole, logout } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          selectedFile.type === "application/vnd.ms-excel") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen sadece Excel (.xlsx, .xls) dosyaları yükleyin.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkUpload = () => {
    if (!file) return;
    // TODO: Implement bulk upload logic
    console.log("Uploading file:", file.name);
    toast({
      title: "Toplu yükleme başlatıldı",
      description: `${file.name} dosyası işleniyor...`,
    });
  };

  const downloadTemplate = () => {
    // Excel şablonu oluştur
    const templateData = [
      {
        'Ad': 'Örnek',
        'Soyad': 'Öğrenci',
        'E-posta': 'ornek@email.com',
        'Telefon': '+90 555 123 45 67',
        'Okul Adı': 'Örnek İlkokulu',
        'Sınıf Seviyesi': '4',
        'Öğrenci Numarası': 'OGR001',
        'Doğum Tarihi': '2015-01-15',
        'Veli Adı': 'Veli Adı Soyadı',
        'Veli Telefonu': '+90 555 987 65 43',
        'Veli E-postası': 'veli@email.com',
        'Notlar': 'Özel durumlar burada belirtilir'
      },
      {
        'Ad': '',
        'Soyad': '',
        'E-posta': '',
        'Telefon': '',
        'Okul Adı': '',
        'Sınıf Seviyesi': '',
        'Öğrenci Numarası': '',
        'Doğum Tarihi': '',
        'Veli Adı': '',
        'Veli Telefonu': '',
        'Veli E-postası': '',
        'Notlar': ''
      }
    ];

    // Workbook oluştur
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Sütun genişliklerini ayarla
    const colWidths = [
      { wch: 15 }, // Ad
      { wch: 15 }, // Soyad
      { wch: 25 }, // E-posta
      { wch: 18 }, // Telefon
      { wch: 20 }, // Okul Adı
      { wch: 12 }, // Sınıf Seviyesi
      { wch: 15 }, // Öğrenci Numarası
      { wch: 12 }, // Doğum Tarihi
      { wch: 20 }, // Veli Adı
      { wch: 18 }, // Veli Telefonu
      { wch: 25 }, // Veli E-postası
      { wch: 30 }  // Notlar
    ];
    ws['!cols'] = colWidths;

    // Worksheet'i workbook'a ekle
    XLSX.utils.book_append_sheet(wb, ws, 'Öğrenci Listesi');

    // Dosyayı indir
    XLSX.writeFile(wb, 'ogrenci_ekleme_sablonu.xlsx');
    
    toast({
      title: "Şablon indirildi",
      description: "Excel şablonu başarıyla indirildi.",
    });
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
              Sisteme yeni kullanıcı ekleyin veya Excel ile toplu ekleme yapın.
            </p>
          </div>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Tekil Kullanıcı</TabsTrigger>
            <TabsTrigger value="bulk">Toplu Kullanıcı Ekleme</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Kullanıcı</CardTitle>
                <CardDescription>
                  Tek kullanıcı eklemek için bu seçeneği kullanın.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Toplu Kullanıcı Ekleme
                </CardTitle>
                <CardDescription>
                  Excel dosyası yükleyerek birden fazla kullanıcıyı aynı anda sisteme ekleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <Label htmlFor="excelFile" className="text-lg font-medium cursor-pointer">
                      Excel Dosyası Seçin
                    </Label>
                    <Input
                      id="excelFile"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground">
                      .xlsx veya .xls formatında dosya yükleyin
                    </p>
                  </div>
                </div>
                
                {file && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium">Seçilen dosya:</p>
                    <p className="text-sm text-muted-foreground">{file.name}</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Şablon İndir
                  </Button>
                  
                  <Button 
                    onClick={handleBulkUpload}
                    disabled={!file}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Dosyayı Yükle
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Kullanım Talimatları:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Önce "Şablon İndir" butonuna tıklayarak Excel şablonunu indirin</li>
                    <li>• Şablonu kullanıcı bilgileriyle doldurun</li>
                    <li>• Doldurduğunuz dosyayı buradan yükleyin</li>
                    <li>• Sistem otomatik olarak tüm kullanıcıları oluşturacaktır</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}