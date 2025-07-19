import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Clock, Users, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function CognitiveAssessment() {
  const { user, switchRole, logout } = useAuth();

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  const assessmentTypes = [
    {
      id: 1,
      title: "Dikkat ve Odaklanma",
      description: "Öğrencinin dikkat süresi ve odaklanma kapasitesini ölçer",
      duration: "15 dakika",
      difficulty: "Kolay",
      participants: 45
    },
    {
      id: 2,
      title: "Görsel Algı",
      description: "Görsel bilgi işleme ve algılama yeteneklerini değerlendirir",
      duration: "20 dakika", 
      difficulty: "Orta",
      participants: 38
    },
    {
      id: 3,
      title: "Bellek ve Hatırlama",
      description: "Kısa ve uzun süreli bellek kapasitesini ölçer",
      duration: "25 dakika",
      difficulty: "Zor",
      participants: 29
    },
    {
      id: 4,
      title: "Problem Çözme",
      description: "Mantıksal düşünme ve problem çözme becerilerini değerlendirir",
      duration: "30 dakika",
      difficulty: "Zor",
      participants: 22
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Kolay": return "bg-green-100 text-green-800";
      case "Orta": return "bg-yellow-100 text-yellow-800";
      case "Zor": return "bg-red-100 text-red-800";
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
                <Brain className="h-8 w-8 text-primary" />
                ForBrain Bilişsel Beceri Değerlendirme
              </h1>
              <p className="text-muted-foreground">
                Öğrencilerinizin bilişsel becerilerini kapsamlı bir şekilde değerlendirin.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessmentTypes.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{assessment.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {assessment.description}
                    </CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(assessment.difficulty)}>
                    {assessment.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{assessment.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{assessment.participants} katılımcı</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="default">
                    <Play className="h-4 w-4 mr-2" />
                    Değerlendirmeyi Başlat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme Hakkında</CardTitle>
            <CardDescription>
              ForBrain Bilişsel Beceri Değerlendirme sistemi hakkında detaylı bilgi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>
                Bu değerlendirme sistemi, öğrencilerin bilişsel becerilerini kapsamlı bir şekilde ölçmek 
                için tasarlanmıştır. Her test, farklı bilişsel alanları hedefler ve öğrencinin güçlü 
                yanları ile gelişim alanlarını belirler.
              </p>
              <ul className="mt-4 space-y-2">
                <li>• Bilimsel araştırmalara dayalı test metodolojisi</li>
                <li>• Yaş grubuna uygun sorular ve aktiviteler</li>
                <li>• Detaylı sonuç raporları ve öneriler</li>
                <li>• İlerleme takibi ve karşılaştırmalı analiz</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}