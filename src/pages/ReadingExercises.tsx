import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, Target, Play, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function ReadingExercises() {
  const { user, switchRole, logout } = useAuth();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const exercises = [
    {
      id: 1,
      title: "Hızlı Okuma Teknikleri",
      description: "Okuma hızınızı artırırken anlama seviyenizi korumayı öğrenin",
      level: "Başlangıç",
      progress: 75,
      duration: "20 dakika",
      rating: 4.8,
      completed: false
    },
    {
      id: 2,
      title: "Aktif Okuma Stratejileri",
      description: "Metinleri daha etkili bir şekilde anlama ve değerlendirme",
      level: "Orta",
      progress: 45,
      duration: "25 dakika",
      rating: 4.9,
      completed: false
    },
    {
      id: 3,
      title: "Eleştirel Düşünme",
      description: "Okuduklarınızı analiz etme ve eleştirel değerlendirme",
      level: "İleri",
      progress: 90,
      duration: "30 dakika",
      rating: 4.7,
      completed: true
    },
    {
      id: 4,
      title: "Not Alma Teknikleri",
      description: "Okurken etkili not alma ve özet çıkarma yöntemleri",
      level: "Orta",
      progress: 20,
      duration: "15 dakika",
      rating: 4.6,
      completed: false
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Başlangıç": return "bg-green-100 text-green-800";
      case "Orta": return "bg-yellow-100 text-yellow-800";
      case "İleri": return "bg-red-100 text-red-800";
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
                <BookOpen className="h-8 w-8 text-primary" />
                ForBrain Etkin ve Anlayarak Okuma
              </h1>
              <p className="text-muted-foreground">
                Okuma becerilerinizi geliştirmek için interaktif egzersizler.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{exercise.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {exercise.description}
                    </CardDescription>
                  </div>
                  <Badge className={getLevelColor(exercise.level)}>
                    {exercise.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>İlerleme</span>
                      <span>{exercise.progress}%</span>
                    </div>
                    <Progress value={exercise.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{exercise.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{exercise.rating}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={exercise.completed ? "outline" : "default"}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {exercise.completed ? "Tekrar Et" : "Başla"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Okuma İstatistikleri</CardTitle>
              <CardDescription>
                Bu hafta ki okuma performansınız
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Tamamlanan Egzersizler</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ortalama Okuma Hızı</span>
                  <Badge variant="secondary">250 kelime/dk</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Anlama Oranı</span>
                  <Badge variant="secondary">87%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Toplam Süre</span>
                  <Badge variant="secondary">4 saat 30 dk</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Önerilen Egzersizler</CardTitle>
              <CardDescription>
                Gelişim alanınıza özel öneriler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Kelime Dağarcığı Geliştirme</div>
                  <div className="text-sm text-muted-foreground">
                    Yeni kelimeler öğrenerek okuma anlama seviyenizi artırın
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Hız Okuma Teknikleri</div>
                  <div className="text-sm text-muted-foreground">
                    Okuma hızınızı artırırken anlama seviyenizi koruyun
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Metin Analizi</div>
                  <div className="text-sm text-muted-foreground">
                    Metinleri daha derin bir şekilde analiz etme becerinizi geliştirin
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}