import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Users, BarChart3, FileText, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ForTest
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Giriş Yap</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Başlayın</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ForBrain Academy
          </h1>
          <h2 className="text-3xl font-bold text-foreground">
            Beyin Antrenmanı Yönetim Sistemi
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Öğrencilerinizin beyin gelişimini takip edin, testler oluşturun ve ilerlemelerini raporlayın. 
            Modern, güvenli ve kullanıcı dostu arayüzü ile eğitim sürecinizi dijitalleştirin.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">Ücretsiz Deneyin</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Demo İzleyin</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Özellikler</h3>
          <p className="text-lg text-muted-foreground">
            Beyin antrenmanı eğitiminde ihtiyacınız olan her şey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Bilişsel Testler</CardTitle>
              <CardDescription>
                Dikkat, hafıza ve koordinasyon testleri ile öğrencilerin gelişimini ölçün
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Öğrenci Yönetimi</CardTitle>
              <CardDescription>
                Öğrenci kayıtları, veli bilgileri ve ilerlemeleri tek yerden yönetin
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Detaylı Raporlar</CardTitle>
              <CardDescription>
                Excel ve PDF formatında kapsamlı raporlar oluşturun ve paylaşın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Egzersiz Kütüphanesi</CardTitle>
              <CardDescription>
                Farklı zorluk seviyelerinde egzersizler oluşturun ve atayın
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Rol Bazlı Erişim</CardTitle>
              <CardDescription>
                Admin, antrenör ve temsilci rolleri ile güvenli erişim kontrolü
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Hızlı ve Güvenli</CardTitle>
              <CardDescription>
                Modern teknoloji ile hızlı performans ve güvenli veri saklama
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto shadow-card">
          <CardContent className="pt-8">
            <h3 className="text-2xl font-bold mb-4">Hemen Başlayın</h3>
            <p className="text-muted-foreground mb-8">
              ForBrain Academy ile beyin antrenmanı eğitimlerinizi profesyonel seviyeye taşıyın.
            </p>
            <Button size="lg" className="w-full" asChild>
              <Link to="/auth">Ücretsiz Hesap Oluşturun</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ForTest
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>+90 212 351 32 12</div>
              <div>forbrain@forbrainacademy.com</div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                © 2024 ForBrain Academy. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
