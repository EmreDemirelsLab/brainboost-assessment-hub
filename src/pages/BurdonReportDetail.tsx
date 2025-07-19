import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { BurdonTestResult } from "./Reports";
import { BurdonPremiumReport } from "@/components/reports/BurdonPremiumReport";

export default function BurdonReportDetail() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<BurdonTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      
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

      setResult({
        ...resultData,
        student_name: studentName,
        conducted_by_name: conductorName
      });
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Rapor bulunamadı</p>
          <Button onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Raporlara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* No-print toolbar */}
      <div className="no-print fixed top-4 left-4 z-50 flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate('/reports')}
          className="bg-background shadow-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Raporlara Dön
        </Button>
        <Button
          onClick={handlePrint}
          className="shadow-lg"
        >
          <Printer className="h-4 w-4 mr-2" />
          Yazdır / PDF
        </Button>
      </div>

      {/* Premium PDF Report Content */}
      <BurdonPremiumReport testData={result} />
      
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            background: white !important;
          }
          
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}