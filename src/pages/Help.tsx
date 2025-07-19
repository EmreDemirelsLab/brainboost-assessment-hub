import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, Book, MessageCircle, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Help() {
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
              <HelpCircle className="h-8 w-8 text-primary" />
              Yardım & Destek
            </h1>
            <p className="text-muted-foreground">
              Sistemi kullanırken ihtiyacınız olan yardımı alın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Kullanım Kılavuzu
              </CardTitle>
              <CardDescription>
                Sistem kullanım rehberi ve dokümantasyon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Kılavuzu İncele
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Canlı Destek
              </CardTitle>
              <CardDescription>
                Uzmanlarımızla anında iletişime geçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Canlı Sohbet Başlat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-posta Desteği
              </CardTitle>
              <CardDescription>
                Detaylı sorularınız için e-posta gönderin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">destek@forbrain.com</p>
                <Button variant="outline" className="w-full">
                  E-posta Gönder
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Telefon Desteği
              </CardTitle>
              <CardDescription>
                Acil durumlar için telefon desteği
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">+90 212 xxx xx xx</p>
                <p className="text-xs text-muted-foreground">
                  Hafta içi 09:00 - 18:00
                </p>
                <Button variant="outline" className="w-full">
                  Ara
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sık Sorulan Sorular</CardTitle>
            <CardDescription>
              En yaygın soruların cevapları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Nasıl yeni bir test oluşturabilirim?</h3>
                <p className="text-sm text-muted-foreground">
                  Test oluşturmak için ana menüden "Testler" sekmesine gidin ve "Yeni Test" butonuna tıklayın.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Öğrenci raporlarını nasıl görüntüleyebilirim?</h3>
                <p className="text-sm text-muted-foreground">
                  Raporlar sekmesinden öğrenci adına göre arama yaparak ilgili raporları görüntüleyebilirsiniz.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Şifremi nasıl değiştirebilirim?</h3>
                <p className="text-sm text-muted-foreground">
                  Ayarlar menüsünden "Güvenlik Ayarları" seçeneğini kullanarak şifrenizi değiştirebilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}