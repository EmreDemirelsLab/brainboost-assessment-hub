import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Forms() {
  const { user, switchRole, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRoleSwitch = (role: any) => {
    switchRole(role);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // No forms to load - keeping empty
    setForms([]);
    setLoading(false);
  }, []);

  const filteredForms = forms.filter(form =>
    form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.category?.toLowerCase().includes(searchTerm.toLowerCase())
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

        {filteredForms.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Henüz form bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}