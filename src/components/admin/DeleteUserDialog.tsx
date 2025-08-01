import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteUserDialogProps {
  user: {
    id: string;
    auth_user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
    is_active: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
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

export function DeleteUserDialog({ user, isOpen, onClose, onUserDeleted }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Kullanıcının test sonuçları olup olmadığını kontrol et
      let hasTestResults = false;
      try {
        const testCheck = await (supabase as any)
          .from('attention_test_results')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        hasTestResults = testCheck.data && testCheck.data.length > 0;
      } catch (testError) {
        console.warn('Test sonuçları kontrol edilemedi:', testError);
        hasTestResults = false;
      }

      if (hasTestResults) {
        // Test sonuçları varsa kullanıcıyı pasif yap, silme
        const { error: deactivateError } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', user.id);

        if (deactivateError) {
          console.error('Kullanıcı deaktivasyonu hatası:', deactivateError);
          toast.error('Kullanıcı deaktif edilirken hata oluştu: ' + deactivateError.message);
          return;
        }

        toast.success(
          'Kullanıcının test sonuçları olduğu için hesap silinmedi, pasif hale getirildi.',
          { duration: 5000 }
        );
      } else {
        // Test sonuçları yoksa kullanıcıyı sistemden sil (sadece users tablosundan)
        const { error: dbError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (dbError) {
          console.error('Veritabanı kullanıcı silme hatası:', dbError);
          toast.error('Kullanıcı silinirken hata oluştu: ' + dbError.message);
          return;
        }

        toast.success('Kullanıcı sistemden başarıyla silindi!');
      }

      onUserDeleted();
      onClose();
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      toast.error('Beklenmeyen bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Kullanıcıyı Sil
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Aşağıdaki kullanıcıyı sistemden kalıcı olarak silmek istediğinizden emin misiniz?
              </p>
              
              {/* Kullanıcı Bilgileri */}
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
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

              {/* Uyarı Metni */}
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Önemli Uyarı:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Bu işlem geri alınamaz</li>
                      <li>• Kullanıcının test geçmişi varsa hesap silinmez, pasif yapılır</li>
                      <li>• Sadece sistem kaydı silinir, oturum açma bilgileri korunur</li>
                      <li>• Kullanıcı verilerinin geçmişi korunur</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Siliniyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Evet, Sil
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}