import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, Shield, User, UserPlus, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserRole } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

interface CreateUserModalProps {
  trigger: React.ReactNode;
  onUserCreated?: () => void;
}

const roleLabels: Record<UserRole, string> = {
  admin: "Sistem Yöneticisi",
  trainer: "Beyin Antrenörü",
  beyin_antrenoru: "Beyin Antrenörü",
  representative: "Temsilci",
  temsilci: "Temsilci",
  user: "Kullanıcı",
  kullanici: "Kullanıcı"
};

// Sadece aktif rolleri göster (duplicateları önle)
const activeRoles: UserRole[] = ['admin', 'beyin_antrenoru', 'temsilci', 'kullanici'];

export function CreateUserModal({ trigger, onUserCreated }: CreateUserModalProps) {
  const { createUser, user } = useAuth();
  
  // Temsilci sadece beyin antrenörü, beyin antrenörü sadece öğrenci ekleyebilir
  const getAvailableRoles = () => {
    if (user?.roles?.includes('temsilci')) {
      return ['beyin_antrenoru'];
    }
    if (user?.roles?.includes('beyin_antrenoru') && !user?.roles?.includes('admin')) {
      return ['kullanici'];
    }
    return activeRoles;
  };
  
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  
  // Temsilci ve beyin antrenörü için otomatik rol seçimi
  React.useEffect(() => {
    if (user?.roles?.includes('temsilci') && selectedRoles.length === 0) {
      setSelectedRoles(['beyin_antrenoru']);
    }
    if (user?.roles?.includes('beyin_antrenoru') && !user?.roles?.includes('admin') && selectedRoles.length === 0) {
      setSelectedRoles(['kullanici']);
    }
  }, [user, selectedRoles.length]);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Demografik bilgiler (öğrenci için)
  const [demographicInfo, setDemographicInfo] = useState({
    birth_date: "",
    grade_level: "",
    school_name: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    notes: ""
  });

  // Admin, trainer, temsilci ve beyin antrenörü kullanıcı oluşturabilir
  const canCreateUsers = user?.roles.includes('admin') || user?.roles.includes('trainer') || user?.roles.includes('temsilci') || user?.roles.includes('beyin_antrenoru');

  if (!canCreateUsers) {
    return null;
  }

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(password);
  };

  const handleRoleChange = (role: UserRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    if (selectedRoles.length === 0) {
      setError("En az bir rol seçmelisiniz.");
      setIsCreating(false);
      return;
    }

    try {
      // Öğrenci rolü varsa demografik bilgileri hazırla
      const isStudent = selectedRoles.includes('kullanici') || selectedRoles.includes('user');
      const finalDemographicInfo = isStudent ? {
        ...demographicInfo,
        student_number: `STU-${Date.now().toString().slice(-8)}`
      } : {};
      
      const { error } = await createUser(email, password, firstName, lastName, selectedRoles);
      
      if (error) {
        setError(error);
      } else {
        // Eğer öğrenci ise demografik bilgileri güncelle
        if (isStudent && Object.values(demographicInfo).some(v => v)) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .eq('email', email)
              .single();
              
            if (userData) {
              await supabase
                .from('users')
                .update({ demographic_info: finalDemographicInfo })
                .eq('id', userData.id);
            }
          } catch (updateError) {
            console.error('Demografik bilgi güncellenemedi:', updateError);
          }
        }
        
        setSuccess(true);
        toast.success("Kullanıcı başarıyla oluşturuldu!");
        
        // Call callback to refresh user list
        if (onUserCreated) {
          onUserCreated();
        }
        
        // Close modal and reset form
        setOpen(false);
        resetForm();
      }
    } catch (err) {
      setError("Kullanıcı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setSelectedRoles([]);
    setError("");
    setSuccess(false);
    setDemographicInfo({
      birth_date: "",
      grade_level: "",
      school_name: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
      notes: ""
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Yeni Kullanıcı Oluştur
          </DialogTitle>
          <DialogDescription>
            Sisteme yeni kullanıcı ekleyin ve rollerini atayın.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <p className="text-success font-medium">
              Kullanıcı başarıyla oluşturuldu!
            </p>
            <p className="text-sm text-muted-foreground">
              Kullanıcı e-posta adresine giriş bilgileri gönderildi.
            </p>
            <Button onClick={() => setOpen(false)}>
              Tamam
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Ad"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Soyad"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@forbrainacademy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Güvenli şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Oluştur
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Roller</Label>
              {user?.roles?.includes('temsilci') && (
                <p className="text-sm text-muted-foreground">
                  Temsilci olarak sadece Beyin Antrenörü ekleyebilirsiniz.
                </p>
              )}
              <div className="space-y-2">
                {getAvailableRoles().map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={selectedRoles.includes(role as UserRole)}
                      onCheckedChange={(checked) => handleRoleChange(role as UserRole, checked as boolean)}
                    />
                    <Label htmlFor={role} className="text-sm">
                      {roleLabels[role as UserRole]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Demografik Bilgiler - Sadece öğrenci rolü seçildiğinde görünür */}
            {(selectedRoles.includes('kullanici') || selectedRoles.includes('user')) && (
              <div className="space-y-3 border-t pt-3 mt-4">
                <Label className="text-sm font-medium text-muted-foreground">Öğrenci Bilgileri (Opsiyonel)</Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={demographicInfo.birth_date}
                      onChange={(e) => setDemographicInfo(prev => ({...prev, birth_date: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Sınıf</Label>
                    <select
                      value={demographicInfo.grade_level}
                      onChange={(e) => setDemographicInfo(prev => ({...prev, grade_level: e.target.value}))}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                          >
                        <option value="" className="bg-background text-foreground">Sınıf seçin</option>
                        {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                          <option key={grade} value={grade.toString()} className="bg-background text-foreground">
                            {grade}. Sınıf
                          </option>
                        ))}
                      </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName">Okul Adı</Label>
                  <Input
                    id="schoolName"
                    type="text"
                    placeholder="Okul adı"
                    value={demographicInfo.school_name}
                    onChange={(e) => setDemographicInfo(prev => ({...prev, school_name: e.target.value}))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentName">Veli Adı</Label>
                  <Input
                    id="parentName"
                    type="text"
                    placeholder="Veli adı soyadı"
                    value={demographicInfo.parent_name}
                    onChange={(e) => setDemographicInfo(prev => ({...prev, parent_name: e.target.value}))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Veli Telefon</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      value={demographicInfo.parent_phone}
                      onChange={(e) => setDemographicInfo(prev => ({...prev, parent_phone: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Veli E-posta</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="veli@email.com"
                      value={demographicInfo.parent_email}
                      onChange={(e) => setDemographicInfo(prev => ({...prev, parent_email: e.target.value}))}
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}