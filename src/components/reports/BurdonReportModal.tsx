import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { BurdonTestResult } from "@/pages/Reports";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BurdonPremiumReport } from "./BurdonPremiumReport";

interface BurdonReportModalProps {
  resultId: string | null;
  open: boolean;
  onClose: () => void;
}

export function BurdonReportModal({ resultId, open, onClose }: BurdonReportModalProps) {
  const [result, setResult] = useState<BurdonTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Her modal açıldığında fresh data çek
  useEffect(() => {
    if (open && resultId) {
      fetchResult();
    }
  }, [open, resultId]);

  const fetchResult = async () => {
    if (!resultId) return;
    
    try {
      setLoading(true);
      console.log('Fetching result for ID:', resultId);
      
      // Test sonucunu al
      const { data: resultData, error } = await supabase
        .from('burdon_test_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error) throw error;

      // Öğrenci bilgisini al
      let studentName = 'Bilinmeyen Öğrenci';
      if (resultData.student_id) {
        const { data: studentData } = await supabase
          .from('students')
          .select('users!students_user_id_fkey(first_name, last_name)')
          .eq('id', resultData.student_id)
          .single();
        
        if (studentData?.users) {
          studentName = `${studentData.users.first_name} ${studentData.users.last_name}`;
        }
      }

      // Test yapan kişi bilgisini al
      let conductorName = 'Bilinmeyen Kullanıcı';
      if (resultData.conducted_by) {
        const { data: conductorData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', resultData.conducted_by)
          .single();
        
        if (conductorData) {
          conductorName = `${conductorData.first_name} ${conductorData.last_name}`;
        }
      }

      const formattedResult = {
        ...resultData,
        student_name: studentName,
        conducted_by_name: conductorName
      };

      setResult(formattedResult);
      console.log('Result fetched successfully:', formattedResult);
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Premium PDF print fonksiyonu
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (!open) return null;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Rapor yükleniyor...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!result) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-8">
            <p>Rapor bulunamadı veya yüklenirken hata oluştu.</p>
            <Button onClick={onClose} className="mt-4">Kapat</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-2">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Burdon Test Premium Raporu</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} size="sm" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
              <Button onClick={onClose} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div id="premium-report-content">
          <BurdonPremiumReport testData={result} />
        </div>
      </DialogContent>
    </Dialog>
  );
}