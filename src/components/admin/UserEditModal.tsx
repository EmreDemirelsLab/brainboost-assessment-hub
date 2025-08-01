import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Calendar, School, Users, MapPin, Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserEditModalProps {
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
  onUserUpdated: () => void;
}

const roleOptions = [
  { value: "admin", label: "Admin", color: "bg-red-50 text-red-700 border-red-200" },
  { value: "temsilci", label: "Temsilci", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "beyin_antrenoru", label: "Beyin Antrenörü", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "kullanici", label: "Kullanıcı", color: "bg-gray-50 text-gray-700 border-gray-200" }
];

export function UserEditModal({ user, isOpen, onClose, onUserUpdated }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    is_active: true,
    roles: [] as string[],
    // Demografik bilgiler
    birth_date: "",
    grade_level: "",
    school_name: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    city: "",
    district: "",
    address: ""
  });

  // User değiştiğinde formu doldur
  useEffect(() => {
    if (user) {
      const demographicInfo = user.demographic_info || {};
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        is_active: user.is_active,
        roles: user.roles || [],
        birth_date: demographicInfo.birth_date || demographicInfo.date_of_birth || "",
        grade_level: demographicInfo.grade_level || demographicInfo.grade || "",
        school_name: demographicInfo.school_name || demographicInfo.school || "",
        parent_name: demographicInfo.parent_name || demographicInfo.guardian_name || "",
        parent_phone: demographicInfo.parent_phone || demographicInfo.guardian_phone || "",
        parent_email: demographicInfo.parent_email || demographicInfo.guardian_email || "",
        city: demographicInfo.city || "",
        district: demographicInfo.district || "",
        address: demographicInfo.address || ""
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleToggle = (roleValue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleValue]
        : prev.roles.filter(r => r !== roleValue)
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Demografik bilgileri hazırla
      const demographicInfo = {
        birth_date: formData.birth_date || null,
        grade_level: formData.grade_level || null,
        school_name: formData.school_name || null,
        parent_name: formData.parent_name || null,
        parent_phone: formData.parent_phone || null,
        parent_email: formData.parent_email || null,
        city: formData.city || null,
        district: formData.district || null,
        address: formData.address || null
      };

      // Boş değerleri temizle
      Object.keys(demographicInfo).forEach(key => {
        if (!demographicInfo[key as keyof typeof demographicInfo]) {
          delete demographicInfo[key as keyof typeof demographicInfo];
        }
      });

      // Kullanıcıyı güncelle
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          is_active: formData.is_active,
          roles: formData.roles,
          demographic_info: Object.keys(demographicInfo).length > 0 ? demographicInfo : null
        })
        .eq('id', user.id);

      if (error) {
        console.error('Kullanıcı güncelleme hatası:', error);
        toast.error('Kullanıcı güncellenirken hata oluştu: ' + error.message);
        return;
      }

      toast.success('Kullanıcı başarıyla güncellendi!');
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Kullanıcı Düzenle
              </DialogTitle>
              <DialogDescription className="mt-2">
                {user.first_name} {user.last_name} kullanıcısının bilgilerini düzenleyin
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Ad *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Soyad *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+90 555 123 45 67"
                />
              </div>

              <div>
                <Label htmlFor="birth_date">Doğum Tarihi</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Hesap aktif</Label>
              </div>
            </CardContent>
          </Card>

          {/* Roller */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kullanıcı Rolleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Mevcut Roller</Label>
                <div className="space-y-3">
                  {roleOptions.map((role) => (
                    <div key={role.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`role_${role.value}`}
                        checked={formData.roles.includes(role.value)}
                        onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                      />
                      <Label htmlFor={`role_${role.value}`} className="flex items-center gap-2">
                        <Badge variant="outline" className={role.color}>
                          {role.label}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.roles.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ En az bir rol seçilmelidir
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Eğitim Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <School className="h-5 w-5" />
                Eğitim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="grade_level">Sınıf Seviyesi</Label>
                <Select value={formData.grade_level} onValueChange={(value) => handleInputChange('grade_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sınıf seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade}. Sınıf
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="school_name">Okul Adı</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => handleInputChange('school_name', e.target.value)}
                  placeholder="Okul adını girin"
                />
              </div>
            </CardContent>
          </Card>

          {/* Veli Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Veli Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="parent_name">Veli Adı</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => handleInputChange('parent_name', e.target.value)}
                  placeholder="Veli adını girin"
                />
              </div>

              <div>
                <Label htmlFor="parent_phone">Veli Telefon</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                  placeholder="+90 555 123 45 67"
                />
              </div>

              <div>
                <Label htmlFor="parent_email">Veli E-posta</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => handleInputChange('parent_email', e.target.value)}
                  placeholder="veli@example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adres Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="İstanbul"
                  />
                </div>
                <div>
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="Kadıköy"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Detaylı adres bilgisi"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || formData.roles.length === 0 || !formData.first_name || !formData.last_name || !formData.email}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}