import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Mail, Lock, User, UserPlus, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TrainerAddStudentModalProps {
  trigger: React.ReactNode;
  onStudentCreated?: any; // Callback function for refreshing parent component
}

export function TrainerAddStudentModal({ trigger, onStudentCreated }: TrainerAddStudentModalProps) {
  const { createUser, user } = useAuth();
  // Updated to support onStudentCreated callback
  
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Öğrenci detay bilgileri
  const [studentNumber, setStudentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Beyin antrenörleri öğrenci ekleyebilir
  const canAddStudents = user?.currentRole === 'beyin_antrenoru';

  if (!canAddStudents) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    console.log('🏫 Beyin antrenörü öğrenci ekliyor:', {
      trainer: user?.firstName + ' ' + user?.lastName,
      trainer_id: user?.id,
      student: firstName + ' ' + lastName,
      roles: ['kullanici'] // Sadece kullanici rolü
    });

    try {
      // Beyin antrenörü sadece 'kullanici' rolü ile öğrenci oluşturabilir
      const result = await createUser(email, password, firstName, lastName, ['kullanici']);
      
      if (result.error) {
        setError(result.error);
      } else {
        // User başarıyla oluşturuldu, şimdi demographic bilgileri ekle ve supervisor_id'yi set et
        const { data: newUser, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (findError || !newUser) {
          console.error('❌ Yeni user bulunamadı:', findError);
          setError("Kullanıcı oluşturuldu ama ID alınamadı.");
          return;
        }

        // Demographic bilgileri ve supervisor_id'yi güncelle
        const demographicInfo = {
          student_number: studentNumber || `STU-${Date.now().toString().slice(-8)}`,
          birth_date: birthDate || null,
          grade_level: gradeLevel || null,
          school_name: schoolName || null,
          parent_name: parentName || null,
          parent_phone: parentPhone || null,
          parent_email: parentEmail || null,
          notes: notes || null
        };

        const { error: updateError } = await supabase
          .from('users')
          .update({
            supervisor_id: user?.id, // Beyin antrenörünü supervisor olarak ata
            demographic_info: demographicInfo
          })
          .eq('id', newUser.id);

        if (updateError) {
          console.error('❌ Öğrenci bilgileri güncelleme hatası:', updateError);
          setError("Kullanıcı oluşturuldu ama öğrenci kaydı eklenemedi.");
        } else {
          setSuccess(true);
          toast.success("Öğrenci başarıyla eklendi!");
          console.log('✅ Öğrenci kaydı eklendi - Supervisor:', user?.firstName, 'Student:', firstName);
          
          // Modal'ı kapat ve callback'i çağır
          setTimeout(() => {
            setOpen(false); // Modal'ı kapat
            resetForm();    // Form'u temizle
            
            // Students listesini güncelle
            if (onStudentCreated) {
              onStudentCreated();
            }
          }, 1000); // Toast mesajını görmek için 1 saniye bekle
        }
      }
    } catch (err) {
      setError("Öğrenci eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setStudentNumber("");
    setBirthDate("");
    setGradeLevel("");
    setSchoolName("");
    setParentName("");
    setParentPhone("");
    setParentEmail("");
    setNotes("");
    setError("");
    setSuccess(false);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Yeni Öğrenci Ekle
          </DialogTitle>
          <DialogDescription>
            Sizin altınızda çalışacak yeni bir öğrenci ekleyin.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <p className="text-success font-medium">
              Öğrenci başarıyla eklendi!
            </p>
            <p className="text-sm text-muted-foreground">
              Öğrenci artık sizin altınızda çalışmaya başlayabilir.
            </p>
            <Button onClick={() => setOpen(false)}>
              Tamam
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Öğrenci Adı</Label>
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
                <Label htmlFor="lastName">Öğrenci Soyadı</Label>
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
                  placeholder="ogrenci@email.com"
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Oluştur
                </Button>
              </div>
            </div>

            {/* Öğrenci Detay Bilgileri */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground">Öğrenci Detay Bilgileri (İsteğe Bağlı)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Sınıf Düzeyi</Label>
                  <Input
                    id="gradeLevel"
                    type="text"
                    placeholder="örn: 3, 5, 8"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">Okul Adı</Label>
                <Input
                  id="schoolName"
                  type="text"
                  placeholder="Öğrencinin okuduğu okul"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Öğrenci hakkında ek notlar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Rol bilgisi - sadece bilgilendirme */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Öğrenci Rolü:</strong> Bu kişi "Öğrenci" rolü ile eklenecek ve sizin altınızda çalışacaktır.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Ekleniyor..." : "Öğrenci Ekle"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 