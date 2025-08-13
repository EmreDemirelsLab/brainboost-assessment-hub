import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, School, Users, MapPin, X, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserDetailModalProps {
  user: {
    id: string;
    auth_user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    roles: string[];
    supervisor_id?: string;
    demographic_info?: any;
    created_at: string;
    is_active: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  temsilci: "Temsilci",
  beyin_antrenoru: "Beyin Antrenörü",
  kullanici: "Kullanıcı"
};

const roleColors: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  temsilci: "bg-green-50 text-green-700 border-green-200",
  beyin_antrenoru: "bg-blue-50 text-blue-700 border-blue-200",
  kullanici: "bg-gray-50 text-gray-700 border-gray-200"
};

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [supervisor, setSupervisor] = useState<any>(null);
  const [loadingSupervisor, setLoadingSupervisor] = useState(true);

  // Supervisor bilgisini modal açılmadan önce fetch et
  useEffect(() => {
    const fetchSupervisor = async () => {
      if (!user?.supervisor_id) {
        setSupervisor(null);
        setLoadingSupervisor(false);
        return;
      }

      // Modal açılacağı zaman hemen yüklemeye başla
      try {
        const { data: supervisorData, error } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, roles')
          .eq('id', user.supervisor_id)
          .single();

        if (error) {
          console.error('Supervisor fetch error:', error);
          setSupervisor(null);
        } else {
          setSupervisor(supervisorData);
        }
      } catch (error) {
        console.error('Supervisor fetch error:', error);
        setSupervisor(null);
      } finally {
        setLoadingSupervisor(false);
      }
    };

    // User değiştiğinde veya modal açılacağında hemen fetch et
    if (user) {
      setLoadingSupervisor(true);
      fetchSupervisor();
    } else {
      setSupervisor(null);
      setLoadingSupervisor(false);
    }
  }, [user?.supervisor_id, user?.id]);

  if (!user) return null;

  const demographicInfo = user.demographic_info || {};
  const birthDate = demographicInfo.birth_date || demographicInfo.date_of_birth;
  const gradeLevel = demographicInfo.grade_level || demographicInfo.grade;
  const schoolName = demographicInfo.school_name || demographicInfo.school;
  const parentName = demographicInfo.parent_name || demographicInfo.guardian_name;
  const parentPhone = demographicInfo.parent_phone || demographicInfo.guardian_phone;
  const parentEmail = demographicInfo.parent_email || demographicInfo.guardian_email;
  const city = demographicInfo.city;
  const district = demographicInfo.district;
  const address = demographicInfo.address;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {user.first_name} {user.last_name}
          </DialogTitle>
          <DialogDescription className="mt-2">
            Kullanıcının detaylı bilgileri ve sistem verileri
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Kişisel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">E-posta</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              )}

              {birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Doğum Tarihi</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(birthDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}

              {(city || district || address) && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Adres</p>
                    <p className="text-sm text-muted-foreground">
                      {address && `${address}, `}
                      {district && `${district}, `}
                      {city}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Roller ve Yetkilendirme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Roller ve Yetkilendirme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Kullanıcı Rolleri</p>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge
                      key={role}
                      variant="outline"
                      className={roleColors[role] || "bg-gray-50 text-gray-700 border-gray-200"}
                    >
                      {roleLabels[role] || role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Supervisor Bilgisi - Sabit yükseklik ile */}
              {user.supervisor_id && (
                <div className="min-h-[100px]">
                  <p className="text-sm font-medium mb-2">Supervisor</p>
                  {loadingSupervisor ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border h-[76px]">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                    </div>
                  ) : supervisor ? (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border min-h-[76px]">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {supervisor.first_name} {supervisor.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {supervisor.roles?.map((role: string) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`text-xs ${roleColors[role] || "bg-gray-50 text-gray-700 border-gray-200"}`}
                            >
                              {roleLabels[role] || role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg border h-[76px] flex items-center">
                      <p className="text-sm text-muted-foreground">Supervisor bilgisi bulunamadı</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Hesap Durumu</p>
                <Badge variant={user.is_active ? "default" : "destructive"} className="mt-1">
                  {user.is_active ? "Aktif" : "Pasif"}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium">Kayıt Tarihi</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleString('tr-TR')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Kullanıcı ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Eğitim Bilgileri */}
          {(gradeLevel || schoolName) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Eğitim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gradeLevel && (
                  <div>
                    <p className="text-sm font-medium">Sınıf Seviyesi</p>
                    <Badge variant="outline" className="mt-1">
                      {gradeLevel}. Sınıf
                    </Badge>
                  </div>
                )}

                {schoolName && (
                  <div>
                    <p className="text-sm font-medium">Okul</p>
                    <p className="text-sm text-muted-foreground">{schoolName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Veli Bilgileri */}
          {(parentName || parentPhone || parentEmail) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Veli Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parentName && (
                  <div>
                    <p className="text-sm font-medium">Veli Adı</p>
                    <p className="text-sm text-muted-foreground">{parentName}</p>
                  </div>
                )}

                {parentPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Veli Telefon</p>
                      <p className="text-sm text-muted-foreground">{parentPhone}</p>
                    </div>
                  </div>
                )}

                {parentEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Veli E-posta</p>
                      <p className="text-sm text-muted-foreground">{parentEmail}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ek Bilgiler */}
        {Object.keys(demographicInfo).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tüm Demografik Veriler</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(demographicInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}